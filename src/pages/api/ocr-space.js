// /pages/api/ocr-space.js
import { IncomingForm } from "formidable";
import fs from "fs";
import FormData from "form-data";
import axios from "axios";
import { execFile } from "child_process";
import { promisify } from "util";
import Tesseract from "tesseract.js";

export const config = {
  api: { bodyParser: false },
};

const execFileAsync = promisify(execFile);

function cleanupFile(filePath) {
  if (!filePath) return;
  fs.unlink(filePath, () => {});
}

function scoreText(text = "") {
  const t = String(text || "").trim();
  if (!t) return 0;
  const letters = (t.match(/[A-Za-z\u0600-\u06FF]/g) || []).length;
  const words = (t.match(/[A-Za-z\u0600-\u06FF]{2,}/g) || []).length;
  const garbage = (t.match(/[^\w\s\u0600-\u06FF]/g) || []).length;
  return letters + words * 3 - garbage * 0.3;
}

function normalizeText(text = "") {
  return String(text)
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function normalizeLang(input) {
  const v = String(input || "")
    .toLowerCase()
    .trim();
  if (v === "ara" || v === "arabic" || v === "ar") return "ara";
  if (v === "eng" || v === "english" || v === "en") return "eng";
  return "";
}

async function extractPdfTextWithPdftotext(filePath) {
  try {
    // -layout يحافظ على تنسيق الأسئلة، و "-" يعني output للـ stdout
    const { stdout } = await execFileAsync("pdftotext", [
      "-layout",
      filePath,
      "-",
    ]);
    return normalizeText(stdout || "");
  } catch {
    return "";
  }
}

async function ocrSpaceRequest({ apiKey, filePath, language, isPdf }) {
  // ✅ axios instance معزول (بدون interceptors) = حل localStorage نهائيًا
  const http = axios.create();

  const fd = new FormData();
  fd.append("apikey", apiKey);
  fd.append("language", language);
  fd.append("isOverlayRequired", "false");
  fd.append("OCREngine", "2");
  fd.append("scale", "true");
  fd.append("file", fs.createReadStream(filePath));

  const ocrRes = await http.post("https://api.ocr.space/parse/image", fd, {
    headers: fd.getHeaders(),
    timeout: isPdf ? 180000 : 60000,
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
  });

  const data = ocrRes?.data;
  const isErrored = data?.IsErroredOnProcessing === true;
  const errorMessage = data?.ErrorMessage || data?.ErrorDetails || null;

  const extractedText =
    (data?.ParsedResults || [])
      .map((r) => r?.ParsedText || "")
      .join("\n")
      .trim() || "";

  return {
    text: normalizeText(extractedText),
    isErrored,
    errorMessage,
    raw: data,
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ message: "Method not allowed" });

  const apiKey = process.env.OCR_SPACE_API_KEY;
  if (!apiKey)
    return res
      .status(500)
      .json({ message: "OCR_SPACE_API_KEY is missing in .env.local" });

  const form = new IncomingForm({
    multiples: false,
    maxFileSize: 15 * 1024 * 1024, // 15MB
  });

  form.parse(req, async (parseErr, fields, files) => {
    if (parseErr) {
      console.error("❌ formidable parse error:", parseErr);
      return res
        .status(500)
        .json({ message: "Error parsing file", details: parseErr?.message });
    }

    // ✅ دعم أكثر من field name
    const file = files?.image || files?.file;
    const fileObj = Array.isArray(file) ? file[0] : file;

    const filePath = fileObj?.filepath;
    const mime = fileObj?.mimetype || "";
    const originalName = fileObj?.originalFilename || "";

    const isPdf =
      mime === "application/pdf" || originalName.toLowerCase().endsWith(".pdf");
    const isImage = mime.startsWith("image/");

    if (!filePath) {
      return res.status(400).json({
        message: "❌ لم يتم إرسال ملف. (field name must be: image or file)",
      });
    }

    const langFromFields = Array.isArray(fields?.lang)
      ? fields.lang[0]
      : fields?.lang;
    const requestedLang = normalizeLang(langFromFields);
    const preferredLang = requestedLang || "ara";
    const secondLang = preferredLang === "ara" ? "eng" : "ara";

    const tryTesseract = async () => {
      if (!isImage) return "";
      try {
        const { data } = await Tesseract.recognize(filePath, "eng+ara");
        return normalizeText(data?.text || "");
      } catch (tErr) {
        console.error("❌ Tesseract error:", tErr?.message || tErr);
        return "";
      }
    };

    try {
      // ✅ PDF: جرّب pdftotext أولاً (لـ PDFs اللي فيها نص جاهز)
      if (isPdf) {
        const pdfText = await extractPdfTextWithPdftotext(filePath);
        if (pdfText && pdfText.length > 50) {
          cleanupFile(filePath);
          return res.status(200).json({
            success: true,
            text: pdfText,
            note: "Extracted by pdftotext",
            meta: { used: "pdftotext" },
          });
        }
      }

      // ✅ إذا صورة أو PDF سكان: روح OCR.Space
      const firstRes = await ocrSpaceRequest({
        apiKey,
        filePath,
        language: preferredLang,
        isPdf,
      });
      let best = firstRes;
      const firstScore = scoreText(firstRes.text);

      let secondRes = null;
      let secondScore = null;

      if (firstScore < 200) {
        secondRes = await ocrSpaceRequest({
          apiKey,
          filePath,
          language: secondLang,
          isPdf,
        });
        secondScore = scoreText(secondRes.text);
        if (secondScore > firstScore) best = secondRes;
      }

      if ((!best.text || best.text.length < 10) && isImage) {
        const fallbackText = await tryTesseract();
        if (fallbackText) {
          cleanupFile(filePath);
          return res.status(200).json({
            success: true,
            text: fallbackText,
            note: "Used Tesseract fallback",
            meta: {
              preferredLang,
              usedLanguage: "tesseract",
              firstScore,
              secondScore,
            },
          });
        }
      }

      cleanupFile(filePath);

      if (!best.text) {
        return res.status(200).json({
          success: false,
          text: "",
          message: "❌ لم يتم استخراج نص.",
          ocrSpaceError: best.isErrored ? best.errorMessage : null,
          meta: {
            preferredLang,
            usedLanguage: best === firstRes ? preferredLang : secondLang,
            firstScore,
            secondScore,
          },
        });
      }

      return res.status(200).json({
        success: true,
        text: best.text,
        meta: {
          preferredLang,
          usedLanguage: best === firstRes ? preferredLang : secondLang,
          firstScore,
          secondScore,
        },
        ocrSpaceError: best.isErrored ? best.errorMessage : null,
      });
    } catch (error) {
      console.error(
        "❌ OCR.Space request failed:",
        error?.response?.data || error?.message || error
      );

      const fallbackText = await tryTesseract();
      cleanupFile(filePath);

      if (fallbackText) {
        return res.status(200).json({
          success: true,
          text: fallbackText,
          note: "OCR.Space failed, used Tesseract fallback",
          meta: { preferredLang, usedLanguage: "tesseract" },
        });
      }

      return res.status(500).json({
        message: "فشل في معالجة الملف.",
        details: error?.response?.data || error?.message || "unknown error",
      });
    }
  });
}

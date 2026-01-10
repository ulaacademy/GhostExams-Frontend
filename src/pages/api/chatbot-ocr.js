// ✅ C:\Users\LENOVO\Desktop\GHOSTEXAMS V2 SCS\Frontend\src\pages\api\chatbot-ocr.js
import formidable from "formidable";
import fs from "fs";
import FormData from "form-data";
import axios from "axios";
import Tesseract from "tesseract.js";
import { OpenAI } from "openai";

export const config = { api: { bodyParser: false } };

function cleanupFile(filePath) {
  if (!filePath) return;
  fs.unlink(filePath, () => {});
}

function cleanText(text = "") {
  return String(text || "")
    .replace(/\r/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function scoreText(text = "") {
  const t = String(text || "").trim();
  if (!t) return 0;
  const letters = (t.match(/[A-Za-z\u0600-\u06FF]/g) || []).length;
  const words = (t.match(/[A-Za-z\u0600-\u06FF]{2,}/g) || []).length;
  const garbage = (t.match(/[^\w\s\u0600-\u06FF]/g) || []).length;
  return letters + words * 3 - garbage * 0.3;
}

async function ocrSpaceRequest({ apiKey, filePath, language, isPdf }) {
  const fd = new FormData();
  fd.append("apikey", apiKey);
  fd.append("language", language); // "eng" or "ara"
  fd.append("isOverlayRequired", "false");
  fd.append("OCREngine", "2");
  fd.append("scale", "true");
  fd.append("file", fs.createReadStream(filePath));

  const ocrRes = await axios.post("https://api.ocr.space/parse/image", fd, {
    headers: fd.getHeaders(),
    timeout: isPdf ? 120000 : 60000,
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
  });

  const data = ocrRes?.data;
  const extractedText =
    (data?.ParsedResults || [])
      .map((r) => r?.ParsedText || "")
      .join("\n")
      .trim() || "";

  return cleanText(extractedText);
}

export default async function handler(req, res) {
  res.setHeader("x-chatbot-ocr-version", "OCR_CHATBOT_OCR_V002");

  if (req.method !== "POST") {
    return res.status(405).json({ message: "الطريقة غير مسموحة" });
  }

  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("❌ formidable error:", err);
      return res.status(500).json({ message: "حدث خطأ أثناء رفع الملف." });
    }

    const file = files?.image;
    const fileObj = Array.isArray(file) ? file[0] : file;
    const filePath = fileObj?.filepath;
    const mime = fileObj?.mimetype || "";
    const originalName = fileObj?.originalFilename || "";

    if (!filePath) {
      return res.status(400).json({ message: "❌ لم يتم إرسال ملف صالح." });
    }

    const isPdf =
      mime === "application/pdf" || originalName.toLowerCase().endsWith(".pdf");
    const isImage = mime.startsWith("image/");

    const tryTesseract = async () => {
      if (!isImage) return "";
      try {
        const { data } = await Tesseract.recognize(filePath, "eng+ara");
        return cleanText(data?.text || "");
      } catch (tErr) {
        console.error("❌ Tesseract error:", tErr?.message || tErr);
        return "";
      }
    };

    try {
      // ✅ OCR أولاً (OCR.Space لو متوفر) ثم fallback
      let text = "";
      const apiKey = process.env.OCR_SPACE_API_KEY;

      if (apiKey) {
        const eng = await ocrSpaceRequest({
          apiKey,
          filePath,
          language: "eng",
          isPdf,
        });
        const engScore = scoreText(eng);

        let best = eng;
        if (engScore < 200) {
          const ara = await ocrSpaceRequest({
            apiKey,
            filePath,
            language: "ara",
            isPdf,
          });
          const araScore = scoreText(ara);
          if (araScore > engScore) best = ara;
        }

        text = best;
      }

      if (!text || text.length < 5) {
        const t = await tryTesseract();
        if (t) text = t;
      }

      if (!text || text.length < 5) {
        cleanupFile(filePath);
        return res.status(200).json({
          success: false,
          text: "",
          answer: "",
          message: "❌ ما قدرت أستخرج نص واضح من الملف. جرّب ملف/صورة أوضح.",
        });
      }

      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const prompt = `
رتّب النص التالي إلى أسئلة واضحة ثم حلّها.

✅ يجب الالتزام بهذا الإخراج حرفياً لكل سؤال:
━━━━━━━━━━━━━━━━━━━━
📝 السؤال رقم (X):
<نص السؤال مرتب>
✅ الخيارات: (إذا موجودة)
A) ...
B) ...
C) ...
D) ...
✅ الإجابة الصحيحة: <الحرف/صح/خطأ/الإجابة>
🧠 الشرح:
- شرح عربي مختصر وواضح (سطرين - 4 أسطر)

قواعد:
- إذا النص مشوه/ناقص بشكل يمنع الحل: اكتب "❌ النص غير واضح" واطلب صورة أوضح بدل التخمين.
- لا تجمع الإجابات في آخر الرسالة؛ لازم كل سؤال مع حله وشرحه تحته مباشرة.

النص:
${text}
`.trim();

      const aiResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "أنت مساعد تعليمي عربي للتوجيهي الأردني. رتّب الأسئلة من النص وحلّها بدقة بدون اختراع.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.2,
      });

      const answer =
        aiResponse.choices?.[0]?.message?.content?.trim() ||
        "❌ لم أتمكن من توليد إجابة واضحة.";

      cleanupFile(filePath);
      return res.status(200).json({ success: true, text, answer });
    } catch (e) {
      const details =
        e?.response?.data?.error?.message || e?.message || String(e);

      console.error("❌ chatbot-ocr error:", details);
      cleanupFile(filePath);

      return res.status(500).json({
        success: false,
        message: "فشل في تحليل الملف أو توليد الإجابة.",
        details,
      });
    }
  });
}

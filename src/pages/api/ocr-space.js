// ✅ src/pages/api/ocr-space.js  (Google Vision OCR - replaces OCR.Space)
import { IncomingForm } from "formidable";
import fs from "fs";
import path from "path";
import os from "os";
import { execFile } from "child_process";
import { promisify } from "util";
import vision from "@google-cloud/vision";

export const config = { api: { bodyParser: false } };

const execFileAsync = promisify(execFile);

const client = new vision.ImageAnnotatorClient();

function cleanupFile(filePath) {
  if (!filePath) return;
  fs.unlink(filePath, () => {});
}

function normalizeText(text = "") {
  return String(text || "")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\u00A0/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function lightDenoise(text = "") {
  let t = String(text || "");
  t = t.replace(/[|]/g, " ");
  t = t.replace(/[•●■◆]/g, "*");
  t = t.replace(/[_]{3,}/g, " ");
  return normalizeText(t);
}

// 0..300 (مثل ملفك القديم)
function scoreText(text = "") {
  const t = String(text || "").trim();
  if (!t) return 0;
  const letters = (t.match(/[A-Za-z\u0600-\u06FF]/g) || []).length;
  const words = (t.match(/[A-Za-z\u0600-\u06FF]{2,}/g) || []).length;
  const qNum = (t.match(/(^|\n)\s*\d+\s*[.)]/g) || []).length;
  const opt = (t.match(/\b([A-Da-d]|[أبجد])[\)\.]/g) || []).length;
  const garbage = (t.match(/[^\w\s\u0600-\u06FF]/g) || []).length;

  let score = 0;
  score += Math.min(letters / 8, 120);
  score += Math.min(words * 1.2, 80);
  score += Math.min(qNum * 12, 60);
  score += Math.min(opt * 2, 40);
  score -= Math.min(garbage / 20, 30);
  score = Math.max(0, Math.min(300, score));
  return Math.round(score);
}

function flagsFrom(text = "", score = 0, isPdf = false) {
  const flags = [];
  if (isPdf) flags.push("pdf");
  if (!text || text.length < 20) flags.push("empty");
  if (score < 160) flags.push("low_quality");
  else if (score < 220) flags.push("medium_quality");
  else flags.push("good_quality");

  const looksExam =
    (text.match(/(^|\n)\s*\d+\s*[.)]/g) || []).length >= 1 &&
    (text.match(/\b([A-Da-d]|[أبجد])[\)\.]/g) || []).length >= 2;

  if (looksExam) flags.push("looks_like_exam");
  return flags;
}

function pickAnyFile(files) {
  if (!files) return null;
  const direct = files?.image || files?.file;
  if (direct) return Array.isArray(direct) ? direct[0] : direct;
  const all = Object.values(files)
    .flatMap((v) => (Array.isArray(v) ? v : [v]))
    .filter(Boolean);
  return all[0] || null;
}

function normalizeTeacherHints(teacherKey = "", preferredLang = "ar") {
  // languageHints for Vision
  if (teacherKey === "english") return ["en"];
  if (
    teacherKey === "arabic" ||
    teacherKey === "religion" ||
    teacherKey === "history"
  )
    return ["ar"];
  return preferredLang === "en" ? ["en", "ar"] : ["ar", "en"];
}

async function extractPdfTextWithPdftotext(filePath) {
  try {
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

async function pdfToPngPages(filePath) {
  // يحتاج Poppler (pdftoppm) على جهازك/السيرفر
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), "pdfpng-"));
  const prefix = path.join(outDir, "page");
  await execFileAsync("pdftoppm", ["-png", "-r", "260", filePath, prefix]);

  const files = fs
    .readdirSync(outDir)
    .filter((f) => f.toLowerCase().endsWith(".png"))
    .map((f) => path.join(outDir, f))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  return { outDir, files };
}

async function visionOcrImage(filePath, languageHints = ["ar", "en"]) {
  // documentTextDetection عادة أفضل للورق/الامتحانات
  const [result] = await client.documentTextDetection({
    image: { content: fs.readFileSync(filePath) },
    imageContext: { languageHints },
  });

  const text =
    result?.fullTextAnnotation?.text ||
    result?.textAnnotations?.[0]?.description ||
    "";

  return normalizeText(text);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }

  // لازم يكون موجود عندك كما قلت
  const creds = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!creds) {
    return res.status(500).json({
      success: false,
      message: "GOOGLE_APPLICATION_CREDENTIALS missing in .env.local",
    });
  }

  const form = new IncomingForm({
    multiples: false,
    maxFileSize: 25 * 1024 * 1024,
  });

  let tmpDirToCleanup = null;

  try {
    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, flds, fls) =>
        err ? reject(err) : resolve({ fields: flds, files: fls }),
      );
    });

    const fileObj = pickAnyFile(files);
    const filePath = fileObj?.filepath;
    const mime = fileObj?.mimetype || "";
    const originalName = fileObj?.originalFilename || "";

    if (!filePath)
      return res
        .status(400)
        .json({ success: false, message: "No file received" });

    const isPdf =
      mime === "application/pdf" || originalName.toLowerCase().endsWith(".pdf");
    const isImage = mime.startsWith("image/");

    const teacherKey = Array.isArray(fields?.teacherKey)
      ? fields.teacherKey[0]
      : fields?.teacherKey || "general";
    const preferredLang = Array.isArray(fields?.preferredLang)
      ? fields.preferredLang[0]
      : fields?.preferredLang || "ar";

    const languageHints = normalizeTeacherHints(teacherKey, preferredLang);

    // ✅ 1) PDF نصّي: جرّب استخراج نص مباشر (أفضل دقة وأسرع)
    if (isPdf) {
      const pdfText = lightDenoise(await extractPdfTextWithPdftotext(filePath));
      const pdfScore = scoreText(pdfText);

      if (pdfText && pdfText.length > 120 && pdfScore >= 220) {
        cleanupFile(filePath);
        return res.status(200).json({
          success: true,
          text: pdfText,
          meta: {
            used: "pdftotext",
            qualityScore: pdfScore,
            flags: flagsFrom(pdfText, pdfScore, true),
          },
        });
      }

      // ✅ 2) PDF سكان: حوّل صفحات PNG ثم Vision لكل صفحة
      try {
        const { outDir, files: pages } = await pdfToPngPages(filePath);
        tmpDirToCleanup = outDir;

        const chunks = [];
        for (const pg of pages.slice(0, 12)) {
          const t = lightDenoise(await visionOcrImage(pg, languageHints));
          if (t) chunks.push(t);
        }

        const finalText = lightDenoise(chunks.join("\n\n"));
        const finalScore = scoreText(finalText);

        cleanupFile(filePath);
        if (tmpDirToCleanup)
          fs.rmSync(tmpDirToCleanup, { recursive: true, force: true });

        if (!finalText) {
          return res.status(200).json({
            success: false,
            text: "",
            message: "لم يتم استخراج نص من PDF السكان عبر Vision.",
            meta: {
              used: "pdftoppm+google_vision",
              qualityScore: finalScore,
              flags: flagsFrom("", 0, true),
            },
          });
        }

        return res.status(200).json({
          success: true,
          text: finalText,
          meta: {
            used: "pdftoppm+google_vision",
            qualityScore: finalScore,
            flags: flagsFrom(finalText, finalScore, true),
            languageHints,
          },
        });
      } catch (e) {
        // إذا pdftoppm غير مثبت على ويندوز
        cleanupFile(filePath);
        return res.status(200).json({
          success: false,
          text: "",
          message:
            "PDF سكان يحتاج تحويل صفحات. على جهازك مش متوفر pdftoppm (Poppler). ارفع PDF نصي أو حوّل PDF لصور PNG وجرب.",
          meta: {
            used: "google_vision",
            qualityScore: 0,
            flags: ["pdf", "empty"],
            error: String(e?.message || e),
          },
        });
      }
    }

    // ✅ 3) Image => Google Vision مباشرة
    if (!isImage) {
      cleanupFile(filePath);
      return res
        .status(400)
        .json({ success: false, message: "Only image or PDF allowed" });
    }

    const extracted = lightDenoise(
      await visionOcrImage(filePath, languageHints),
    );
    const sc = scoreText(extracted);

    cleanupFile(filePath);

    if (!extracted) {
      return res.status(200).json({
        success: false,
        text: "",
        message: "Vision لم يُرجع نص.",
        meta: {
          used: "google_vision",
          qualityScore: sc,
          flags: flagsFrom("", 0, false),
          languageHints,
        },
      });
    }

    return res.status(200).json({
      success: true,
      text: extracted,
      meta: {
        used: "google_vision",
        qualityScore: sc,
        flags: flagsFrom(extracted, sc, false),
        languageHints,
      },
    });
  } catch (e) {
    if (tmpDirToCleanup)
      fs.rmSync(tmpDirToCleanup, { recursive: true, force: true });
    return res.status(500).json({
      success: false,
      message: "فشل في معالجة الملف.",
      details: e?.message || String(e),
    });
  }
}

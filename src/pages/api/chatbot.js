// ✅ src/pages/api/chatbot.js
// FIXED (v2):
// - يلقط الأسئلة 1-9 حتى لو كانت بصيغة "- 1" بدون ":" أو "-" بعد الرقم
// - يفك الخيارات اللي جنب بعض بنفس السطر (أ/ب/ج/د) بدون تداخل
// - يمنع drift قدر الإمكان (سطر خيارات بعيد عن السؤال ما ينحسب)
// - مخرجات العربي: خيارات أ/ب/ج/د + الإجابة أ/ب/ج/د

import OpenAI from "openai";

export const config = { api: { bodyParser: true } };

const ARABIC_INDIC = "٠١٢٣٤٥٦٧٨٩";
const AR_TO_EN = { أ: "A", ب: "B", ج: "C", د: "D" };

function toLatinDigits(s = "") {
  return String(s).replace(/[٠-٩]/g, (d) => String(ARABIC_INDIC.indexOf(d)));
}
function toArabicIndicDigits(s = "") {
  return String(s).replace(/\d/g, (d) => ARABIC_INDIC[Number(d)]);
}

function ratioArabic(text = "") {
  const t = String(text || "");
  const ar = (t.match(/[\u0600-\u06FF]/g) || []).length;
  const en = (t.match(/[A-Za-z]/g) || []).length;
  return ar / Math.max(1, ar + en);
}

function normalizeNewlines(raw = "") {
  return String(raw || "")
    .replace(/\r/g, "\n")
    .replace(/\u00A0/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function arOptionToEn(letter = "") {
  return AR_TO_EN[letter] || null;
}

function isAnswerKeyLine(line = "") {
  const s = String(line || "").trim();
  if (!s) return false;

  const cleaned = s
    .replace(/[،,;|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // repeated pairs: "12 ب 13 أ 14 د ..."
  const arPairs = (cleaned.match(/\b\d{1,3}\s*[أبجد]\b/g) || []).length;
  const enPairs = (cleaned.match(/\b\d{1,3}\s*[A-D]\b/g) || []).length;

  // packed: "12A 13C 14D ..."
  const packed = (cleaned.match(/\b\d{1,3}\s*[A-Dأبجد]\b/g) || []).length;

  // avoid false positives: short lines that look like "23 د"
  // but keep detection if there are many pairs
  if (arPairs >= 3 || enPairs >= 3 || packed >= 4) return true;

  return false;
}

/**
 * ✅ sanitize خفيف + يدعم:
 * - "- 1 <text>" (بدون punctuation)
 * - "1-" / "1 -" / "1:" / "1)" / "1."
 * - يزيل سطور مفتاح الإجابات فقط لأنها بتخرب البارسر
 */
function sanitizeExamText(raw = "") {
  let t = normalizeNewlines(raw);

  // remove hidden RTL/LTR marks
  t = t.replace(/[\u200E\u200F\u202A-\u202E\u2066-\u2069]/g, "");

  // remove obvious noisy header/footer lines
  t = t.replace(/^.*(?:tel|phone|whatsapp|واتس|هاتف|رقم|www\.|http).*$/gim, "");

  // normalize separators lightly
  t = t.replace(/[|]/g, " ");
  t = t.replace(/[•●■◆]/g, "*");
  t = t.replace(/[_]{3,}/g, " ");

  // ✅ digits to latin early
  t = toLatinDigits(t);

  // fix OCR split digits at line start: "1 0:" => "10:"
  t = t.replace(/(^|\n)\s*(\d)\s+(\d)\s*([:–\-\.)])/g, "$1$2$3$4");
  t = t.replace(/(^|\n)\s*(\d)\s+(\d)\s+(\d)\s*([:–\-\.)])/g, "$1$2$3$4$5");

  // ✅ normalize question numbering into "N. "
  // 1) "- 1 نص..."  (بدون punctuation بعد الرقم)  << هذا كان سبب فشل 1-9 عندك
  t = t.replace(/(^|\n)\s*[-–•]\s*(\d{1,3})\s+(?=\S)/g, "\n$2. ");

  // 2) "- 1:" "- 1-" "- 1)" "- 1."
  t = t.replace(/(^|\n)\s*[-–•]\s*(\d{1,3})\s*[:\-–\.)]\s*/g, "\n$2. ");

  // 3) "1:" "1-" "1)" "1."
  t = t.replace(/(^|\n)\s*(\d{1,3})\s*[:\-–\.)]\s*/g, "\n$2. ");

  // 4) "1 <text>" (بداية سطر رقم + مسافة) — مفيد لبعض ملفات OCR
  // (مهم: هذا فقط ببداية سطر، وما يلمس السنوات لأنها 4 أرقام)
  t = t.replace(/(^|\n)\s*(\d{1,3})\s+(?=\S)/g, "\n$2. ");

  // normalize (أ) => أ)  and (A) => A)
  t = t.replace(/\(([أبجد])\)\s*/g, " $1) ");
  t = t.replace(
    /\(([A-Da-d])\)\s*/g,
    (_, c) => ` ${String(c).toUpperCase()}) `,
  );

  // remove answer-key lines
  t = t
    .split("\n")
    .filter((ln) => !isAnswerKeyLine(ln))
    .join("\n");

  t = t.replace(/\n{3,}/g, "\n\n").trim();
  return t;
}

function detectIntent(msg = "") {
  const t = String(msg || "");
  const optCount = (t.match(/\b([A-Da-d]|[أبجد])[\)\.]/g) || []).length;
  const hasNumbering = /(^|\n)\s*\d+\s*[.)\-:]/.test(t);
  const hasExamPhrases =
    /choose the correct|answer the following|for items|اختر|اختَر|الاختيار|ضع دائرة/i.test(
      t,
    );

  if (
    (optCount >= 2 && hasNumbering) ||
    (optCount >= 3 && hasExamPhrases) ||
    optCount >= 4
  )
    return "exam";
  if (/اشتراك|سعر|بكج|دينار/i.test(t)) return "pricing";
  if (/مشكلة|خطأ|لا يعمل|مش زابط|error/i.test(t)) return "support";
  if (/كيف|شرح|درس|فسّر|وضح/i.test(t)) return "education";
  return "general";
}

function detectTeacherAuto(text = "") {
  const t = String(text || "");
  const arRatio = ratioArabic(t);
  if (arRatio < 0.18) return "english";

  const rel =
    /سورة|آية|الآية|القرآن|حديث|النبي|صلى الله|الفقه|الطهارة|الصلاة|الزكاة|الصوم|الحج|العقيدة|التوحيد|الركن|السنّة|الفرض/i;

  const hist =
    /تاريخ الأردن|الأردن|الإمارة|الهاشمي|عبد الله|الحسين|الملك|معاهدة|انتداب|ثورة|وعد بلفور|سايكس|بيكو|النكبة|النكسة|الجامعة العربية|مؤتمر|استقلال|1948|1967/i;

  if (rel.test(t)) return "religion";
  if (hist.test(t)) return "history";
  return "arabic";
}

function teacherIsolationGate({ teacherKey, text }) {
  if (!teacherKey || teacherKey === "auto" || teacherKey === "general")
    return { ok: true };

  const arRatio = ratioArabic(text);

  if (teacherKey === "english") {
    if (arRatio > 0.35) {
      return {
        ok: false,
        msg: "أنا معلم الإنجليزي فقط ✅\n❌ النص يبدو عربي/غير إنجليزي.\nبدّل للمعلم الصحيح.",
      };
    }
    return { ok: true };
  }

  if (arRatio < 0.15) {
    return {
      ok: false,
      msg: "أنا معلم عربي/دين/تاريخ فقط ✅\n❌ النص يبدو إنجليزي.\nبدّل لمعلم الإنجليزي.",
    };
  }

  if (teacherKey === "religion") {
    const rel =
      /سورة|آية|القرآن|حديث|النبي|الفقه|الصلاة|الزكاة|الصوم|الحج|العقيدة|التوحيد/i;
    if (!rel.test(text)) {
      return {
        ok: false,
        msg: "أنا معلم دين فقط ✅\n❌ هذا النص لا يبدو دين.\nبدّل للمعلم الصحيح.",
      };
    }
  }

  if (teacherKey === "history") {
    const hist =
      /الأردن|الإمارة|الهاشمي|عبد الله|الحسين|الملك|انتداب|ثورة|معاهدة|استقلال|1948|1967|النكبة|النكسة/i;
    if (!hist.test(text)) {
      return {
        ok: false,
        msg: "أنا معلم تاريخ فقط ✅\n❌ هذا النص لا يبدو تاريخ.\nبدّل للمعلم الصحيح.",
      };
    }
  }

  return { ok: true };
}

/**
 * ✅ تفكيك الخيارات حتى لو كانت جنب بعض وبلا مسافات مثالية:
 * - يدعم: "أ)..." "ب)..." "ج)..." "د)..."
 * - ويدعم: "أ." "ب." "A." "(أ)"
 */
function splitInlineOptions(line = "") {
  let s = String(line || "").trim();
  if (!s) return [];

  // normalize "أ." "أ:" => "أ)"
  s = s.replace(/(^|\s)([أبجد])\s*[\.\:]\s*/g, "$1$2) ");
  s = s.replace(
    /(^|\s)([A-Da-d])\s*[\.\:]\s*/g,
    (_, p1, c) => `${p1}${String(c).toUpperCase()}) `,
  );

  // ensure "(أ)" and "(A)" normalized
  s = s.replace(/\(([أبجد])\)\s*/g, " $1) ");
  s = s.replace(
    /\(([A-Da-d])\)\s*/g,
    (_, c) => ` ${String(c).toUpperCase()}) `,
  );

  // ✅ strongest split: newline BEFORE every option marker (even if glued)
  // 1) Arabic options
  s = s.replace(/([^\n])\s*([أبجد])\)\s*/g, "$1\n$2) ");

  // 2) English options (force uppercase)
  s = s.replace(/([^\n])\s*([A-Da-d])\)\s*/g, (_, a, b) => {
    return `${a}\n${String(b).toUpperCase()}) `;
  });

  return s
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);
}

function isQuestionStart(line = "") {
  // "12. ..." after sanitize
  return /^\s*(?:[-–•*]\s*)?\d{1,3}\s*\.\s*/.test(line);
}

function getQuestionNumber(line = "") {
  const m = line.match(/^\s*(?:[-–•*]\s*)?(\d{1,3})\s*\.\s*(.*)$/);
  if (!m) return null;
  return { number: Number(m[1]), rest: String(m[2] || "").trim() };
}

function normalizeOptionLine(line = "") {
  const l = String(line || "").trim();
  if (!l) return null;
  if (isAnswerKeyLine(l)) return null;

  // Arabic option
  const am = l.match(/^([أبجد])\)\s*(.*)$/);
  if (am) {
    const key = arOptionToEn(am[1]); // internal A/B/C/D
    return key ? { key, text: String(am[2] || "").trim() } : null;
  }

  // English option
  const em = l.match(/^([A-Da-d])\)\s*(.*)$/);
  if (em) {
    return {
      key: String(em[1]).toUpperCase(),
      text: String(em[2] || "").trim(),
    };
  }

  return null;
}

/**
 * ✅ State machine parser (no drifting)
 */
function parseMcq(text = "") {
  const rawLines = String(text || "")
    .replace(/\r/g, "\n")
    .split("\n");

  const lines = [];
  for (const ln of rawLines) {
    const parts = splitInlineOptions(ln);
    if (parts.length) lines.push(...parts);
  }

  const questions = [];
  let current = null;

  // Prevent option drift
  const MAX_LINES_BEFORE_FIRST_OPTION = 16;

  const flush = () => {
    if (!current) return;

    const present = ["A", "B", "C", "D"].filter(
      (k) => (current.options[k] || "").trim().length > 0,
    );

    const qText = current.textParts.join(" ").replace(/\s+/g, " ").trim();

    questions.push({
      number: current.number,
      text: qText,
      options: current.options, // internal A/B/C/D
      present,
      quality: {
        hasText: qText.length >= 6,
        presentCount: present.length,
        optionLengths: {
          A: (current.options.A || "").trim().length,
          B: (current.options.B || "").trim().length,
          C: (current.options.C || "").trim().length,
          D: (current.options.D || "").trim().length,
        },
        linesBeforeFirstOption: current.linesBeforeFirstOption,
      },
    });

    current = null;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = String(lines[i] || "").trim();
    if (!line) continue;
    if (isAnswerKeyLine(line)) continue;

    if (isQuestionStart(line)) {
      flush();
      const info = getQuestionNumber(line);
      if (!info) continue;

      current = {
        number: info.number,
        textParts: info.rest ? [info.rest] : [],
        options: { A: "", B: "", C: "", D: "" },
        seenAnyOption: false,
        linesBeforeFirstOption: 0,
      };
      continue;
    }

    if (!current) continue;

    const opt = normalizeOptionLine(line);
    if (opt) {
      if (
        !current.seenAnyOption &&
        current.linesBeforeFirstOption > MAX_LINES_BEFORE_FIRST_OPTION
      ) {
        // too late => ignore drift
        continue;
      }
      const key = opt.key;
      const val = opt.text || "";
      if (key && val) current.options[key] = val.trim();
      current.seenAnyOption = true;
      continue;
    }

    if (!current.seenAnyOption) current.linesBeforeFirstOption += 1;
    current.textParts.push(line);
  }

  flush();
  return questions;
}

function examIsClearEnough(questions = []) {
  if (!Array.isArray(questions) || questions.length === 0)
    return { ok: false, reason: "no_questions" };

  const anyAcceptable = questions.some(
    (q) => (q.text || "").length >= 6 && (q.present?.length || 0) >= 3,
  );
  if (!anyAcceptable) return { ok: false, reason: "options_missing" };

  return { ok: true, reason: "ok" };
}

/**
 * ✅ Build prompt:
 * - عربي: خيارات أ/ب/ج/د + جواب أ/ب/ج/د
 * - إنجليزي: A/B/C/D
 */
function buildSystemExam({ teacherKey = "arabic", outputLang = "ar" }) {
  const roleMap = {
    english:
      "You are ONLY an English teacher (Tawjihi). Do NOT answer Arabic/Religion/History.",
    arabic:
      "أنت معلم لغة عربية فقط (توجيهي). لا تجب عن الإنجليزي/الدين/التاريخ.",
    religion:
      "أنت معلم تربية إسلامية فقط (توجيهي). لا تجب عن الإنجليزي/العربي/التاريخ.",
    history:
      "أنت معلم تاريخ الأردن فقط (توجيهي). لا تجب عن الإنجليزي/العربي/الدين.",
  };

  if (outputLang === "en") {
    return `
${roleMap[teacherKey] || roleMap.english}
Output language MUST be English.

You will receive JSON with MCQ questions.
Solve EACH question.

✅ Output format (repeat for each question):
━━━━━━━━━━━━━━━━━━━━
📝 Question (X):
<question text>
✅ Options:
A) ...
B) ...
C) ...
D) ...
✅ Correct: <A/B/C/D or ❌ unclear>
🧠 Explanation:
- 2 to 4 lines

STRICT:
- If question text is unclear OR any option missing/garbled/very short => ❌ unclear.
- NEVER guess.
- NEVER invent missing options.
`.trim();
  }

  return `
${roleMap[teacherKey] || roleMap.arabic}
لغة المخرجات MUST تكون عربي.

ستستقبل JSON لأسئلة اختيار من متعدد.
حلّ كل سؤال.

✅ صيغة الإخراج إلزامية (كرر لكل سؤال):
━━━━━━━━━━━━━━━━━━━━
📝 السؤال رقم (X):
<نص السؤال>
✅ الخيارات:
أ) ...
ب) ...
ج) ...
د) ...
✅ الإجابة الصحيحة: <أ/ب/ج/د أو ❌ النص غير واضح>
🧠 الشرح:
- شرح واضح (2 إلى 4 أسطر)

قواعد صارمة:
- إذا نص السؤال غير واضح أو خيار ناقص/فارغ/مشوّه => ❌ النص غير واضح.
- ممنوع التخمين.
- ممنوع اختراع خيارات غير موجودة.
`.trim();
}

function optionsToArabicKeys(opts = { A: "", B: "", C: "", D: "" }) {
  return {
    أ: (opts.A || "").trim(),
    ب: (opts.B || "").trim(),
    ج: (opts.C || "").trim(),
    د: (opts.D || "").trim(),
  };
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST")
      return res.status(405).json({ message: "الطريقة غير مسموحة" });

    const body = req.body || {};
    const message = typeof body.message === "string" ? body.message : "";
    const isSubscribed = !!body.isSubscribed;
    const forceExam = !!body.forceExam;

    const subject = typeof body.subject === "string" ? body.subject : "general";
    const preferredLangIn =
      body.preferredLang === "en"
        ? "en"
        : body.preferredLang === "ar"
          ? "ar"
          : "auto";
    const teacherKeyIn =
      typeof body.teacherKey === "string" ? body.teacherKey : subject;

    if (!message || message.trim().length < 2)
      return res.status(400).json({ error: "الرسالة مطلوبة" });

    const intent = forceExam ? "exam" : detectIntent(message);
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // ✅ Non-exam chat
    if (intent !== "exam") {
      const response = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "أنت مساعد لمنصة تعليمية. أجب باختصار ووضوح.",
          },
          { role: "user", content: message },
        ],
        temperature: 0.6,
      });

      let aiReply =
        response.choices?.[0]?.message?.content?.trim() ||
        "❌ لم أتمكن من توليد رد واضح.";

      const outputLang =
        preferredLangIn === "auto"
          ? ratioArabic(message) > 0.2
            ? "ar"
            : "en"
          : preferredLangIn;

      if (outputLang === "ar") aiReply = toArabicIndicDigits(aiReply);

      if (intent === "pricing" && !isSubscribed)
        aiReply += "\n\n💡 للتفاصيل الكاملة حول الاشتراكات، تفضل صفحة العروض.";
      if (intent === "support") aiReply += "\n\n🛠️ للدعم: /contact";
      if (intent === "education") aiReply += "\n\n📚 ابدأ من: /exams";

      return res.status(200).json({ reply: aiReply });
    }

    // ✅ Exam flow
    const raw = sanitizeExamText(message);

    const teacherKey =
      !teacherKeyIn || teacherKeyIn === "auto" || teacherKeyIn === "general"
        ? detectTeacherAuto(raw)
        : teacherKeyIn;

    const iso = teacherIsolationGate({
      teacherKey: teacherKeyIn,
      text: message,
    });
    if (!iso.ok) return res.status(200).json({ reply: iso.msg });

    const outputLang = teacherKey === "english" ? "en" : "ar";

    const questions = parseMcq(raw);
    const gate = examIsClearEnough(questions);

    if (!gate.ok) {
      return res.status(200).json({
        reply:
          "❌ النص غير واضح كفاية للحل بدقة.\n" +
          "✅ جرّب:\n- قص السؤال وحده\n- صورة أوضح بدون ميلان/ظل\n- PDF أصلي إن وجد\n" +
          "📌 ملاحظة: لازم تظهر الخيارات كاملة (أ/ب/ج/د أو A/B/C/D).",
      });
    }

    const payload = {
      format: "mcq_exam",
      teacherKey,
      outputLang,
      questions: questions.map((q) => ({
        number: q.number,
        text: q.text,
        options:
          outputLang === "ar" ? optionsToArabicKeys(q.options) : q.options,
        quality: q.quality,
      })),
    };

    const systemExam = buildSystemExam({ teacherKey, outputLang });

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        { role: "system", content: systemExam },
        { role: "user", content: JSON.stringify(payload) },
      ],
      temperature: 0.1,
    });

    let aiReply =
      response.choices?.[0]?.message?.content?.trim() ||
      "❌ لم أتمكن من توليد رد واضح.";

    if (outputLang === "ar") aiReply = toArabicIndicDigits(aiReply);

    // ✅ لو طلع A/B/C/D بالغلط، نحولهم لعربي
    if (outputLang === "ar") {
      aiReply = aiReply
        .replace(/\bA\)/g, "أ)")
        .replace(/\bB\)/g, "ب)")
        .replace(/\bC\)/g, "ج)")
        .replace(/\bD\)/g, "د)")
        .replace(/✅ الإجابة الصحيحة:\s*A\b/g, "✅ الإجابة الصحيحة: أ")
        .replace(/✅ الإجابة الصحيحة:\s*B\b/g, "✅ الإجابة الصحيحة: ب")
        .replace(/✅ الإجابة الصحيحة:\s*C\b/g, "✅ الإجابة الصحيحة: ج")
        .replace(/✅ الإجابة الصحيحة:\s*D\b/g, "✅ الإجابة الصحيحة: د");
    }

    return res.status(200).json({ reply: aiReply });
  } catch (error) {
    console.error(
      "❌ chatbot error:",
      error?.response?.data || error?.message || error,
    );
    return res.status(500).json({ error: "حدث خطأ أثناء توليد الرد" });
  }
}

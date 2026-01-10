// ✅ src/pages/api/chatbot.js
import OpenAI from "openai";

const ARABIC_INDIC = "٠١٢٣٤٥٦٧٨٩";

function toLatinDigits(s = "") {
  return String(s).replace(/[٠-٩]/g, (d) => String(ARABIC_INDIC.indexOf(d)));
}
function toArabicIndicDigits(s = "") {
  return String(s).replace(/\d/g, (d) => ARABIC_INDIC[Number(d)]);
}

function sanitizeExamText(raw = "") {
  let t = String(raw || "");

  t = t.replace(/\r/g, "\n");
  t = t.replace(/[ \t]+/g, " ");
  t = t.replace(/\n{3,}/g, "\n\n");
  t = t.replace(/[|]/g, " ");
  t = t.replace(/[•●■◆]/g, "*");
  t = t.replace(/[_]{3,}/g, " ");

  // "* 1." -> "1."
  t = t.replace(/\*\s*(\d+)\s*[.)]/g, "$1.");
  t = t.replace(/^\s*\*\s*/gm, "");

  // فصل الخيارات A) ... إلخ
  t = t.replace(/\s*([A-D])\)\s*/g, "\n$1) ");

  // فلترة سطور ضجيج واضحة
  const lines = t.split("\n").map((l) => l.trim());
  const cleaned = [];
  for (const line of lines) {
    if (!line) continue;
    const compact = line.replace(/\s+/g, "");
    const hasLetters = /[A-Za-z\u0600-\u06FF]/.test(line);

    if (!hasLetters && compact.length <= 6) continue;
    if (/^[0-9ILkpi\/\\\.\-_,:;()]+$/i.test(compact)) continue;
    if (!hasLetters && /^[0-9]{7,}$/.test(compact)) continue;

    cleaned.push(line);
  }

  t = cleaned.join("\n");
  t = t.replace(/\n{3,}/g, "\n\n").trim();
  return t;
}

function detectIntent(msg = "") {
  const t = String(msg || "");

  const hasOptions = (t.match(/[A-D]\)/g) || []).length >= 2;
  const hasNumbering = /(^|\n)\s*(\*?\s*)?\d+\s*[.)]/.test(t);
  const hasExamPhrases = /For items|choose from A|answer\.|الاختيار|اختر/i.test(
    t
  );

  if ((hasOptions && hasNumbering) || (hasOptions && hasExamPhrases))
    return "exam";
  if ((t.match(/[A-D]\)/g) || []).length >= 4) return "exam";

  if (t.includes("اشتراك") || t.includes("سعر")) return "pricing";
  if (t.includes("كيف") || t.includes("درس")) return "education";
  if (t.includes("مشكلة") || t.includes("خطأ")) return "support";
  return "general";
}

function shouldRepairOcr(text = "") {
  const t = String(text || "");
  const hasArabic = /[\u0600-\u06FF]/.test(t);

  // مؤشرات عامة لتشويش OCR (بدون ترقيع حالة واحدة)
  const suspicious =
    /(?:\b[Yy][Oo0]\b)|(?:£\s*\d)|(?:\bDll\b)|(?:\bSs\b)|(?:\bGg\b)|(?:\bTE\b)/.test(
      t
    ) ||
    (hasArabic && /[A-Za-z]{2,}/.test(t) && /\d/.test(t)) || // خلط عربي + لاتيني + أرقام
    (hasArabic && (t.match(/[A-Za-z]/g) || []).length > 25); // لاتيني كثير مع عربي

  return suspicious;
}

async function repairOcrText(openai, text) {
  const prompt = `
أنت مساعد تنظيف OCR فقط (بدون حل، بدون شرح).
مهمتك: إصلاح نص OCR المشوّه مع التركيز على:
- الأرقام والسنوات والتواريخ (1910, 1917, 35...) سواء كانت عربية (٣٥) أو لاتينية.
- تصحيح الرموز/الحروف التي تُستعمل بدل الأرقام بسبب OCR (مثل: YO / Y0 / £1910 / Dll / Ss ...).
قواعد صارمة:
- لا تضف أي سؤال غير موجود.
- لا تحذف أسئلة صحيحة.
- إذا رقم غير متأكد منه 100% اتركه كما هو (لا تخمّن).
- أخرج "النص المصحّح فقط" بدون أي تعليق.

النص:
${text}
`.trim();

  const r = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "أنت نظام تنظيف OCR فقط. تُخرج النص المصحّح فقط بدون شرح وبدون إجابات.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0,
  });

  return r.choices?.[0]?.message?.content?.trim() || text;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "الطريقة غير مسموحة" });
  }

  const { message, isSubscribed, forceExam } = req.body || {};
  if (!message) return res.status(400).json({ error: "الرسالة مطلوبة" });

  const intent = forceExam ? "exam" : detectIntent(message);

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const systemExam = `
أنت مساعد تعليمي عربي.
المستخدم سيرسل نص فيه عدة أسئلة (قد تكون MCQ أو صح/خطأ أو فراغات).
مهمتك: إعادة ترتيب النص أولاً إلى أسئلة واضحة، ثم حل كل سؤال.

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
- تجاهل أي ضجيج/رموز/أرقام ليست جزءًا من السؤال.
- إذا النص مشوه/ناقص بشكل يمنع الحل: اكتب "❌ النص غير واضح" واطلب صورة أوضح بدل التخمين.
- لا تجمع الإجابات في آخر الرسالة؛ لازم كل سؤال مع حله وشرحه تحته مباشرة.
`.trim();

    const systemGeneral = "أنت مساعد عربي لمنصة تعليمية. أجب باختصار ووضوح.";

    let userContent =
      intent === "exam" ? sanitizeExamText(message) : String(message);

    // ✅ توحيد الأرقام: أي أرقام عربية (٣٥) تتحول للاتيني داخليًا (35)
    // هذا يساعد الذكاء الاصطناعي يفهمها ويخرجها صح.
    userContent = toLatinDigits(userContent);

    // ✅ إصلاح OCR عام (جذري) قبل الحل
    if (intent === "exam" && shouldRepairOcr(userContent)) {
      userContent = await repairOcrText(openai, userContent);
    }

    const msgs =
      intent === "exam"
        ? [
            { role: "system", content: systemExam },
            { role: "user", content: userContent },
          ]
        : [
            { role: "system", content: systemGeneral },
            { role: "user", content: userContent },
          ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: msgs,
      temperature: intent === "exam" ? 0.2 : 0.7,
    });

    let aiReply = response.choices?.[0]?.message?.content || "";

    // ✅ عرض الأرقام للطالب بالأرقام العربية الهندية (١٩١٠ / ٣٥)
    // إذا بدك تخليها إنجليزية احذف السطرين الجايين
    if (intent === "exam") {
      aiReply = toArabicIndicDigits(aiReply);
    }

    // إضافات الاشتراك فقط لغير الامتحان
    if (intent !== "exam") {
      if (intent === "pricing" && !isSubscribed) {
        aiReply +=
          "\n\n💡 للتفاصيل الكاملة حول الاشتراكات والحصول على ميزات إضافية، اشترك الآن عبر صفحة العروض!";
      } else if (intent === "support") {
        aiReply +=
          "\n\n🛠️ إذا واجهت أي مشكلة، تواصل معنا على صفحة الدعم: /contact";
      } else if (intent === "education") {
        aiReply += "\n\n📚 تفضل بزيارة قسم الامتحانات لتبدأ: /exams";
      }
    }

    return res.status(200).json({ reply: aiReply.trim() });
  } catch (error) {
    console.error(
      "❌ chatbot error:",
      error?.response?.data || error?.message || error
    );
    return res.status(500).json({ error: "حدث خطأ أثناء توليد الرد" });
  }
}

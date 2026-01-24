// src/utils/tawjihiCalculator.js

/**
 * حاسبة التوجيهي 30/70
 *
 * Grade 11:
 *  - عربي 100
 *  - إنجليزي 100
 *  - إسلامية 50
 *  - تاريخ الأردن 50
 *  => المجموع 300
 *
 * ✅ مهم: إذا الطالب أدخل الإسلامية/التاريخ كنسبة من 100 (مثل 88 و 99)
 * رح نحولهم تلقائياً إلى من 50 (يعني 88% من 50 = 44)
 */

export function calcTawjihiFinal30_70({ grade11, grade12Subjects }) {
  // ---- Grade 11 (30%) ----
  const g11_ar = normalizeScore(grade11?.arabic, 100);
  const g11_en = normalizeScore(grade11?.english, 100);
  const g11_is = normalizeScore(grade11?.islamic, 60);
  const g11_hi = normalizeScore(grade11?.history, 40);

  const g11_totalScore = g11_ar + g11_en + g11_is + g11_hi;
  const g11_totalMax = 300;

  const grade11Percent = clamp(round2((g11_totalScore / g11_totalMax) * 100));

  // ---- Grade 12 (70%) ----
  let g12_scoreSum = 0;
  let g12_maxSum = 0;

  (grade12Subjects || []).forEach((s) => {
    const max = toNum(s?.max ?? 100);
    if (max <= 0) return;

    const score = normalizeScore(s?.score, max);
    g12_scoreSum += score;
    g12_maxSum += max;
  });

  const grade12Percent =
    g12_maxSum > 0 ? clamp(round2((g12_scoreSum / g12_maxSum) * 100)) : 0;

  // ---- Final ----
  const final = clamp(round2(grade11Percent * 0.30 + grade12Percent * 0.70));

  // إضافات مفيدة للعرض (اختياري)
  const grade11From30 = round2(grade11Percent * 0.30); // كم جايب من 30
  const grade12From70 = round2(grade12Percent * 0.70); // كم جايب من 70

  return {
    grade11Percent,
    grade12Percent,
    final,
    grade11From30,
    grade12From70,

    // للتأكد/الديبَغ
    debug: {
      g11_ar,
      g11_en,
      g11_is,
      g11_hi,
      g11_totalScore,
      g11_totalMax,
      g12_scoreSum,
      g12_maxSum,
    },
  };
}

/**
 * يحول الإدخال لعلامة صحيحة ضمن max
 * - إذا max = 50 والطالب كتب 88 => نفترضها 88% ونحوّلها لـ 44/50
 * - إذا كتب 44 => نعتبرها 44/50 مباشرة
 * - إذا كتب رقم أكبر من 100 => نقصه للـ max
 */
function normalizeScore(rawValue, max) {
  const v = toNum(rawValue);

  if (v <= 0) return 0;

  // إذا المادة max أقل من 100 والطالب كتب رقم بين (max و 100)
  // غالباً قصده نسبة مئوية من 100
  if (max < 100 && v > max && v <= 100) {
    return clampTo(round2((v / 100) * max), max);
  }

  // غير ذلك: نعتبره علامة مباشرة من max
  return clampTo(v, max);
}

function toNum(v) {
  const n = parseFloat(String(v ?? "").trim().replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

function round2(x) {
  return Math.round(x * 100) / 100;
}

function clamp(x) {
  if (x < 0) return 0;
  if (x > 100) return 100;
  return x;
}

function clampTo(x, max) {
  if (x < 0) return 0;
  if (x > max) return max;
  return x;
}

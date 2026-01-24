import { useMemo, useState } from "react";
import { calcTawjihiFinal30_70 } from "@/utils/tawjihiCalculator";

export default function GpaCalculatorForm() {
  const [grade11, setGrade11] = useState({
    arabic: "",
    english: "",
    islamic: "",
    history: "",
  });

  const [grade12Subjects, setGrade12Subjects] = useState([
    { name: "مادة 1", score: "", max: 100 },
    { name: "مادة 2", score: "", max: 100 },
    { name: "مادة 3", score: "", max: 100 },
    { name: "مادة 4", score: "", max: 100 },
  ]);

  const result = useMemo(() => {
    return calcTawjihiFinal30_70({ grade11, grade12Subjects });
  }, [grade11, grade12Subjects]);

  // ✅ مساهمة كل سنة حسب 30/70 (من 30 ومن 70)
  const grade11From30 = useMemo(
    () => round2(result.grade11Percent * 0.30),
    [result.grade11Percent]
  );
  const grade12From70 = useMemo(
    () => round2(result.grade12Percent * 0.70),
    [result.grade12Percent]
  );

  const update12 = (idx, key, value) => {
    setGrade12Subjects((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [key]: value };
      return copy;
    });
  };

  const resetAll = () => {
    setGrade11({ arabic: "", english: "", islamic: "", history: "" });
    setGrade12Subjects([
      { name: "مادة 1", score: "", max: 100 },
      { name: "مادة 2", score: "", max: 100 },
      { name: "مادة 3", score: "", max: 100 },
      { name: "مادة 4", score: "", max: 100 },
    ]);
  };

  const copyResult = () => {
    const text =
      `معدلي النهائي: ${result.final}%\n` +
      `الحادي عشر: ${result.grade11Percent}% (حِصته: ${grade11From30}/30)\n` +
      `الثاني عشر: ${result.grade12Percent}% (حِصته: ${grade12From70}/70)`;
    if (navigator?.clipboard) navigator.clipboard.writeText(text);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Left: Form */}
      <div className="lg:col-span-2 space-y-5">
        <Header />

        {/* Grade 11 Card */}
        <Card
          title="علامات الحادي عشر (30%)"
          subtitle="أدخل المواد المشتركة — المجموع من 300"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label="اللغة العربية (100)"
              value={grade11.arabic}
              max={100}
              onChange={(v) => setGrade11({ ...grade11, arabic: v })}
            />
            <Input
              label="اللغة الإنجليزية (100)"
              value={grade11.english}
              max={100}
              onChange={(v) => setGrade11({ ...grade11, english: v })}
            />
            <Input
              label="التربية الإسلامية (60)"
              value={grade11.islamic}
              max={60}
              onChange={(v) => setGrade11({ ...grade11, islamic: v })}
            />
            <Input
              label="تاريخ الأردن (40)"
              value={grade11.history}
              max={40}
              onChange={(v) => setGrade11({ ...grade11, history: v })}
            />
          </div>
        </Card>

        {/* Grade 12 Card */}
        <Card
          title="علامات الثاني عشر (70%)"
          subtitle="أدخل موادك حسب خطتك — تقدر تغيّر الاسم والعدد"
          rightAction={
            <button
              onClick={() =>
                setGrade12Subjects((p) => [
                  ...p,
                  { name: `مادة ${p.length + 1}`, score: "", max: 100 },
                ])
              }
              className="text-sm font-semibold px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
              type="button"
            >
              + إضافة مادة
            </button>
          }
        >
          <div className="space-y-3">
            {grade12Subjects.map((s, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 rounded-xl border bg-white"
              >
                <Input
                  label="اسم المادة"
                  value={s.name}
                  onChange={(v) => update12(idx, "name", v)}
                  isText
                />
                <Input
                  label={`علامتك (من ${s.max})`}
                  value={s.score}
                  max={Number(s.max) || 100}
                  onChange={(v) => update12(idx, "score", v)}
                />
                <Input
                  label="العلامة العظمى"
                  value={s.max}
                  min={1}
                  max={300}
                  onChange={(v) => update12(idx, "max", v)}
                />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Right: Result (Sticky) */}
      <div className="lg:col-span-1">
        <div className="lg:sticky lg:top-6">
          <div className="rounded-2xl border bg-white shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="font-bold text-lg">النتيجة</div>
              <span className="text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-semibold">
                30/70
              </span>
            </div>

            <div className="space-y-2 text-sm text-gray-700">
              {/* ✅ المطلوب: من 30 ومن 70 */}
              <Row label="حصة الحادي عشر (من 30)" value={`${grade11From30}/30`} />
              <Row label="حصة الثاني عشر (من 70)" value={`${grade12From70}/70`} />

              {/* ✅ توضيح إضافي (اختياري) */}
              <div className="text-xs text-gray-500 mt-2">
                (نسبة الحادي عشر: {result.grade11Percent}% — نسبة الثاني عشر:{" "}
                {result.grade12Percent}%)
              </div>

              <div className="h-px bg-gray-100 my-3" />

              <div className="text-gray-900 text-3xl font-extrabold">
                {result.final}%
              </div>

              <div className="text-xs text-gray-500">
                (الحادي عشر × 30%) + (الثاني عشر × 70%)
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={resetAll}
                className="px-3 py-2 rounded-xl border bg-gray-50 hover:bg-gray-100 transition font-semibold text-sm"
              >
                مسح
              </button>

              <button
                type="button"
                onClick={copyResult}
                className="px-3 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition font-semibold text-sm"
              >
                نسخ النتيجة
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Header() {
  return (
    <div className="rounded-2xl bg-white border shadow-sm p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">
            حاسبة معدل التوجيهي 30/70
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            أدخل علامات الحادي عشر والثاني عشر لتحصل على معدلك النهائي فورًا.
          </p>
        </div>
        <div className="text-xs px-3 py-2 rounded-xl bg-gray-50 border text-gray-700 font-semibold">
          GhostExams
        </div>
      </div>
    </div>
  );
}

function Card({ title, subtitle, rightAction, children }) {
  return (
    <div className="rounded-2xl border bg-white shadow-sm p-5">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="font-bold text-gray-900">{title}</div>
          {subtitle ? (
            <div className="text-sm text-gray-600 mt-1">{subtitle}</div>
          ) : null}
        </div>
        {rightAction}
      </div>
      {children}
    </div>
  );
}

function Input({ label, value, onChange, max, min = 0, isText = false }) {
  const handleChange = (raw) => {
    if (isText) return onChange(raw);

    const cleaned = String(raw ?? "")
      .replace(/[^\d.,]/g, "")
      .replace(",", ".");

    if (cleaned === "") return onChange("");

    let n = parseFloat(cleaned);
    if (!Number.isFinite(n)) n = 0;

    if (Number.isFinite(min)) n = Math.max(Number(min), n);
    if (max != null && Number.isFinite(Number(max))) n = Math.min(Number(max), n);

    onChange(String(n));
  };

  return (
    <label className="block">
      <div className="text-sm font-semibold text-gray-700 mb-1">{label}</div>

      <input
        className="w-full border rounded-xl p-2.5 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        inputMode={isText ? "text" : "decimal"}
      />

      {!isText && max != null ? (
        <div className="mt-1 text-xs text-gray-500">الحد الأقصى: {max}</div>
      ) : null}
    </label>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-600">{label}</span>
      <span className="font-bold text-gray-900">{value}</span>
    </div>
  );
}

function round2(x) {
  return Math.round(Number(x) * 100) / 100;
}

import GpaCalculatorForm from "./GpaCalculatorForm";

export default function GpaCalculatorPage() {
  return (
    <div className="space-y-8">
      {/* Hero مثل ستايل صفحات الموقع */}
      <section className="rounded-3xl border bg-gradient-to-b from-gray-50 to-white p-6 md:p-10">
        <div className="max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
            حاسبة معدل التوجيهي 30/70
          </h1>
          <p className="mt-3 text-gray-600 text-base md:text-lg">
            أدخل علامات الحادي عشر والثاني عشر واحصل على معدلك النهائي فوراً.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <Badge>الحادي عشر 30%</Badge>
            <Badge>الثاني عشر 70%</Badge>
            <Badge>نتيجة فورية</Badge>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <GpaCalculatorForm />
        </div>

        <aside className="lg:col-span-1">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="font-bold text-gray-900 mb-2">
              كيف تنحسب؟
            </div>
            <div className="text-sm text-gray-600 leading-7">
              المعدل النهائي = (معدل الحادي عشر × 30%) + (معدل الثاني عشر × 70%)
            </div>

            <div className="mt-4 p-3 rounded-xl bg-gray-50 border text-sm text-gray-700">
              مثال: 11 = 85% ، 12 = 90% → الناتج = 88.5%
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}

function Badge({ children }) {
  return (
    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white border text-gray-700">
      {children}
    </span>
  );
}

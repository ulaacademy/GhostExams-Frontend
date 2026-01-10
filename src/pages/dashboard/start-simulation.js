import ComingSoon from "@/components/ComingSoon";

export default function StartSimulationPage() {
  return (
    <ComingSoon
      title="بدء محاكاة جديدة"
      description="سيتم تفعيل ميزة إنشاء محاكاة الامتحانات الوزارية قريبًا."
      backHref="/dashboard/simulation"
      backLabel="العودة إلى صفحة المحاكاة"
    />
  );
}


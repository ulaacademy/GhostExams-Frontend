import ComingSoon from "@/components/ComingSoon";

export default function PreviousSimulationsPage() {
  return (
    <ComingSoon
      title="محاكاة سابقة"
      description="ستتمكن قريبًا من مراجعة المحاكاة التي أنهيتها وتحليل نتائجك بالتفصيل."
      backHref="/dashboard/simulation"
      backLabel="العودة إلى صفحة المحاكاة"
    />
  );
}


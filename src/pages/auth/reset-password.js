import ComingSoon from "@/components/ComingSoon";

export default function ResetPasswordPage() {
  return (
    <ComingSoon
      title="استعادة كلمة المرور"
      description="خدمة إعادة تعيين كلمة المرور ستتوفر قريبًا. لحينها، يرجى التواصل مع الدعم."
      backHref="/auth/Login"
      backLabel="العودة إلى تسجيل الدخول"
    />
  );
}


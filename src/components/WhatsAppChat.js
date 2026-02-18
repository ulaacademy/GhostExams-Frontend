"use client";
import { useEffect, useRef, useState, useMemo } from "react";

export default function WhatsAppChat({
  phone = "962791515106", // بدون +
  // ✅ الإيموجي مكتوب Unicode عشان ما يتحول لـ � ويقصّ الرسالة
  message = "مرحبا، عندي استفسار بخصوص الاشتراك \u{1F44B} - بدي الأربع مواد بسعر 5 دنانير لأني جاي من الموقع",
}) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  // ✅ تنظيف بسيط: إزالة أسطر جديدة/مسافات زيادة (بعض المتصفحات تقصّ عند newline)
  const safeMessage = useMemo(() => {
    return String(message)
      .replace(/\r?\n|\r/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }, [message]);

  // ✅ الرابط الأفضل: wa.me + encodeURIComponent
  const waLink = useMemo(() => {
    return `https://wa.me/${phone}?text=${encodeURIComponent(safeMessage)}`;
  }, [phone, safeMessage]);

  // ✅ إغلاق عند الضغط خارج البوب اب + ESC
  useEffect(() => {
    const onMouseDown = (e) => {
      if (!open) return;
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };

    const onKeyDown = (e) => {
      if (!open) return;
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="fixed bottom-5 right-5 z-[9999]">
      {/* Popup */}
      {open && (
        <div
          ref={boxRef}
          className="mb-3 w-[calc(100vw-2.5rem)] max-w-sm rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden"
        >
          <div className="p-4 bg-gray-900 text-white flex items-center justify-between">
            <div className="font-semibold">واتساب البيع المباشر والدعم</div>
            <button
              onClick={() => setOpen(false)}
              className="text-white/80 hover:text-white"
              aria-label="إغلاق"
              type="button"
            >
              ✕
            </button>
          </div>

          <div className="p-4 text-right">
            <p className="text-sm text-gray-700 leading-relaxed">
              مرحبًا <span aria-hidden="true">{"\u{1F44B}"}</span>
              <br />
              اكتب سؤالك وسنرد عليك بأسرع وقت.
            </p>

            <div className="mt-4 flex gap-2">
              <a
                href={waLink}
                target="_blank"
                rel="noreferrer"
                className="flex-1 text-center rounded-xl bg-green-600 hover:bg-green-700 text-white py-2 font-semibold"
              >
                تواصل معنا
              </a>

              <button
                onClick={() => setOpen(false)}
                className="rounded-xl bg-gray-100 hover:bg-gray-200 px-4 py-2 text-gray-700 font-semibold"
                type="button"
              >
                لاحقًا
              </button>
            </div>

            <p className="mt-3 text-xs text-gray-600">
              * يتم فتح المحادثة في تطبيق واتساب أو واتساب ويب
            </p>

            {/* اختياري للتأكد أثناء الاختبار — احذفها لاحقًا */}
            {/* <p className="mt-2 text-[11px] text-gray-400 break-all">{waLink}</p> */}
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="h-14 w-14 rounded-full bg-green-600 hover:bg-green-700 shadow-xl flex items-center justify-center text-white text-2xl"
        aria-label="WhatsApp Chat"
        type="button"
      >
        💬
      </button>
    </div>
  );
}

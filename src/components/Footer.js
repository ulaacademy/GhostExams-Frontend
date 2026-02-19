"use client";

import Link from "next/link";

export default function Footer() {
  const phoneDisplay = "0791515106";
  const phoneIntl = "+962791515106"; // الأردن
  const waLink = "https://wa.me/962791515106";
  const igLink = "https://www.instagram.com/ghostexams_tawjihi_2009/";
  const fbLink = "https://www.facebook.com/ghostexams";

  return (
    <footer className="mt-12 border-t border-white/10 bg-gray-900 text-white">
      <div className="mx-auto max-w-6xl px-4 py-10" dir="rtl">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="text-right">
            <div className="text-xl font-extrabold text-yellow-400">
              GhostExams
            </div>
            <p className="mt-2 text-sm text-gray-200 leading-relaxed">
              منصة امتحانات توجيهي الأردن 2009 — امتحانات إلكترونية وبنك أسئلة
              مرتب للمراجعة والتحضير.
            </p>
          </div>

          {/* Quick links */}
          <nav className="text-right">
            <h3 className="text-sm font-extrabold text-yellow-300">
              روابط سريعة
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-gray-300 hover:text-yellow-300 transition"
                >
                  الرئيسية
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-gray-300 hover:text-yellow-300 transition"
                >
                  الاشتراكات
                </Link>
              </li>
              <li>
                <Link
                  href="/ourteachers"
                  className="text-gray-300 hover:text-yellow-300 transition"
                >
                  المعلمين
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-gray-300 hover:text-yellow-300 transition"
                >
                  تواصل معنا
                </Link>
              </li>
            </ul>
          </nav>

          {/* Contact */}
          <div className="text-right">
            <h3 className="text-sm font-extrabold text-yellow-300">
              تواصل سريع
            </h3>

            <div className="mt-3 space-y-3 text-sm">
              <div className="flex items-center justify-end gap-2">
                <span className="text-gray-300">واتساب:</span>
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-yellow-300 hover:text-yellow-200 font-bold transition"
                  aria-label="GhostExams WhatsApp"
                >
                  {phoneDisplay}
                </a>
              </div>

              <div className="flex items-center justify-end gap-2">
                <span className="text-gray-300">اتصال:</span>
                <a
                  href={`tel:${phoneIntl}`}
                  className="text-gray-200 hover:text-yellow-200 font-bold transition"
                  aria-label="Call GhostExams"
                >
                  {phoneDisplay}
                </a>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <a
                  href={igLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-yellow-300 transition"
                  aria-label="GhostExams Instagram"
                >
                  Instagram
                </a>
                <span className="text-gray-600">•</span>
                <a
                  href={fbLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-yellow-300 transition"
                  aria-label="GhostExams Facebook"
                >
                  Facebook
                </a>
                <span className="text-gray-600">•</span>
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-yellow-300 transition"
                  aria-label="GhostExams WhatsApp"
                >
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/10 pt-6">
          <p className="text-xs text-gray-400">
            © Ghost Exams Jordan 2026. All rights reserved.
          </p>

          <p className="text-xs text-gray-300">
            للتواصل فقط عبر واتساب:{" "}
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-yellow-300 transition font-bold"
            >
              {phoneDisplay}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

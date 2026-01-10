import Link from "next/link";
import Navbar from "./Navbar";

export default function ComingSoon({
  title = "ميزة جديدة قيد التطوير",
  description = "نعمل حاليًا على هذه الصفحة. Coming Soon!",
  backHref = "/",
  backLabel = "العودة إلى الرئيسية",
  showNavbar = true,
}) {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {showNavbar && <Navbar />}

      <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
          🛠️ {title}
        </h1>
        <p className="text-lg text-gray-600 mb-6 max-w-2xl">
          {description} <span className="font-semibold text-blue-600">Coming Soon</span>
        </p>

        <Link href={backHref}>
          <button className="px-6 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg shadow hover:bg-blue-700 transition duration-300">
            🔙 {backLabel}
          </button>
        </Link>
      </div>
    </div>
  );
}


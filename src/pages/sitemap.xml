/**
 * ✅ Dynamic Sitemap for GhostExams (Next.js Pages Router)
 * Path:  src/pages/sitemap.xml.js
 * URL :  https://ghostexams.com/sitemap.xml
 */

import { API_URL } from "@/services/api";

const SITE_URL = "https://ghostexams.com";

const STATIC_PATHS = ["/", "/pricing", "/ourteachers", "/chat", "/contact"];

const TAWJIHI_2009_HUB = "/tawjihi-2009";

const SUBJECTS = [
  { key: "arabic", slug: "arabic" },
  { key: "english", slug: "english" },
  { key: "jordan-history", slug: "jordan-history" },
  { key: "islamic", slug: "islamic" },
];

const TERMS = ["1", "2"];

// ---------------- helpers ----------------

function escapeXml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function normalizeLastMod(exam) {
  const d = exam?.updatedAt || exam?.createdAt || null;
  if (!d) return null;
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return null;
  return dt.toISOString();
}

async function fetchExamsFor(subjectKey, term) {
  const base = `${API_URL}/public/exams`;

  const urlsToTry = [
    `${base}?subject=${encodeURIComponent(subjectKey)}&term=${encodeURIComponent(
      term
    )}&grade=2009`,
    `${base}?subject=${encodeURIComponent(subjectKey)}&term=${encodeURIComponent(
      term
    )}`,
  ];

  for (const url of urlsToTry) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;

      const json = await res.json();
      const exams = json?.success ? json?.data : [];

      if (Array.isArray(exams) && exams.length > 0) return exams;
    } catch {
      // ignore and fallback
    }
  }

  return [];
}

function buildUrlEntry({ loc, lastmod, changefreq, priority }) {
  let xml = "  <url>\n";
  xml += `    <loc>${escapeXml(loc)}</loc>\n`;
  if (lastmod) xml += `    <lastmod>${escapeXml(lastmod)}</lastmod>\n`;
  if (changefreq)
    xml += `    <changefreq>${escapeXml(changefreq)}</changefreq>\n`;
  if (priority != null) xml += `    <priority>${String(priority)}</priority>\n`;
  xml += "  </url>\n";
  return xml;
}

function buildSitemapXml(entries) {
  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    entries.join("") +
    `</urlset>\n`
  );
}

// ---------------- Next.js handler ----------------

export async function getServerSideProps({ res }) {
  try {
    const entries = [];

    // 1) Static pages
    for (const path of STATIC_PATHS) {
      entries.push(
        buildUrlEntry({
          loc: `${SITE_URL}${path}`,
          changefreq: path === "/" ? "daily" : "weekly",
          priority: path === "/" ? "1.0" : "0.8",
        })
      );
    }

    // 2) Tawjihi 2009 hub
    entries.push(
      buildUrlEntry({
        loc: `${SITE_URL}${TAWJIHI_2009_HUB}`,
        changefreq: "weekly",
        priority: "0.9",
      })
    );

    // 3) Subject + term + exam pages
    for (const s of SUBJECTS) {
      const subjectRoot = `${TAWJIHI_2009_HUB}/${s.slug}`;

      // subject page
      entries.push(
        buildUrlEntry({
          loc: `${SITE_URL}${subjectRoot}`,
          changefreq: "weekly",
          priority: "0.9",
        })
      );

      for (const term of TERMS) {
        const termPath = `${subjectRoot}/term-${term}`;

        // term page
        entries.push(
          buildUrlEntry({
            loc: `${SITE_URL}${termPath}`,
            changefreq: "daily",
            priority: "0.85",
          })
        );

        // exams
        const exams = await fetchExamsFor(s.key, term);
        for (const exam of exams) {
          if (!exam?._id) continue;

          const examSeoUrl = `${SITE_URL}${termPath}/${exam._id}`;

          entries.push(
            buildUrlEntry({
              loc: examSeoUrl,
              lastmod: normalizeLastMod(exam) || undefined,
              changefreq: "weekly",
              priority: "0.7",
            })
          );
        }
      }
    }

    const sitemap = buildSitemapXml(entries);

    res.setHeader("Content-Type", "text/xml; charset=utf-8");
    res.setHeader(
      "Cache-Control",
      "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400"
    );

    res.write(sitemap);
    res.end();
  } catch  {
    // fallback valid xml
    const fallback = buildSitemapXml([
      buildUrlEntry({
        loc: `${SITE_URL}/`,
        changefreq: "daily",
        priority: "1.0",
      }),
    ]);

    res.setHeader("Content-Type", "text/xml; charset=utf-8");
    res.write(fallback);
    res.end();
  }

  return { props: {} };
}

export default function SiteMap() {
  return null;
}
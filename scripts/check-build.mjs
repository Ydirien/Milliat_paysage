import fs from "node:fs/promises";
import path from "node:path";

const siteUrl = "https://milliatpaysage.fr";
const pages = [
  "index.html",
  "services.html",
  "realisations.html",
  "a-propos.html",
  "contact.html",
  "mentions-legales.html",
  "politique-confidentialite.html",
  "plan-du-site.html",
  "404.html",
  "robots.txt",
  "sitemap.xml",
  "site.webmanifest",
  ".htaccess"
];
const indexablePages = [];
let failed = false;

async function assertExists(url) {
  const clean = url.split(/[?#]/)[0];
  const relative = clean === "/" ? "index.html" : clean.replace(/^\//, "");
  try {
    await fs.access(path.resolve("_site", relative));
  } catch {
    throw new Error(`ressource interne absente : ${url}`);
  }
}

for (const page of pages) {
  const file = path.resolve("_site", page);
  try {
    const source = await fs.readFile(file, "utf8");
    if (!source.trim()) throw new Error("fichier vide");
    if (page.endsWith(".html")) {
      if (!source.includes("<html lang=\"fr\">")) throw new Error("langue absente");
      if (!source.includes("<main id=\"contenu\"")) throw new Error("repère main absent");
      if ((source.match(/<h1[\s>]/g) || []).length !== 1) throw new Error("la page doit contenir exactement un h1");

      const title = source.match(/<title>([^<]*)<\/title>/)?.[1] || "";
      if (title.length < 10 || title.length > 70) throw new Error(`titre de ${title.length} caractères (10 à 70 attendus)`);
      const description = source.match(/<meta name="description" content="([^"]*)"/)?.[1] || "";
      if (description.length < 50 || description.length > 160) throw new Error(`description de ${description.length} caractères (50 à 160 attendus)`);

      const noindex = /<meta name="robots" content="[^"]*noindex/.test(source);
      const canonical = source.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
      if (noindex && canonical) throw new Error("canonique présente sur une page noindex");
      if (!noindex) {
        if (!canonical) throw new Error("canonique absente");
        if (!canonical.startsWith(siteUrl)) throw new Error(`canonique hors domaine : ${canonical}`);
        indexablePages.push(canonical);
      }

      const ogImage = source.match(/<meta property="og:image" content="([^"]+)"/)?.[1];
      if (!ogImage) throw new Error("og:image absente");
      await assertExists(ogImage.replace(siteUrl, ""));

      for (const match of source.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
        JSON.parse(match[1]);
      }

      for (const match of source.matchAll(/<(?:img|source)\b[^>]*>/g)) {
        const isImg = match[0].startsWith("<img");
        if (isImg && !/\salt="[^"]*"/.test(match[0])) throw new Error("image sans attribut alt");
        if (isImg && (!/\swidth="\d+"/.test(match[0]) || !/\sheight="\d+"/.test(match[0]))) throw new Error("image sans dimensions");
        const srcset = match[0].match(/\ssrcset="([^"]+)"/)?.[1];
        for (const candidate of srcset ? srcset.split(",") : []) await assertExists(candidate.trim().split(/\s+/)[0]);
      }

      for (const match of source.matchAll(/(?:src|href)="(\/[^"]*)"/g)) await assertExists(match[1]);

      // La Content-Security-Policy du .htaccess interdit les styles et scripts inline
      if (/\sstyle="/.test(source)) throw new Error("attribut style inline (bloqué par la CSP)");
      if (/<style[\s>]/.test(source)) throw new Error("balise style inline (bloquée par la CSP)");
      if (/\son[a-z]+="/.test(source)) throw new Error("gestionnaire d’événement inline (bloqué par la CSP)");
      for (const match of source.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
        if (match[2].trim() && !/type="application\/ld\+json"/.test(match[1])) throw new Error("script inline (bloqué par la CSP)");
      }
      if (/(?:src|href)="(?:https?:)?\/\/(?!milliatpaysage\.fr)/.test(source.replace(/<a\b[^>]*>/g, ""))) throw new Error("ressource tierce chargée (bloquée par la CSP)");

      const visibleText = source
        .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
        .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/&[a-z0-9#]+;/gi, " ");
      if (/[—:]/.test(visibleText)) throw new Error("ponctuation éditoriale interdite détectée");
    }
    if (page === "site.webmanifest") JSON.parse(source);
    console.log(`✓ ${page}`);
  } catch (error) {
    failed = true;
    console.error(`✗ ${page}: ${error.message}`);
  }
}

const sitemap = await fs.readFile(path.resolve("_site", "sitemap.xml"), "utf8");
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]).sort();
if (JSON.stringify(sitemapUrls) !== JSON.stringify([...indexablePages].sort())) {
  failed = true;
  console.error(`✗ le sitemap ne correspond pas aux pages indexables\n  sitemap : ${sitemapUrls.join(", ")}\n  pages : ${indexablePages.sort().join(", ")}`);
}

const allHtml = (await Promise.all(
  pages.filter((page) => page.endsWith(".html")).map((page) => fs.readFile(path.resolve("_site", page), "utf8"))
)).join("\n");

for (const forbidden of ["via.placeholder.com", "04 12 34 56 78", "Google Analytics", "À compléter"]) {
  if (allHtml.includes(forbidden)) {
    failed = true;
    console.error(`✗ contenu indésirable détecté : ${forbidden}`);
  }
}

for (const requiredLegalDetail of ["10059218700015", "27 RUE des Vignes", "68200 Mulhouse"]) {
  if (!allHtml.includes(requiredLegalDetail)) {
    failed = true;
    console.error(`✗ information légale absente : ${requiredLegalDetail}`);
  }
}

// Le script d'envoi ne doit dépendre ni d'un chemin propre au serveur ni d'un compte d'hébergement
const mailer = await fs.readFile(path.resolve("_site", "send-mail.php"), "utf8");
if (/\/home\/|public_html/.test(mailer)) {
  failed = true;
  console.error("✗ send-mail.php contient un chemin absolu propre au serveur");
}
for (const guard of ["ALLOWED_ORIGINS", "rate_limited(", "site_web"]) {
  if (!mailer.includes(guard)) {
    failed = true;
    console.error(`✗ protection absente de send-mail.php : ${guard}`);
  }
}

if (failed) process.exit(1);
console.log("Contrôle de build réussi.");

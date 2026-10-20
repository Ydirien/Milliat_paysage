const crypto = require("node:crypto");
const fs = require("node:fs/promises");
const path = require("node:path");
const sharp = require("sharp");

const generatedDir = path.resolve("src/assets/images/generated");
const publicDir = "/assets/images/generated";

function escapeAttribute(value) {
  return String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

// Recense les variantes WebP produites par scripts/optimize-images.mjs avec leurs dimensions réelles
module.exports = async function () {
  const variants = {};
  for (const file of await fs.readdir(generatedDir)) {
    const match = file.match(/^(.+)-(\d+)\.webp$/);
    if (!match) continue;
    // Lecture en mémoire pour ne pas garder de descripteur ouvert (verrou Windows pendant eleventy --serve)
    const buffer = await fs.readFile(path.join(generatedDir, file));
    const { width, height } = await sharp(buffer).metadata();
    // Empreinte du contenu : une photo remplacée sous le même nom n'est pas servie depuis le cache
    const version = crypto.createHash("sha256").update(buffer).digest("hex").slice(0, 10);
    (variants[match[1]] ||= []).push({ url: `${publicDir}/${file}?v=${version}`, width, height });
  }
  Object.values(variants).forEach((list) => list.sort((a, b) => a.width - b.width));

  const listFor = (stem) => {
    const list = variants[stem];
    if (!list) throw new Error(`Image inconnue : ${stem}. Lancer npm run images.`);
    return list;
  };
  const srcset = (list) => list.map((variant) => `${variant.url} ${variant.width}w`).join(", ");

  return {
    // wide : variante 3:2 pour un emplacement toujours paysage
    // wideBelow : variante 3:2 sous cette largeur d'écran seulement (élément picture)
    img(stem, { alt, sizes = "100vw", loading = "lazy", fetchpriority, className, fallbackWidth = 1024, wide = false, wideBelow } = {}) {
      if (alt === undefined) throw new Error(`Texte alternatif manquant pour ${stem}`);
      const list = listFor(wide ? `${stem}-wide` : stem);
      const fallback = [...list].reverse().find((variant) => variant.width <= fallbackWidth) || list[0];
      const attributes = [
        className && `class="${escapeAttribute(className)}"`,
        `src="${fallback.url}"`,
        `srcset="${srcset(list)}"`,
        `sizes="${escapeAttribute(sizes)}"`,
        `width="${fallback.width}"`,
        `height="${fallback.height}"`,
        `alt="${escapeAttribute(alt)}"`,
        loading === "lazy" ? `loading="lazy" decoding="async"` : null,
        fetchpriority && `fetchpriority="${fetchpriority}"`
      ];
      const tag = `<img ${attributes.filter(Boolean).join(" ")}>`;
      if (!wideBelow) return tag;
      const wideList = listFor(`${stem}-wide`);
      return `<picture><source media="(max-width: ${wideBelow - 1}px)" srcset="${srcset(wideList)}" sizes="${escapeAttribute(sizes)}">${tag}</picture>`;
    }
  };
};

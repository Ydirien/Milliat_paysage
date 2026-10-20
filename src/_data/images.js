const crypto = require("node:crypto");
const fs = require("node:fs/promises");
const path = require("node:path");
const sharp = require("sharp");

const generatedDir = path.resolve("src/assets/images/generated");
const publicDir = "/assets/images/generated";

function escapeAttribute(value) {
  return String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

// Recense les variantes AVIF et WebP produites par scripts/optimize-images.mjs avec leurs dimensions réelles
module.exports = async function () {
  const variants = {};
  for (const file of await fs.readdir(generatedDir)) {
    const match = file.match(/^(.+)-(\d+)\.(avif|webp)$/);
    if (!match) continue;
    const [, stem, , format] = match;
    // Lecture en mémoire pour ne pas garder de descripteur ouvert (verrou Windows pendant eleventy --serve)
    const buffer = await fs.readFile(path.join(generatedDir, file));
    const { width, height } = await sharp(buffer).metadata();
    // Empreinte du contenu : une photo remplacée sous le même nom n'est pas servie depuis le cache
    const version = crypto.createHash("sha256").update(buffer).digest("hex").slice(0, 10);
    ((variants[stem] ||= { avif: [], webp: [] })[format]).push({ url: `${publicDir}/${file}?v=${version}`, width, height });
  }
  Object.values(variants).forEach((set) => Object.values(set).forEach((list) => list.sort((a, b) => a.width - b.width)));

  const setFor = (stem) => {
    const set = variants[stem];
    if (!set?.webp.length) throw new Error(`Image inconnue : ${stem}. Lancer npm run images.`);
    return set;
  };
  const srcset = (list) => list.map((variant) => `${variant.url} ${variant.width}w`).join(", ");
  const source = (list, type, sizes, media) => list.length
    ? `<source${media ? ` media="${media}"` : ""} type="${type}" srcset="${srcset(list)}" sizes="${escapeAttribute(sizes)}">`
    : "";

  return {
    // wide : variante 3:2 pour un emplacement toujours paysage
    // wideBelow : variante 3:2 sous cette largeur d'écran seulement
    img(stem, { alt, sizes = "100vw", loading = "lazy", fetchpriority, className, fallbackWidth = 1024, wide = false, wideBelow } = {}) {
      if (alt === undefined) throw new Error(`Texte alternatif manquant pour ${stem}`);
      const set = setFor(wide ? `${stem}-wide` : stem);
      const fallback = [...set.webp].reverse().find((variant) => variant.width <= fallbackWidth) || set.webp[0];
      const attributes = [
        className && `class="${escapeAttribute(className)}"`,
        `src="${fallback.url}"`,
        `srcset="${srcset(set.webp)}"`,
        `sizes="${escapeAttribute(sizes)}"`,
        `width="${fallback.width}"`,
        `height="${fallback.height}"`,
        `alt="${escapeAttribute(alt)}"`,
        loading === "lazy" ? `loading="lazy" decoding="async"` : null,
        fetchpriority && `fetchpriority="${fetchpriority}"`
      ];
      // Le navigateur retient la première source compatible : variante paysage d'abord, AVIF avant WebP
      let sources = "";
      if (wideBelow) {
        const media = `(max-width: ${wideBelow - 1}px)`;
        const wideSet = setFor(`${stem}-wide`);
        sources += source(wideSet.avif, "image/avif", sizes, media) + source(wideSet.webp, "image/webp", sizes, media);
      }
      sources += source(set.avif, "image/avif", sizes);
      return `<picture>${sources}<img ${attributes.filter(Boolean).join(" ")}></picture>`;
    }
  };
};

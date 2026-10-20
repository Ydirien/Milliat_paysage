import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const sourceDir = path.resolve("assets/img");
const outputDir = path.resolve("src/assets/images/generated");
const images = [
  "jardin-entretenu.png",
  "amenagement-paysager.jpg",
  "finitions-chantier-paysagiste.jpg",
  "entretien-jardin-arbore.jpg",
  "tonte-pelouse.png",
  "taille-haie.png",
  "creation-paysagere.png",
  "jardin-arbore-apres-entretien.jpg",
  "vegetaux-plantation.jpg",
  "alexis-milliat-paysagiste.jpg"
];
// Largeurs cibles, plafonnées à la largeur réelle de la source pour ne jamais annoncer une variante agrandie.
// 1024 px suffit : aucune image n'est affichée à plus de 1024 px de large, même sur un écran 3x.
// Le palier 640 correspond aux cartes affichées en 390 px sur les mobiles de densité 1,75.
const widths = [480, 640, 768, 1024];
// Les photos très verticales sont recadrées en 4:5. Les emplacements les affichent en object-fit cover
// dans un cadre plus large que 4:5, la partie retirée n'était donc jamais visible.
const maxPortraitRatio = 1.25;
const uncropped = new Set(["alexis-milliat-paysagiste.jpg"]);
// Les grandes variantes ne servent qu'aux écrans haute densité, où une compression plus forte ne se voit pas
const quality = (width) => (width <= 480 ? 72 : width <= 768 ? 64 : 58);
// Chaque variante existe en AVIF (environ 40 % plus léger) et en WebP pour les navigateurs qui ne lisent pas l'AVIF
const encoders = {
  avif: (image, width) => image.avif({ quality: quality(width) - 16, effort: 4 }),
  webp: (image, width) => image.webp({ quality: quality(width), effort: 6, smartSubsample: true })
};
const ogImages = ["jardin-entretenu.png", "amenagement-paysager.jpg", "tonte-pelouse.png"];
const logoSource = path.join(sourceDir, "logo-milliat-v2.png");
const expected = new Set();

sharp.cache(false);
await fs.mkdir(outputDir, { recursive: true });

// Toute modification des réglages ou de ce script force une régénération complète
const settingsFile = path.join(outputDir, ".pipeline");
const settings = (await import("node:crypto")).createHash("sha256").update(await fs.readFile(new URL(import.meta.url))).digest("hex");
const force = (await fs.readFile(settingsFile, "utf8").catch(() => "")) !== settings;
expected.add(".pipeline");

// Ne régénère une variante que si elle manque ou si la source est plus récente
async function generate(source, filename, pipeline) {
  const target = path.join(outputDir, filename);
  expected.add(filename);
  if (!force) try {
    const [sourceStat, targetStat] = await Promise.all([fs.stat(source), fs.stat(target)]);
    if (targetStat.mtimeMs >= sourceStat.mtimeMs) return;
  } catch {}
  const buffer = await pipeline(sharp(await fs.readFile(source))).toBuffer();
  // Sous Windows, eleventy --serve peut verrouiller brièvement un fichier qu'il recopie
  for (let attempt = 1; ; attempt++) {
    try {
      await fs.writeFile(target, buffer);
      return;
    } catch (error) {
      if (attempt === 5 || !["EBUSY", "EPERM", "UNKNOWN"].includes(error.code)) throw error;
      await new Promise((resolve) => setTimeout(resolve, 200 * attempt));
    }
  }
}

for (const filename of images) {
  const source = path.join(sourceDir, filename);
  const stem = path.parse(filename).name;
  const { width: sourceWidth, height: sourceHeight } = await sharp(await fs.readFile(source)).rotate().metadata();
  const crop = !uncropped.has(filename) && sourceHeight / sourceWidth > maxPortraitRatio;
  const targets = widths.filter((width) => width <= sourceWidth);
  if (!targets.length || targets.at(-1) < Math.min(sourceWidth, widths.at(-1))) targets.push(Math.min(sourceWidth, widths.at(-1)));

  for (const width of targets) {
    for (const [format, encode] of Object.entries(encoders)) {
      await generate(source, `${stem}-${width}.${format}`, (image) => encode(image
        .rotate()
        .resize(crop
          ? { width, height: Math.round(width * maxPortraitRatio), fit: "cover", position: "centre" }
          : { width, withoutEnlargement: true }), width));

      // Variante 3:2 pour les emplacements paysage (cartes, grilles, page Services sur mobile)
      if (uncropped.has(filename)) continue;
      await generate(source, `${stem}-wide-${width}.${format}`, (image) => encode(image
        .rotate()
        .resize({ width, height: Math.round(width / 1.5), fit: "cover", position: "centre" }), width));
    }
  }
}

// Logo de l'en-tête et du pied de page, affiché entre 44 et 58 px de large
for (const width of [128, 256]) {
  await generate(logoSource, `logo-milliat-v2-${width}.avif`, (image) => image.resize({ width }).avif({ quality: 60, effort: 4 }));
  await generate(logoSource, `logo-milliat-v2-${width}.webp`, (image) => image.resize({ width }).webp({ quality: 90, effort: 6 }));
}

// Images de partage au format recommandé par Open Graph (1200 × 630, JPEG)
for (const filename of ogImages) {
  await generate(path.join(sourceDir, filename), `${path.parse(filename).name}-og.jpg`, (image) => image
    .rotate()
    .resize({ width: 1200, height: 630, fit: "cover", position: "attention" })
    .jpeg({ quality: 80, mozjpeg: true }));
}

// Version 320 px pour le filigrane des en-têtes de page et les données structurées
await generate(logoSource, "logo-milliat-v2.webp", (image) => image
  .resize({ width: 320, withoutEnlargement: true })
  .webp({ quality: 92, effort: 5 }));

// Favicons en multiples de 48 px, comme le recommande Google, et icônes d'application
for (const size of [48, 96, 192, 512]) {
  await generate(logoSource, `favicon-${size}.png`, (image) => image
    .resize({ width: size, height: size, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 }));
}
await generate(logoSource, "apple-touch-icon.png", (image) => image
  .resize({ width: 150, height: 150, fit: "contain", background: "#fbf9f1" })
  .extend({ top: 15, bottom: 15, left: 15, right: 15, background: "#fbf9f1" })
  .flatten({ background: "#fbf9f1" })
  .png({ compressionLevel: 9 }));

await fs.writeFile(settingsFile, settings);

// Supprime les variantes obsolètes (images renommées ou retirées)
for (const file of await fs.readdir(outputDir)) {
  if (!expected.has(file)) await fs.rm(path.join(outputDir, file));
}

console.log(`Images optimisées dans ${path.relative(process.cwd(), outputDir)}`);

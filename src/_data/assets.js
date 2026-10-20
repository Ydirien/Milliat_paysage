const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const assetsDir = path.resolve("src/assets");
const shortHash = (content) => crypto.createHash("sha256").update(content).digest("hex").slice(0, 10);

// URL versionnée par l'empreinte du contenu : le fichier peut être mis en cache un an
// et n'est retéléchargé qu'après une vraie modification
function url(publicPath) {
  const file = path.join(assetsDir, publicPath.replace(/^\/assets\//, ""));
  return `${publicPath}?v=${shortHash(fs.readFileSync(file))}`;
}

// Fonction réévaluée à chaque build, pour suivre les modifications du CSS pendant eleventy --serve
module.exports = function () {
  // Le CSS est intégré dans chaque page pour éviter un aller-retour réseau avant le premier affichage
  const css = fs.readFileSync(path.join(assetsDir, "css/site.css"), "utf8")
    .replace(/url\((['"]?)(\/assets\/[^'")?]+)\1\)/g, (match, quote, publicPath) => `url(${quote}${url(publicPath)}${quote})`)
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s*\n\s*/g, "\n")
    .trim();

  return {
    url,
    css: {
      content: css,
      // Empreinte autorisée par la Content-Security-Policy du .htaccess
      hash: crypto.createHash("sha256").update(css).digest("base64")
    }
  };
};

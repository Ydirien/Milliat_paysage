const ejsPlugin = require("@11ty/eleventy-plugin-ejs");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(ejsPlugin);
  // Seuls les fichiers servis sont publiés : le CSS est intégré aux pages via src/_data/assets.js
  eleventyConfig.addPassthroughCopy({ "src/assets/js": "assets/js" });
  eleventyConfig.addPassthroughCopy({ "src/assets/images/generated/*.{avif,webp,png,jpg}": "assets/images/generated" });
  // Une modification du CSS doit relancer le build puisqu'il est intégré aux pages
  eleventyConfig.addWatchTarget("src/assets/css/");
  eleventyConfig.addPassthroughCopy("send-mail.php");
  eleventyConfig.addPassthroughCopy("vendor");

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site"
    },
    templateFormats: ["ejs"],
    htmlTemplateEngine: "ejs"
  };
};

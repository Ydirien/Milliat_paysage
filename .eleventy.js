const ejsPlugin = require("@11ty/eleventy-plugin-ejs");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(ejsPlugin);
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/.htaccess": ".htaccess" });
  eleventyConfig.addPassthroughCopy("send-mail.php");
  eleventyConfig.addPassthroughCopy("vendor");

  eleventyConfig.addFilter("year", () => new Date().getFullYear());
  eleventyConfig.addFilter("isActive", (pageUrl, targetUrl) => pageUrl === targetUrl);

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

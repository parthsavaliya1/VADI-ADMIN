const path = require("node:path");

// Tailwind 4.1 resolves imports from the parent of cwd when a bundler omits
// PostCSS's `from`. Supply the original filename, or a project-local fallback.
module.exports = () => ({
  postcssPlugin: "vadi-postcss-project-source",
  Once(root, { result }) {
    if (!result.opts.from) {
      result.opts.from = root.source?.input.file || path.join(__dirname, "postcss-input.css");
    }
  },
});
module.exports.postcss = true;

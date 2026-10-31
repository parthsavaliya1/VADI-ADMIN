import path from "node:path";

const config = {
  plugins: {
    [path.resolve("postcss-project-source.cjs")]: {},
    "@tailwindcss/postcss": {},
  },
};

export default config;

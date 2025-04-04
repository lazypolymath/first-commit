import { defineConfig } from "vite";
import monkey from "vite-plugin-monkey";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    monkey({
      entry: "src/main.ts",
      userscript: {
        version: "1.0.0",
        description:
          "A simple userscript to view the first commit of a GitHub repository.",
        icon: "https://github.githubassets.com/favicons/favicon.svg",
        namespace: "https://github.com/lazypolymath",
        author: "https://github.com/lazypolymath",
        match: ["https://github.com/*/*"],
        downloadURL:
          "https://github.com/lazypolymath/first-commit/raw/main/dist/build.user.js",
        updateURL:
          "https://github.com/lazypolymath/first-commit/raw/main/dist/build.user.js",
        source: "https://github.com/lazypolymath/first-commit",
        connect: ["api.github.com"],
      },
      build: {
        fileName: "build.user.js",
      },
    }),
  ],
});

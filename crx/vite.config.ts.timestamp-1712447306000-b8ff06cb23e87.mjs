// vite.config.ts
import { crx } from "file:///C:/Users/gitnasr/Desktop/socialstalker/crx/node_modules/@crxjs/vite-plugin/dist/index.mjs";
import { resolve } from "path";
import { defineConfig } from "file:///C:/Users/gitnasr/Desktop/socialstalker/crx/node_modules/vite/dist/node/index.js";

// manifest.dev.json
var manifest_dev_default = {
  icons: {
    "128": "public/dev-icon-128.png"
  },
  web_accessible_resources: [
    {
      resources: [
        "dev-icon-128.png",
        "dev-icon-32.png",
        "style.css"
      ],
      matches: []
    }
  ]
};

// vite.config.ts
import fs from "fs";

// manifest.json
var manifest_default = {
  manifest_version: 3,
  name: "<name in manifest.json>",
  description: "<description in manifest.json>",
  background: {
    service_worker: "src/background/index.ts"
  },
  icons: {
    "128": "icon-128.png"
  },
  permissions: [
    "activeTab",
    "downloads",
    "notifications",
    "tabs",
    "storage",
    "webRequest",
    "webNavigation"
  ],
  content_scripts: [
    {
      matches: ["https://*.instagram.com/*"],
      js: [
        "src/scripts/instagram/profile.ts",
        "src/scripts/instagram/stories.ts",
        "src/scripts/instagram/posts.ts",
        "src/scripts/utils.ts"
      ],
      css: ["style.css"]
    },
    {
      runs_at: "document_start",
      matches: ["https://*.facebook.com/*"],
      js: [
        "src/scripts/facebook/stories.ts",
        "src/scripts/facebook/profile.ts",
        "src/scripts/utils.ts"
      ],
      css: ["style.css"]
    }
  ],
  options_page: "src/pages/options/index.html",
  web_accessible_resources: [
    {
      resources: ["icon-128.png", "icon-32.png", "style.css"],
      matches: []
    }
  ],
  host_permissions: ["*://*.facebook.com/*", "*://*.instagram.com/"]
};

// package.json
var package_default = {
  name: "vite-web-extension",
  version: "1.1.0",
  description: "A simple chrome extension template with Vite, React, TypeScript and Tailwind CSS.",
  license: "MIT",
  repository: {
    type: "git",
    url: "https://github.com/JohnBra/web-extension.git"
  },
  scripts: {
    build: "vite build",
    dev: "nodemon",
    test: "jest"
  },
  type: "module",
  dependencies: {
    clsx: "^2.1.0",
    jszip: "^3.10.1",
    moment: "^2.30.1",
    react: "^18.2.0",
    "react-dom": "^18.2.0",
    "react-icons": "^5.0.1",
    underscore: "^1.13.6",
    "webextension-polyfill": "^0.10.0"
  },
  devDependencies: {
    "@babel/preset-env": "^7.24.4",
    "@babel/preset-typescript": "^7.24.1",
    "@crxjs/vite-plugin": "^1.0.14",
    "@jest/globals": "^29.7.0",
    "@types/chrome": "^0.0.253",
    "@types/jest": "^29.5.12",
    "@types/node": "^18.17.1",
    "@types/react": "^18.2.39",
    "@types/react-dom": "^18.2.17",
    "@types/underscore": "^1.11.15",
    "@types/webextension-polyfill": "^0.10.0",
    "@typescript-eslint/eslint-plugin": "^5.49.0",
    "@typescript-eslint/parser": "^5.49.0",
    "@vitejs/plugin-react-swc": "^3.0.1",
    autoprefixer: "^10.4.16",
    cheerio: "^1.0.0-rc.12",
    eslint: "^8.32.0",
    "eslint-config-prettier": "^8.6.0",
    "eslint-plugin-import": "^2.27.5",
    "eslint-plugin-jsx-a11y": "^6.7.1",
    "eslint-plugin-react": "^7.32.1",
    "eslint-plugin-react-hooks": "^4.3.0",
    "fs-extra": "^11.1.0",
    jest: "^29.7.0",
    nodemon: "^2.0.20",
    postcss: "^8.4.31",
    tailwindcss: "^3.3.5",
    "ts-jest": "^29.1.2",
    "ts-node": "^10.9.1",
    typescript: "^4.9.4",
    vite: "^4.5.0"
  }
};

// vite.config.ts
import react from "file:///C:/Users/gitnasr/Desktop/socialstalker/crx/node_modules/@vitejs/plugin-react-swc/index.mjs";
var __vite_injected_original_dirname = "C:\\Users\\gitnasr\\Desktop\\socialstalker\\crx";
var root = resolve(__vite_injected_original_dirname, "src");
var pagesDir = resolve(root, "pages");
var assetsDir = resolve(root, "assets");
var outDir = resolve(__vite_injected_original_dirname, "dist");
var publicDir = resolve(__vite_injected_original_dirname, "public");
var typesDir = resolve(root, "types");
var isDev = process.env.__DEV__ === "true";
var extensionManifest = {
  ...manifest_default,
  ...isDev ? manifest_dev_default : {},
  name: isDev ? `DEV: ${manifest_default.name}` : manifest_default.name,
  version: package_default.version
};
function stripDevIcons(apply) {
  if (apply)
    return null;
  return {
    name: "strip-dev-icons",
    resolveId(source) {
      return source === "virtual-module" ? source : null;
    },
    renderStart(outputOptions, inputOptions) {
      const outDir2 = outputOptions.dir;
      fs.rm(resolve(outDir2, "dev-icon-32.png"), () => console.log(`Deleted dev-icon-32.png frm prod build`));
      fs.rm(resolve(outDir2, "dev-icon-128.png"), () => console.log(`Deleted dev-icon-128.png frm prod build`));
    }
  };
}
var vite_config_default = defineConfig({
  resolve: {
    alias: {
      "@src": root,
      "@assets": assetsDir,
      "@pages": pagesDir,
      "@types": typesDir
    }
  },
  plugins: [
    react(),
    crx({
      manifest: extensionManifest,
      contentScripts: {
        injectCss: true
      }
    }),
    stripDevIcons(isDev)
  ],
  publicDir,
  build: {
    outDir,
    sourcemap: isDev,
    emptyOutDir: !isDev,
    minify: !isDev,
    reportCompressedSize: !isDev
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAibWFuaWZlc3QuZGV2Lmpzb24iLCAibWFuaWZlc3QuanNvbiIsICJwYWNrYWdlLmpzb24iXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxnaXRuYXNyXFxcXERlc2t0b3BcXFxcc29jaWFsc3RhbGtlclxcXFxjcnhcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXGdpdG5hc3JcXFxcRGVza3RvcFxcXFxzb2NpYWxzdGFsa2VyXFxcXGNyeFxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvZ2l0bmFzci9EZXNrdG9wL3NvY2lhbHN0YWxrZXIvY3J4L3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgTWFuaWZlc3RWM0V4cG9ydCwgY3J4IH0gZnJvbSAnQGNyeGpzL3ZpdGUtcGx1Z2luJztcclxuaW1wb3J0IHBhdGgsIHsgcmVzb2x2ZSB9IGZyb20gJ3BhdGgnO1xyXG5cclxuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XHJcbmltcG9ydCBkZXZNYW5pZmVzdCBmcm9tICcuL21hbmlmZXN0LmRldi5qc29uJztcclxuaW1wb3J0IGZzIGZyb20gJ2ZzJztcclxuaW1wb3J0IG1hbmlmZXN0IGZyb20gJy4vbWFuaWZlc3QuanNvbic7XHJcbmltcG9ydCBwa2cgZnJvbSAnLi9wYWNrYWdlLmpzb24nO1xyXG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3Qtc3djJztcclxuXHJcbmNvbnN0IHJvb3QgPSByZXNvbHZlKF9fZGlybmFtZSwgJ3NyYycpO1xyXG5jb25zdCBwYWdlc0RpciA9IHJlc29sdmUocm9vdCwgJ3BhZ2VzJyk7XHJcbmNvbnN0IGFzc2V0c0RpciA9IHJlc29sdmUocm9vdCwgJ2Fzc2V0cycpO1xyXG5jb25zdCBvdXREaXIgPSByZXNvbHZlKF9fZGlybmFtZSwgJ2Rpc3QnKTtcclxuY29uc3QgcHVibGljRGlyID0gcmVzb2x2ZShfX2Rpcm5hbWUsICdwdWJsaWMnKTtcclxuY29uc3QgdHlwZXNEaXIgPSByZXNvbHZlKHJvb3QsICd0eXBlcycpO1xyXG5jb25zdCBpc0RldiA9IHByb2Nlc3MuZW52Ll9fREVWX18gPT09ICd0cnVlJztcclxuXHJcbmNvbnN0IGV4dGVuc2lvbk1hbmlmZXN0ID0ge1xyXG4gIC4uLm1hbmlmZXN0LFxyXG4gIC4uLihpc0RldiA/IGRldk1hbmlmZXN0IDoge30gYXMgTWFuaWZlc3RWM0V4cG9ydCksXHJcbiAgbmFtZTogaXNEZXYgPyBgREVWOiAkeyBtYW5pZmVzdC5uYW1lIH1gIDogbWFuaWZlc3QubmFtZSxcclxuICB2ZXJzaW9uOiBwa2cudmVyc2lvbixcclxuICBcclxufTtcclxuXHJcbi8vIHBsdWdpbiB0byByZW1vdmUgZGV2IGljb25zIGZyb20gcHJvZCBidWlsZFxyXG5mdW5jdGlvbiBzdHJpcERldkljb25zIChhcHBseTogYm9vbGVhbikge1xyXG4gIGlmIChhcHBseSkgcmV0dXJuIG51bGxcclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIG5hbWU6ICdzdHJpcC1kZXYtaWNvbnMnLFxyXG4gICAgcmVzb2x2ZUlkIChzb3VyY2U6IHN0cmluZykge1xyXG4gICAgICByZXR1cm4gc291cmNlID09PSAndmlydHVhbC1tb2R1bGUnID8gc291cmNlIDogbnVsbFxyXG4gICAgfSxcclxuICAgIHJlbmRlclN0YXJ0IChvdXRwdXRPcHRpb25zOiBhbnksIGlucHV0T3B0aW9uczogYW55KSB7XHJcbiAgICAgIGNvbnN0IG91dERpciA9IG91dHB1dE9wdGlvbnMuZGlyXHJcbiAgICAgIGZzLnJtKHJlc29sdmUob3V0RGlyLCAnZGV2LWljb24tMzIucG5nJyksICgpID0+IGNvbnNvbGUubG9nKGBEZWxldGVkIGRldi1pY29uLTMyLnBuZyBmcm0gcHJvZCBidWlsZGApKVxyXG4gICAgICBmcy5ybShyZXNvbHZlKG91dERpciwgJ2Rldi1pY29uLTEyOC5wbmcnKSwgKCkgPT4gY29uc29sZS5sb2coYERlbGV0ZWQgZGV2LWljb24tMTI4LnBuZyBmcm0gcHJvZCBidWlsZGApKVxyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuICByZXNvbHZlOiB7XHJcbiAgICBhbGlhczoge1xyXG4gICAgICAnQHNyYyc6IHJvb3QsXHJcbiAgICAgICdAYXNzZXRzJzogYXNzZXRzRGlyLFxyXG4gICAgICAnQHBhZ2VzJzogcGFnZXNEaXIsXHJcbiAgICAgIFwiQHR5cGVzXCI6IHR5cGVzRGlyLFxyXG4gICAgfSxcclxuICB9LFxyXG4gIHBsdWdpbnM6IFtcclxuICAgIHJlYWN0KCksXHJcbiAgICBjcngoe1xyXG4gICAgICBtYW5pZmVzdDogZXh0ZW5zaW9uTWFuaWZlc3QgYXMgTWFuaWZlc3RWM0V4cG9ydCxcclxuICAgICAgY29udGVudFNjcmlwdHM6IHtcclxuICAgICAgICBpbmplY3RDc3M6IHRydWUsXHJcbiAgICAgICAgXHJcbiAgICAgIH0sXHJcbiAgICAgXHJcbiAgICB9KSxcclxuICAgIHN0cmlwRGV2SWNvbnMoaXNEZXYpXHJcbiAgXSxcclxuICBwdWJsaWNEaXIsXHJcbiAgYnVpbGQ6IHtcclxuICAgIG91dERpcixcclxuICAgIHNvdXJjZW1hcDogaXNEZXYsXHJcbiAgICBlbXB0eU91dERpcjogIWlzRGV2LFxyXG4gICAgbWluaWZ5OiAhaXNEZXYsXHJcbiAgICByZXBvcnRDb21wcmVzc2VkU2l6ZTogIWlzRGV2LFxyXG4gICAgXHJcbiAgXHJcbiAgfSxcclxuICBcclxufSk7XHJcbiIsICJ7XHJcblxyXG4gIFwiaWNvbnNcIjoge1xyXG4gICAgXCIxMjhcIjogXCJwdWJsaWMvZGV2LWljb24tMTI4LnBuZ1wiXHJcbiAgfSxcclxuICBcIndlYl9hY2Nlc3NpYmxlX3Jlc291cmNlc1wiOiBbXHJcbiAgICB7XHJcbiAgICAgIFwicmVzb3VyY2VzXCI6IFtcclxuICAgICAgICBcImRldi1pY29uLTEyOC5wbmdcIixcclxuICAgICAgICBcImRldi1pY29uLTMyLnBuZ1wiLFxyXG4gICAgICAgIFwic3R5bGUuY3NzXCJcclxuICAgICAgXSxcclxuICAgICAgXCJtYXRjaGVzXCI6IFtdXHJcbiAgICB9XHJcbiAgXVxyXG5cclxufVxyXG4iLCAie1xyXG5cdFwibWFuaWZlc3RfdmVyc2lvblwiOiAzLFxyXG5cdFwibmFtZVwiOiBcIjxuYW1lIGluIG1hbmlmZXN0Lmpzb24+XCIsXHJcblx0XCJkZXNjcmlwdGlvblwiOiBcIjxkZXNjcmlwdGlvbiBpbiBtYW5pZmVzdC5qc29uPlwiLFxyXG5cdFwiYmFja2dyb3VuZFwiOiB7XHJcblx0XHRcInNlcnZpY2Vfd29ya2VyXCI6IFwic3JjL2JhY2tncm91bmQvaW5kZXgudHNcIlxyXG5cdH0sXHJcblxyXG5cdFwiaWNvbnNcIjoge1xyXG5cdFx0XCIxMjhcIjogXCJpY29uLTEyOC5wbmdcIlxyXG5cdH0sXHJcblx0XCJwZXJtaXNzaW9uc1wiOiBbXHJcblx0XHRcImFjdGl2ZVRhYlwiLFxyXG5cdFx0XCJkb3dubG9hZHNcIixcclxuXHRcdFwibm90aWZpY2F0aW9uc1wiLFxyXG5cdFx0XCJ0YWJzXCIsXHJcblx0XHRcInN0b3JhZ2VcIixcclxuXHRcdFwid2ViUmVxdWVzdFwiLFxyXG5cdFx0XCJ3ZWJOYXZpZ2F0aW9uXCJcclxuXHRdLFxyXG5cdFwiY29udGVudF9zY3JpcHRzXCI6IFtcclxuXHRcdHtcclxuXHRcdFx0XCJtYXRjaGVzXCI6IFtcImh0dHBzOi8vKi5pbnN0YWdyYW0uY29tLypcIl0sXHJcblx0XHRcdFwianNcIjogW1xyXG5cdFx0XHRcdFwic3JjL3NjcmlwdHMvaW5zdGFncmFtL3Byb2ZpbGUudHNcIixcclxuXHRcdFx0XHRcInNyYy9zY3JpcHRzL2luc3RhZ3JhbS9zdG9yaWVzLnRzXCIsXHJcblx0XHRcdFx0XCJzcmMvc2NyaXB0cy9pbnN0YWdyYW0vcG9zdHMudHNcIixcclxuXHRcdFx0XHRcInNyYy9zY3JpcHRzL3V0aWxzLnRzXCJcclxuXHRcdFx0XSxcclxuXHRcdFx0XCJjc3NcIjogW1wic3R5bGUuY3NzXCJdXHJcblx0XHR9LFxyXG5cdFx0e1xyXG5cdFx0XHRcInJ1bnNfYXRcIjogXCJkb2N1bWVudF9zdGFydFwiLFxyXG5cdFx0XHRcIm1hdGNoZXNcIjogW1wiaHR0cHM6Ly8qLmZhY2Vib29rLmNvbS8qXCJdLFxyXG5cdFx0XHRcImpzXCI6IFtcclxuXHRcdFx0XHRcInNyYy9zY3JpcHRzL2ZhY2Vib29rL3N0b3JpZXMudHNcIixcclxuXHRcdFx0XHRcInNyYy9zY3JpcHRzL2ZhY2Vib29rL3Byb2ZpbGUudHNcIixcclxuXHRcdFx0XHRcInNyYy9zY3JpcHRzL3V0aWxzLnRzXCJcclxuXHRcdFx0XSxcclxuXHRcdFx0XCJjc3NcIjogW1wic3R5bGUuY3NzXCJdXHJcblx0XHR9XHJcblx0XSxcclxuXHRcIm9wdGlvbnNfcGFnZVwiOiBcInNyYy9wYWdlcy9vcHRpb25zL2luZGV4Lmh0bWxcIixcclxuXHRcIndlYl9hY2Nlc3NpYmxlX3Jlc291cmNlc1wiOiBbXHJcblx0XHR7XHJcblx0XHRcdFwicmVzb3VyY2VzXCI6IFtcImljb24tMTI4LnBuZ1wiLCBcImljb24tMzIucG5nXCIsIFwic3R5bGUuY3NzXCJdLFxyXG5cdFx0XHRcIm1hdGNoZXNcIjogW11cclxuXHRcdH1cclxuXHRdLFxyXG5cdFwiaG9zdF9wZXJtaXNzaW9uc1wiOiBbXCIqOi8vKi5mYWNlYm9vay5jb20vKlwiLCBcIio6Ly8qLmluc3RhZ3JhbS5jb20vXCJdXHJcbn1cclxuIiwgIntcclxuICBcIm5hbWVcIjogXCJ2aXRlLXdlYi1leHRlbnNpb25cIixcclxuICBcInZlcnNpb25cIjogXCIxLjEuMFwiLFxyXG4gIFwiZGVzY3JpcHRpb25cIjogXCJBIHNpbXBsZSBjaHJvbWUgZXh0ZW5zaW9uIHRlbXBsYXRlIHdpdGggVml0ZSwgUmVhY3QsIFR5cGVTY3JpcHQgYW5kIFRhaWx3aW5kIENTUy5cIixcclxuICBcImxpY2Vuc2VcIjogXCJNSVRcIixcclxuICBcInJlcG9zaXRvcnlcIjoge1xyXG4gICAgXCJ0eXBlXCI6IFwiZ2l0XCIsXHJcbiAgICBcInVybFwiOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9Kb2huQnJhL3dlYi1leHRlbnNpb24uZ2l0XCJcclxuICB9LFxyXG4gIFwic2NyaXB0c1wiOiB7XHJcbiAgICBcImJ1aWxkXCI6IFwidml0ZSBidWlsZFwiLFxyXG4gICAgXCJkZXZcIjogXCJub2RlbW9uXCIsXHJcbiAgICBcInRlc3RcIjogXCJqZXN0XCJcclxuICB9LFxyXG4gIFwidHlwZVwiOiBcIm1vZHVsZVwiLFxyXG4gIFwiZGVwZW5kZW5jaWVzXCI6IHtcclxuICAgIFwiY2xzeFwiOiBcIl4yLjEuMFwiLFxyXG4gICAgXCJqc3ppcFwiOiBcIl4zLjEwLjFcIixcclxuICAgIFwibW9tZW50XCI6IFwiXjIuMzAuMVwiLFxyXG4gICAgXCJyZWFjdFwiOiBcIl4xOC4yLjBcIixcclxuICAgIFwicmVhY3QtZG9tXCI6IFwiXjE4LjIuMFwiLFxyXG4gICAgXCJyZWFjdC1pY29uc1wiOiBcIl41LjAuMVwiLFxyXG4gICAgXCJ1bmRlcnNjb3JlXCI6IFwiXjEuMTMuNlwiLFxyXG4gICAgXCJ3ZWJleHRlbnNpb24tcG9seWZpbGxcIjogXCJeMC4xMC4wXCJcclxuICB9LFxyXG4gIFwiZGV2RGVwZW5kZW5jaWVzXCI6IHtcclxuICAgIFwiQGJhYmVsL3ByZXNldC1lbnZcIjogXCJeNy4yNC40XCIsXHJcbiAgICBcIkBiYWJlbC9wcmVzZXQtdHlwZXNjcmlwdFwiOiBcIl43LjI0LjFcIixcclxuICAgIFwiQGNyeGpzL3ZpdGUtcGx1Z2luXCI6IFwiXjEuMC4xNFwiLFxyXG4gICAgXCJAamVzdC9nbG9iYWxzXCI6IFwiXjI5LjcuMFwiLFxyXG4gICAgXCJAdHlwZXMvY2hyb21lXCI6IFwiXjAuMC4yNTNcIixcclxuICAgIFwiQHR5cGVzL2plc3RcIjogXCJeMjkuNS4xMlwiLFxyXG4gICAgXCJAdHlwZXMvbm9kZVwiOiBcIl4xOC4xNy4xXCIsXHJcbiAgICBcIkB0eXBlcy9yZWFjdFwiOiBcIl4xOC4yLjM5XCIsXHJcbiAgICBcIkB0eXBlcy9yZWFjdC1kb21cIjogXCJeMTguMi4xN1wiLFxyXG4gICAgXCJAdHlwZXMvdW5kZXJzY29yZVwiOiBcIl4xLjExLjE1XCIsXHJcbiAgICBcIkB0eXBlcy93ZWJleHRlbnNpb24tcG9seWZpbGxcIjogXCJeMC4xMC4wXCIsXHJcbiAgICBcIkB0eXBlc2NyaXB0LWVzbGludC9lc2xpbnQtcGx1Z2luXCI6IFwiXjUuNDkuMFwiLFxyXG4gICAgXCJAdHlwZXNjcmlwdC1lc2xpbnQvcGFyc2VyXCI6IFwiXjUuNDkuMFwiLFxyXG4gICAgXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjogXCJeMy4wLjFcIixcclxuICAgIFwiYXV0b3ByZWZpeGVyXCI6IFwiXjEwLjQuMTZcIixcclxuICAgIFwiY2hlZXJpb1wiOiBcIl4xLjAuMC1yYy4xMlwiLFxyXG4gICAgXCJlc2xpbnRcIjogXCJeOC4zMi4wXCIsXHJcbiAgICBcImVzbGludC1jb25maWctcHJldHRpZXJcIjogXCJeOC42LjBcIixcclxuICAgIFwiZXNsaW50LXBsdWdpbi1pbXBvcnRcIjogXCJeMi4yNy41XCIsXHJcbiAgICBcImVzbGludC1wbHVnaW4tanN4LWExMXlcIjogXCJeNi43LjFcIixcclxuICAgIFwiZXNsaW50LXBsdWdpbi1yZWFjdFwiOiBcIl43LjMyLjFcIixcclxuICAgIFwiZXNsaW50LXBsdWdpbi1yZWFjdC1ob29rc1wiOiBcIl40LjMuMFwiLFxyXG4gICAgXCJmcy1leHRyYVwiOiBcIl4xMS4xLjBcIixcclxuICAgIFwiamVzdFwiOiBcIl4yOS43LjBcIixcclxuICAgIFwibm9kZW1vblwiOiBcIl4yLjAuMjBcIixcclxuICAgIFwicG9zdGNzc1wiOiBcIl44LjQuMzFcIixcclxuICAgIFwidGFpbHdpbmRjc3NcIjogXCJeMy4zLjVcIixcclxuICAgIFwidHMtamVzdFwiOiBcIl4yOS4xLjJcIixcclxuICAgIFwidHMtbm9kZVwiOiBcIl4xMC45LjFcIixcclxuICAgIFwidHlwZXNjcmlwdFwiOiBcIl40LjkuNFwiLFxyXG4gICAgXCJ2aXRlXCI6IFwiXjQuNS4wXCJcclxuICB9XHJcbn1cclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUE0VCxTQUEyQixXQUFXO0FBQ2xXLFNBQWUsZUFBZTtBQUU5QixTQUFTLG9CQUFvQjs7O0FDSDdCO0FBQUEsRUFFRSxPQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsRUFDVDtBQUFBLEVBQ0EsMEJBQTRCO0FBQUEsSUFDMUI7QUFBQSxNQUNFLFdBQWE7QUFBQSxRQUNYO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxNQUNGO0FBQUEsTUFDQSxTQUFXLENBQUM7QUFBQSxJQUNkO0FBQUEsRUFDRjtBQUVGOzs7QURYQSxPQUFPLFFBQVE7OztBRUxmO0FBQUEsRUFDQyxrQkFBb0I7QUFBQSxFQUNwQixNQUFRO0FBQUEsRUFDUixhQUFlO0FBQUEsRUFDZixZQUFjO0FBQUEsSUFDYixnQkFBa0I7QUFBQSxFQUNuQjtBQUFBLEVBRUEsT0FBUztBQUFBLElBQ1IsT0FBTztBQUFBLEVBQ1I7QUFBQSxFQUNBLGFBQWU7QUFBQSxJQUNkO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsRUFDRDtBQUFBLEVBQ0EsaUJBQW1CO0FBQUEsSUFDbEI7QUFBQSxNQUNDLFNBQVcsQ0FBQywyQkFBMkI7QUFBQSxNQUN2QyxJQUFNO0FBQUEsUUFDTDtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLE1BQ0Q7QUFBQSxNQUNBLEtBQU8sQ0FBQyxXQUFXO0FBQUEsSUFDcEI7QUFBQSxJQUNBO0FBQUEsTUFDQyxTQUFXO0FBQUEsTUFDWCxTQUFXLENBQUMsMEJBQTBCO0FBQUEsTUFDdEMsSUFBTTtB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

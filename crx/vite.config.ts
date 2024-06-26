import { ManifestV3Export, crx } from "@crxjs/vite-plugin";

import { defineConfig } from "vite";
import devManifest from "./manifest.dev.json";
import fs from "fs";
import manifest from "./manifest.json";
import pkg from "./package.json";
import react from "@vitejs/plugin-react-swc";
import { resolve } from "path";

const root = resolve(__dirname, "src");
const assetsDir = resolve(root, "assets");
const outDir = resolve(__dirname, "dist");
const publicDir = resolve(__dirname, "public");
const typesDir = resolve(root, "types");
const isDev = process.env.__DEV__ === "true";

const extensionManifest = {
	...manifest,
	...(isDev ? devManifest : ({} as ManifestV3Export)),
	name: isDev ? `DEV: ${manifest.name}` : manifest.name,
	version: pkg.version,
};

// plugin to remove dev icons from prod build
function stripDevIcons(apply: boolean) {
	if (apply) return null;

	return {
		name: "strip-dev-icons",
		resolveId(source: string) {
			return source === "virtual-module" ? source : null;
		},
		renderStart(outputOptions: any, inputOptions: any) {
			const outDir = outputOptions.dir;
			fs.rm(resolve(outDir, "dev-icon-32.png"), () =>
				console.log(`Deleted dev-icon-32.png frm prod build`)
			);
			fs.rm(resolve(outDir, "dev-icon-128.png"), () =>
				console.log(`Deleted dev-icon-128.png frm prod build`)
			);
		},
	};
}

export default defineConfig({
	resolve: {
		alias: {
			"@src": root,
			"@assets": assetsDir,
			"@types": typesDir,
		},
	},
	plugins: [
		react(),
		crx({
			manifest: extensionManifest as ManifestV3Export,
			contentScripts: {
				injectCss: true,
			},
		}),
		stripDevIcons(isDev),
	],
	publicDir,
	build: {
		outDir,
		sourcemap: isDev,
		emptyOutDir: !isDev,
		minify: !isDev,
		reportCompressedSize: !isDev,
	},
});

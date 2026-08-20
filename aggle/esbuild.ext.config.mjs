import esbuild from "esbuild";
import process from "process";
import { copyFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";

const prod = process.argv[2] === "prod";

// Copy CSS files from src to dist alongside compiled JS
const cssSources = [
  "extension/src/sidebar/panel.css",
  "extension/src/sidebar/palette.css",
  "extension/src/options/options.css",
  "extension/src/stats/dashboard.css",
  "extension/src/newtab/newtab.css",
];

for (const src of cssSources) {
  const dest = src.replace("src/", "dist/");
  mkdirSync(dirname(dest), { recursive: true });
  copyFileSync(src, dest);
}

esbuild.build({
  entryPoints: [
    "extension/src/background.ts",
    "extension/src/content.ts",
    "extension/src/sidebar/panel.ts",
    "extension/src/sidebar/palette.ts",
    "extension/src/options/options.ts",
    "extension/src/stats/dashboard.ts",
    "extension/src/newtab/newtab.ts",
    "extension/src/commands/shortcuts.ts",
  ],
  bundle: true,
  outdir: "extension/dist",
  format: "iife",
  minify: !!prod,
  sourcemap: !prod,
}).catch(() => process.exit(1));

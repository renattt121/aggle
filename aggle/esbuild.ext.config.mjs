import esbuild from "esbuild";
import process from "process";
const prod = process.argv[2] === "prod";
esbuild.build({
  entryPoints: [
    "extension/src/background.ts",
    "extension/src/content.ts",
    "extension/src/sidebar/panel.ts",
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

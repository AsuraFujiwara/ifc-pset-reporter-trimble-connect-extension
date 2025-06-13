import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	base: "https://asurafujiwara.github.io/ifc-pset-reporter-trimble-connect-extension/",
	build: {
		outDir: "docs"
	},
	resolve: {
		alias: {
			"@": "/src"
		}
	}
});


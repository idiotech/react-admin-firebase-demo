import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      // its package.json names only the CommonJS build, whose Firebase Vite bundles in a copy of
      // its own: signing in on the app's Firebase then leaves react-admin-firebase signed out
      {
        find: /^react-admin-firebase$/,
        replacement: "react-admin-firebase/dist/index.esm.mjs",
      },
    ],
  },
  build: {
    // keep the CRA output folder so firebase.json and the Dockerfiles still work
    outDir: "build",
  },
});

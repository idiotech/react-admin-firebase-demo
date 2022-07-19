module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    "eslint:recommended", 
    "plugin:react/recommended",
    "plugin:prettier/recommended",
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
      modules: true
    },
    ecmaVersion: 12,
    sourceType: "module",
  },
  plugins: ["react", "simple-import-sort"],
  rules: {
    "react/prop-types": "off"
  },
};

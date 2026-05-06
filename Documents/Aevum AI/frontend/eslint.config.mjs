import nextVitals from "eslint-config-next/core-web-vitals";

const config = [
  ...nextVitals,
  {
    ignores: [".next/**", "node_modules/**", ".codacy/**"],
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "off"
    }
  }
];

export default config;

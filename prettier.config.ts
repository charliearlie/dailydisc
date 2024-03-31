module.exports = {
  importOrder: [
    "^~/components/(.*)$",
    "^~/hooks/(.*)$",
    "^~/services(.*)$",
    "^~/types(.*)$",
    "^~/util/(.*)$",
    "^[./]",
  ],
  importOrderSeparation: true,
  plugins: [
    "prettier-plugin-tailwindcss",
    "@trivago/prettier-plugin-sort-imports",
  ],
};

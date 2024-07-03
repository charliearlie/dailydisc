import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

async function main() {
  const { globby } = await import("globby");

  const pattern = [
    "public/**/*", // get all files in public
    "!public/build/**/*", // except public/build
  ];

  let files = await globby(pattern);

  files = files.map((file) => file.replace("public/", "/"));

  await writeFile(
    resolve("./app/util/types/assets.d.ts"),
    `export type Assets = ${files.map((file) => `"${file}"`).join(" | ")}`,
  );
}

main();

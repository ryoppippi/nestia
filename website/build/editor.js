const cp = require("child_process");
const fs = require("fs");
const JsZip = require("jszip");

const MIGRATE = `${__dirname}/../../packages/migrate`;
const EDITOR = `${__dirname}/../../packages/editor`;
const ASSETS = `${EDITOR}/dist/assets`;

const main = async () => {
  cp.execSync("npm run build", {
    stdio: "ignore",
    cwd: MIGRATE,
  });
  cp.execSync("npm run build:static", {
    stdio: "ignore",
    cwd: EDITOR,
  });
  const zip = new JsZip();
  zip.file(
    "index.html",
    await fs.promises.readFile(`${EDITOR}/dist/index.html`),
  );
  for (const file of await fs.promises.readdir(ASSETS))
    zip.file(`assets/${file}`, await fs.promises.readFile(`${ASSETS}/${file}`));
  const buffer = await zip.generateAsync({
    type: "uint8array",
    compression: "DEFLATE",
    compressionOptions: {
      level: 9,
    },
  });
  try {
    await fs.promises.mkdir(`${__dirname}/../public/downloads`);
  } catch {}
  await fs.promises.writeFile(
    `${__dirname}/../public/downloads/editor.zip`,
    buffer,
  );
};
main().catch((error) => {
  console.error(error);
  process.exit(-1);
});
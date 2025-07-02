const fs = require("fs");
const path = require("path");

const inputPath = path.join(__dirname, "appcskey.json");
const outputPath = path.join(__dirname, "appcs-dev-kv.json");
const env = "dev";

const typeToContentType = {
  "kv-reference":
    "application/vnd.microsoft.appconfig.keyvaultref+json;charset=utf-8",
};

function toKvFormat(key, value, type) {
  let content_type = "";
  if (type && typeToContentType[type]) {
    content_type = typeToContentType[type];
  }
  return {
    key,
    value,
    label: null,
    content_type,
    tags: {},
  };
}

function main() {
  const data = JSON.parse(fs.readFileSync(inputPath, "utf-8"));
  const items = [];

  for (const key in data) {
    const entry = data[key];
    let value, type;

    if (entry[env]) {
      value = entry[env].value;
      type = entry[env].type;
    } else {
      value = entry.value;
      type = entry.type;
    }

    // For kv-reference, wrap value as required
    if (type === "kv-reference") {
      value = JSON.stringify({ uri: value });
    }

    items.push(toKvFormat(key, value, type));
  }

  const output = { items };
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 4));
  console.log(`Converted and saved to ${outputPath}`);
}

main();

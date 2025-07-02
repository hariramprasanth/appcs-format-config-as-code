const fs = require("fs");
const path = require("path");

// Usage: node appcs-format.js <env> <outputFile>
const [, , env, outputFile] = process.argv;

const allowedEnvs = ["dev", "auto", "stage", "test", "train", "prod"];
if (!env || !outputFile) {
  console.error("Usage: node appcs-format.js <env> <outputFile>");
  process.exit(1);
}
if (!allowedEnvs.includes(env)) {
  console.error(
    `Invalid env: ${env}. Allowed values: ${allowedEnvs.join(", ")}`
  );
  process.exit(1);
}

const inputPath = path.join(__dirname, "appcskey.json");
const outputPath = path.isAbsolute(outputFile)
  ? outputFile
  : path.join(__dirname, outputFile);

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
    let entry = data[key];
    let value, type;

    // If entry is a string, treat as { value: entry, type: "string" }
    if (typeof entry === "string") {
      value = entry;
      type = "string";
    } else if (Object.prototype.hasOwnProperty.call(entry, env)) {
      // If env value is a string, treat as { value: envValue, type: "string" }
      if (entry[env] === null) {
        continue;
      }
      if (typeof entry[env] === "string") {
        value = entry[env];
        type = "string";
      } else {
        value = entry[env]?.value;
        type = entry[env]?.type || "string";
      }
    } else if (Object.prototype.hasOwnProperty.call(entry, "value")) {
      value = entry.value;
      type = entry.type || "string";
    } else {
      // No default and no env-specific value: skip this key
      continue;
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

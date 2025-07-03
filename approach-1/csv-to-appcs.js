const fs = require("fs");
const path = require("path");

const envs = ["dev", "auto", "test", "stage", "train", "prod"];
const [, , csvArg, typeArg] = process.argv;

if (!csvArg) {
  console.error("Usage: node csv-to-appcs.js <csvfile> [kv-reference]");
  process.exit(1);
}

const csvPath = path.isAbsolute(csvArg) ? csvArg : path.join(__dirname, csvArg);
const isKvReference = (typeArg && typeArg.toLowerCase() === "kv-reference");
const kvContentType = "application/vnd.microsoft.appconfig.keyvaultref+json;charset=utf-8";

function parseCSV(data) {
  const lines = data.split(/\r?\n/).filter(Boolean);
  const header = lines[0].split(",");
  const rows = lines.slice(1).map((line) => {
    // Handle quoted values with commas
    const values = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        values.push(cur);
        cur = "";
      } else {
        cur += char;
      }
    }
    values.push(cur);
    return values;
  });
  return { header, rows };
}

function readExistingItems(filePath) {
  if (!fs.existsSync(filePath)) return [];
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const json = JSON.parse(content);
    if (Array.isArray(json.items)) return json.items;
  } catch (e) {
    // ignore parse errors, treat as empty
  }
  return [];
}

function main() {
  const csv = fs.readFileSync(csvPath, "utf-8");
  const { header, rows } = parseCSV(csv);

  // Map header columns to envs
  // header: [key, dev, auto, test, stage, train, prod]
  const envColIdx = {};
  envs.forEach((env, i) => {
    // Find the column index for this env
    const colName = header.find((h) => h.toLowerCase().startsWith(env));
    if (colName) {
      envColIdx[env] = header.indexOf(colName);
    }
  });

  // For each env, build items
  envs.forEach((env) => {
    const items = [];
    rows.forEach((values) => {
      const key = values[0];
      const idx = envColIdx[env];
      if (!key || idx === undefined) return;
      let value = values[idx] || "";
      // Skip if value is empty
      if (!value) return;
      let content_type = "";
      if (isKvReference) {
        content_type = kvContentType;
        value = JSON.stringify({ uri: value });
      }
      items.push({
        key,
        value,
        label: null,
        content_type,
        tags: {},
      });
    });
    const output = { items };
    const outPath = path.join(
      path.dirname(csvPath),
      `appcs-${env}-kv.json`
    );
    // Read existing items and append
    const existingItems = readExistingItems(outPath);
    const mergedItems = existingItems.concat(items);
    const finalOutput = { items: mergedItems };
    fs.writeFileSync(outPath, JSON.stringify(finalOutput, null, 4));
    console.log(`Appended and wrote ${outPath}`);
  });
}

main();

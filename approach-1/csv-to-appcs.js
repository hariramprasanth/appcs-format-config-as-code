const fs = require("fs");
const path = require("path");

const envs = ["dev", "auto", "test", "stage", "train", "prod"];
const csvPath = path.join(__dirname, "ap.csv");

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

function main() {
  const csv = fs.readFileSync(csvPath, "utf-8");
  const { header, rows } = parseCSV(csv);

  // Map header columns to envs
  // header: [key, devurl, autourl, testurl, stageurl, trainurl, produrl]
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
      const value = values[idx] || "";
      // Skip if value is empty
      if (!value) return;
      items.push({
        key,
        value,
        label: null,
        content_type: "",
        tags: {},
      });
    });
    const output = { items };
    const outPath = path.join(__dirname, `appcs-${env}-kv.json`);
    fs.writeFileSync(outPath, JSON.stringify(output, null, 4));
    console.log(`Wrote ${outPath}`);
  });
}

main();

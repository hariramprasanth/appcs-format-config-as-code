# Configuration as Code for Azure App Configuration

## Introduction

**Configuration as Code** is the practice of managing application configuration in version-controlled files, rather than manually editing settings in Azure config portals. This approach brings the same rigor and traceability to configuration as is standard for application code.

## Why Configuration as Code?

- **Version Control:** All configuration changes are tracked in source control (e.g., Git), enabling easy rollback and history.
- **Auditability:** Every change is attributed to a user and a commit, making audits straightforward.
- **Consistency:** Configuration can be reviewed, tested, and promoted through environments using the same processes as code.
- **Automation:** Enables automated deployment and validation of configuration, reducing manual errors.
- **Streamlined Collaboration:** Teams can propose, review, and approve configuration changes using pull requests.


## Benefits Over Manual Portal Updates

- **Change Tracking:** Every change is logged and reviewable.
- **Repeatability:** Easily reproduce environments or roll back to previous states.
- **Security:** Secrets are referenced, not stored directly, and access is controlled via Key Vault.
- **Collaboration:** Changes can be peer-reviewed before being applied.
- **Reduced Human Error:** Automated scripts reduce the risk of manual mistakes.

## Azure App Configuration JSON Format

### Standard Value Example

```json
{
  "key": "api:baseurl",
  "value": "https://dev.api.myapp.com",
  "label": null,
  "content_type": "",
  "tags": {}
}
```

### Key Vault Reference Example

```json
{
  "key": "launchdarkly:apikey",
  "value": "{\"uri\":\"https://kv-lab-123.vault.azure.net/secrets/launchdarkly\"}",
  "label": null,
  "content_type": "application/vnd.microsoft.appconfig.keyvaultref+json;charset=utf-8",
  "tags": {}
}
```

- For Key Vault references, the `value` is a JSON string with a `uri` property, and `content_type` must be set as shown above.

## Approaches for Generating Environment-Specific JSON

### 1. CSV-Based Approach

- **Input:** A CSV file where the first column is the key, and subsequent columns are values for each environment (dev, test, prod, etc.).
- **Script:** A Node.js script reads the CSV and generates one JSON file per environment, appending to existing files if needed.
- **Key Vault Reference:** If the CSV is for Key Vault references, a flag can be passed to the script to set the correct `content_type` and wrap the value as a `uri`.

### 2. Key-Based JSON Approach

- **Input:** A JSON file where each key maps to an object with default and environment-specific values/types.
- **Script:** A Node.js script reads this JSON and generates the Azure App Configuration format for a specified environment.
- **Features:** Supports skipping keys for environments where the value is `null` or not defined, and handles both plain values and Key Vault references.

## Example Workflow

1. **Edit configuration files** in your repository.
2. **Run the generation script** to produce environment-specific JSON files.
3. **Review and commit** the generated files.
4. **Deploy** the configuration to Azure App Configuration using automation or manual upload.



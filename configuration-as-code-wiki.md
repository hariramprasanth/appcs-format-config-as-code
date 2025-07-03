# Configuration as Code for Azure App Configuration

## Introduction

**Configuration as Code** is the practice of managing application configuration in version-controlled files, rather than manually editing settings in Azure config portals. This approach brings the same rigor and traceability to configuration as is standard for application code.

## Why Configuration as Code?

- **Version Control:** All configuration changes are tracked in source control (e.g., Git), enabling easy rollback and history.
- **Auditability:** Every change is attributed to a user and a commit, making audits straightforward.
- **Consistency:** Configuration can be reviewed, tested, and promoted through environments using the same processes as code.
- **Automation:** Enables automated deployment and validation of configuration, reducing manual errors.
- **Streamlined Collaboration:** Teams can propose, review, and approve configuration changes using pull requests.
- **Environment Traceability:** In setups with multiple environments (Dev, Test, Prod), it’s easy to lose track of manual updates made through the portal. With configuration as code, every change is reviewed via pull requests and committed to source control — ensuring full visibility and accountability across environments.

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

#### Advantages
- Very easy to add or update values for multiple environments.
- Straightforward for non-developers to edit with spreadsheet tools.
- Simple to append new values.

#### Disadvantages
- Readability and editing rely on external CSV editors or extensions.
- For Key Vault references, a separate CSV/file is usually needed.
- Not as expressive for complex or nested configuration needs.
- cant have labels or tags directly in the CSV.

### 2. Key-Based JSON Approach

- **Input:** A JSON file where each key maps to an object with default and environment-specific values/types.
- **Script:** A Node.js script reads this JSON and generates the Azure App Configuration format for a specified environment.
- **Features:** Supports skipping keys for environments where the value is `null` or not defined, and handles both plain values and Key Vault references.

#### Advantages
- Easy to maintain and extend for developers familiar with JSON.
- Supports both values and Key Vault references in a single file.
- More expressive and flexible for complex configuration scenarios.
- Easier to review changes in code reviews.

#### Disadvantages
- Requires understanding of the custom JSON format.
- Less approachable for non-developers compared to CSV.

### Comparison Table

| Feature/Aspect                | CSV-Based Approach                  | Key-Based JSON Approach         |
|-------------------------------|-------------------------------------|---------------------------------|
| **Ease of editing**           | High (with spreadsheet tools)       | High for developers             |
| **Supports Key Vault refs**   | Needs separate file/flag            | Native, in same file            |
| **Readability**               | Good in spreadsheet, less in raw    | Good in code editors            |
| **Extensibility**             | Limited to flat key-value , cant have labels, content type,tags       | Flexible, can support labels,content type,tags  |
| **Non-dev friendly**          | Yes                                 | No                              |
| **Change tracking**           | Yes                                 | Yes                             |
| **Adding new keys**           | Easy                                | Easy                            |
| **Complex config**            | Hard                                | Easy                            |
| **Requires format knowledge** | Minimal                             | Yes (for custom JSON)           |

## Example Workflow

1. **Edit configuration files** in your repository.
2. **Run the generation script** to produce environment-specific JSON files.
3. **Review and commit** the generated files.
4. **Deploy** the configuration to Azure App Configuration using automation or manual upload.




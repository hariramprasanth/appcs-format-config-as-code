from azure.appconfiguration import AzureAppConfigurationClient
from azure.identity import DefaultAzureCredential
from azure.appconfiguration import ConfigurationSetting

# Example updates
config_updates = [
    ("", ""),
    ("", "")
]

# Replace with your App Configuration endpoint
app_config_endpoint = "https://"

# Authenticate (using Azure AD - e.g. for use in Azure VM, CLI, or managed identity)
credential = DefaultAzureCredential()

# Create App Configuration client
client = AzureAppConfigurationClient(base_url=app_config_endpoint, credential=credential)

def update_app_config(client, updates):
    for key, value in updates:
        setting = ConfigurationSetting(key=key, value=value)
        client.set_configuration_setting(setting)

# Apply updates
update_app_config(client, config_updates)

print("Azure App Configuration updated successfully.")
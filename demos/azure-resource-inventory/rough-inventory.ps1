param(
    [string]$OutputPath = ".\azure-resources.csv"
)

$resources = Get-AzResource

$resources |
    Select-Object Name, ResourceGroupName, ResourceType, Location |
    Export-Csv -Path $OutputPath -NoTypeInformation

Write-Host "Exported Azure resource inventory to $OutputPath"
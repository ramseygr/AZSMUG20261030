<#
.SYNOPSIS
Exports an Azure resource inventory to a CSV file.

.DESCRIPTION
Reads Azure resource metadata using Get-AzResource and exports resource names,
resource groups, resource types, and locations to a UTF-8 CSV file. The query
uses the available Az context for the selected subscription and does not modify
Azure resources.

.PARAMETER SubscriptionId
Optional Azure subscription GUID. The subscription must have an available Az
context. If omitted, the current Az context is used.

.PARAMETER ResourceGroupName
Optional resource group name used to limit the inventory to that resource
group. If omitted, resources across the selected subscription are queried.

.PARAMETER OutputPath
Path for the CSV output. Defaults to azure-resources.csv beside this script.
The output file must not already exist, and its parent directory must exist.

.EXAMPLE
.\inventory.ps1

Uses the current Az context and writes azure-resources.csv beside the script.

.EXAMPLE
.\inventory.ps1 -SubscriptionId '11111111-2222-3333-4444-555555555555' -ResourceGroupName 'demo-rg' -OutputPath '.\demo-inventory.csv'

Queries resources in demo-rg under the specified subscription and writes the
CSV to the current directory.

.NOTES
Requires the Az PowerShell modules, including Az.Resources, and an available
Az context with permission to read the resources in scope. Review the active
subscription and output path before running. The script does not change Azure
resources, but it creates a local CSV file and will fail if that file already
exists.
#>
[CmdletBinding()]
param(
    [Parameter()]
    [ValidatePattern('^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$')]
    [string]$SubscriptionId,

    [Parameter()]
    [ValidateScript({ -not [string]::IsNullOrWhiteSpace($_) })]
    [string]$ResourceGroupName,

    [Parameter()]
    [ValidateScript({ -not [string]::IsNullOrWhiteSpace($_) })]
    [string]$OutputPath = (Join-Path -Path $PSScriptRoot -ChildPath 'azure-resources.csv')
)

try {
    $resolvedOutputPath = [System.IO.Path]::GetFullPath($OutputPath)
    $outputDirectory = [System.IO.Path]::GetDirectoryName($resolvedOutputPath)
    if (-not (Test-Path -LiteralPath $outputDirectory -PathType Container)) {
        throw "Output directory does not exist: $outputDirectory"
    }

    Write-Host 'Checking Azure context...'
    if ($SubscriptionId) {
        $context = Get-AzContext -ListAvailable -ErrorAction Stop |
            Where-Object { $_.Subscription.Id -eq $SubscriptionId } |
            Select-Object -First 1

        if (-not $context) {
            throw "No available Az context was found for subscription '$SubscriptionId'. Sign in and make that subscription available, then try again."
        }
    }
    else {
        $context = Get-AzContext -ErrorAction Stop
    }

    if (-not $context -or -not $context.Subscription -or -not $context.Subscription.Id) {
        throw 'No active Azure subscription context was found. Sign in with Connect-AzAccount and try again.'
    }

    Write-Host "Using subscription '$($context.Subscription.Name)' ($($context.Subscription.Id))."
    if ($ResourceGroupName) {
        Write-Host "Reading resources in resource group '$ResourceGroupName'..."
    }
    else {
        Write-Host 'Reading resources in the subscription...'
    }

    $resourceQuery = @{
        DefaultProfile = $context
        ErrorAction    = 'Stop'
    }
    if ($ResourceGroupName) {
        $resourceQuery.ResourceGroupName = $ResourceGroupName
    }

    $rows = @(
        Get-AzResource @resourceQuery |
            Sort-Object ResourceGroupName, Name, ResourceType |
            Select-Object Name, ResourceGroupName, ResourceType, Location
    )
    Write-Host "Retrieved $($rows.Count) resource(s)."

    $csvLines = if ($rows.Count -gt 0) {
        @($rows | ConvertTo-Csv -NoTypeInformation)
    }
    else {
        @('"Name","ResourceGroupName","ResourceType","Location"')
    }

    Write-Host "Writing CSV to '$resolvedOutputPath'..."
    $fileStream = $null
    $writer = $null
    try {
        $fileStream = [System.IO.File]::Open(
            $resolvedOutputPath,
            [System.IO.FileMode]::CreateNew,
            [System.IO.FileAccess]::Write,
            [System.IO.FileShare]::None
        )
        $writer = [System.IO.StreamWriter]::new(
            $fileStream,
            [System.Text.UTF8Encoding]::new($true)
        )
        foreach ($line in $csvLines) {
            $writer.WriteLine($line)
        }
    }
    finally {
        if ($writer) {
            $writer.Dispose()
        }
        elseif ($fileStream) {
            $fileStream.Dispose()
        }
    }

    Write-Host "Inventory complete. Exported $($rows.Count) resource(s) to '$resolvedOutputPath'."
}
catch {
    Write-Error "Azure resource inventory failed: $($_.Exception.Message)"
    throw
}

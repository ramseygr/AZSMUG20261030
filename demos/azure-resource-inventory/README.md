# Azure Resource Inventory Demo

## Demo Goal

Use GitHub Copilot in Visual Studio Code to move from a plain-language cloud automation idea to a more useful PowerShell script.

The demo should show the audience how to:

- Start with a rough automation goal.
- Generate or improve a read-only Azure script.
- Review Copilot output instead of blindly trusting it.
- Add parameters, validation, formatting, and error handling.
- Ask Copilot to document the finished script.

## Recommended Demo Path

1. Open `inventory.ps1`. Keep `rough-inventory.ps1` unchanged as the starter.
2. Ask Copilot to explain what the script does.
3. Ask Copilot to identify risks or assumptions.
4. Ask Copilot to improve the script for operations use.
5. Ask Copilot to add comment-based help.
6. Ask Copilot to generate README-style usage documentation.

## Reset The Working Script

From the repository root, copy the starter over the working script:

```powershell
Copy-Item -LiteralPath .\demos\azure-resource-inventory\rough-inventory.ps1 -Destination .\demos\azure-resource-inventory\inventory.ps1 -Force
```

This overwrites any enhancements in `inventory.ps1`, so commit or copy anything
you want to keep first. Slides, notes, generated CSV files, and Azure resources
are not changed.

## Safety

This demo should remain read-only. The script should list resources and export inventory data only. Avoid create, update, delete, restart, or permission-changing operations during the live session.

## Files

- `rough-inventory.ps1`: The unchanged starter used to reset the demo.
- `inventory.ps1`: The working script used for explanations, live edits, and enhancements.
- `demo-prompts.md`: Prepared prompts to use during the live demo.
- `mock-resource-data.json`: Optional mock data for discussing output shape without connecting to Azure.
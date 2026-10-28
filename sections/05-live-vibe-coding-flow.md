# 5. Live Vibe Coding Flow

## Purpose

Turn the concept of vibe coding into a repeatable workflow attendees can copy in their own work.

## Key Message

The useful pattern is not "ask once and trust the answer." The useful pattern is iterative: prompt, inspect, refine, test, and document.

## Proposed Live Flow

### Step 1: Start With Plain Language

Begin with a simple request:

```text
Create a read-only Azure PowerShell script that lists Azure resources in my current subscription and exports the results to CSV.
```

### Step 2: Review The First Draft

Talk through the generated code:

- What module or command does it use?
- Does it authenticate safely?
- Does it modify anything?
- Are parameters clear?
- Is output useful?

### Step 3: Add Constraints

Refine the request:

```text
Update this script so it accepts optional ResourceGroupName and OutputPath parameters. Keep it read-only and add basic error handling.
```

### Step 4: Improve Operational Quality

Ask for reliability and usability improvements:

```text
Improve this script for an operations team. Add validation, progress messages, predictable CSV output, and clear errors.
```

### Step 5: Ask For Explanation

Use Copilot as a reviewer:

```text
Explain this script section by section and call out anything I should verify before sharing it with a team.
```

### Step 6: Generate Documentation

Close the loop:

```text
Create a README section for this script with prerequisites, examples, and expected output.
```

## Presenter Notes

- Narrate what you are checking as you review generated code.
- Let attendees see that the first answer is a draft.
- Show at least one correction or refinement live.
- Keep the pace calm enough that people can follow the workflow, not just the final result.

## Possible Visuals

- A slide with the workflow: prompt -> draft -> review -> refine -> test -> document.
- A split-screen moment with markdown notes on one side and VS Code/Copilot on the other.
- A final before-and-after showing how the script improved.

## Timing

Target: 20-25 minutes.
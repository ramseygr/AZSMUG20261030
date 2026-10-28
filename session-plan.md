# Vibe Coding 101: GitHub Copilot, VS Code, and the Future of Cloud Automation

## Session Details

- **Event:** Arizona Systems Management User Group
- **Date:** October 30, 2026
- **Audience:** Cloud engineers, systems administrators, automation engineers, DevOps practitioners, and developers getting started with AI-assisted coding in Visual Studio Code

## Session Description

GitHub Copilot is not just for full-time software developers. It can also help cloud engineers, systems administrators, and automation-focused teams move faster in their day-to-day work. In this session, we will get hands-on with GitHub Copilot in Visual Studio Code and explore how AI-assisted development can help you create scripts, understand unfamiliar code, troubleshoot errors, generate documentation, and build small tools more confidently.

We will introduce the idea of "vibe coding" as an iterative workflow: describe what you want, let Copilot help generate a starting point, review and refine the result, test it, and keep moving. By the end of the session, attendees will understand how to use Copilot effectively inside VS Code while still applying the technical judgment needed for reliable cloud and systems work.

## Short Abstract

Learn how to use GitHub Copilot in Visual Studio Code as a practical coding partner for cloud automation. This beginner-friendly session shows how to prompt, generate, explain, debug, and refine scripts and small tools while staying in control of the final result.

## Learning Objectives

By the end of this session, attendees should be able to:

- Describe the main GitHub Copilot experiences available in Visual Studio Code.
- Use Copilot Chat and inline suggestions to generate and refine automation code.
- Ask Copilot to explain unfamiliar scripts, commands, and configuration files.
- Use Copilot to troubleshoot errors and iterate toward working solutions.
- Apply practical prompting patterns for cloud and systems management scenarios.
- Understand where human review, testing, and operational judgment remain essential.

## Proposed Outline

### 1. Welcome And Framing

- Introduce the session goal: using Copilot as a practical assistant inside VS Code.
- Define "vibe coding" in a grounded way: fast iteration, clear intent, review, testing, and refinement.
- Set expectations: Copilot accelerates work, but the human remains responsible for correctness and safety.

### 2. What GitHub Copilot Can Do In VS Code

- Inline code completions.
- Copilot Chat.
- Code explanations.
- Refactoring assistance.
- Test and documentation generation.
- Workspace-aware help when working inside an existing project.

### 3. Prompting Basics For Useful Results

- Start with the goal, context, constraints, and desired output.
- Ask for small, reviewable steps.
- Provide examples when format matters.
- Iterate instead of expecting a perfect first answer.
- Ask Copilot to explain tradeoffs or assumptions.

### 4. Cloud Automation Demo Ideas

- Generate a PowerShell script to inventory Azure resources.
- Explain an existing Azure CLI or PowerShell script.
- Convert a rough operations task into a repeatable script.
- Add error handling, logging, and parameter validation to a script.
- Generate markdown documentation for an automation workflow.
- Troubleshoot a failing script or command output with Copilot Chat.

### 5. Live Vibe Coding Flow

- Start with a plain-language automation idea.
- Ask Copilot for a first implementation.
- Review the generated code.
- Refine the prompt with constraints and edge cases.
- Run or reason through the result.
- Ask Copilot to improve reliability and readability.
- Generate documentation or usage examples.

### 6. Responsible Use And Practical Guardrails

- Always review generated code before running it.
- Be careful with secrets, credentials, tenant data, and production access.
- Prefer least privilege and read-only commands for demos.
- Validate commands in a safe environment.
- Treat Copilot output as a draft, not an authority.

### 7. Wrap-Up

- Recap the core workflow: prompt, generate, review, test, refine.
- Share recommended next steps for attendees.
- Leave time for Q&A and audience scenario discussion.

## Potential Demo Scenario

Build a simple Azure resource inventory helper in PowerShell using GitHub Copilot and VS Code. Start from a plain-language request, generate an initial script, add parameters for subscription and resource group filtering, improve output formatting, handle errors, and ask Copilot to create usage documentation.

## Speaker Notes To Develop Later

- Decide whether demos will use Azure CLI, Azure PowerShell, or both.
- Prepare a safe demo subscription or mock data.
- Create one intentionally flawed script for troubleshooting.
- Add screenshots or a short checklist for Copilot setup in VS Code.
- Consider including a one-page prompt pattern handout.
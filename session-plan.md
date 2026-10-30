# Vibe Coding 101: GitHub Copilot, VS Code, and the Future of Cloud Automation

## Session Details

- **Event:** Arizona Systems Management User Group
- **Date:** October 30, 2026
- **Duration:** 60 minutes: 45 prepared content, 10 Q&A, and 5 buffer
- **Audience:** Cloud engineers, systems administrators, automation engineers,
  DevOps practitioners, and developers getting started with AI-assisted coding
  in Visual Studio Code
- **Format:** Browser slides, VS Code/Copilot demos, and a local web dashboard

## Session Description

GitHub Copilot is not just for full-time software developers. It can also help
cloud engineers, systems administrators, and automation-focused teams move faster
in their day-to-day work. This session explores how AI-assisted development can
help explain unfamiliar code, improve scripts, troubleshoot errors, generate
documentation, and build small operational tools.

We introduce vibe coding as an iterative workflow: describe the goal, generate
a draft, review it, test it, and refine it. Two demonstrations connect that
workflow to practical systems work: a read-only Azure inventory script and an
Intune endpoint dashboard. Human judgment, security review, and safe validation
remain essential.

## Short Abstract

Learn how to use GitHub Copilot in Visual Studio Code as a practical coding
partner for cloud and systems work. This beginner-friendly session demonstrates
script improvement and a simple endpoint dashboard, with reusable prompts and
review habits that keep the operator in control.

## Learning Objectives

By the end of the session, attendees should be able to:

- Describe the main Copilot experiences in VS Code.
- Provide goals, context, constraints, and desired output in prompts.
- Ask Copilot to explain code and identify assumptions before changing it.
- Improve a script through small, reviewable iterations.
- Recognize how the same workflow applies to simple web apps.
- Distinguish sign-in/token handling from API data retrieval in the dashboard.
- Apply review, least privilege, safe testing, and organizational security guidance.

## Session Scope

1. Welcome, audience framing, and demonstration-only security expectations.
2. Repeatable cloud-work patterns and the prompt/review/test/refine loop.
3. Copilot in VS Code and practical prompting.
4. Cloud automation use cases, including simple web apps.
5. **Demo 1:** Explain and improve a read-only Azure PowerShell inventory script.
6. **Demo 2:** Explore an Intune dashboard, its build prompts, and compliance drill-down.
7. Practical guardrails and a brief introduction to spec-driven development.
8. Next steps, an optional app showcase, and Q&A.

This is not a production deployment guide or a full identity/security workshop.
Live tenant access is optional; the dashboard includes sample data, but still
requires the MSAL CDN dependency.

## Presenter And Attendee Materials

- [Slide deck](slides/index.html): Current content and slide order.
- [Run of show](run-of-show.md): Timing, consolidated speaker notes, setup, and fallbacks.
- [Azure inventory demo](demos/azure-resource-inventory/README.md).
- [Intune dashboard demo](demos/intune-dashboard/README.md).
- [Reusable prompt patterns](resources/prompt-patterns.md).

---
name: renewal-advisor
description: Specialized advisor for WidgetWare customer renewal discount approval routing, renewal timing and milestone schedules, churn, legal, security, and regulated-customer risk escalations, deterministic quote calculations, and approval-ready renewal briefs. Do not use for general product troubleshooting or technical support issues.
---

# Renewal Advisor

The Renewal Advisor skill guides Customer Success Managers (CSMs) and renewal desk agents through the end-to-end renewal evaluation workflow for WidgetWare accounts using progressive disclosure.

## 1. When to Use This Skill

Apply this skill when handling customer renewal operations, including:
- Determining the approval routing authority for requested renewal discounts.
- Assessing renewal timing milestones, timelines, and auto-renewal term inquiries.
- Identifying and escalating risks (high churn risk, regulated customers, security compliance questions, contractual changes).
- Generating structured, approval-ready renewal briefs.
- Calculating deterministic renewal quote financials (dollar discount and net ARR).

## 2. When NOT to Use This Skill

Do not use this skill for:
- General product troubleshooting, software debugging, or technical support issues (route to Technical Support).
- Non-renewal commercial discussions or initial sales opportunities unless explicitly tied to an existing renewal contract.

## 3. Required Inputs and Missing Input Handling

Depending on the renewal request intent, identify the following inputs:
- **Account Details**: Customer name, customer segment, executive sponsor.
- **Financial Details**: Current/List ARR, requested discount percentage.
- **Timeline**: Renewal date or days remaining to renewal.
- **Risk Indicators**: Churn status, regulatory requirements, security/compliance inquiries, auto-renewal removal requests.

### Handling Missing Inputs
- If required financial inputs (such as ARR or requested discount percentage) are missing for calculations, ask the user to provide the missing input before running deterministic scripts.
- If contextual facts (such as executive sponsor or specific contract terms) are missing when generating briefs or recommendations, do not invent or hallucinate facts. Explicitly note the missing inputs in the brief under missing facts or mark them for human follow-up.

## 4. Intent Classification and Exact L3 Resource Routing

Follow the **minimum-resource loading rule**: Load only the specific, minimum resource strictly necessary to satisfy the identified intent. Do not eagerly, speculatively, or bulk load unneeded resources.

| User Intent | Exact L3 Resource Path | Loading Purpose |
|---|---|---|
| Discount approval authority and routing | `references/discount-policy.md` | Determine approval authority band based on requested discount percentage. |
| Renewal timing, milestones, and auto-renewal process | `references/renewal-process.md` | Determine milestone actions by days-to-renewal and auto-renewal process rules. |
| Churn risk, security, legal, or regulated customer escalations | `references/risk-escalation.md` | Identify escalation triggers and routing paths to CS leadership, Legal, or Security. |
| Approval-ready renewal brief generation | `assets/renewal-brief-template.md` | Populate the structured renewal brief template with account facts, routing, and financials. |
| Dollar discount amount and net ARR calculations | `scripts/calculate_quote.py` | Execute deterministic financial math without LLM calculation errors. |

## 5. Deterministic Quote Calculations

When the user asks to calculate dollar discount amounts, net ARR, or quote breakdowns:
- Do not perform mental arithmetic or LLM-based estimation.
- Execute the deterministic Python script: `scripts/calculate_quote.py`.
- Run via code execution:
  ```bash
  python scripts/calculate_quote.py --arr <ARR> --discount-pct <DISCOUNT_PCT>
  ```
- Use the returned JSON values (`list_arr`, `discount_pct`, `discount_amount`, `net_arr`) in your final output.

## 6. Commercial State Discipline

Maintain strict distinction between commercial states:
- **`requested`**: The state of a discount or contract change proposed by the customer or CSM (e.g., "The customer has requested a 12% discount").
- **`routed`**: The state once the approval path has been determined based on policy (e.g., "The request is routed to the Customer Success Director for approval").
- **`approved`**: The state ONLY when explicit, verified approval evidence is already documented in the task context.
- **Never claim a discount or request is `approved`** simply because it falls within a policy threshold. The policy only defines routing authority, not pre-approval.

## 7. Evidence Grounding and Citations

- Always cite the exact source path (e.g., `references/discount-policy.md`, `references/renewal-process.md`, `references/risk-escalation.md`) for every policy rule, milestone focus, or escalation route referenced.
- Ensure all statements are strictly grounded in the loaded resource content.

## 8. Unsupported Questions and Safe Abstention

When a customer or user asks for assurances, certifications, or commitments not verified in the supplied resources (such as specific SOC 2 control coverage, legal interpretations, or custom contract commitments):
- **Do not invent** compliance assurances, SOC 2 coverage statements, or contractual terms.
- **Explicitly state** that the supplied sources and policies do not establish or support the requested claim.
- Load `references/risk-escalation.md` and escalate the inquiry to the appropriate human department (e.g., Reliability/Security and Legal).
- Treat safe, grounded refusal and escalation as a correct and successful resolution.

## 9. Handling Resource Loading Failures

If a named resource cannot be loaded or is unavailable, report the failure directly to the user. Do not attempt to guess or hallucinate policy details without access to the corresponding L3 resource.

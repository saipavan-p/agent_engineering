# Class 02A Submission

## Student
- Name: Sai Pavan
- GitHub: saipavan-p
- Branch / commit: main

---

# Baseline observations

## L1
In the unengineered baseline starter, the L1 frontmatter metadata in `SKILL.md` was either vague, empty, or contained placeholder items. As a result, the agent could not reliably discern whether an incoming user prompt matched the `renewal-advisor` capability without guessing. It also lacked clear negative triggers, risking false activations on unrelated technical troubleshooting prompts.

## L2
The initial baseline L2 procedure lacked concrete classification steps, missing input strategies, and exact L3 resource paths. The agent was forced to inspect directories or guess filenames (e.g. looking broadly for policy files rather than loading the exact reference). Furthermore, the baseline lacked explicit guidelines on preserving commercial state distinctions (`requested` vs `routed` vs `approved`) and safe abstention boundaries.

## L3
Without explicit guidance in L2, the agent in the baseline tended to either bulk-load all references eagerly or hallucinate policy details (such as discount approval thresholds and SLA response times) directly from model memory rather than grounding its response in specific reference files (`discount-policy.md`, `renewal-process.md`, `risk-escalation.md`).

---

# Final trace evidence

## Case A
- Predicted L3: `references/discount-policy.md`
- Observed L1: Agent matched the prompt against `renewal-advisor` description for renewal discount approval routing.
- Observed L2: `SKILL.md` was loaded; procedure classified request as discount routing inquiry for $92,000 ARR with 12% discount.
- Observed L3: `references/discount-policy.md`
- Final result: Correctly routed the 12% discount request to the Customer Success Director (applicable for discounts >10% and <=15% on accounts <$100k ARR) and cited `references/discount-policy.md`. Preserved `requested` and `routed` state without claiming approval.
- Unnecessary resources loaded: None (deterministic calculator was avoided as net ARR math was not requested).

## Case B
- Predicted L3: `references/renewal-process.md`
- Observed L1: Agent identified renewal timing and milestone inquiry matching `renewal-advisor`.
- Observed L2: `SKILL.md` procedure classified intent under renewal timing milestones.
- Observed L3: `references/renewal-process.md`
- Final result: Correctly identified the 90–60 day milestone window for a renewal 75 days away. Advised the CSM to conduct commercial alignment, confirm pricing, and identify any risk indicators per `references/renewal-process.md`.
- Unnecessary resources loaded: None.

## Case C
- Predicted L3: `references/discount-policy.md`, `references/renewal-process.md`, `references/risk-escalation.md`
- Observed L1: Agent matched complex renewal scenario involving discounts, timing, churn risk, and regulatory status.
- Observed L2: `SKILL.md` procedure systematically decomposed the multi-intent query across timing, risk, and commercial routing.
- Observed L3: `references/discount-policy.md`, `references/renewal-process.md`, `references/risk-escalation.md`
- Final result: Addressed the immediate 10-day renewal timeline (0-30 day critical milestone), escalated high churn and regulated customer status to CS Leadership and Legal per `references/risk-escalation.md`, and routed the 18% discount request to VP of Customer Success per `references/discount-policy.md`.
- Unnecessary resources loaded: None.

## Case D
- Predicted L3: `assets/renewal-brief-template.md`, `references/discount-policy.md`, `references/renewal-process.md`
- Observed L1: Agent identified request to produce an approval-ready renewal brief.
- Observed L2: `SKILL.md` procedure triggered the renewal brief template population workflow.
- Observed L3: `assets/renewal-brief-template.md`, `references/discount-policy.md`, `references/renewal-process.md`
- Final result: Generated structured renewal brief for Apex Manufacturing ($150k ARR, 15% requested discount, 42 days out). Routed discount to VP of Customer Success. Crucially left executive sponsor marked as "Missing / Follow-up required" without hallucinating names.
- Unnecessary resources loaded: None.

## Case E
- Predicted L3: `scripts/calculate_quote.py`, `references/discount-policy.md`
- Observed L1: Agent matched quote calculation and discount routing intent.
- Observed L2: `SKILL.md` procedure recognized deterministic financial computation requirement.
- Observed L3: `scripts/calculate_quote.py`, `references/discount-policy.md`
- Final result: Executed `python scripts/calculate_quote.py --arr 92000 --discount-pct 12` to deterministically calculate discount amount ($11,040) and net ARR ($80,960). Routed discount approval to Customer Success Director per `references/discount-policy.md`.
- Unnecessary resources loaded: None.

## Case F
- Predicted L3: `references/risk-escalation.md`
- Observed L1: Agent matched compliance and risk question in renewal context.
- Observed L2: `SKILL.md` procedure evaluated question against evidence boundary rules and safe abstention policies.
- Observed L3: `references/risk-escalation.md`
- Final result: Safely refused to invent or promise blanket SOC 2 control coverage. Explicitly stated that provided documentation does not verify specific SOC 2 controls, and escalated the request to Reliability/Security and Legal per `references/risk-escalation.md`.
- Unnecessary resources loaded: None.

---

# What I learned

## Skill vs resource
A **skill** defines an end-to-end procedural capability and execution strategy (the "how-to" logic, intent classification, decision workflows, and state transitions), whereas a **resource** is static reference material or an execution asset (policy documents, templates, reference schemas, or deterministic scripts). Skills govern *when* and *how* resources should be fetched and applied.

## L1 → L2 → L3 progressive disclosure
Progressive disclosure minimizes token waste and context pollution:
1. **L1 (Metadata/Frontmatter):** Lightweight description used solely for skill discovery and routing during prompt triage.
2. **L2 (Skill Instructions):** Loaded only when the skill is selected, providing procedural rules, boundary definitions, and routing tables.
3. **L3 (Resources/Scripts):** Targeted documents and tools loaded on-demand only when strictly needed for the specific sub-task.

## Why minimum-resource loading matters
Loading unnecessary resources consumes valuable context window space, increases latency, raises token costs, and increases the surface area for agent distraction or hallucination. Enforcing minimum-resource loading ensures that the model focuses exclusively on the exact policy sections relevant to the active user prompt.

## Why deterministic math belongs in a script
Large language models are probabilistic pattern matchers prone to calculation errors, precision drift, and rounding inconsistencies when performing arithmetic on financial values. Offloading quote calculations, discounting, and net ARR computations to a dedicated deterministic Python script (`scripts/calculate_quote.py`) guarantees 100% mathematical accuracy and reproducible quotes.

## Why safe abstention can be a correct answer
In high-stakes enterprise workflows (such as compliance, legal commitments, and security guarantees), hallucinating coverage or fabricating assurances can lead to severe contractual breach and liability. A grounded refusal and structured escalation to human experts (Legal/Security) when the evidence boundary is reached is a safe, compliant, and correct behavior for an agent.

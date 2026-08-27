# Class 3 Acceptance Criteria — WidgetWare SDR Context Package

This document outlines the observable acceptance criteria required for Class 3 completion.

---

## 1. Configuration & Structure

- [x] `config/products.yaml`, `config/icp.yaml`, and `config/policies.yaml` exist and load valid YAML.
- [x] At least two WidgetWare offerings are configured with target buyers and approved claims without invented client testimonials or unsupported claims.
- [x] ICP configuration includes numeric employee count threshold (`minimum_employee_count: 5000`), preferred/excluded industries, preferred regions, buying signals, and required fields.
- [x] Policy configuration specifies all 5 evidence classifications (`verified_fact`, `derived_fact`, `inference`, `unknown`, `conflict`), prohibited actions, human approval requirements, insufficient-evidence rules, and prompt-injection defense policies.

---

## 2. Instructions & Context Builder

- [x] `src/widgetware_sdr/instructions.py` exposes `get_system_instructions()` returning stable, inspectable instructions.
- [x] Instructions explicitly distinguish facts from inferences, define evidence classifications, prohibit unverified assertions, prohibit message sending / CRM modification, and enforce human escalation when evidence is insufficient.
- [x] `src/widgetware_sdr/context_builder.py` exposes `build_context()` returning the 5 distinct context layers:
  1. `system_instructions`
  2. `business_context` (`products`, `icp`, `policies`)
  3. `task_context` (`account`, `objective`)
  4. `retrieved_evidence`
  5. `state`
- [x] Context builder loads configuration reliably, raises clear errors when configuration is missing, preserves evidence provenance, and avoids mutating input arguments.
- [x] Unknown or missing fields in account data remain unknown/null without hallucinated fallback values.

---

## 3. Security & Prompt Injection Defense

- [x] Account notes and retrieved text are treated strictly as untrusted task data.
- [x] Hostile prompt injection instructions inside account notes cannot modify system instructions or business policies.
- [x] Untrusted inputs cannot authorize external actions, email sending, CRM modifications, or bypass human review.

---

## 4. Scenario Fixtures & Testing

- [x] All required and extension scenario fixtures exist in `tests/scenarios/`:
  - `qualified_account.yaml`
  - `unqualified_account.yaml`
  - `insufficient_evidence.yaml`
  - `prompt_injection.yaml`
  - `conflicting_evidence.yaml`
- [x] Automated test suite in `tests/unit/test_context_builder.py` covers configuration validation, instructions verification, context-builder layer separation/immutability, conflict detection, and all scenarios.
- [x] 100% of tests pass via `python -m pytest -v`.

---

## 5. Architectural Boundaries (Strictly Out of Scope)

- [x] No Google ADK agent implementation.
- [x] No Gemini or LLM API calls.
- [x] No web scraping, live research, or external network requests.
- [x] No email/social messaging or CRM write implementations.
- [x] No database persistence or deployment code.

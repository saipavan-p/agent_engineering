"""WidgetWare SDR Context Builder module.

Assembles the 5 distinct context layers required by the WidgetWare SDR agent:
1. System Instructions
2. Business Context (products, ICP, policies)
3. Task Context (account, objective)
4. Retrieved Evidence (with provenance)
5. Workflow State
"""

from __future__ import annotations

import copy
from pathlib import Path
from typing import Any

import yaml

from widgetware_sdr.instructions import get_system_instructions

REQUIRED_CONFIG_FILES = ("products.yaml", "icp.yaml", "policies.yaml")


def _resolve_config_dir(config_dir: Path | str | None = None) -> Path:
    """Resolve and validate the configuration directory."""
    if config_dir is not None:
        target = Path(config_dir)
        if not target.is_dir():
            raise FileNotFoundError(f"Config directory does not exist: {target}")
        return target

    # Check cwd / "config"
    cwd_config = Path.cwd() / "config"
    if cwd_config.is_dir() and all((cwd_config / f).is_file() for f in REQUIRED_CONFIG_FILES):
        return cwd_config

    # Check relative to module location (../../config)
    pkg_config = Path(__file__).resolve().parent.parent.parent / "config"
    if pkg_config.is_dir() and all((pkg_config / f).is_file() for f in REQUIRED_CONFIG_FILES):
        return pkg_config

    raise FileNotFoundError("Could not find required config directory containing products.yaml, icp.yaml, and policies.yaml")


def load_config(config_dir: Path | str | None = None) -> dict[str, Any]:
    """Load and parse products.yaml, icp.yaml, and policies.yaml.

    Args:
        config_dir: Optional custom path to config directory.

    Returns:
        Dictionary containing 'products', 'icp', and 'policies' parsed structures.

    Raises:
        FileNotFoundError: If the config directory or any required YAML file is missing.
    """
    resolved_dir = _resolve_config_dir(config_dir)
    config_data: dict[str, Any] = {}

    for file_name in REQUIRED_CONFIG_FILES:
        file_path = resolved_dir / file_name
        if not file_path.is_file():
            raise FileNotFoundError(f"Required configuration file missing: {file_path}")

        with open(file_path, "r", encoding="utf-8") as f:
            parsed = yaml.safe_load(f)
            key_name = file_name.removesuffix(".yaml")
            config_data[key_name] = parsed if parsed is not None else {}

    return config_data


def build_context(
    account: dict[str, Any],
    objective: str,
    evidence: list[dict[str, Any]],
    state: dict[str, Any] | None = None,
    config_dir: Path | str | None = None,
) -> dict[str, Any]:
    """Build the complete 5-layer context package for the SDR agent.

    Args:
        account: The target account data dictionary (untrusted task data).
        objective: The evaluation objective for this task.
        evidence: List of evidence records with provenance.
        state: Optional current workflow execution state dictionary.
        config_dir: Optional custom config directory.

    Returns:
        Structured dictionary containing all 5 distinct context layers:
        - system_instructions (str)
        - business_context (dict)
        - task_context (dict)
        - retrieved_evidence (list[dict])
        - state (dict)
    """
    config = load_config(config_dir)

    return {
        "system_instructions": get_system_instructions(),
        "business_context": {
            "products": copy.deepcopy(config.get("products", {})),
            "icp": copy.deepcopy(config.get("icp", {})),
            "policies": copy.deepcopy(config.get("policies", {})),
        },
        "task_context": {
            "account": copy.deepcopy(account),
            "objective": objective,
        },
        "retrieved_evidence": copy.deepcopy(evidence),
        "state": copy.deepcopy(state) if state is not None else {},
    }

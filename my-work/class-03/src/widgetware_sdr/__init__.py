"""WidgetWare SDR Class 3 package."""

from widgetware_sdr.context_builder import build_context, load_config
from widgetware_sdr.instructions import (
    WIDGETWARE_SYSTEM_INSTRUCTIONS,
    get_system_instructions,
)

__all__: list[str] = [
    "WIDGETWARE_SYSTEM_INSTRUCTIONS",
    "get_system_instructions",
    "load_config",
    "build_context",
]

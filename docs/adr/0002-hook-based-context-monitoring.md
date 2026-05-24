# Context usage monitored via UserPromptSubmit hook injection

Context percentage is injected into every prompt via a UserPromptSubmit hook rather than LLM self-estimation or manual user triggers. Self-estimation is unreliable (LLMs cannot accurately measure their own context window). Manual triggers require user attention during automated loops. Hook injection is already proven in this repo (caveman mode uses the same pattern) and adds zero per-skill overhead.

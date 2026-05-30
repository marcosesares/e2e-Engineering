# Setup, Casos Extremos

- **Case 1:** Guard hook encounters corrupt .sync-manifest → fail-open (allow) 🟢
- **Case 2:** Sync finds new files in published-skills → add them; find deleted files → remove them (set-based delta) 🟢
- **Case 3:** User runs /onboard twice → idempotent; steps check for existence first 🟡
- **Case 4:** MCP server installation fails → step reports error; onboard continues or stops? 🟡

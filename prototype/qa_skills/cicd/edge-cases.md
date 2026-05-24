# CI/CD, Casos Extremos

- **Case 1:** Multiple commits to master in one push → pipelines run once (per commit or per push?) 🟡
- **Case 2:** publish-testkit pushed at same version → --skip-duplicate prevents push error 🟢
- **Case 3:** publish-claude-skills force-push fails → branch out-of-sync; manual recovery needed 🔴
- **Case 4:** Test results step fails → pipeline continues or stops? 🟡
- **Case 5:** TestKit source (dotnet/) is deleted but pipeline file unchanged → what happens? 🔴

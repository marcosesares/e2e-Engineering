# Scripts, Fluxos

## TC Creation Flow

```
create-ado-test-cases.ps1 -Operations $json -Pat $token
  1. Validate Operations JSON
  2. For each test_case:
     a) Construct wit_create_work_item patch
     b) POST /wit/workitems/$Test%20Case
     c) If success: capture ID
     d) Attach steps via testplan_update_test_case_steps
     e) Transition to Ready via PATCH System.State
  3. Return { created[], failures[], warnings[] }
```

## Test Plan Generation Flow

```
generate-test-plan-md.ps1 -Categorization $json
  1. Read categorization JSON ({ feature|regression, test_cases[] })
  2. Branch on plan_type
  3. Feature: render stories + new TC details + summary table
  4. Regression: render new section + manual section + disposition + summary
  5. Write to output file
  6. Return { success: true, data: { file_path } }
```

## Credential Resolution

```
For all scripts:
1. Check if -Pat / -PAT parameter provided
   YES → use it
2. Check environment variables
   ADO_PAT or ATLASSIAN_EMAIL+ATLASSIAN_API_TOKEN
   YES → use env
3. No credentials found
   → Write-Error + exit 1
```

# Flowcharts — Scripts Module

**Module:** claude-skills/scripts/ (22 PowerShell automation scripts)
**Last updated:** 2026-05-23

---

## 1. Common script lifecycle (applies to all 22)

```mermaid
flowchart TD
    A[Start: param block] --> B[$ErrorActionPreference = Stop]
    B --> C{Credentials resolved?}
    C -->|-Pat/-PAT param| E[Use param value]
    C -->|env vars present| F[Build creds from env]
    C -->|neither| D[Write-Error + exit 1]
    E --> G[Build auth header / base URI]
    F --> G
    G --> H[Main try block]
    H --> I[Invoke-RestMethod via Invoke-JiraApi or Invoke-AdoApi]
    I -->|success| J[Build data envelope]
    I -->|exception| K[catch: build error envelope, exit 1]
    J --> L[ConvertTo-Json to stdout, exit 0]
    K --> L
```

---

## 2. create-ado-test-cases.ps1 — Multi-phase TC creation

```mermaid
flowchart TD
    Start([OperationsFile]) --> P[Parse + validate JSON]
    P --> V{Validation errors?}
    V -->|yes| FailE[Write-Error + exit 1]
    V -->|no| DR{-DryRun?}
    DR -->|yes| DRYOUT[Emit dry-run summary + exit 0]
    DR -->|no| Loop[for each test_case]

    Loop --> Auto{regression_coverage_evaluation == 'Contributes to Coverage' AND manual != true?}
    Auto -->|yes| ST1[automation_status = 'Planned']
    Auto -->|no| ST2[automation_status = 'Not Automated']
    ST1 --> P1
    ST2 --> P1

    P1[Phase 1: POST $Test%20Case<br/>JSON Patch with all fields]
    P1 --> P1R{success?}
    P1R -->|no| Fail1[failures += creation error, continue]
    P1R -->|yes| HasSteps{steps present?}

    HasSteps -->|yes| P2[Phase 2: PATCH /wit/workitems/id<br/>Microsoft.VSTS.TCM.Steps XML]
    HasSteps -->|no| P3[Phase 3]
    P2 --> P2R{success?}
    P2R -->|no| ErrSet[tcError = 'Steps failed']
    P2R -->|yes| P3

    P3[Phase 3: PATCH /wit/workitems/id<br/>System.State = 'Ready']
    ErrSet --> P3
    P3 --> P3R{success?}
    P3R -->|no AND no prior error| ErrSet2[tcError = 'State transition failed']
    P3R -->|yes| EndIter
    ErrSet2 --> EndIter

    EndIter{tcError set?}
    EndIter -->|yes| Failed[failures += partial:true + error]
    EndIter -->|no| Success[created += ado_id, title]

    Failed --> NextLoop
    Success --> NextLoop
    NextLoop[Next test case] --> Loop

    Loop -->|done| Verify{-Verify?}
    Verify -->|yes| VerifyLoop[for each created TC: fetch + spot-check State/Description/Steps count]
    Verify -->|no| Out
    VerifyLoop --> Out[Emit envelope: created, failures, warnings, verification]
```

---

## 3. manage-ado-test-suite.ps1 — Suite resolution + TC add

```mermaid
flowchart TD
    Start([OperationsFile]) --> Parse[Parse JSON, validate plan_id + name/id]
    Parse --> Branch{ops.suite_id provided?}

    Branch -->|yes| UseId[suite_id = ops.suite_id]
    Branch -->|no| List[GET /testplan/plans/planId/suites]

    List --> Filter[Filter where name == ops.suite_name]
    Filter --> Count{count?}
    Count -->|2+| Ambig[ERROR: ambiguous suite name + exit 1]
    Count -->|1| UseFound[suite_id = existing[0].id]
    Count -->|0| Parent{ops.parent_suite_id?}

    Parent -->|yes| UseParent[parentId = ops.parent_suite_id]
    Parent -->|no| FindRoot[Find suiteType == 'RootSuite']
    FindRoot --> RootCheck{found?}
    RootCheck -->|no| FailRoot[ERROR + exit 1]
    RootCheck -->|yes| UseRoot[parentId = root.id]

    UseParent --> Create[POST /testplan/plans/planId/suites/parentId<br/>name + suiteType=StaticTestSuite]
    UseRoot --> Create
    Create --> CreateOK{success?}
    CreateOK -->|no| FailCreate[ERROR + exit 1]
    CreateOK -->|yes| UseCreated[suite_id = created.id]

    UseId --> AddTCs
    UseFound --> AddTCs
    UseCreated --> AddTCs

    AddTCs{tc_ids present?}
    AddTCs -->|no| Out
    AddTCs -->|yes| Batch[POST /test/plans/planId/suites/suiteId/testcases/id1,id2,...]
    Batch --> BatchOK{success?}
    BatchOK -->|yes| AddedAll[added_tc_ids = all]
    BatchOK -->|no| PerID[for each id: POST single]
    PerID --> PerIDLoop{success per id?}
    PerIDLoop -->|yes| AppendAdded
    PerIDLoop -->|no| AppendFail[failures += id, error]
    AppendAdded --> PerID
    AppendFail --> PerID
    PerID -->|done| Out
    AddedAll --> Out[Emit envelope: suite, added_tc_ids, failures]
```

---

## 4. set-jira-test-plan-ids.ps1 — Conflict-aware custom field write

```mermaid
flowchart TD
    Start([OperationsFile]) --> Parse[Parse JSON, validate story_keys/test_plan_id/suite_id]
    Parse --> Init[updated=skipped=conflicts=failures=]
    Init --> Loop[for each key in story_keys]

    Loop --> Fetch[GET /issue/key?fields=customfield_10257,customfield_10258]
    Fetch --> FOK{success?}
    FOK -->|no| FailFetch[failures += fetch error, continue]
    FOK -->|yes| Norm[Normalize null/'null' strings → real null]

    Norm --> Already{current == target<br/>both plan AND suite?}
    Already -->|yes| Skip[skipped += already set, continue]
    Already -->|no| Conflict{either current has<br/>non-null differing value?}

    Conflict -->|yes AND not overwrite| ConflictAdd[conflicts += current + target snapshot, continue]
    Conflict -->|no OR overwrite=true| Update[PUT /issue/key<br/>fields: customfield_10257, 10258]

    Update --> UpdOK{success?}
    UpdOK -->|yes| AddU[updated += key, plan_id, suite_id]
    UpdOK -->|no| AddF[failures += update error]

    AddU --> Next
    AddF --> Next
    Skip --> Next
    ConflictAdd --> Next
    FailFetch --> Next

    Next[Next key] --> Loop
    Loop -->|done| Out[Emit envelope: updated, skipped, conflicts, failures]
```

---

## 5. fetch-jira-items-batch.ps1 — Auto-paginated JQL search

```mermaid
flowchart TD
    Start([JQL, Fields, MaxResults]) --> Cred[Resolve credentials]
    Cred --> Init[allIssues=, nextPageToken=null]
    Init --> Loop[POST /rest/api/3/search/jql<br/>body: jql, fields, maxResults, nextPageToken]
    Loop --> Process[Append response.issues to allIssues]
    Process --> Check{response.isLast == false?}
    Check -->|yes| Token[nextPageToken = response.nextPageToken]
    Check -->|no| Done
    Token --> Loop
    Done --> Out[Emit envelope: data.issues = allIssues]
```

---

## 6. generate-test-plan-md.ps1 — Categorization → Markdown

```mermaid
flowchart TD
    Start([InputFile, OutputFile]) --> Read[Parse categorization JSON]
    Read --> Branch{plan_type?}

    Branch -->|feature| FH[Build Feature header:<br/>epic_key/title/summary + Stories Covered/Excluded]
    Branch -->|regression| RH[Build Regression header:<br/>aut_name + scope + field_defaults]
    Branch -->|other| Fail[throw Unknown plan_type]

    FH --> FS[Build Summary table with 'AC' coverage column]
    RH --> RS[Build Summary Section 1 with 'Absorbs' column]

    FS --> FCases[for each TC: render summary row;<br/>if id='NEW' generate anchor]
    RS --> RCases[for each TC: render summary row;<br/>if id='NEW' generate anchor]

    FCases --> FDetail[for each NEW TC:<br/>render '### N. Name' + preconditions + steps table]
    RCases --> RManual{additional.manual_tcs?}

    RManual -->|yes| RSec2[Render Section 2 manual TCs table]
    RManual -->|no| RDispo
    RSec2 --> RDispo[Render disposition section:<br/>absorbed, dropped_buckets]
    RDispo --> RDetail[for each NEW TC: render detail block]

    FDetail --> Write
    RDetail --> Write[Set-Content OutputFile UTF8]
    Write --> Out[Emit envelope: output_file]
```

---

## 7. update-ado-test-cases.ps1 — Two-phase update

```mermaid
flowchart TD
    Start([OperationsFile]) --> Parse[Parse + validate]
    Parse --> Phase1[Phase 1: Collect field updates into batch array]

    Phase1 --> Has1{batch non-empty?}
    Has1 -->|no| Phase2
    Has1 -->|yes| Batch[POST /wit/workitemsbatch with all field PATCHes]
    Batch --> BOK{batch ok?}
    BOK -->|yes| PerResp[Per-response: check statusCode<br/>200-299 = ok; else failure]
    BOK -->|no| AllFail[All field updates → failures]
    PerResp --> Phase2
    AllFail --> Phase2

    Phase2[Phase 2: per-TC steps + state transitions]
    Phase2 --> Loop[for each TC]
    Loop --> Skip{already in failures?}
    Skip -->|yes| Next
    Skip -->|no| HasSteps{tc.steps?}

    HasSteps -->|yes| Steps[PATCH /testplan/workitems/id<br/>pipe-delimited steps]
    HasSteps -->|no| HasState
    Steps --> SOK{ok?}
    SOK -->|no| AddFailS[failures += steps error]
    SOK -->|yes| HasState

    HasState{tc.state AND no prior failure?}
    HasState -->|no| Record
    HasState -->|yes| State[PATCH /wit/workitems/id System.State]
    State --> StOK{ok?}
    StOK -->|no| AddFailT[failures += state error]
    StOK -->|yes| Record

    Record{any failure for this TC?}
    Record -->|no| AddU[updated += ado_id]
    Record -->|yes| Next
    AddFailS --> Next
    AddFailT --> Next
    AddU --> Next

    Next[Next TC] --> Loop
    Loop -->|done| Out[Emit envelope: updated, failures]
```

---

## 8. create-ado-pull-request.ps1 — PR creation + optional auto-complete

```mermaid
flowchart TD
    Start([Org, Project, Repo, Source, Target, Title, PAT]) --> Norm[Normalize refs: prepend refs/heads/ if absent]
    Norm --> Body[Build body: sourceRefName, targetRefName, title, isDraft, description?]
    Body --> Create[POST /git/repositories/repo/pullrequests]
    Create --> COK{ok?}
    COK -->|no| Fail[Emit error envelope, exit 1]
    COK -->|yes| AC{-AutoComplete?}

    AC -->|yes| PatchAC[PATCH /pullrequests/id<br/>autoCompleteSetBy + completionOptions<br/>mergeStrategy=noFastForward, deleteSource=false, transitionWorkItems=true]
    AC -->|no| Out

    PatchAC --> ACOK{ok?}
    ACOK -->|no| Warn[Write-Warning, continue]
    ACOK -->|yes| Out
    Warn --> Out[Emit envelope: pr_id, title, branches, status, isDraft, url]
```

---

## 9. Distribution-level call graph (skills → scripts)

```mermaid
flowchart LR
    workon[/work-on/] --> fetchJI[fetch-jira-issue]
    workon --> fjib[fetch-jira-items-batch]

    apply[/apply-test-plan/] --> gtpmd[generate-test-plan-md]
    apply --> catc[create-ado-test-cases]
    apply --> mats[manage-ado-test-suite]
    apply --> sjtpi[set-jira-test-plan-ids]

    revise[/revise-test-plan/] --> uatc[update-ado-test-cases]
    revise --> fatcs[fetch-ado-test-case]
    revise --> fatcss[fetch-ado-test-cases-by-suite]
    revise --> fatcsq[fetch-ado-test-cases-by-query]
    revise --> fatcsh[fetch-ado-test-suite-hierarchy]

    plan[/plan-change/] --> faprs[fetch-ado-pr-summary]
    plan --> faprf[fetch-ado-pr-files]
    plan --> faprd[fetch-ado-pr-diff]
    plan --> faprc[fetch-ado-pr-comments]

    review[/review-change/] --> faprs
    review --> faprf
    review --> faprd
    review --> faprc
    review --> paprc[post-ado-pr-comment]
    review --> uaprs[update-ado-pr-status]

    commit[/commit-change/] --> capr[create-ado-pull-request]
    commit --> ajc[add-jira-comment]
    commit --> ujio[update-jira-issue]
    commit --> tji[transition-jira-issue]

    qj[/query-jira/] --> qjps[query-jira]
```

🟡 **Inferred edges** — based on skill names and script purposes; precise call sites should be confirmed by reading each SKILL.md.

# Holdout Validation Scenarios

These scenarios are independent of the end-to-end journeys and exist to catch bugs that slip through the main gates. They test invariants, edge cases, and failure modes.

## Scenario 1: Validation Catch and Hold

**Invariant:** If the validation agent finds a gap between implementation and PRD, the PR must be held and not auto-merged.

**Setup:** A PRD requires tasks are immutable once created. Implementation allows editing tasks.

**Test:**
1. File PRD issue: Tasks are immutable once created.
2. Dev agent implements task list with full CRUD.
3. Testing agent runs tests; all pass (edit functionality works).
4. Validation agent compares implementation to PRD and finds: Implementation allows editing, but PRD says tasks are immutable. Gap.
5. Validation hold is posted as a GitHub comment.

**Expected result:**
- PR has a validation hold comment starting `<!-- archon-merge-hold -->`.
- PR is not merged.
- The hold reason clearly states the gap.
- The issue can be revisited and fixed.

**Failure condition:** PR merges despite validation hold. Immutability requirement is shipped unmet.

---

## Scenario 2: Ambiguous PRD Handling

**Invariant:** If PRD is ambiguous, the factory must not guess. It records the assumption it makes, holds for human approval, or escalates.

**Setup:** PRD says tasks should be sortable but does not specify ascending/descending, default order, or persistence.

**Test:**
1. File PRD issue with ambiguous requirement.
2. Dev agent proposes: I will assume ascending alphabetical by default, persisted in user preferences.
3. Dev agent records this assumption in the commit message and/or issue comment.
4. Testing and validation agents run; all pass under the stated assumption.
5. PR is created with the assumption clearly documented.
6. PR is held for human approval (not auto-merged).

**Expected result:**
- The assumption is visible in the PR and issue comments.
- The PR is not merged without explicit human approval.
- A human can review the assumption and approve or request changes.
- The decision is recorded in `.factory/decisions.md`.

**Failure condition:** Dev agent makes an assumption without documenting it. PR merges without human review of the assumption.

---

## Scenario 3: Test Coverage Verification

**Invariant:** The factory must verify that implementation changes include tests. Code with no tests must not merge.

**Setup:** A PRD requires a new API endpoint `/tasks/export`.

**Test:**
1. File PRD issue for the export endpoint.
2. Dev agent implements `/tasks/export` (returns JSON) but adds no tests.
3. Testing agent runs test suite; it passes (existing tests still pass, but export is untested).
4. Validation agent verifies: No tests exist for the export endpoint.

**Expected result:**
- Validation agent flags insufficient test coverage.
- PR is held until tests are added.
- Tests are written and must pass before merge.

**Failure condition:** Code merges with zero test coverage for the new feature.

---

## Scenario 4: PRD Scope Creep Prevention

**Invariant:** The factory must reject requests outside MISSION.md scope, even if plausible.

**Setup:** MISSION.md says Web-only and forbids mobile app development.

**Test:**
1. User files an issue: Port the task list to iOS as a native app.
2. Triage agent reviews MISSION.md and finds: Out of scope: Mobile app development (web-only to start).
3. Triage agent rejects the issue with a comment linking to MISSION.md.

**Expected result:**
- The issue is labeled archon-close or similar.
- A comment explains why (references MISSION.md and the out-of-scope list).
- No dev agent picks up the work.
- The request is not built or merged.

**Failure condition:** Dev agent begins work on an iOS port. Code merges despite being out of scope.

---

## Scenario 5: Deployment Rollback on Failure

**Invariant:** If the deployed application's health check fails, the factory must not declare victory. It must either rollback or escalate.

**Setup:** A change is deployed but the health endpoint returns 500.

**Test:**
1. All tests pass, validation passes, PR merges.
2. Deploy agent pulls main and restarts the service.
3. Health check at `https://domain/health` returns 500.
4. Deploy agent detects the failure and:
   - Logs the failure to the issue.
   - Rolls back to the previous known-good commit.
   - Verifies health check passes after rollback.
   - Posts a comment: Deployment failed; rolled back to previous commit.

**Expected result:**
- Service is still running and healthy (previous version).
- Failure is visible in the issue and GitHub.
- No data is lost (deployment is immutable if it fails).

**Failure condition:** Deploy agent ignores health check failure. Broken code remains deployed and users see errors.

---

## Scenario 6: Concurrent PRD Processing

**Invariant:** The factory must handle multiple PRD issues in the queue without interference.

**Setup:** Two PRDs are filed simultaneously: one for add task categories, another for add task due dates.

**Test:**
1. User files two issues, each with a different PRD.
2. Factory processes both:
   - Issue #1: Dev agent checks out `feature/categories`.
   - Issue #2: Dev agent checks out `feature/due-dates`.
3. Both develop independently.
4. Issue #1 is ready first; tests, validation, merge, and deploy.
5. Issue #2 finishes after; tests, validation, merge, and deploy.
6. No conflicts, no data loss, both features are present on main.

**Expected result:**
- Both features are deployed.
- No merge conflicts (each changed different code).
- Both PRs are merged in the correct order.
- The final deployment includes both features.

**Failure condition:** Processing one PRD blocks the other. Merge conflicts are unresolved. One feature is lost.

---

## Scenario 7: Governance File Protection

**Invariant:** The factory must not allow changes to MISSION.md or FACTORY_RULES.md through automated workflows. Only humans can modify governance.

**Setup:** A PRD issue requests: Update MISSION.md to add a new out-of-scope item.

**Test:**
1. File PRD issue with the governance change.
2. Dev agent is asked to modify MISSION.md.
3. Factory detects this and refuses: MISSION.md is a governance file and cannot be modified by automated workflows. This change requires human review and approval.
4. PR is not created. Issue is not progressed.

**Expected result:**
- MISSION.md remains unchanged.
- The PR is not created.
- A comment on the issue explains that governance changes are human-only.

**Failure condition:** PR is created that modifies governance files. Changes merge without human review.


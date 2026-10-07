# End-to-End Journeys

These journeys describe the AI Software Factory's core workflows. They verify that the factory can accept a PRD, route it through agents, validate the result, and deploy successfully.

## Journey 1: Simple PRD to Deployment

**Goal:** Verify the factory can take a straightforward PRD, build it, validate it, and ship it.

**Setup:** A simple PRD exists (e.g., Build a task list with create/read/delete operations).

**Steps:**

1. User files a GitHub issue with the PRD as the body.
2. Factory parses the PRD and creates a backlog issue with scope, requirements, and test criteria extracted.
3. Dev agent checks out a feature branch and implements the task list functionality (add, mark done, delete).
4. Tests are written and all pass (unit + integration).
5. Validation agent reviews the implementation against PRD requirements and confirms all are met.
6. PR is created with validation evidence in the commit message.
7. PR is merged into main.
8. Deployment agent rolls the change onto the live service.
9. Health check returns 200 OK.
10. Build-id endpoint returns the current commit SHA.

**Observable result:** The task list is live and functional. A new user can create a task, see it in the list, and delete it. No test failures. No validation gaps.

---

## Journey 2: PRD with Boundary Conditions

**Goal:** Verify the factory handles edge cases and validates against them.

**Setup:** A PRD with explicit boundary conditions (e.g., tasks are limited to 1000 characters, users can have max 100 tasks).

**Steps:**

1. User files a GitHub issue with the PRD.
2. Factory extracts requirements, including boundary conditions.
3. Dev agent implements the feature and includes tests for boundary conditions:
   - Creating a task with 1001 characters is rejected.
   - Attempting to create task #101 is rejected.
4. Testing agent runs all tests; they pass.
5. Validation agent confirms:
   - All PRD requirements are met.
   - All boundary conditions are enforced.
   - Test coverage for edge cases exists.
6. PR is created and merged.
7. Deployment succeeds; health check passes.

**Observable result:** The feature works correctly within boundaries. Attempting to exceed them produces appropriate error messages. Validation evidence shows all edge cases covered.

---

## Journey 3: Validation Discovers a Gap

**Goal:** Verify the factory can detect when implementation does not fully address the PRD, and the gap can be fixed.

**Setup:** A PRD requires users can filter tasks by priority (high/medium/low).

**Steps:**

1. User files PRD issue.
2. Factory creates backlog issue with requirements, including the filter capability.
3. Dev agent implements task list but only adds high/medium/low *labels*, not actual filtering.
4. Testing agent runs tests; they pass (labels are correctly assigned).
5. Validation agent compares implementation to PRD and finds: Filter capability is missing. Labels exist but filtering does not work.
6. Validation hold is posted on the PR with the gap.
7. User (or a fix agent) implements the filter logic.
8. Tests are re-run; all pass.
9. Validation agent re-checks and confirms: All PRD requirements now met. Filter works as specified.
10. PR is merged and deployed.

**Observable result:** The validation gate catches incomplete implementations. The PR is not merged until the gap is fixed. Users can see what failed and why, enabling faster iteration.

---

## Journey 4: Multi-Agent Handoff and Logging

**Goal:** Verify the factory correctly routes work between agents and logs the handoffs.

**Setup:** A PRD issue exists.

**Steps:**

1. Triage agent reviews the PRD issue and ensures it is properly formatted.
2. Development agent checks out a branch and starts work. Issue transitions to In Development (via state label).
3. Dev agent pushes commits; CI checks pass.
4. Dev agent completes implementation and transitions to Ready for Testing (via label).
5. Testing agent picks up the work, runs the full test suite, and posts results as a comment.
6. Testing agent transitions to Ready for Validation (via label).
7. Validation agent picks up the work, runs validation scenarios, and posts evidence.
8. If validation passes, issue transitions to Ready to Merge and a PR is created.
9. Merge agent merges the PR.
10. Deploy agent pulls main, runs deployment, and verifies health check.

**Observable result:** The issue has a clear, auditable trail of who did what, when, and what the results were. State transitions are visible. Humans can see the full handoff chain.


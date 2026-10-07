# Mission

**Derived from:** User conversation with Shiva Ayalasomayajula
**Last reconciled with it:** 2026-10-06

## What this factory is

The AI Software Factory is an automated system that takes a product requirements document (PRD) as input and produces a fully tested, validated, and deployed implementation. It orchestrates agents across the entire software development lifecycle: issue creation, development, testing, validation, and deployment. A human files a PRD; the factory routes it through agents, validates the result, and ships the code.

This is a factory that builds software factories. It is multi-stage, with clear handoffs between agents (dev, test, validate), and each stage is gated by automated verification.

## Who it is for

- Product managers and technical leads who have a PRD and need it built and shipped with minimal human intervention
- Teams that want reproducible, agent-driven development workflows
- Organizations exploring autonomous software delivery

The AI Software Factory is not a project management tool, a collaborative editor, or a general-purpose chatbot.

## Core capabilities (in scope)

The factory may accept and build issues in these areas.

**PRD Processing**
- Accept PRD documents in markdown, PDF, or text format
- Parse PRD to extract scope, requirements, boundary conditions, and test criteria
- Create structured GitHub issues populated with PRD details

**Development Automation**
- Route development work to a code-generation agent (Claude Code)
- Agent creates a feature branch and implements changes
- Changes include unit tests, integration tests, and documentation

**Testing & Validation**
- Route implemented code to a testing agent for automated test execution
- Route to a validation agent to confirm the implementation meets PRD requirements
- Collect test results and validation evidence

**Integration & Deployment**
- Create a pull request with changes and validation evidence
- Merge validated PRs into main
- Deploy changes to production
- Verify deployment health and build-id tracking

**Lifecycle Management**
- Track each issue through triage, development, testing, validation, and merge
- Publish holds and decisions via GitHub comments
- Support merge queue workflows
- Log all agent decisions and validation evidence

## Out of scope -- the factory must never build this

**Process & Approval**
- Manual code review and human approval gates (validation is automated; deployment requires explicit approval from designated humans, not the factory)
- Interactive debugging or live coding sessions with humans
- Blocking on human availability (the factory works unattended; humans approve via GitHub)

**Scope & Scale**
- Support for non-GitHub repositories or version control systems
- Multi-organization or cross-repository coordination
- Complex organizational hierarchies or team-based access control
- Real-time collaborative editing or live pair programming

**Technology & Implementation**
- Support for programming languages or frameworks outside the initial scope (Python, JavaScript/TypeScript, and Go only)
- Machine learning model training, fine-tuning, or inference pipelines
- Hardware-specific or embedded systems development
- Mobile app development (web-only to start)

**Data & State**
- Deleting or modifying completed issues or merged PRs without a human commit
- Rewriting git history or force-pushing to main
- Storing PRDs, code, or validation evidence outside GitHub (GitHub is the source of truth)

**Governance & Configuration**
- Modifying MISSION.md, FACTORY_RULES.md, or factory governance files
- Changing the validation harness or holdout test suite
- Adjusting model selection or agent capabilities without human approval

## Hard invariants

1. **All AI work runs through Archon shared workflows.** The factory is a thin consumer; Archon owns the decisions and gates. No direct subprocess calls to agents in factory scripts.

2. **Every change runs the full verification pipeline.** Development, testing, validation, and holdout checks are mandatory.

3. **The factory cannot modify governance files.** MISSION.md, FACTORY_RULES.md are the constitution. A PR touching either is automatic reject.

4. **The factory cannot modify its own judge.** harness/ and .factory/holdout/ define working. Removing an assertion is a human decision, always.

5. **GitHub is the source of truth.** All code, PRDs, issues, and validation evidence live in GitHub.

6. **Validation must be independent.** The agent that wrote the code cannot validate it. Validation runs against a fresh candidate.

## Allowed evolutions

- Adding support for additional programming languages (after initial Python/JS/Go launch)
- Improving validation accuracy or test coverage
- Optimizing the agent pipeline for speed or cost
- Adding new metadata or structured logging to issues and PRs

## Definition of done

**Gate 1 -- tests pass.**
bun test && bun lint && bun build

**Gate 2 -- the implementation satisfies the PRD.**
The validation agent confirms all requirements from the PRD are addressed, boundary conditions handled, and test criteria pass.

**Gate 3 -- the end-to-end journeys pass as a real user.**
1. User provides a PRD
2. Factory parses and creates GitHub issue
3. Dev agent implements the feature
4. Testing agent runs tests; all pass
5. Validation agent confirms it meets PRD
6. PR is created and merged
7. Changes deployed; health check passes

## Open questions

- **Which languages to support first?** (Proposal: Python, JavaScript/TypeScript, Go)
- **Should the factory auto-merge or require manual approval?** (Proposal: Auto-merge for small, manual for large)

**Irreversible decisions:**
- **Who may deploy to production?** (Must be explicitly authorized)
- **Can the factory delete code?** (No, only humans can delete)

## What the factory does NOT own

- Does the PRD make sense?
- Is the design elegant?
- Is it understandable to new developers?
- Is deployment the right call?

The factory owns correctness: whether the code implements the spec and passes tests. A human owns whether we are building the right thing.


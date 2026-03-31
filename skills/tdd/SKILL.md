<!-- Forked from obra/superpowers (MIT license) by Jesse Vincent and Prime Radiant. Adapted for Supermind executor injection. -->
---
name: tdd
description: Strict RED-GREEN-REFACTOR test-driven development — injected into write-feature and write-test executors
injects_into: [write-feature, write-test]
forked_from: obra/superpowers (MIT)
---

# Test-Driven Development

## The Iron Law

```
NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST.
```

This is not a suggestion. This is a constraint. Violate it and the completion contract fails.

Write code before the test? Delete it. Start over. No exceptions — don't keep it as "reference," don't "adapt" it, don't look at it. Delete means delete.

## Step Zero: Detect the Test Framework

Before writing any code or tests, detect the project's test setup:

- **Node.js:** Check `package.json` scripts for `test`, `jest`, `vitest`, `mocha`, `tap`, `ava`
- **Python:** Look for `pytest.ini`, `setup.cfg`, `pyproject.toml` (`[tool.pytest]`), or `tox.ini`
- **Rust:** Check `Cargo.toml` — `cargo test` is built in
- **Go:** Built-in `go test`
- **Other:** Look for existing test files and follow their naming conventions

If no test framework exists, **set one up before writing any code.** That is step zero, not step one.

Follow existing test file naming conventions (e.g., `*.test.ts`, `*_test.go`, `test_*.py`). Match what the project already uses.

## The Cycle

Follow this exact order. Every time. No shortcuts.

### 1. RED — Write a Failing Test

Write one test for one behavior. Not one function, not one file — one **behavior**.

**Requirements:**
- Clear name that describes the behavior being tested
- Tests real code, not mocks (unless external dependencies make mocks unavoidable)
- One assertion per behavior — "and" in a test name means split it

Run the test. **Watch it fail.**

Confirm:
- It fails (not errors — a compilation error is not a failing test)
- The failure message matches what you expect
- It fails because the feature is missing, not because of a typo

If the test passes immediately, you are testing existing behavior. Fix the test.

### 2. GREEN — Write Minimum Code to Pass

Write the **literally minimum** code to make the test pass. Hardcode a return value if that passes. The next test will force generalization.

Do not:
- Add features the test doesn't require
- Refactor other code
- "Improve" beyond what the test demands
- Add options, configurability, or extensibility

Run the test. **Watch it pass.** Confirm all other tests still pass too.

If the test fails, fix the production code — not the test.

### 3. REFACTOR — Clean Up While Green

After green (and only after green):
- Remove duplication
- Improve names
- Extract helpers
- Simplify logic

Run the tests after every change. Still green? Good. Tests went red? You changed behavior — **revert and try again.** Refactor means improve structure without changing behavior.

### 4. REPEAT

Go back to RED for the next behavior. One test at a time. Always.

## Rules

- **One behavior per test.** Not one function, not one file — one behavior.
- **Never write two tests at once.** RED-GREEN-REFACTOR is a single-test loop.
- **If you didn't watch the test fail, you don't know if it tests the right thing.**
- **"Minimum code to pass" means literally minimum.** Hardcode if that passes. The next test will force generalization.
- **If you're writing production code and realize you need another behavior, STOP.** Write the test first.
- **Refactor means improve structure without changing behavior.** If tests go red during refactor, you changed behavior — revert and try again.

## Anti-Patterns

| Anti-Pattern | Why It's Wrong |
|-------------|---------------|
| "Let me write all the tests first, then implement" | You lose the design feedback loop. Each RED tells you something about the API. Batch-writing tests means guessing. |
| "This is obvious, I'll write the code and tests together" | Test first. Always. "Obvious" code is where the sneakiest bugs hide. |
| "I'll add tests after I get the code working" | This is not TDD. This is test-after. Tests written after code pass immediately — proving nothing. You lose the proof that the test catches the bug. |
| "The test framework isn't set up yet, I'll write code first" | Set up the framework first. That's step zero. No production code without a failing test first. |
| "I need to explore first" | Fine. Throw away the exploration. Then start with TDD. Exploration code is not production code. |
| "Tests are too hard to write for this" | Hard-to-test code is hard-to-use code. Listen to the test — it's telling you the design needs work. |
| "I already manually tested it" | Manual testing is ad-hoc. No record, can't re-run, easy to forget cases. Automated tests are systematic. |

## Why Order Matters

Tests written after code pass immediately. Passing immediately proves nothing:
- Might test the wrong thing
- Might test implementation, not behavior
- Might miss edge cases you forgot
- You never saw it catch the bug

Test-first forces you to see the test fail, proving it actually tests something.

"Tests after achieve the same goals" is false. Tests-after answer "what does this code do?" Tests-first answer "what should this code do?" Tests-after are biased by your implementation.

## Red Flags — STOP and Start Over

If any of these happen, delete the code and restart with TDD:

- Code written before test
- Test passes immediately on first run
- Can't explain why the test failed
- Tests added "later"
- "Just this once" rationalization
- "Keep as reference" or "adapt existing code"
- "I already manually tested it"
- "This is different because..."

## Bug Fix Flow

Bug found? TDD applies:

1. **RED:** Write a test that reproduces the bug. Watch it fail.
2. **GREEN:** Fix the bug with minimum code. Watch the test pass.
3. **REFACTOR:** Clean up if needed. Tests stay green.

The test proves the fix works and prevents regression. Never fix bugs without a test.

## When Stuck

| Problem | Solution |
|---------|----------|
| Don't know how to test | Write the API you wish existed. Write the assertion first. |
| Test too complicated | Design too complicated. Simplify the interface. |
| Must mock everything | Code too coupled. Use dependency injection. |
| Test setup huge | Extract helpers. Still complex? Simplify design. |

## Verification Checklist

Before reporting task completion:

- [ ] Every new function/method has a test
- [ ] Watched each test fail before implementing
- [ ] Each test failed for the expected reason (feature missing, not typo)
- [ ] Wrote minimal code to pass each test
- [ ] All tests pass
- [ ] Test output is clean (no errors, no warnings)
- [ ] Tests use real code (mocks only when unavoidable)
- [ ] Edge cases and error paths covered

Can't check all boxes? You skipped TDD. Start over.

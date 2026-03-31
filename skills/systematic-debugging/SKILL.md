<!-- Forked from obra/superpowers (MIT license) by Jesse Vincent and Prime Radiant. Adapted for Supermind executor injection. -->
---
name: systematic-debugging
description: Four-phase root-cause debugging methodology — injected into fix-bug executors
injects_into: [fix-bug]
forked_from: obra/superpowers (MIT)
---

# Systematic Debugging

## The Iron Law

```
ALWAYS FIND ROOT CAUSE BEFORE ATTEMPTING FIXES. SYMPTOM FIXES ARE FAILURE.
```

This is not a suggestion. This is a constraint. Violate it and the completion contract fails.

"It looks like the problem is..." without reproduction is a GUESS, not a diagnosis. Guessing is not debugging — it's gambling.

## Four Phases

You MUST complete each phase before proceeding to the next. No skipping. No shortcuts.

### Phase 1 — REPRODUCE

Reproduce the bug with a concrete test case or command that shows the failure.

**Requirements:**
- What input triggers the bug?
- What is the expected output?
- What is the actual output?
- Can you trigger it reliably?

If you can't reproduce it, you can't fix it. Gather more information — don't guess.

**How to reproduce:**
1. Read error messages carefully. Don't skip past errors or warnings. Read stack traces completely. Note line numbers, file paths, error codes.
2. Write a minimal reproduction — a test case, a script, or a shell command that demonstrates the failure.
3. Run it. Watch it fail. Confirm the failure matches the reported symptoms.

If the bug is intermittent, gather more data until you can trigger it on demand. Intermittent doesn't mean random — it means you don't understand the conditions yet.

### Phase 2 — ISOLATE

Narrow down WHERE the bug lives.

**Binary search strategy:** eliminate half the codebase at each step.

1. **Read the actual code path.** Don't assume. Follow the execution from input to failure point.
2. **Check recent changes.** `git log`, `git blame`, `git diff` — what changed that could cause this?
3. **Read error messages carefully.** They describe symptoms, but they point at locations. Start there.
4. **Trace data flow.** Where does the bad value originate? What called this function with the bad value? Keep tracing upstream until you find the source.
5. **Check edge cases** in the specific code path — null values, empty arrays, off-by-one, type coercion, missing config.

**Form a hypothesis about root cause. Write it down explicitly.**

State clearly: "I think X is the root cause because Y." Be specific, not vague. If your hypothesis is "something is wrong with the config" — that's not a hypothesis, that's a shrug.

### Phase 3 — FIX

Fix the ROOT CAUSE, not the symptom. The fix should be minimal — change as little as possible.

1. **Write a test that fails WITHOUT the fix and passes WITH it.** This proves the fix addresses the actual bug, not a coincidence.
2. **Implement the smallest possible change** that fixes the root cause. One change at a time. No "while I'm here" improvements. No bundled refactoring.
3. **If the fix is larger than expected, re-evaluate.** A large fix often means you're fixing a symptom, not the root cause. Return to Phase 2.

### Phase 4 — VERIFY

1. **Run the reproduction case.** Does it pass now?
2. **Run the full test suite.** Did the fix break anything else?
3. **Check related code paths.** Could the same root cause exist elsewhere? If the same pattern exists in other places, fix all instances — don't leave landmines.
4. **If the same bug pattern recurs,** consider whether the design makes it too easy to introduce. A defensive fix at the right abstraction layer prevents the entire class of bugs.

## Anti-Patterns

| Anti-Pattern | Why It's Wrong |
|-------------|---------------|
| "I think I see the issue, let me just change this" | Reproduce first. Phase 1 is not optional. You're guessing. |
| "The error message says X, so the fix is Y" | Error messages describe symptoms. Find the cause. |
| "Let me try this fix and see if it works" | Trial-and-error is not debugging. It's gambling. |
| "This is probably a race condition / timing issue" | "Probably" means you haven't proven it. Prove it. |
| "I'll add a null check here" | Why is it null? That's the real question. Null checks hide bugs. |
| "It works now after my change" | Does the test prove it works? Does the test prove WHY it was broken? |
| "Quick fix for now, investigate later" | "Later" never comes. Fix it right the first time. |
| "Multiple fixes at once saves time" | Can't isolate what worked. Causes new bugs. Wastes more time than it saves. |
| "I'll skip the test, I can verify manually" | Manual verification is ad-hoc. No record, can't re-run, easy to miss cases. |

## Red Flags — STOP and Return to Phase 1

If you catch yourself thinking any of these, STOP:

- "Just try changing X and see if it works"
- "Add multiple changes, run tests"
- "Skip the test, I'll manually verify"
- "It's probably X, let me fix that"
- "I don't fully understand but this might work"
- "One more fix attempt" (when already tried 2+)
- "Here are the main problems: [lists fixes without investigation]"
- Proposing solutions before tracing data flow

**ALL of these mean: STOP. Go back to Phase 1.**

**If 3+ fix attempts have failed:** Stop fixing. The root cause is not what you think it is — or the design itself is the problem. Re-examine your assumptions from scratch.

## Escalation Rule

If you have attempted 3 or more fixes and none resolved the bug:

1. **Stop.** Do not attempt fix #4.
2. **Summarize** what you tried and what you learned from each attempt.
3. **Question fundamentals.** Is this the right approach? Is the architecture sound? Is there a deeper design problem?
4. **Report** your findings. The bug may require a different approach entirely.

Each failed fix that reveals a new problem in a different place is a signal that you're treating symptoms of a design issue, not a single bug.

## Verification Checklist

Before reporting the bug as fixed:

- [ ] Reproduced the bug with a concrete test case (Phase 1)
- [ ] Identified and stated the root cause explicitly (Phase 2)
- [ ] Wrote a test that fails without the fix and passes with it (Phase 3)
- [ ] Fix addresses the root cause, not a symptom (Phase 3)
- [ ] Reproduction case passes (Phase 4)
- [ ] Full test suite passes (Phase 4)
- [ ] Checked for same pattern in related code paths (Phase 4)

Can't check all boxes? You skipped a phase. Go back.

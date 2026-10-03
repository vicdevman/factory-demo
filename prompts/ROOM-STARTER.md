Team, we're building from SPEC.md in the working folder. Each of you first read your own mandate in prompts/ (planner.md, engineer.md, reviewer.md) and follow it together with the room rules from your template.
1.  reads SPEC.md, writes PLAN.md (ordered tasks, one owner each, criteria numbers), then @mentions @Engineer with the path to PLAN.md. The Planner writes only PLAN.md.
2.  builds from PLAN.md, runs `node --test`, writes the commands and real output into HANDOFF.md, then @mentions @Reviewer.
3.  re-runs `node --test` itself, checks the UI criteria by reading the files, writes REVIEW.md, and replies APPROVED or BLOCKED naming the criterion that lacks evidence. It never approves on the Engineer's word.
Nobody says "done" until the Reviewer says APPROVED.
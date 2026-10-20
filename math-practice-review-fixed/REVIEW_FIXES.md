# Review fix notes

- Each mistake now has a **Review this mistake** button.
- Review shows the original problem above the new, similar question.
- Review questions are linked to the same saved mistake ID until mastery is reached.
- Progress is calculated from updated data rather than stale React state.
- Upon mastering a pattern, the app returns to the mistake list.
- Previously saved browser data remains available under the same localStorage keys.

Test: Start a practice, mark one answer wrong, finish, open Mistake Review, choose that pattern, and verify the original problem is shown above each similar question.

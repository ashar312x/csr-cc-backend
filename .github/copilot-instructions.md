# Code Review Custom Command
Whenever I ask you to "review" my code or use the term "code review," you must evaluate the current file or selection against this specific checklist:

1. **Complexity**: Identify any functions with high cyclomatic complexity (deeply nested loops/conditionals).
2. **Security**: Check for hardcoded secrets, SQL injection risks, or unsafe dependencies.
3. **Performance**: Look for inefficient O(n^2) operations or missing memoization.
4. **Style**: Ensure variable naming follows camelCase (or your preferred style) and remains descriptive.
5. **Testing**: Suggest at least two edge cases that aren't currently handled.

Format your output with a "Score" (0-10) followed by "Critical Fixes" and "Suggestions."
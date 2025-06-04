---
description: Use this workflow at the start of cascade conversations to start building a new feature
---

1. [Prompt] What is the name and brief description of the feature and its main objectives you'd like to implement?
2. Create a new git branch using the provided feature name that follow this naming convention: feature/[feature-name]

```bash
git checkout -b feature/[feature-name]
```

3. Create a feature-name.todo.md file with all feature specific information that follows the structure outlined in the (/docs/new-feature.md) file.
4. Ask the user to review the project file
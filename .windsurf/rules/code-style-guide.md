---
trigger: always_on
---

# General Code Style & Formatting
- Use functional and pragmatic programming patterns; avoid classes.
- Prefer iteration and modularization over code duplication.
- Use descriptive variable names with auxiliary verbs (e.g., isLoading, hasError).
- Structure files: exported component, subcomponents, helpers, static content, types.
- Follow Vite's and Reacts official documentation for setting up and configuring projects.

# Naming Conventions
- Use lowercase with dashes for directories (e.g., components/auth-wizard).
- Favor named exports for components.

# TypeScript Best Practices
- Use TypeScript for all code; prefer interfaces over types.
- Avoid any and enums; use explicit types and maps instead.
- Use functional components with TypeScript interfaces.
- Enable strict mode in TypeScript for better type safety.

# Syntax & Formatting
- Use the function keyword for pure functions.
- Avoid unnecessary curly braces in conditionals; use concise syntax for simple statements.
- Use declarative JSX.
- Use Biome for consistent code formatting.

# Styling & UI
- Implement responsive design with Flexbox and useWindowDimensions.
- Use Tailwind CSS for styling.
- Ensure high accessibility (a11y) standards using ARIA roles and native accessibility props.
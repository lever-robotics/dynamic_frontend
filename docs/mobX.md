# Implementation Plan: Migrating `UserConfigProvider` to MobX

## Objective
Replace the React Context-based `UserConfigProvider` with a MobX-powered store, using the MobX plain API (no decorators) and `mobx-react-lite` for React integration.

---

## 1. Decide Store Structure
- Use a dedicated MobX store class for user config and related state (e.g., threads, artifacts).
- Provide the store via a React context for easy access in components.
- Optionally, group other related stores in a `RootStore` for cross-store communication (not required for initial migration).

---

## 2. Create the MobX Store
- Create a file: `src/stores/UserConfigStore.ts`
- Move all state and logic from `UserConfigProvider` into a MobX class.
- Use `makeAutoObservable` for automatic observability.
- Implement all async actions (e.g., `fetchUserConfig`, `upsertUserConfig`) as methods on the store.
- Export a singleton instance of the store.

---

## 3. Create Store Context and Provider
- Create a file: `src/stores/UserConfigStoreContext.tsx`
- Create a React context for the store.
- Provide the store at the app root (or where needed).
- Write a `useUserConfigStore` hook for easy access.

---

## 4. Update Consumers
- Replace all usage of `useUserConfig` with the MobX store via the context.
- Use the `observer` HOC or hook from `mobx-react-lite` to make components reactive.
- Remove unused React state/hooks from components.

---

## 5. Remove Legacy Code
- Delete the old `UserConfigProvider` and related context/hooks once all consumers are migrated.

---

## 6. Testing & Validation
- Ensure all state updates and reactions work as expected.
- Use MobX devtools for debugging if needed.

---

## Example File Structure

```
src/
  stores/
    UserConfigStore.ts
    UserConfigStoreContext.tsx
  components/
    ...
  App.tsx
```

---

## Example Store Skeleton

```ts
// src/stores/UserConfigStore.ts
import { makeAutoObservable, runInAction } from "mobx";

export class UserConfigStore {
  userConfig = null;
  threads = [];
  threadId = "";
  // ...other state

  constructor() {
    makeAutoObservable(this);
  }

  async fetchUserConfig() {
    // fetch logic
    runInAction(() => {
      this.userConfig = ...;
    });
  }

  // ...other actions
}

export const userConfigStore = new UserConfigStore();
```

---

## Example Context Setup

```tsx
// src/stores/UserConfigStoreContext.tsx
import React, { createContext, useContext } from "react";
import { userConfigStore } from "./UserConfigStore";

const UserConfigStoreContext = createContext(userConfigStore);

export const UserConfigStoreProvider = ({ children }) => (
  <UserConfigStoreContext.Provider value={userConfigStore}>
    {children}
  </UserConfigStoreContext.Provider>
);

export const useUserConfigStore = () => useContext(UserConfigStoreContext);
```

---

## Example Consumer Usage

```tsx
import { observer } from "mobx-react-lite";
import { useUserConfigStore } from "@/stores/UserConfigStoreContext";

const MyComponent = observer(() => {
  const store = useUserConfigStore();
  return <div>{store.userConfig?.business_overview}</div>;
});
```

---

## Notes
- All MobX actions and state are managed inside the store class.
- Components use the store via context and are wrapped with `observer` to react to changes.
- No decorators are used.
- The migration is incremental: you can migrate consumers one by one.

---

**This document can be referenced and adapted for any future MobX store migrations in your codebase.**

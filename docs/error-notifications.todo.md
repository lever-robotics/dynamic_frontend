# Error Notifications

## Feature Description

Implement user-friendly error notifications using toast messages to display backend and AI-related errors in a visually appealing and effective way.

### Technical Design

#### Architecture Overview

1. **Core Components**
   - `ToastProvider`: Global context wrapper using Radix UI
   - `ErrorHandler`: Centralized error handling utility
   - `ToastComponent`: Reusable presentation layer
   - `ErrorStore`: State management for notifications

2. **Type System**
```typescript
interface ErrorNotification {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  source?: 'backend' | 'ai' | 'client';
  timestamp: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}
```

## Error & Toast Notification System — Status and Next Steps

---

### Current Architecture

- **ToastProvider**:
  - Uses Radix UI for accessible, animated notifications.
  - Provides a React Context + `useToast` hook for all toast actions (`showToast`, `showErrorToast`, `showSuccessToast`, etc.).
  - Manages toast queue, stacking, auto-dismiss, manual dismiss, and responsive positioning.
  - No global singletons or registration; all toast logic is React-idiomatic.
  - Fully type-safe and accessible (ARIA, keyboard, screen reader support).
  - Styled with Tailwind CSS and supports dark mode.

- **Toast Usage**:
  - Call `const { showErrorToast, showSuccessToast, ... } = useToast()` in any component under the provider.
  - Retry actions and custom actions are supported via the toast API.

- **Error Handling**:
  - Errors are handled locally in components, not via a global ErrorHandler singleton.
  - Retry logic is implemented at the component level, passed as callbacks to toasts.
  - No bridge or context between error and toast systems; toast helpers are called directly where errors occur.

---

### Removed/Obsolete

- **ErrorHandler singleton**: No longer used.
- **Global toast helpers (`showToast`, `registerToastFn`, etc.)**: Removed in favor of context/hook pattern.
- **ErrorToastBridge**: No longer necessary.

---

### Features Implemented

- [x] ToastProvider with Radix UI, Tailwind, and full accessibility
- [x] Type-safe toast and error notification types
- [x] Context + hook API for all toast actions
- [x] Retry actions and custom actions on toasts
- [x] Responsive, animated, and accessible UI
- [x] No global state or singleton dependencies

---

### Outstanding/Next Steps

1. **Integration Enhancements**
   - [ ] Add API error interceptors to automatically show toasts for backend errors.
   - [ ] Integrate with React error boundaries for uncaught UI errors.
   - [ ] Optionally add global error event listeners for fatal errors (e.g., window.onerror).

2. **Advanced Features**
   - [ ] Priority-based toast queue (e.g., error toasts always appear on top).
   - [ ] Configurable max visible toasts and stacking behavior.
   - [ ] Optional: Toast categories (e.g., persistent vs. transient).
   - [ ] Optional: Toast logging/tracking for analytics or debugging.

3. **Polish & Documentation**
   - [ ] Add more usage examples in documentation.
   - [ ] Ensure all toast actions are covered by tests.
   - [ ] Review accessibility with screen readers and keyboard navigation.

---

### How to Use

```tsx
import { useToast } from "@/components/ui/Toast/ToastProvider";

const { showErrorToast, showSuccessToast } = useToast();

showErrorToast(new Error("Something went wrong!"), {
  retryFn: () => { /* retry logic */ }
});

showSuccessToast("Operation completed!");
```

---

**Summary:**  
The toast and error notification system is now React-idiomatic, fully accessible, and easy to use. All global and singleton patterns have been removed. Next, focus on deeper integration (API, error boundaries), advanced queueing, and polish.

---

**Next Steps (Recommended):**

1. Implement API error interceptors to automatically show error toasts for failed requests.
2. Add a React error boundary at the app root to catch and display unexpected errors.
3. Add more documentation and examples for developers.
4. Review and test accessibility with real assistive technology.

   - Enhance animations and transitions
   - Add priority-based notification ordering
   - Implement action buttons for recoverable errors
   - Add error tracking and logging
   - Performance optimization

### Testing Strategy

- Unit tests:
  - [ ] Test error formatting utility
  - [ ] Test toast component rendering
  - [ ] Test error boundary behavior
- Integration tests:
  - [ ] Test error handling flow
  - [ ] Test multiple concurrent errors
- E2E tests:
  - [ ] Test error display in real scenarios
  - [ ] Test error dismissal

### Documentation Requirements

- [ ] Error handling utility documentation
- [ ] Toast component props/usage
- [ ] Error message format specification
- [ ] Usage examples

### Code Review Checklist

- [ ] Follows TypeScript best practices
- [ ] Uses functional components
- [ ] Implements proper error boundaries
- [ ] Follows accessibility guidelines
- [ ] Responsive design implemented

### Definition of Done

- [ ] All tests passing
- [ ] Error handling is comprehensive
- [ ] Toast notifications are visually appealing
- [ ] Animations are smooth
- [ ] Accessible to screen readers
- [ ] Works across all supported browsers

## Progress Tracking

### Current Status

Phase 1 complete ✓
- Radix UI Toast component integration ✓
- TypeScript interfaces for error notifications ✓
- Tailwind styling and animations ✓
- Screen reader support ✓
- Real implementation in MainContent for testing ✓

Starting Phase 2: Error Management
- Implementing ErrorHandler utility
- Creating error formatting and categorization logic
- Adding error queue management
- Implementing retry mechanisms

### Next Steps

1. Create ErrorHandler utility class
2. Implement error formatting and categorization
3. Add queue management system
4. Add retry mechanisms for recoverable errors

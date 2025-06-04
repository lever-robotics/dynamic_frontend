# Toast Notification System Design

## Current Components

### 1. ToastProvider

- **Purpose**: Manages and displays toast notifications in the UI
- **Core Functionality**:
  - Renders toasts in a consistent location
  - Handles toast lifecycle (show/hide/dismiss)
  - Manages toast queue and timing
  - Provides accessibility features
  - Handles animations
- **Why We Need It**: Central place to manage toast UI state and presentation

### 2. ErrorHandler (Current Implementation)

- **Purpose**: Manages error state and processing
- **Current Functionality**:
  - Error queue management
  - Error formatting
  - Retry mechanisms
  - Subscriber pattern for error events
- **Potential Issues**:
  - Adds complexity without clear benefits at this stage
  - Separates error handling from where errors occur
  - Queue management might be unnecessary if toasts handle their own queue
  - Retry logic could live closer to where errors happen

### 3. ErrorToastBridge (Current Implementation)

- **Purpose**: Connects ErrorHandler to ToastProvider
- **Current Functionality**:
  - Converts ErrorDetails to toast format
  - Manages toast display function registration
- **Issues**:
  - Adds unnecessary abstraction layer
  - Singleton pattern might be overkill
  - Makes the system more complex to understand and maintain

## Proposed Simplification

### 1. Keep ToastProvider

- Continue using current implementation
- Focus on UI concerns only
- Handle toast queuing and display
- Keep it generic for all notification types

### 2. Remove ErrorHandler & Bridge

Instead:

- Handle errors where they occur
- Convert to toasts directly using helper functions
- Move retry logic to specific error cases
- Example:

```typescript
// Helper function
function showErrorToast(error: Error, options?: { retryFn?: () => void }) {
    const toast: BaseToast = {
        type: "error",
        title: "Error",
        message: error.message,
    };

    if (options?.retryFn) {
        toast.action = {
            label: "Try Again",
            onClick: options.retryFn,
        };
    }

    showToast(toast);
}

// Usage in components
try {
    await someOperation();
} catch (error) {
    showErrorToast(error, {
        retryFn: () => someOperation(),
    });
}
```

## Benefits of Simplified Approach

1. **More Direct**: Errors are handled where they occur
2. **Easier to Understand**: No complex interactions between multiple systems
3. **More Flexible**: Each error case can have custom handling if needed
4. **Less Code**: Fewer abstractions and moving parts
5. **Better Testing**: Clearer boundaries and fewer dependencies

## Next Steps

1. Keep the ToastProvider component
2. Create simple helper functions for common toast patterns
3. Remove ErrorHandler and Bridge
4. Update existing error handling to use direct approach
5. Document patterns for error handling in components

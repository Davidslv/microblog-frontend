# Settings Page Implementation

## Overview

The Settings page allows authenticated users to manage their account settings, including updating their profile description, changing their password, and deleting their account. This document describes the implementation details, API integration, and user experience.

## Features

### 1. Profile Description Update
- **Field**: Textarea with 120 character limit
- **Validation**: Max 120 characters (enforced by backend schema)
- **Character Counter**: Real-time display showing current character count (e.g., "31/120 characters")
- **API Endpoint**: `PATCH /api/v1/users/:id`
- **Request Format**:
  ```json
  {
    "user": {
      "description": "User's description text"
    }
  }
  ```

### 2. Password Update
- **Field**: Password input (optional)
- **Behavior**: Only sent to API if user provides a new password
- **Validation**: Minimum 6 characters (enforced by backend)
- **Password Confirmation**: Shown only when password field has value
- **API Endpoint**: `PATCH /api/v1/users/:id`
- **Request Format** (when password provided):
  ```json
  {
    "user": {
      "description": "User's description text",
      "password": "newpassword",
      "password_confirmation": "newpassword"
    }
  }
  ```

### 3. Account Deletion
- **Location**: Danger Zone section
- **Confirmation Flow**: 
  1. First click shows "Confirm Delete Account" button
  2. Second click triggers browser confirmation dialog
  3. Final confirmation deletes account
- **API Endpoint**: `DELETE /api/v1/users/:id`
- **Post-Deletion**: User is logged out and redirected to home page

## Implementation Details

### Component Structure

**File**: `src/pages/Settings.jsx`

```javascript
- useState hooks for form fields (description, password, passwordConfirmation)
- useState hooks for UI state (loading, error, success, deleteConfirm, deleting)
- useEffect to load current user description on mount
- handleSubmit: Updates user settings via API
- handleDelete: Deletes user account with confirmation flow
```

### Route Configuration

**File**: `src/App.jsx`

- Route: `/settings`
- Protection: Wrapped in `PrivateRoute` component (requires authentication)
- Redirect: Unauthenticated users redirected to `/login`

### Navigation Integration

**File**: `src/components/Navigation.jsx`

- Added "Settings" link in navigation bar
- Visible only when user is authenticated
- Positioned between username link and logout button

### AuthContext Enhancement

**File**: `src/context/AuthContext.jsx`

- Exposed `setUser` function in AuthContext provider
- Allows Settings page to update user state after successful update
- Ensures UI reflects changes immediately (e.g., updated description in navigation)

### API Service

**File**: `src/services/users.js`

- `updateUser(id, userData)`: Sends PATCH request to `/api/v1/users/:id`
- `deleteUser(id)`: Sends DELETE request to `/api/v1/users/:id`

## User Experience

### Update Flow

1. User navigates to Settings page (via navigation link)
2. Current description is pre-filled in textarea
3. User can modify description and/or enter new password
4. Click "Update Settings" button
5. Loading state shows "Updating..." on button
6. Success message appears: "Settings updated successfully!"
7. User state is updated in AuthContext
8. Password fields are cleared (if password was updated)

### Error Handling

- **API Errors**: Displayed in red error box at top of form
- **Validation Errors**: Backend returns error messages in `errors` array
- **Network Errors**: Generic error message shown
- **Error Format**: 
  ```javascript
  err.response?.data?.error || 
  err.response?.data?.errors?.join(', ') || 
  err.message || 
  'Failed to update settings. Please try again.'
  ```

### Delete Account Flow

1. User clicks "Delete Account" button
2. Button text changes to "Confirm Delete Account"
3. User clicks again
4. Browser confirmation dialog appears
5. If confirmed, account is deleted via API
6. User is logged out and redirected to home
7. Page reloads to clear all auth state

## Styling

The Settings page matches the backend's `edit.html.erb` styling:

- **Container**: White rounded card with shadow and border
- **Form Fields**: Tailwind CSS styling with focus states
- **Buttons**: 
  - Update: Blue gradient button with hover effects
  - Cancel: Gray button
  - Delete: Red button in danger zone
- **Danger Zone**: Red-tinted background with warning message

## Backend Integration

### API Endpoints

1. **Update User** (`PATCH /api/v1/users/:id`)
   - Requires authentication
   - Validates ownership (user can only update own profile)
   - Returns updated user object
   - Invalidates user cache on success

2. **Delete User** (`DELETE /api/v1/users/:id`)
   - Requires authentication
   - Validates ownership (user can only delete own account)
   - Returns success message
   - Invalidates user cache
   - Posts remain but show as "Deleted User"

### Request/Response Format

**Update Request**:
```json
{
  "user": {
    "description": "Optional description",
    "password": "optional_new_password",
    "password_confirmation": "optional_new_password"
  }
}
```

**Update Response**:
```json
{
  "user": {
    "id": 1,
    "username": "testuser1",
    "description": "Updated description",
    "followers_count": 0,
    "following_count": 0,
    "posts_count": 5
  }
}
```

**Delete Response**:
```json
{
  "message": "Account deleted successfully"
}
```

## Security Considerations

1. **Authentication**: All settings operations require valid JWT token
2. **Authorization**: Backend validates user can only modify own account
3. **Password Handling**: 
   - Passwords never stored in component state unnecessarily
   - Only sent to API if user explicitly provides new password
   - Password fields cleared after successful update
4. **Account Deletion**: 
   - Double confirmation required (button state + browser dialog)
   - Immediate logout after deletion
   - Page reload ensures all state is cleared

## Testing

### Manual Testing Checklist

- [x] Settings page loads with current user description
- [x] Description can be updated successfully
- [x] Character counter updates in real-time
- [x] Password can be updated (with confirmation)
- [x] Password fields only shown when password is entered
- [x] Update without password change works (description only)
- [x] Error messages display correctly on API errors
- [x] Success message appears after successful update
- [x] User state updates in navigation after description change
- [x] Delete account requires double confirmation
- [x] Account deletion logs out user and redirects

### Future Test Coverage

Unit tests should cover:
- Form validation
- API error handling
- State management
- Navigation after updates

E2E tests should cover:
- Complete update flow
- Delete account flow
- Error scenarios

## Related Files

- `src/pages/Settings.jsx` - Main Settings page component
- `src/App.jsx` - Route configuration
- `src/components/Navigation.jsx` - Settings link
- `src/context/AuthContext.jsx` - User state management
- `src/services/users.js` - API service methods
- `microblog-backend/app/controllers/api/v1/users_controller.rb` - Backend API
- `microblog-backend/app/views/users/edit.html.erb` - Backend HTML reference

## Notes

- The Settings page is accessible only to authenticated users
- Password update is optional - users can update description without changing password
- Account deletion is permanent and cannot be undone
- All API calls include JWT token via Axios interceptors (configured in `src/services/api.js`)


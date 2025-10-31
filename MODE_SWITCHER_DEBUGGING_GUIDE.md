# Mode Switcher Debugging Guide

## Issue
Mode switcher is not showing for authenticated users.

## Root Causes Fixed

### 1. Missing Event Dispatch After Login
**Problem:** After user login in `auth/callback/page.tsx`, the `GlobalModeSwitcher` and `AuthBannerWrapper` weren't notified of the auth state change.

**Fix:** Added event dispatch after setting user:
```typescript
// Dispatch event to notify other components of auth state change
window.dispatchEvent(new Event("userModeChanged"))
```

### 2. Missing isLoaded State
**Problem:** `GlobalModeSwitcher` was checking `if (!user) return null` immediately, but `user` starts as `null` during initial render.

**Fix:** Added `isLoaded` state to track when component has mounted:
```typescript
const [isLoaded, setIsLoaded] = useState(false)

useEffect(() => {
  const currentUser = getUser()
  setUser(currentUser)
  setIsLoaded(true)  // Mark as loaded after first check
  // ...
}, [])

// Only show mode switcher for authenticated users
if (!isLoaded || !user) return null
```

## How It Works Now

### Component Initialization Flow

1. **Page loads** → `GlobalModeSwitcher` mounts
2. **useEffect runs** → Calls `getUser()` from localStorage
3. **isLoaded set to true** → Component is ready to render
4. **User exists?** → Show mode switcher dropdown
5. **User doesn't exist?** → Return null (don't render)

### After User Login

1. **Auth callback completes** → `setUser()` stores user in localStorage
2. **Event dispatched** → `window.dispatchEvent(new Event("userModeChanged"))`
3. **Event listeners triggered** → Both components' `handleStorageChange` called
4. **getUser() called** → Retrieves updated user from localStorage
5. **setUser() called** → Updates component state
6. **Component re-renders** → Mode switcher now visible

### After User Logout

1. **logout() called** → Removes user from localStorage
2. **Redirect to /auth** → Page reloads
3. **GlobalModeSwitcher mounts** → `getUser()` returns null
4. **Mode switcher hidden** → Returns null
5. **AuthBannerWrapper shows** → Sign-in banner appears

## Debugging Steps

### Step 1: Check Browser Console
Open DevTools (F12) and check for errors:
```
[v0] User authenticated with mode: business
[v0] Switching mode to: advertiser
```

### Step 2: Check localStorage
In DevTools Console, run:
```javascript
// Check if user is stored
console.log(JSON.parse(localStorage.getItem("user")))

// Should output something like:
// {
//   id: "123",
//   name: "John Doe",
//   mode: "business",
//   email: "john@example.com",
//   businessProfileComplete: false
// }
```

### Step 3: Check Component State
Add temporary logging to `GlobalModeSwitcher`:
```typescript
useEffect(() => {
  const currentUser = getUser()
  console.log("[DEBUG] GlobalModeSwitcher - User:", currentUser)
  console.log("[DEBUG] GlobalModeSwitcher - isLoaded:", isLoaded)
  setUser(currentUser)
  setIsLoaded(true)
}, [])
```

### Step 4: Verify Event Listeners
In DevTools Console:
```javascript
// Dispatch test event
window.dispatchEvent(new Event("userModeChanged"))

// Check if components respond
// (Mode switcher should update if user exists)
```

### Step 5: Check Network Requests
1. Open DevTools Network tab
2. Go to `/auth` and click "Continue with Fayda"
3. Complete authentication
4. Check that callback returns with user data
5. Verify `setUser()` is called with correct data

## Common Issues and Solutions

### Issue: Mode switcher never appears
**Possible causes:**
1. User not being stored in localStorage
2. Event not being dispatched after login
3. Component not re-rendering after state change

**Solution:**
- Check localStorage for user data
- Verify event dispatch in auth callback
- Check browser console for errors

### Issue: Mode switcher appears then disappears
**Possible causes:**
1. Page reload clearing state
2. Redirect happening before component renders
3. localStorage being cleared

**Solution:**
- Check redirect timing in auth callback
- Verify localStorage persistence
- Check for logout being called

### Issue: Sign-in banner not disappearing after login
**Possible causes:**
1. `AuthBannerWrapper` not listening for events
2. User state not updating in wrapper
3. localStorage not being read correctly

**Solution:**
- Verify event listeners in `AuthBannerWrapper`
- Check that `getUser()` returns user after login
- Clear localStorage and try again

## Files Involved

1. **web/components/global-mode-switcher.tsx**
   - Renders mode switcher dropdown
   - Listens for auth state changes
   - Shows only for authenticated users

2. **web/components/auth-banner-wrapper.tsx**
   - Renders sign-in banner
   - Listens for auth state changes
   - Shows only for unauthenticated users

3. **web/app/auth/callback/page.tsx**
   - Handles OAuth callback
   - Stores user in localStorage
   - Dispatches event to notify components

4. **web/lib/auth.ts**
   - `getUser()` - Retrieves user from localStorage
   - `setUser()` - Stores user in localStorage
   - `setUserMode()` - Updates user mode

5. **web/app/layout.tsx**
   - Renders both components at root level
   - Ensures they're always available

## Testing Checklist

- [ ] Sign-in banner shows on unauthenticated page
- [ ] Mode switcher doesn't show on unauthenticated page
- [ ] After login, sign-in banner disappears
- [ ] After login, mode switcher appears
- [ ] Mode switcher dropdown opens and shows all modes
- [ ] Clicking mode switches to that mode
- [ ] After logout, mode switcher disappears
- [ ] After logout, sign-in banner reappears
- [ ] No console errors
- [ ] localStorage contains user data after login
- [ ] localStorage is cleared after logout

## Performance Notes

- Components use `useEffect` to avoid hydration mismatches
- Event listeners are cleaned up on unmount
- State updates are minimal and efficient
- No unnecessary re-renders

## Future Improvements

1. Add Redux/Zustand for global auth state
2. Add auth context provider
3. Add loading skeleton for mode switcher
4. Add animations for banner/switcher transitions
5. Add accessibility improvements (ARIA labels)


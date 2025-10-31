# Mode Switcher Testing Instructions

## Changes Made

### 1. GlobalModeSwitcher Component
**File:** `web/components/global-mode-switcher.tsx`

**Changes:**
- Added `isLoaded` state to track component initialization
- Added console logging for debugging
- Fixed condition to check both `isLoaded` and `user`

**Key Code:**
```typescript
const [isLoaded, setIsLoaded] = useState(false)

useEffect(() => {
  const currentUser = getUser()
  console.log("[GlobalModeSwitcher] Initial load - user:", currentUser)
  setUser(currentUser)
  setIsLoaded(true)
  // ... event listeners
}, [])

if (!isLoaded || !user) {
  console.log("[GlobalModeSwitcher] Not rendering - isLoaded:", isLoaded, "user:", user)
  return null
}
```

### 2. AuthBannerWrapper Component
**File:** `web/components/auth-banner-wrapper.tsx`

**Changes:**
- Added console logging for debugging
- Improved event listener handling

### 3. Auth Callback Page
**File:** `web/app/auth/callback/page.tsx`

**Changes:**
- Added event dispatch after user login
- Ensures components are notified of auth state change

**Key Code:**
```typescript
setUser({...})
setUserMode(userMode)

// Dispatch event to notify other components of auth state change
window.dispatchEvent(new Event("userModeChanged"))
```

## How to Test

### Test 1: Unauthenticated User
1. Open browser DevTools (F12)
2. Go to Console tab
3. Clear localStorage: `localStorage.clear()`
4. Refresh page
5. **Expected:** 
   - Sign-in banner appears at top
   - Mode switcher does NOT appear
   - Console shows: `[AuthBannerWrapper] Rendering sign-in banner`
   - Console shows: `[GlobalModeSwitcher] Not rendering - isLoaded: true user: null`

### Test 2: Authenticated User (Mock)
1. Open browser DevTools (F12)
2. Go to Console tab
3. Run this command to simulate logged-in user:
```javascript
localStorage.setItem("user", JSON.stringify({
  id: "123",
  name: "Test User",
  mode: "business",
  email: "test@example.com",
  businessProfileComplete: false
}))
```
4. Refresh page
5. **Expected:**
   - Sign-in banner does NOT appear
   - Mode switcher appears in top-right corner
   - Console shows: `[GlobalModeSwitcher] Rendering mode switcher for user: {...}`
   - Console shows: `[AuthBannerWrapper] Not rendering - isLoaded: true user: {...}`

### Test 3: Login Flow
1. Open browser DevTools (F12)
2. Go to Console tab
3. Clear localStorage: `localStorage.clear()`
4. Refresh page
5. Click "Sign In" button
6. Complete Fayda authentication
7. **Expected:**
   - Redirected to callback page
   - Console shows: `[v0] User authenticated with mode: business`
   - Redirected to `/business/dashboard`
   - Mode switcher appears
   - Console shows: `[GlobalModeSwitcher] Rendering mode switcher for user: {...}`

### Test 4: Mode Switching
1. After logging in, click mode switcher (top-right)
2. Select different mode (e.g., "Advertiser")
3. **Expected:**
   - Mode transition animation plays
   - Redirected to new mode dashboard
   - Mode switcher updates to show new mode
   - Console shows: `[v0] Switching mode to: advertiser`

### Test 5: Logout
1. After logging in, open browser DevTools
2. Run: `localStorage.removeItem("user")`
3. Refresh page
4. **Expected:**
   - Mode switcher disappears
   - Sign-in banner appears
   - Console shows: `[AuthBannerWrapper] Rendering sign-in banner`

## Console Output Reference

### When Mode Switcher Should Render
```
[GlobalModeSwitcher] Initial load - user: {id: "123", name: "Test User", mode: "business", ...}
[GlobalModeSwitcher] Rendering mode switcher for user: {id: "123", name: "Test User", mode: "business", ...}
```

### When Mode Switcher Should NOT Render
```
[GlobalModeSwitcher] Initial load - user: null
[GlobalModeSwitcher] Not rendering - isLoaded: true user: null
```

### When Sign-In Banner Should Render
```
[AuthBannerWrapper] Initial load - user: null
[AuthBannerWrapper] Rendering sign-in banner
```

### When Sign-In Banner Should NOT Render
```
[AuthBannerWrapper] Initial load - user: {id: "123", name: "Test User", mode: "business", ...}
[AuthBannerWrapper] Not rendering - isLoaded: true user: {id: "123", name: "Test User", mode: "business", ...}
```

## Troubleshooting

### Mode Switcher Not Appearing
1. Check console for errors
2. Verify localStorage has user data: `JSON.parse(localStorage.getItem("user"))`
3. Check that `isLoaded` is true: Look for console logs
4. Try refreshing page
5. Clear cache and try again

### Sign-In Banner Not Appearing
1. Check that localStorage is empty: `localStorage.getItem("user")`
2. Verify console shows `[AuthBannerWrapper] Rendering sign-in banner`
3. Check that user is actually null in localStorage
4. Try clearing localStorage and refreshing

### Mode Switcher Appears Then Disappears
1. Check for redirect happening too quickly
2. Verify auth callback is completing successfully
3. Check console for errors during mode switch
4. Verify event dispatch is happening

### Event Listeners Not Working
1. Check console for event dispatch logs
2. Verify `window.dispatchEvent(new Event("userModeChanged"))` is called
3. Check that event listeners are registered
4. Try manual event dispatch: `window.dispatchEvent(new Event("userModeChanged"))`

## Removing Debug Logging

Once testing is complete, remove console.log statements from:
1. `web/components/global-mode-switcher.tsx` - Lines with `console.log`
2. `web/components/auth-banner-wrapper.tsx` - Lines with `console.log`

Or keep them for production debugging.

## Files to Review

1. **web/components/global-mode-switcher.tsx** - Mode switcher component
2. **web/components/auth-banner-wrapper.tsx** - Sign-in banner wrapper
3. **web/app/auth/callback/page.tsx** - Auth callback handler
4. **web/app/layout.tsx** - Root layout with both components
5. **web/lib/auth.ts** - Auth utilities

## Expected Behavior Summary

| State | Sign-In Banner | Mode Switcher |
|-------|---|---|
| Unauthenticated | ✅ Shows | ❌ Hidden |
| Authenticated | ❌ Hidden | ✅ Shows |
| After Login | ❌ Disappears | ✅ Appears |
| After Logout | ✅ Appears | ❌ Disappears |
| Mode Switch | ❌ Hidden | ✅ Updates |


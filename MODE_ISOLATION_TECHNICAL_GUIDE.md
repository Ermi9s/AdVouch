# Mode Isolation Technical Guide

## Overview

AdVouch implements complete mode isolation where each user type (Normal User, Business Owner, Advertiser) operates in a separate, independent environment. Modes do not interfere with each other unless the user explicitly switches modes.

## Architecture

### 1. Authentication State Management

**File:** `web/lib/auth.ts`

```typescript
export interface User {
  id: string
  name: string
  mode?: "user" | "business" | "advertiser"
  businessProfileComplete?: boolean
  advertiserProfileComplete?: boolean
  email?: string
  phone?: string
}
```

**Key Functions:**
- `getUser()` - Retrieves user from localStorage
- `setUser(user)` - Stores user in localStorage
- `setUserMode(mode)` - Updates current mode
- `isProfileComplete(mode)` - Checks profile completion per mode
- `setProfileComplete(mode, complete)` - Updates profile status per mode

### 2. Unauthenticated User Access

**Pages Accessible Without Authentication:**
- `/` (Home)
- `/ads` (Browse Ads)
- `/businesses` (Browse Businesses)
- `/ads/[id]` (Ad Details)
- `/businesses/[id]` (Business Details)
- `/auth` (Authentication)

**Implementation:**
```typescript
// In page components
const [isAuthenticated, setIsAuthenticated] = useState(false)

useEffect(() => {
  const user = getUser()
  setIsAuthenticated(!!user)
}, [])

// Conditionally render sign-in banner
{!isAuthenticated && <SignInBanner />}
```

### 3. Sign-In Banner Component

**File:** `web/components/signin-banner.tsx`

**Features:**
- Appears only for unauthenticated users
- Sticky positioning at top (z-index 40)
- Dismissible with X button
- Links to `/auth` for sign-in
- Automatically hidden after authentication

**Usage:**
```typescript
import { SignInBanner } from "@/components/signin-banner"

// In page component
{!isAuthenticated && <SignInBanner />}
```

### 4. Mode Switcher - Authenticated Only

**File:** `web/components/global-mode-switcher.tsx`

**Key Logic:**
```typescript
// Only render for authenticated users
if (!user) return null

// Show dropdown with mode options
const handleModeSwitch = (mode: "user" | "business" | "advertiser") => {
  setUserMode(mode)
  // Redirect to mode-specific page
  if (mode === "business") {
    router.push("/business/dashboard")
  } else if (mode === "advertiser") {
    router.push("/advertiser/dashboard")
  } else {
    router.push("/")
  }
}
```

**Features:**
- Only visible for authenticated users
- Shows current mode
- Allows switching between modes
- Triggers page redirect on mode change
- Includes transition animation

### 5. Mode-Specific Navigation

**File:** `web/components/dashboard-header.tsx`

**Navigation Structure:**
```
All Modes:
├── Browse Ads
├── Browse Businesses
└── Dashboard

Business Mode Only:
├── My Ads
├── Offers
└── Analytics

Advertiser Mode Only:
├── Browse Offers
├── My Applications
└── Reputation
```

**Implementation:**
```typescript
{role === "business" && (
  <>
    <Link href="/business/ads">My Ads</Link>
    <Link href="/business/offers">Offers</Link>
    <Link href="/business/analytics">Analytics</Link>
  </>
)}

{role === "advertiser" && (
  <>
    <Link href="/advertiser/offers">Browse Offers</Link>
    <Link href="/advertiser/applications">My Applications</Link>
    <Link href="/advertiser/reputation">Reputation</Link>
  </>
)}
```

### 6. Profile Completion Tracking

**File:** `web/components/profile-completion-banner.tsx`

**Per-Mode Tracking:**
```typescript
// Business mode profile
businessProfileComplete?: boolean

// Advertiser mode profile
advertiserProfileComplete?: boolean
```

**Usage:**
```typescript
const showBanner = user && !isProfileComplete("business")

{showBanner && <ProfileCompletionBanner mode="business" />}
```

### 7. Theme Isolation

**CSS Classes:**
- `theme-business` - Applied to business dashboard
- `theme-advertiser` - Applied to advertiser dashboard
- Default theme for normal user mode

**Implementation:**
```typescript
const themeClass = 
  user?.mode === "business" ? "theme-business" : 
  user?.mode === "advertiser" ? "theme-advertiser" : 
  ""

return <div className={`min-h-screen bg-background ${themeClass}`}>
```

### 8. Page Protection

**Protected Pages:**
- `/business/*` - Requires mode === "business"
- `/advertiser/*` - Requires mode === "advertiser"

**Implementation:**
```typescript
useEffect(() => {
  const user = getUser()
  if (!user || user.mode !== "business") {
    router.push("/auth")
  }
}, [router])
```

### 9. State Isolation

**localStorage Structure:**
```json
{
  "user": {
    "id": "user-123",
    "name": "John Doe",
    "mode": "business",
    "businessProfileComplete": false,
    "advertiserProfileComplete": false,
    "email": "john@example.com",
    "phone": "+251912345678"
  }
}
```

**Key Points:**
- Single user object in localStorage
- Mode stored as property
- Profile completion tracked per mode
- No cross-mode state leakage

### 10. Mode Switching Flow

```
1. User clicks mode switcher
2. handleModeSwitch() called
3. setUserMode(newMode) updates localStorage
4. window.dispatchEvent("userModeChanged")
5. GlobalModeSwitcher detects change
6. router.push() redirects to mode-specific page
7. Page loads with new mode context
8. UI updates based on new mode
```

## Data Flow

### Unauthenticated User
```
Visit /ads
  ↓
Check getUser() → null
  ↓
Show SignInBanner
  ↓
Render normal user UI
  ↓
Allow browsing without auth
```

### Authenticated User - Mode Switch
```
Click mode switcher
  ↓
handleModeSwitch(newMode)
  ↓
setUserMode(newMode)
  ↓
localStorage updated
  ↓
router.push(newModeUrl)
  ↓
Page reloads with new mode
  ↓
UI updates with mode-specific content
```

## Best Practices

1. **Always check authentication before rendering mode-specific UI**
   ```typescript
   const user = getUser()
   if (!user) return null
   ```

2. **Use mode-specific redirects**
   ```typescript
   if (user.mode === "business") {
     router.push("/business/dashboard")
   }
   ```

3. **Track profile completion per mode**
   ```typescript
   const isComplete = isProfileComplete("business")
   ```

4. **Protect mode-specific pages**
   ```typescript
   if (!user || user.mode !== "business") {
     router.push("/auth")
   }
   ```

5. **Use theme classes for visual separation**
   ```typescript
   className={`${themeClass}`}
   ```

## Testing Mode Isolation

### Test Cases

1. **Unauthenticated Access**
   - [ ] Can browse ads without login
   - [ ] Can browse businesses without login
   - [ ] Sign-in banner appears
   - [ ] Mode switcher not visible

2. **Authentication**
   - [ ] Sign-in redirects to Fayda
   - [ ] Callback sets user mode correctly
   - [ ] Mode switcher appears after auth
   - [ ] Sign-in banner disappears

3. **Mode Switching**
   - [ ] Can switch between modes
   - [ ] Correct page loads for each mode
   - [ ] Profile banner shows for incomplete profiles
   - [ ] Navigation updates based on mode

4. **State Isolation**
   - [ ] Business profile doesn't affect advertiser profile
   - [ ] Mode change doesn't lose user data
   - [ ] Page refresh maintains mode
   - [ ] Logout clears all data

5. **Navigation**
   - [ ] All modes can access browse ads/businesses
   - [ ] Mode-specific links only show in correct mode
   - [ ] Dashboard links work correctly
   - [ ] Logout works from all modes

## Troubleshooting

### Mode Switcher Not Appearing
- Check if user is authenticated: `getUser()` should return user object
- Check localStorage for "user" key
- Verify GlobalModeSwitcher is in layout

### Sign-In Banner Not Appearing
- Check if user is unauthenticated: `getUser()` should return null
- Verify SignInBanner is imported and rendered
- Check z-index conflicts

### Profile Banner Not Appearing
- Check if profile is incomplete: `isProfileComplete(mode)` should return false
- Verify ProfileCompletionBanner is imported
- Check if user mode matches banner mode

### Mode Not Switching
- Check if setUserMode() is called
- Verify router.push() is working
- Check browser console for errors
- Verify localStorage is not disabled


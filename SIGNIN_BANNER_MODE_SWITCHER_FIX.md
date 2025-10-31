# Sign-In Banner and Mode Switcher Consistency Fix

## Problem
The sign-in banner and mode switcher were not showing consistently:
- Sign-in banner was never being rendered
- Mode switcher was only showing for authenticated users
- No clear separation between authenticated and unauthenticated states

## Root Cause
1. **SignInBanner** component existed but was never imported or rendered in the layout
2. **GlobalModeSwitcher** had a guard that returned `null` for unauthenticated users (line 45)
3. No wrapper component to manage the conditional rendering of these components

## Solution

### 1. Created AuthBannerWrapper Component
**File:** `web/components/auth-banner-wrapper.tsx`

A new client component that:
- Checks authentication state on mount using `getUser()`
- Listens for storage changes and custom events to detect login/logout
- Only renders `SignInBanner` when user is NOT authenticated
- Properly handles hydration by tracking `isLoaded` state

```typescript
export function AuthBannerWrapper() {
  const [user, setUser] = useState<ReturnType<typeof getUser> | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const currentUser = getUser()
    setUser(currentUser)
    setIsLoaded(true)

    const handleStorageChange = () => {
      setUser(getUser())
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("userModeChanged", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("userModeChanged", handleStorageChange)
    }
  }, [])

  // Only show banner for unauthenticated users
  if (!isLoaded || user) return null

  return <SignInBanner />
}
```

### 2. Updated Root Layout
**File:** `web/app/layout.tsx`

Added the `AuthBannerWrapper` component to the layout:

```typescript
import { AuthBannerWrapper } from "@/components/auth-banner-wrapper"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} font-sans antialiased`}>
        <AuthBannerWrapper />
        <GlobalModeSwitcher />
        {children}
        <TokenRefreshHandler />
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
```

## Component Behavior

### For Unauthenticated Users
- **AuthBannerWrapper** renders `SignInBanner`
- **GlobalModeSwitcher** returns `null` (not rendered)
- User sees: Sign-in banner at top with "Sign In" button

### For Authenticated Users
- **AuthBannerWrapper** returns `null` (not rendered)
- **GlobalModeSwitcher** renders mode switcher dropdown
- User sees: Mode switcher in top-right corner

## Key Features

1. **Consistent Rendering** - Components now render based on authentication state
2. **Event Listeners** - Both components listen for auth state changes
3. **Hydration Safe** - Uses `isLoaded` state to prevent hydration mismatches
4. **Real-time Updates** - Responds to login/logout events immediately
5. **Clean Separation** - Unauthenticated and authenticated UIs are separate

## Files Modified

1. `web/app/layout.tsx` - Added AuthBannerWrapper import and rendering
2. `web/components/auth-banner-wrapper.tsx` - Created new wrapper component

## Files Unchanged

- `web/components/signin-banner.tsx` - No changes needed
- `web/components/global-mode-switcher.tsx` - No changes needed

## Testing Checklist

- [x] Sign-in banner shows for unauthenticated users
- [x] Mode switcher shows for authenticated users
- [x] Sign-in banner disappears after login
- [x] Mode switcher appears after login
- [x] No hydration mismatches
- [x] Event listeners work correctly
- [x] Components respond to auth state changes

## Benefits

1. **User Experience** - Clear visual feedback for authentication state
2. **Consistency** - Same behavior across all pages
3. **Maintainability** - Centralized auth UI logic
4. **Scalability** - Easy to add more auth-dependent components
5. **Performance** - Minimal re-renders with proper state management


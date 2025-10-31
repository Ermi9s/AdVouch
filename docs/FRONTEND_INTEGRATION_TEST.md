# Frontend Integration Testing Checklist

**Date:** 2025-10-30  
**Test Environment:** http://localhost:3001  
**Backend API:** http://localhost:8000

---

## 🎯 Test Objectives

1. Verify all pages load without errors
2. Test interaction tracking (views, clicks, shares, searches)
3. Verify API integration
4. Check UI consistency across all pages
5. Test mode switcher functionality
6. Verify navigation and routing

---

## ✅ Manual Testing Checklist

### 1. Homepage Testing

**URL:** `http://localhost:3001/`

- [ ] Page loads without errors
- [ ] UnifiedHeader is visible
- [ ] GlobalModeSwitcher is present
- [ ] Search bar is visible and functional
- [ ] Google-like layout is displayed
- [ ] No duplicate headers
- [ ] No console errors

**Expected Behavior:**
- Clean homepage with search bar
- Mode switcher shows current mode
- Navigation links work

---

### 2. Ads Listing Page

**URL:** `http://localhost:3001/ads`

- [ ] Page loads without errors
- [ ] Ads list is displayed
- [ ] Sample ads from database are shown
- [ ] Split-view layout on desktop (≥1024px)
- [ ] Full-page layout on mobile (<1024px)
- [ ] Ad cards are clickable
- [ ] No duplicate headers

**Expected Data:**
- Should show 18 ads from sample data
- Ads include: "Premium Web Development Services", "Professional Graphic Design", etc.

**API Call to Verify:**
```bash
curl http://localhost:8000/api/v1/ads/
```

---

### 3. Ad Details Page

**URL:** `http://localhost:3001/ads/[id]`

- [ ] Page loads without errors
- [ ] Ad details are displayed
- [ ] Business information is shown
- [ ] Share button is visible
- [ ] Export options are available
- [ ] View tracking is triggered
- [ ] No duplicate headers

**Network Tab Check:**
- [ ] POST request to `/api/v1/track/view/` is sent
- [ ] Request payload includes `ad_id`
- [ ] Response status is 200 or 201

**API Call to Test:**
```bash
# Track view
curl -X POST http://localhost:8000/api/v1/track/view/ \
  -H "Content-Type: application/json" \
  -d '{"ad_id": 1}'
```

---

### 4. Search Functionality

**URL:** `http://localhost:3001/` (search bar)

- [ ] Search bar accepts input
- [ ] Search results are displayed
- [ ] Results show relevant ads
- [ ] Search tracking is triggered
- [ ] Clicking result navigates to ad details

**Network Tab Check:**
- [ ] POST request to `/api/v1/track/search/` is sent
- [ ] Request payload includes `query` and `results_count`
- [ ] Response status is 200 or 201

**API Call to Test:**
```bash
# Track search
curl -X POST http://localhost:8000/api/v1/track/search/ \
  -H "Content-Type: application/json" \
  -d '{"query": "web development", "results_count": 5}'
```

---

### 5. Click Tracking

**Test:** Click on any ad card or link

- [ ] Click navigates to ad details
- [ ] Click tracking is triggered
- [ ] Referrer is captured

**Network Tab Check:**
- [ ] POST request to `/api/v1/track/click/` is sent
- [ ] Request payload includes `ad_id` and `referrer`
- [ ] Response status is 201

**API Call to Test:**
```bash
# Track click
curl -X POST http://localhost:8000/api/v1/track/click/ \
  -H "Content-Type: application/json" \
  -d '{"ad_id": 1, "referrer": "http://localhost:3001/ads"}'
```

---

### 6. Share Functionality

**Test:** Click share button on ad details page

- [ ] Share button is visible
- [ ] Share options are displayed
- [ ] Share tracking is triggered
- [ ] Share count updates

**Network Tab Check:**
- [ ] POST request to `/api/v1/track/share/` is sent
- [ ] Request payload includes `ad_id` and `platform`
- [ ] Response status is 200 or 201

**API Call to Test:**
```bash
# Track share
curl -X POST http://localhost:8000/api/v1/track/share/ \
  -H "Content-Type: application/json" \
  -d '{"ad_id": 1, "platform": "facebook"}'
```

---

### 7. Mode Switcher Testing

**Test:** Switch between Normal User, Business Owner, and Advertiser modes

- [ ] Mode switcher is visible on all pages
- [ ] Clicking mode opens dropdown
- [ ] Selecting mode changes navigation
- [ ] Mode-specific links are shown
- [ ] Active mode is highlighted
- [ ] No duplicate mode switchers

**Expected Behavior:**
- **Normal User Mode:** Home, Ads, Businesses, About
- **Business Owner Mode:** Dashboard, My Business, Ads, Analytics
- **Advertiser Mode:** Dashboard, Campaigns, Ads, Analytics

---

### 8. Navigation Testing

**Test:** Navigate through all pages

- [ ] Home → Ads → Ad Details
- [ ] Home → Businesses → Business Details
- [ ] Dashboard (Business Owner mode)
- [ ] Dashboard (Advertiser mode)
- [ ] All links work correctly
- [ ] Back button works
- [ ] No broken links

---

### 9. Business Dashboard

**URL:** `http://localhost:3001/business/dashboard`

- [ ] Page loads without errors
- [ ] Business stats are displayed
- [ ] Ads list is shown
- [ ] Reputation metrics are visible
- [ ] No duplicate headers

**Expected Data:**
- Should show business from sample data
- Stats include clicks, views, shares, ratings

---

### 10. Advertiser Dashboard

**URL:** `http://localhost:3001/advertiser/dashboard`

- [ ] Page loads without errors
- [ ] Campaign stats are displayed
- [ ] Ads performance is shown
- [ ] Analytics are visible
- [ ] No duplicate headers

---

### 11. Reputation System

**Test:** Check business reputation

**API Call:**
```bash
# Get business reputation
curl http://localhost:8000/api/v1/reputation/business/2/
```

**Expected Response:**
```json
{
  "id": 2,
  "business_id": 2,
  "business_name": "Creative Design Studio",
  "share_count": 17,
  "average_ratting": 4.2,
  "review_count": 9,
  "click_count": 150,
  "view_count": 285,
  "search_count": 0,
  "overall_score": 67
}
```

- [ ] Reputation data is accurate
- [ ] Scores are calculated correctly
- [ ] Metrics match database

---

### 12. Export Functionality

**URL:** `http://localhost:3001/ads/[id]` (export button)

- [ ] Export button is visible
- [ ] Export options are displayed
- [ ] Iframe code is generated
- [ ] HTML link code is generated
- [ ] JSON export works
- [ ] Copy to clipboard works

---

### 13. Responsive Design

**Desktop (≥1024px):**
- [ ] Split-view layout on ads page
- [ ] List on left, details on right
- [ ] Navigation is horizontal
- [ ] All elements are visible

**Mobile (<1024px):**
- [ ] Full-page layout
- [ ] List view shows all ads
- [ ] Details view is separate page
- [ ] Navigation is responsive
- [ ] Mode switcher is accessible

---

### 14. Error Handling

**Test:** Invalid URLs and error states

- [ ] 404 page for invalid routes
- [ ] Error messages for failed API calls
- [ ] Loading states are shown
- [ ] Graceful degradation

---

### 15. Performance

**Test:** Page load times and responsiveness

- [ ] Homepage loads in <2 seconds
- [ ] Ads page loads in <3 seconds
- [ ] API calls complete in <1 second
- [ ] No layout shifts
- [ ] Smooth transitions

---

## 🔍 Browser Console Checks

**Open Developer Tools → Console**

- [ ] No JavaScript errors
- [ ] No React warnings
- [ ] No console.log statements
- [ ] No 404 errors for assets

---

## 🌐 Network Tab Checks

**Open Developer Tools → Network**

**Expected API Calls:**
1. `GET /api/v1/ads/` - Fetch ads list
2. `GET /api/v1/ads/[id]/` - Fetch ad details
3. `POST /api/v1/track/view/` - Track ad view
4. `POST /api/v1/track/click/` - Track ad click
5. `POST /api/v1/track/search/` - Track search
6. `POST /api/v1/track/share/` - Track share
7. `GET /api/v1/reputation/business/[id]/` - Get reputation

**Verify:**
- [ ] All API calls return 200/201 status
- [ ] Request payloads are correct
- [ ] Response data is valid JSON
- [ ] No CORS errors
- [ ] No authentication errors for public endpoints

---

## 📊 Database Verification

**After testing, verify data in database:**

```bash
# Check ad views
docker compose exec db psql -U postgres -d postgres -c "SELECT COUNT(*) FROM ad_views;"

# Check ad clicks
docker compose exec db psql -U postgres -d postgres -c "SELECT COUNT(*) FROM ad_clicks;"

# Check search queries
docker compose exec db psql -U postgres -d postgres -c "SELECT COUNT(*) FROM search_queries;"

# Check shares
docker compose exec db psql -U postgres -d postgres -c "SELECT COUNT(*) FROM shares;"
```

**Expected:**
- Counts should increase after testing
- Data should match user interactions

---

## ✅ Test Results Summary

**Total Tests:** 15 categories  
**Tests Passed:** ___  
**Tests Failed:** ___  
**Issues Found:** ___

---

## 🐛 Issues Found

| # | Issue | Severity | Page | Status |
|---|-------|----------|------|--------|
| 1 |       |          |      |        |
| 2 |       |          |      |        |
| 3 |       |          |      |        |

---

## 📝 Notes

- Frontend running on port 3001 (port 3000 in use)
- Backend API on port 8000
- Sample data includes 18 ads, 6 businesses, 11 users
- All interaction tracking endpoints are public (no auth required)

---

## 🎯 Next Steps

After completing manual testing:
1. Document all issues found
2. Fix critical bugs
3. Verify fixes
4. Proceed to mobile responsiveness testing
5. Conduct performance testing
6. Run security testing


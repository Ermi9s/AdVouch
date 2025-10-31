# Interaction Tracking System

## Overview

The Interaction Tracking System is a comprehensive analytics solution that tracks user interactions with ads and businesses on the AdVouch platform. This data is used to calculate business reputation scores and provide valuable insights to business owners and advertisers.

## Tracked Interactions

### 1. **Ad Views (Impressions)**
- **What**: When an ad is displayed to a user
- **When**: Automatically tracked when ad details page loads
- **Data Collected**:
  - Ad ID
  - User ID (if authenticated)
  - Session ID
  - IP Address
  - Timestamp

### 2. **Ad Clicks**
- **What**: When a user clicks on an ad
- **When**: When user selects an ad from search results or list view
- **Data Collected**:
  - Ad ID
  - User ID (if authenticated)
  - Session ID
  - IP Address
  - Referrer URL
  - User Agent
  - Timestamp

### 3. **Ad Shares**
- **What**: When a user shares an ad
- **When**: User clicks share button or exports ad
- **Data Collected**:
  - Ad ID
  - User ID (if authenticated)
  - Timestamp

### 4. **Search Queries**
- **What**: User search queries and their results
- **When**: User searches for ads or businesses
- **Data Collected**:
  - Search query text
  - User ID (if authenticated)
  - Session ID
  - Results count
  - Clicked ad ID (if user clicks on a result)
  - Clicked business ID (if user clicks on a result)
  - Timestamp

## Backend Implementation

### Models

#### AdClick
```python
class AdClick(models.Model):
    ad = ForeignKey('ads.Ad')
    user = ForeignKey('users.User', null=True, blank=True)
    session_id = CharField(max_length=255, null=True, blank=True)
    ip_address = GenericIPAddressField(null=True, blank=True)
    referrer = CharField(max_length=512, null=True, blank=True)
    user_agent = CharField(max_length=512, null=True, blank=True)
    created_at = DateTimeField(auto_now_add=True)
```

#### AdView
```python
class AdView(models.Model):
    ad = ForeignKey('ads.Ad')
    user = ForeignKey('users.User', null=True, blank=True)
    session_id = CharField(max_length=255, null=True, blank=True)
    ip_address = GenericIPAddressField(null=True, blank=True)
    created_at = DateTimeField(auto_now_add=True)
```

#### SearchQuery
```python
class SearchQuery(models.Model):
    query = CharField(max_length=255)
    user = ForeignKey('users.User', null=True, blank=True)
    session_id = CharField(max_length=255, null=True, blank=True)
    clicked_ad = ForeignKey('ads.Ad', null=True, blank=True)
    clicked_business = ForeignKey('business.Business', null=True, blank=True)
    results_count = IntegerField(default=0)
    created_at = DateTimeField(auto_now_add=True)
```

### API Endpoints

All tracking endpoints are **public** (no authentication required) to allow tracking of anonymous users.

#### Track Ad Click
```
POST /api/v1/interactions/track/click/
Content-Type: application/json

{
  "ad_id": 123,
  "referrer": "https://example.com",
  "user_agent": "Mozilla/5.0..."
}

Response:
{
  "success": true,
  "click_id": 456,
  "message": "Click tracked successfully"
}
```

#### Track Ad View
```
POST /api/v1/interactions/track/view/
Content-Type: application/json

{
  "ad_id": 123
}

Response:
{
  "success": true,
  "view_id": 789,
  "message": "View tracked successfully"
}
```

#### Track Share
```
POST /api/v1/interactions/track/share/
Content-Type: application/json

{
  "ad_id": 123
}

Response:
{
  "success": true,
  "share_id": 101,
  "message": "Share tracked successfully"
}
```

#### Track Search
```
POST /api/v1/interactions/track/search/
Content-Type: application/json

{
  "query": "coffee shop",
  "results_count": 5,
  "clicked_ad_id": 123,
  "clicked_business_id": 45
}

Response:
{
  "success": true,
  "search_id": 202,
  "message": "Search tracked successfully"
}
```

## Frontend Implementation

### React Hooks

#### `useInteractionTracking()`
Main hook for tracking interactions:

```typescript
const { trackView, trackClick, trackShare, trackSearch } = useInteractionTracking()

// Track a view
await trackView(adId)

// Track a click
await trackClick(adId, referrer)

// Track a share
await trackShare(adId)

// Track a search
await trackSearch(query, resultsCount, clickedAdId, clickedBusinessId)
```

#### `useTrackAdView(adId)`
Automatically tracks ad view when component mounts:

```typescript
// In ad details page
useTrackAdView(ad?.id)
```

#### `useTrackSearch(delay)`
Debounced search tracking:

```typescript
const trackSearch = useTrackSearch(1500) // 1.5 second debounce

// In search input handler
trackSearch(query, resultsCount)
```

### Integration Points

#### Ad Details Page (`/ads/[id]`)
- **View Tracking**: Automatic on page load
- **Share Tracking**: When user shares ad
- **Click Tracking**: Implicit (user navigated to page)

#### Ads List Page (`/ads`)
- **Search Tracking**: When user searches
- **Click Tracking**: When user clicks on ad card
- **Search Click Tracking**: When user clicks on search result

#### Businesses Page (`/businesses`)
- **Search Tracking**: When user searches
- **Click Tracking**: When user clicks on business card

## Reputation Calculation

The reputation system uses interaction data to calculate business scores:

### Reputation Model
```python
class Reputation(models.Model):
    business = ForeignKey('business.Business')
    share_count = BigIntegerField(default=0)
    average_ratting = FloatField(default=0.0)
    review_count = BigIntegerField(default=0)
    click_count = BigIntegerField(default=0)
    view_count = BigIntegerField(default=0)
    search_count = BigIntegerField(default=0)
    overall_score = BigIntegerField(default=50)
    last_updated = DateTimeField(auto_now=True)
```

### Score Calculation Algorithm

```python
def calculate_score(self):
    # Rating score (0-40 points)
    rating_score = (self.average_ratting / 5.0) * 40
    
    # Engagement score (0-30 points)
    engagement_total = self.click_count + (self.view_count * 0.1) + (self.share_count * 5)
    engagement_score = min(engagement_total / 100, 1.0) * 30
    
    # Review score (0-20 points)
    review_score = min(self.review_count / 50, 1.0) * 20
    
    # Search visibility score (0-10 points)
    search_score = min(self.search_count / 100, 1.0) * 10
    
    # Total score (0-100)
    total_score = rating_score + engagement_score + review_score + search_score
    
    return int(total_score)
```

### Weights
- **Average Rating**: 40% - Quality of service
- **Engagement**: 30% - User interest (clicks, views, shares)
- **Reviews**: 20% - User feedback volume
- **Search Visibility**: 10% - Discoverability

## Privacy & Security

### Anonymous Tracking
- Users can be tracked without authentication
- Session IDs used to identify unique sessions
- IP addresses stored for fraud detection

### Data Retention
- Interaction data retained indefinitely for analytics
- Personal data (IP, session) can be anonymized after 90 days

### GDPR Compliance
- Users can request deletion of their interaction data
- IP addresses can be anonymized
- Session tracking uses first-party cookies only

## Analytics & Reporting

### Business Owner Dashboard
Business owners can view:
- Total views, clicks, shares
- Click-through rate (CTR)
- Share rate
- Search appearances
- Reputation score breakdown

### API Endpoints

#### Get Business Reputation
```
GET /api/v1/reputation/business/{business_id}/

Response:
{
  "id": 1,
  "business_id": 123,
  "business_name": "Coffee Shop",
  "share_count": 42,
  "average_rating": 4.5,
  "review_count": 28,
  "click_count": 350,
  "view_count": 1200,
  "search_count": 85,
  "overall_score": 78,
  "last_updated": "2025-01-15T10:30:00Z"
}
```

#### Update Business Reputation (Owner Only)
```
POST /api/v1/reputation/business/{business_id}/update/
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Reputation updated successfully",
  "reputation": { ... }
}
```

## Performance Considerations

### Database Indexes
- `(ad, created_at)` on AdClick and AdView for time-series queries
- `(user, created_at)` for user activity analysis
- `(query, created_at)` on SearchQuery for trending searches

### Caching
- Reputation scores cached for 1 hour
- Aggregate statistics cached for 15 minutes
- Real-time tracking has no caching

### Batch Processing
- Reputation updates can be batched
- Bulk update endpoint for admin use
- Scheduled jobs for periodic recalculation

## Testing

### Manual Testing
```bash
# Track a click
curl -X POST http://localhost:8000/api/v1/interactions/track/click/ \
  -H "Content-Type: application/json" \
  -d '{"ad_id": 1, "referrer": "https://example.com"}'

# Track a view
curl -X POST http://localhost:8000/api/v1/interactions/track/view/ \
  -H "Content-Type: application/json" \
  -d '{"ad_id": 1}'

# Track a search
curl -X POST http://localhost:8000/api/v1/interactions/track/search/ \
  -H "Content-Type: application/json" \
  -d '{"query": "coffee", "results_count": 5}'

# Get reputation
curl http://localhost:8000/api/v1/reputation/business/1/
```

### Frontend Testing
1. Open browser DevTools
2. Navigate to ads page
3. Search for ads
4. Click on ad cards
5. Check console for tracking logs: `[Tracking] ...`
6. Verify network requests to `/api/v1/interactions/track/...`

## Future Enhancements

- [ ] Real-time analytics dashboard
- [ ] Heatmaps for ad engagement
- [ ] A/B testing support
- [ ] Conversion tracking
- [ ] Attribution modeling
- [ ] Fraud detection algorithms
- [ ] Geographic analytics
- [ ] Time-based trending analysis
- [ ] Predictive reputation scoring
- [ ] Machine learning for ad recommendations

## Troubleshooting

### Issue: Tracking not working
- Check browser console for errors
- Verify API endpoints are accessible
- Check CORS settings
- Ensure session cookies are enabled

### Issue: Duplicate tracking
- Check if `useTrackAdView` is called multiple times
- Verify debouncing is working for searches
- Check for duplicate event handlers

### Issue: Reputation not updating
- Run manual update: `POST /api/v1/reputation/business/{id}/update/`
- Check database for interaction records
- Verify calculation algorithm
- Check for database connection issues

## Support

For issues or questions:
- Check the main documentation
- Review API documentation
- Contact the development team


# Ad Export & Embedding System

## Overview

The Ad Export & Embedding System allows business owners to export their ads with AdVouch branding for use on external advertising platforms. This feature ensures that all exported ads maintain trust and credibility by displaying "Advertised via AdVouch" branding.

## Features

### 1. **Embeddable HTML Templates**
- Fully responsive HTML templates with AdVouch branding
- Professional styling with gradient accents
- "Advertised via AdVouch" badge prominently displayed
- Verified & Trusted footer branding
- Support for both image and video media

### 2. **Multiple Export Formats**

#### iFrame Embed Code
- Ready-to-use iframe code for embedding on websites
- Responsive design that adapts to container width
- Isolated styling to prevent conflicts
- Auto-height adjustment

#### Direct Link
- HTML anchor tag for linking to ads
- Opens in new tab with security attributes
- SEO-friendly markup

#### Plain URL
- Direct URL to the embeddable ad view
- Can be shared on social media or messaging platforms

#### JSON Export
- Complete ad data with branding information
- Includes business details
- Export metadata and versioning
- Suitable for custom integrations

### 3. **AdVouch Branding Elements**

All exported ads include:
- **Top-right badge**: "Advertised via AdVouch" with AdVouch logo
- **Footer branding**: "Verified & Trusted" with AdVouch logo
- **Gradient styling**: Purple-to-blue gradient matching AdVouch brand
- **Professional design**: Clean, modern aesthetic

## Backend Implementation

### Django Views

#### `AdEmbedView`
- **Endpoint**: `/api/v1/ads/{id}/embed/`
- **Method**: GET
- **Description**: Renders the embeddable HTML template
- **Template**: `ad_embed.html`
- **Access**: Public (for active ads only)

#### `AdEmbedCodeView`
- **Endpoint**: `/api/v1/ads/{id}/embed-code/`
- **Method**: GET
- **Description**: Generates embed codes (iframe, direct link, URL)
- **Response**:
  ```json
  {
    "ad_id": 123,
    "ad_title": "Example Ad",
    "embed_url": "https://advouch.com/api/v1/ads/123/embed/",
    "iframe_code": "<iframe src=\"...\">...</iframe>",
    "direct_link": "<a href=\"...\">...</a>",
    "preview_url": "https://advouch.com/api/v1/ads/123/embed/"
  }
  ```
- **Access**: Public (for active ads only)

#### `AdExportDataView`
- **Endpoint**: `/api/v1/ads/{id}/export/`
- **Method**: GET
- **Description**: Exports complete ad data in JSON format
- **Authentication**: Required (JWT)
- **Permission**: Owner only
- **Response**:
  ```json
  {
    "ad": {
      "id": 123,
      "title": "Example Ad",
      "description": "...",
      "status": "active",
      "share_count": 42,
      "created_at": "2025-01-15T10:30:00Z",
      "media_files": [...]
    },
    "business": {
      "id": 1,
      "name": "Example Business"
    },
    "branding": {
      "platform": "AdVouch",
      "tagline": "Verified & Trusted Advertising",
      "website": "https://advouch.com",
      "badge_text": "Advertised via AdVouch"
    },
    "export_info": {
      "exported_at": "...",
      "format": "json",
      "version": "1.0"
    }
  }
  ```

### Template: `ad_embed.html`

Located at: `resource/ads/templates/ad_embed.html`

Features:
- Responsive design (mobile-first)
- Embedded CSS (no external dependencies)
- AdVouch badge (top-right, absolute positioned)
- Media section (supports images and videos)
- Content section (title, description, CTA)
- Meta information (shares, business name)
- Branded footer

## Frontend Implementation

### Components

#### `AdExportModal`
- **Location**: `web/components/ad-export-modal.tsx`
- **Purpose**: Modal dialog for exporting ads
- **Features**:
  - Tabbed interface (Embed Code, Direct Link, Preview)
  - Copy-to-clipboard functionality
  - Preview in new tab
  - AdVouch branding notice
  - Loading states and error handling

#### `AdDetailsPanel`
- **Location**: `web/components/ad-details-panel.tsx`
- **Purpose**: Display ad details in split-view layout
- **Features**: Fetches and displays ad information with stats

#### `BusinessDetailsPanel`
- **Location**: `web/components/business-details-panel.tsx`
- **Purpose**: Display business details in split-view layout

#### `AdCardExport`
- **Location**: `web/components/ad-card-export.tsx`
- **Purpose**: Exportable ad card component for screenshots/social sharing
- **Features**: Fixed-width (600px) design optimized for sharing

### API Client Updates

Added to `web/lib/api.ts`:

```typescript
adsApi.getById(id: string | number): Promise<Ad>
adsApi.getEmbedCode(id: string | number): Promise<EmbedCodeResponse>
adsApi.getExportData(id: string | number): Promise<ExportDataResponse>

businessApi.getById(id: string | number): Promise<Business>
```

### Integration Points

#### Ad Details Page (`/ads/[id]`)
- Export button added to business owner view
- Opens `AdExportModal` when clicked
- Positioned prominently as primary CTA for business owners

#### Business Dashboard
- Can be integrated to show export options for each ad
- Quick access to export functionality

## Usage

### For Business Owners

1. **Navigate to Ad Details**
   - Go to any of your active ads
   - Switch to Business Owner mode if not already

2. **Click "Export Ad for External Use"**
   - Primary button in the ad details sidebar
   - Opens the export modal

3. **Choose Export Format**
   - **Embed Code Tab**: Copy iframe code for websites
   - **Direct Link Tab**: Copy HTML link or plain URL
   - **Preview Tab**: View how the ad will appear

4. **Copy and Use**
   - Click copy button next to any code snippet
   - Paste into your external platform
   - Preview before publishing

### For Advertisers (External Platforms)

1. **Receive Embed Code**
   - Business owner shares embed code with you
   - Code includes AdVouch branding

2. **Embed on Your Platform**
   - Paste iframe code into your website/platform
   - Ad displays with AdVouch verification badge
   - Builds trust with your audience

3. **Track Performance**
   - Users can click through to AdVouch
   - Interactions tracked on AdVouch platform
   - Contributes to business reputation

## Security & Privacy

- **Public Access**: Embed views are public for active ads only
- **Owner Verification**: Export data endpoint requires authentication
- **XSS Protection**: All user content is properly escaped in templates
- **CORS**: Configured to allow embedding from external domains
- **Frame Options**: Allows embedding in iframes

## Branding Guidelines

### Required Elements

All exported ads MUST include:
1. "Advertised via AdVouch" badge (visible, not removable)
2. AdVouch logo in footer
3. "Verified & Trusted" indicator
4. Link back to AdVouch platform

### Visual Identity

- **Primary Gradient**: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- **Logo Badge**: Circular "A" icon with gradient background
- **Typography**: System fonts for maximum compatibility
- **Border Radius**: 12px for cards, 20px for badges

## Future Enhancements

- [ ] Social media optimized image exports (PNG/JPG)
- [ ] Animated GIF exports for social media
- [ ] QR code generation for offline advertising
- [ ] Analytics tracking for embedded ads
- [ ] Custom branding options (while maintaining AdVouch badge)
- [ ] Bulk export functionality
- [ ] Export templates for different platforms (Instagram, Facebook, etc.)
- [ ] Video ad exports with watermark
- [ ] PDF export for print advertising

## Testing

### Manual Testing Checklist

- [ ] Export modal opens correctly
- [ ] All three tabs display proper content
- [ ] Copy-to-clipboard works for all code snippets
- [ ] Preview opens in new tab
- [ ] Embed view renders correctly
- [ ] AdVouch branding is visible and prominent
- [ ] Responsive design works on mobile
- [ ] iFrame code works when embedded
- [ ] Authentication required for export data endpoint
- [ ] Only active ads can be embedded

### API Testing

```bash
# Get embed code (public)
curl http://localhost:8000/api/v1/ads/1/embed-code/

# View embed (public)
curl http://localhost:8000/api/v1/ads/1/embed/

# Export data (requires auth)
curl -H "Authorization: Bearer <token>" \
     http://localhost:8000/api/v1/ads/1/export/
```

## Troubleshooting

### Issue: Embed not displaying
- Check if ad status is "active"
- Verify embed URL is correct
- Check browser console for errors
- Ensure iframe is not blocked by CSP

### Issue: Copy button not working
- Check browser clipboard permissions
- Try using HTTPS (required for clipboard API)
- Fallback: manually select and copy text

### Issue: Preview not opening
- Check popup blocker settings
- Verify embed URL is accessible
- Check network connectivity

## Support

For issues or questions:
- Check the main AdVouch documentation
- Review the API documentation
- Contact the development team


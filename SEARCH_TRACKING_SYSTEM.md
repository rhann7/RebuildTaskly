# Article Search Tracking System

## Overview
Sistem tracking otomatis untuk mencatat setiap pencarian yang dilakukan users di Article Center page dan menampilkannya di Analytics dashboard.

## Flow Diagram
```
User Search di Article Center
    ↓
ArticleCenterController::trackSearch()
    ↓
1. Normalize keyword (lowercase, trim)
    ↓
2. Detect Device Type (Desktop/Mobile/Tablet + OS/Brand)
    ↓
3. Find or Create Keyword di table `article_keywords`
    ↓
4. Update keyword rate (+0.1 per search, max 10.0)
    ↓
5. Save search record di table `article_key_searches`
    ↓
Data muncul di Analytics Dashboard (/article-management/analytics)
```

## Features Implemented

### 1. Search Tracking
- **Location**: `ArticleCenterController::trackSearch()`
- **Triggered**: Setiap kali user search di Article Center
- **Data Captured**:
  - Keyword yang dicari (normalized)
  - Device type (detailed)
  - User ID (nullable untuk guest)
  - Timestamp pencarian

### 2. Keyword Management
- **Auto-create**: Keyword baru otomatis dibuat dengan rate 1.0
- **Rate System**: Rate meningkat +0.1 setiap search (max 10.0)
- **Purpose**: Keyword dengan rate tinggi = sering dicari

### 3. Device Detection
- **Library**: `jenssegers/agent`
- **Detection**: 
  - Desktop: "Desktop Windows 10", "Desktop macOS"
  - Mobile: "iPhone", "Android Samsung Galaxy"
  - Tablet: "iPad", "Android Tablet"
  - Bot: "Bot (Googlebot)"

### 4. Analytics Integration
Semua data tracking langsung tersedia di:
- `/article-management/analytics` → View analytics page
- Stats: Total searches, keywords, users, avg rate
- Top Keywords card
- Device Activity Monitor (potential issues)
- Search History DataTable

## Files Modified/Created

### Modified:
1. **ArticleCenterController.php**
   - Added imports: `ArticleKeyword`, `ArticleKeySearch`, `Auth`, `Agent`
   - Added `trackSearch()` method
   - Added `getDeviceType()` helper method
   - Integrated tracking call in `index()` method

### Created:
2. **Migration**: `2026_02_23_000001_make_users_id_nullable_in_article_key_searches.php`
   - Makes `users_id` nullable for guest tracking

## Database Schema

### article_keywords
```sql
id              BIGINT (PK)
name            VARCHAR (keyword text, lowercase)
rate_keyword    FLOAT (1.0 - 10.0)
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

### article_key_searches
```sql
id                  BIGINT (PK)
article_keyword_id  BIGINT (FK → article_keywords)
users_id            BIGINT (FK → users, NULLABLE)
device_type         VARCHAR (detailed device info)
search_at           TIMESTAMP
```

## Usage Example

### User Journey:
1. User visits `/article-center`
2. Search for "login error"
3. **System automatically**:
   - Creates/finds keyword "login error"
   - Detects device: "Desktop Windows 10"
   - Saves search record with user_id (or null)
   - Updates keyword rate
4. Admin can see this in Analytics:
   - "login error" appears in Top Keywords
   - "Desktop Windows 10" shows in Device Monitor
   - Search appears in DataTable

## Installation Steps

```bash
# 1. Run migration to make users_id nullable
php artisan migrate

# 2. (Optional) Seed sample analytics data
php artisan db:seed --class=ArticleAnalyticsSeeder

# 3. Test search tracking
# - Visit: http://localhost:8000/article-center
# - Search for any keyword
# - Check analytics: http://localhost:8000/article-management/analytics
```

## Logs
All tracking events are logged:
```php
\Log::info('Search tracked', [
    'keyword' => 'login error',
    'device' => 'Desktop Windows 10',
    'user_id' => 1,
    'rate' => 2.3,
]);
```

## Error Handling
- Tracking failures don't break user experience
- Errors are logged but search continues normally
- Short keywords (<2 chars) are skipped

## Analytics Dashboard Impact

### Before:
- Manual data entry only
- No search tracking

### After:
- **Real-time tracking** of all searches
- **Device insights** showing which devices have most issues
- **Popular keywords** based on actual user searches
- **Search history** with full audit trail

## Testing Checklist

- [ ] Search as authenticated user → Check analytics for user_id
- [ ] Search as guest → Check analytics shows "Guest"
- [ ] Search from mobile device → Check device detection
- [ ] Search same keyword multiple times → Check rate increases
- [ ] View analytics dashboard → Verify data appears correctly
- [ ] Export analytics CSV → Verify data export works

## Notes
- Guest users are tracked with `users_id = NULL`
- Device detection works for desktop, mobile, tablet, and bots
- Keywords are case-insensitive (auto-lowercase)
- Rate system helps identify trending search topics
- All tracking is async and doesn't slow down search

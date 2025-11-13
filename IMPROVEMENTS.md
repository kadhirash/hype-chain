# Codebase Improvements

## High Priority

### 1. Replace `alert()` with Toast Notifications
**Files:**
- `app/create/page.tsx` (line 59)
- `app/content/[contentId]/page.tsx` (lines 69, 74)

**Issue:** Using browser `alert()` is poor UX and blocks the UI thread.

**Solution:** Implement a toast notification system (e.g., `react-hot-toast` or custom component) for better user feedback.

### 2. Error Handling in API Routes
**Files:** All API routes in `app/api/`

**Issue:** Some API routes return generic "Internal server error" without logging context.

**Improvements:**
- Add structured error logging
- Return more specific error messages (without exposing sensitive data)
- Add error tracking/monitoring (optional for hackathon)

### 3. Type Safety
**Files:** Multiple pages using `any` types

**Issues:**
- `app/explore/page.tsx`: `content: any[]`
- `app/content/[contentId]/page.tsx`: Multiple `any` types
- `app/create/page.tsx`: `result: any`

**Solution:** Create TypeScript interfaces/types for:
- Content
- Share
- Stats
- API responses

## Medium Priority

### 4. Loading States Consistency
**Files:** All pages

**Issue:** Loading states vary in style and implementation.

**Solution:** Create a reusable `<LoadingSpinner />` component for consistency.

### 5. Image Loading Strategy
**Files:** 
- `app/explore/page.tsx`
- `app/content/[contentId]/page.tsx`

**Issue:** Image loading logic is duplicated.

**Solution:** Extract into a reusable `<ImageWithFallback />` component.

### 6. API Error Handling in Frontend
**Files:** All pages with API calls

**Issue:** Error handling is inconsistent - some show errors, some just log.

**Solution:** Create a centralized error handler or use a consistent pattern.

### 7. Environment Variables Validation
**File:** `src/lib/supabase.ts`

**Issue:** Environment variables are checked but could fail more gracefully.

**Solution:** Add startup validation for required env vars.

### 8. Dynamic Chain Height in Viral Tree
**File:** `app/content/[contentId]/page.tsx` (lines 311, 322)

**Issue:** Chain height is hardcoded at `17rem`/`h-72` for specific child indices (`childIndex === 1`), causing chains to extend beyond user cards when there are multiple children or different depths.

**Solution:** Calculate chain height dynamically based on:
- Actual distance between parent and child nodes
- Number of siblings between nodes
- Depth level
- Use `ref` to measure actual DOM positions and calculate required height

## Low Priority / Nice to Have

### 8. Code Duplication
**Files:** Navigation component (mobile vs desktop)

**Issue:** Similar logic duplicated for mobile/desktop views.

**Solution:** Extract shared logic into helper functions (but current approach is fine for hackathon).

### 9. Performance Optimizations
- Add React.memo for expensive components
- Implement virtual scrolling for long lists (explore page)
- Add debouncing for search/filter inputs (if added)

### 10. Accessibility
- Add ARIA labels to buttons
- Improve keyboard navigation
- Add focus indicators

### 11. SEO Improvements
- Add meta tags to pages
- Add Open Graph tags
- Add structured data (JSON-LD)

## Quick Wins (Can be done quickly)

1. ✅ Replace `alert()` with toast notifications (30 min)
2. ✅ Create TypeScript interfaces (20 min)
3. ✅ Create reusable LoadingSpinner component (15 min)
4. ✅ Add better error messages in API routes (20 min)

## Notes

- Most improvements are polish/optimization - core functionality works well
- For hackathon demo, focus on: toast notifications, better error messages, type safety
- Performance optimizations can wait until after demo if needed


# Universal Search Feature - Implementation Guide

## Overview

The Universal Search feature provides a powerful, system-wide search capability that allows users to quickly find people, tasks, projects, and other resources across the entire application. Accessible via a prominent search bar in the header and keyboard shortcuts, it delivers instant, relevant results with smooth navigation.

## Features

### 🔍 What Can Be Searched

The universal search searches across multiple resource types:

1. **Users** (👤)
   - Full name
   - Email address
   - Job role/title
   
2. **Tasks** (✓)
   - Task title
   - Description
   - Status and priority
   
3. **Projects** (📁)
   - Project name
   - Description
   - Status
   
4. **Departments** (🏢)
   - Department name
   - Description
   
5. **Feedback** (💬) - Admin only
   - Feedback content
   - Sentiment analysis
   
6. **Chat Rooms** (💬)
   - Room names
   - Room types

### ⌨️ Keyboard Shortcuts

- **⌘K** (Mac) / **Ctrl+K** (Windows/Linux) - Open search
- **↑ / ↓** - Navigate results
- **Enter** - Select result and navigate
- **Esc** - Close search

### 🎯 Key Features

1. **Real-time Search** - Results update as you type (300ms debounce)
2. **Relevance Ranking** - Results sorted by relevance score
3. **Type Filtering** - Filter by resource type
4. **Rich Previews** - Shows avatars, icons, and metadata
5. **Keyboard Navigation** - Full keyboard support
6. **Performance** - Fast search with execution time tracking
7. **Permissions** - Respects user permissions (e.g., feedback for admins only)

## Architecture

### Backend Structure

```
backend/
├── app/
│   ├── api/
│   │   └── search.py              # Search endpoint
│   └── schemas/
│       └── search.py               # Search schemas
```

### Frontend Structure

```
frontend/
├── src/
│   ├── components/
│   │   └── Search/
│   │       └── UniversalSearch.tsx # Search modal component
│   ├── services/
│   │   └── searchService.ts        # Search API client
│   └── components/Layout/
│       └── Header.tsx              # Integrated search bar
```

## Backend Implementation

### API Endpoint

**Endpoint:** `GET /api/v1/search`

**Query Parameters:**
- `q` (required) - Search query string (min 1 character)
- `types` (optional) - Comma-separated list of types to search
- `limit` (optional) - Maximum results to return (default: 20, max: 100)
- `offset` (optional) - Pagination offset (default: 0)

**Example Request:**
```bash
GET /api/v1/search?q=john&types=user,task&limit=10
```

**Response:**
```json
{
  "query": "john",
  "total_results": 5,
  "results": [
    {
      "id": 1,
      "type": "user",
      "title": "John Doe",
      "subtitle": "Software Engineer",
      "description": "john.doe@example.com",
      "avatar_url": "/uploads/avatars/1_abc123.jpg",
      "icon": "user",
      "url": "/people/1",
      "metadata": {
        "email": "john.doe@example.com",
        "department_id": 2,
        "is_active": true
      },
      "relevance_score": 0.9
    }
  ],
  "results_by_type": {
    "user": 3,
    "task": 2
  },
  "execution_time_ms": 45.23
}
```

### Relevance Scoring

The search implements a relevance scoring algorithm:

- **Exact match**: 1.0
- **Starts with query**: 0.9
- **Contains query**: 0.7
- **Word match**: 0.5 × (matches / total words)

Results are automatically sorted by relevance score (highest first).

### Search Logic

For each resource type, the search:

1. Performs case-insensitive SQL `ILIKE` search
2. Searches multiple fields (name, description, etc.)
3. Calculates relevance score
4. Limits results per type (10 items)
5. Respects user permissions

## Frontend Implementation

### Universal Search Component

Located at: `frontend/src/components/Search/UniversalSearch.tsx`

**Key Features:**

1. **Modal Interface** - Overlay with backdrop
2. **Debounced Search** - 300ms delay to reduce API calls
3. **Keyboard Navigation** - Full arrow key and Enter support
4. **Visual Feedback** - Loading states, hover effects
5. **Auto-focus** - Input automatically focused when opened

### Search Service

Located at: `frontend/src/services/searchService.ts`

Provides:
- `search(query, types?, limit?, offset?)` - Perform search
- `getIconForType(type)` - Get emoji icon for type
- `getColorForType(type)` - Get color scheme for type
- `getLabelForType(type)` - Get display label for type

### Integration in Header

The search bar is integrated into the main header:

```tsx
// Search bar in header
<button onClick={() => setIsSearchOpen(true)}>
  Search anything... ⌘K
</button>

// Modal
<UniversalSearch 
  isOpen={isSearchOpen} 
  onClose={() => setIsSearchOpen(false)} 
/>
```

## User Interface

### Search Bar (Header)

- **Location**: Center of header, between title and user menu
- **Visual**: Light gray background, search icon, keyboard hint
- **Interaction**: Click to open or use keyboard shortcut

### Search Modal

- **Backdrop**: Semi-transparent black overlay
- **Modal**: White, centered, rounded corners, shadow
- **Input**: Large, prominent search field
- **Results**: Scrollable list with rich previews
- **Footer**: Keyboard hints and result count

### Result Items

Each result shows:

- **Avatar/Icon**: User photo or type emoji
- **Title**: Primary text (bold)
- **Type Badge**: Colored pill with resource type
- **Subtitle**: Secondary info (role, status, etc.)
- **Description**: Additional context (truncated)
- **Hover State**: Light background highlight
- **Selected State**: Blue left border, blue background

## Performance Optimizations

1. **Debouncing**: 300ms delay before search request
2. **Result Limiting**: Max 10 results per type
3. **Lazy Loading**: Results loaded only when needed
4. **Caching**: Browser caches API responses
5. **Efficient Queries**: Database indexes on searchable fields

## Permissions & Security

- **Authentication**: All search requests require valid JWT token
- **Feedback Access**: Only admins can search feedback
- **User Privacy**: Search respects data visibility rules
- **SQL Injection**: Protected via SQLAlchemy parameterized queries

## Usage Examples

### Basic Search

1. Click search bar or press `⌘K`/`Ctrl+K`
2. Type search query (e.g., "john")
3. View results as you type
4. Use arrow keys to navigate or click
5. Press Enter or click to open result

### Advanced Search

1. Open search
2. Type query with specific intent:
   - "marketing" → Finds department, people in marketing
   - "urgent" → Finds urgent tasks
   - "project alpha" → Finds Project Alpha

### Keyboard Navigation

```
⌘K / Ctrl+K  →  Open search
Type          →  Search
↓             →  Next result
↑             →  Previous result
Enter         →  Open selected result
Esc           →  Close search
```

## Customization

### Adding New Resource Types

1. **Backend**: Update `search.py`
```python
# Add new search block
if 'newtype' in search_types:
    items = db.query(NewModel).filter(
        NewModel.field.ilike(search_pattern)
    ).limit(10).all()
    
    for item in items:
        results.append(SearchResult(
            id=item.id,
            type='newtype',
            title=item.name,
            # ... other fields
        ))
```

2. **Frontend**: Update `searchService.ts`
```typescript
// Add icon, color, label
getIconForType(type: string): string {
  const iconMap = {
    // ...
    newtype: '🆕',
  };
}
```

### Customizing Relevance Algorithm

Edit `calculate_relevance()` in `backend/app/api/search.py`:

```python
def calculate_relevance(text: str, query: str) -> float:
    # Custom scoring logic
    # Return 0.0 to 1.0
    pass
```

## Troubleshooting

### Search Not Working

1. **Check backend is running**: `http://localhost:8000`
2. **Verify authentication**: User must be logged in
3. **Check browser console**: Look for API errors
4. **Test endpoint directly**: Use curl or Postman

### No Results Returned

1. **Check query length**: Minimum 2 characters
2. **Verify data exists**: Search requires existing data
3. **Check permissions**: Some resources are restricted
4. **Review search types**: Ensure types parameter is valid

### Slow Performance

1. **Add database indexes**: Index searchable columns
2. **Reduce result limit**: Lower max results per type
3. **Optimize queries**: Review SQL execution plans
4. **Enable caching**: Add Redis caching layer

## Testing

### Manual Testing

1. **Empty Search**: Verify no errors with empty results
2. **Single Character**: Check minimum length validation
3. **Special Characters**: Test with quotes, symbols
4. **Long Queries**: Test with very long search strings
5. **All Types**: Search each resource type
6. **Permissions**: Test with different user roles

### API Testing

```bash
# Test basic search
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8000/api/v1/search?q=test"

# Test with type filter
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8000/api/v1/search?q=john&types=user,task"

# Test pagination
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8000/api/v1/search?q=test&limit=5&offset=5"
```

## Future Enhancements

### Planned Features

1. **Search History** - Track and show recent searches
2. **Saved Searches** - Save frequent searches
3. **Advanced Filters** - Date ranges, status filters, etc.
4. **Search Suggestions** - Autocomplete suggestions
5. **Fuzzy Matching** - Handle typos and variations
6. **Full-Text Search** - Use PostgreSQL full-text search
7. **Search Analytics** - Track popular searches
8. **Voice Search** - Speech-to-text search input

### Performance Improvements

1. **ElasticSearch Integration** - For larger datasets
2. **Search Result Caching** - Redis cache for common queries
3. **Infinite Scroll** - Load more results on scroll
4. **Background Indexing** - Pre-index searchable content

## Best Practices

1. **Keep It Fast**: Search should return results in < 200ms
2. **Relevant Results**: Tune relevance algorithm regularly
3. **Clear Feedback**: Show loading states, empty states
4. **Keyboard First**: Optimize for keyboard users
5. **Mobile Friendly**: Ensure search works on mobile devices
6. **Test Regularly**: Test with production-like data

## Support

For issues or questions:
- Check this documentation
- Review backend logs for search queries
- Test API endpoint directly
- Check browser console for errors

---

## Summary

The Universal Search feature provides:

✅ **Fast, system-wide search** across all resources
✅ **Intuitive interface** with keyboard shortcuts
✅ **Relevance-based ranking** for best results
✅ **Permission-aware** search results
✅ **Rich previews** with avatars and metadata
✅ **Keyboard navigation** for power users
✅ **Mobile responsive** design

Total Implementation:
- **Backend**: 1 endpoint, 2 schema files, ~300 lines
- **Frontend**: 1 component, 1 service, ~250 lines
- **Integration**: Header component updated

**Last Updated**: 2025-10-18


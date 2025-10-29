# TRAXCIS Design System
## Corporate HR Management System - Design & Implementation Guide

> **Version 1.0** | Modern, professional, data-driven design language for enterprise HR applications

---

## 📋 Table of Contents
1. [Overview](#overview)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Components](#components)
5. [Layout Patterns](#layout-patterns)
6. [Dark Mode](#dark-mode)
7. [Implementation Guide](#implementation-guide)

---

## 🎯 Overview

The TRAXCIS design system provides a cohesive, modern visual language across all HR management modules. It emphasizes clarity, professional aesthetics, and seamless user experience.

### Core Principles
- **Consistency First**: All components follow the same visual patterns
- **Inline Styles + Theme System**: Use `TRAXCIS_COLORS` with inline styles for consistency
- **Dark Mode Native**: Full dark mode support built into every component
- **Animation & Motion**: Smooth transitions using Framer Motion
- **Accessibility**: Strong contrast ratios and focus states

---

## 🎨 Color System

### Primary Palette

```typescript
// Located in: frontend/src/theme/traxcis.ts

TRAXCIS_COLORS = {
  primary: {
    DEFAULT: '#2563EB',  // Electric Blue
    50: '#EFF6FF',
    100: '#DBEAFE',
    // ... through 900
  },
  
  secondary: {
    DEFAULT: '#1E293B',  // Soft Charcoal
    50: '#F8FAFC',
    100: '#F1F5F9',
    // ... through 900
  },
  
  accent: {
    DEFAULT: '#F97316',  // Citrus Core (Orange)
    50: '#FFF7ED',
    // ... through 900
  },
  
  neutral: {
    light: '#F8FAFC',    // Clear Mist
    dark: '#0F172A',     // Deep Graphite
  },
  
  status: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#2563EB',
  }
}
```

### Color Usage Guidelines

| Use Case | Light Mode | Dark Mode |
|----------|-----------|-----------|
| **Page Background** | `neutral.light` (#F8FAFC) | `secondary[900]` |
| **Card Background** | `#FFFFFF` | `secondary[900]` |
| **Card Border** | `secondary[200]` | `secondary[700]` |
| **Primary Text** | `secondary.DEFAULT` | `secondary[100]` |
| **Secondary Text** | `secondary[500]` | `secondary[400]` |
| **Active/Highlighted** | `accent.DEFAULT` | `accent.DEFAULT` |
| **Primary Actions** | `primary.DEFAULT` | `primary.DEFAULT` |

---

## ✍️ Typography

### Font Family
```css
font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif
```

**Outfit** is a modern geometric sans-serif that provides excellent readability and a contemporary feel.

### Type Scale

| Element | Size | Weight | Use |
|---------|------|--------|-----|
| **Page Title** | 28px | 500 | H1 headings |
| **Section Title** | 18-20px | 600 | H2 headings, card titles |
| **Subsection** | 16-18px | 500 | H3, subheadings |
| **Body Text** | 14-15px | 400 | Paragraph text |
| **Small Text** | 12-13px | 400 | Meta info, timestamps |
| **Labels** | 14px | 500 | Form labels, buttons |
| **Button Text** | 14px | 500 | CTAs |

### Implementation
```typescript
// Page Title
style={{
  fontSize: '28px',
  fontWeight: '500',
  color: textColor,
  fontFamily: "'Outfit', sans-serif",
}}

// Body Text
style={{
  fontSize: '14px',
  fontWeight: '400',
  lineHeight: '1.6',
  color: textColor,
  fontFamily: "'Outfit', sans-serif",
}}
```

---

## 🧩 Components

### 1. Cards

**Standard Card Pattern:**
```typescript
<motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  style={{
    backgroundColor: cardBg,  // #FFFFFF or secondary[900]
    borderRadius: '16px',
    border: `1px solid ${cardBorder}`,
    boxShadow: isDark ? '0 1px 3px 0 rgba(0, 0, 0, 0.3)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    padding: '24px',
    transition: 'all 0.3s ease',
    fontFamily: "'Outfit', sans-serif",
  }}
  whileHover={{
    boxShadow: isDark ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  }}
>
  {/* Content */}
</motion.div>
```

**Key Features:**
- 16px border radius for modern look
- Subtle shadow that lifts on hover
- Smooth animations with Framer Motion
- Consistent padding (24px)

### 2. Buttons

**Primary Button:**
```typescript
<button
  style={{
    padding: '10px 20px',
    backgroundColor: TRAXCIS_COLORS.primary.DEFAULT,
    color: '#FFFFFF',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    border: 'none',
    cursor: 'pointer',
    fontFamily: "'Outfit', sans-serif",
    transition: 'background-color 0.2s ease',
  }}
  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = TRAXCIS_COLORS.primary[700]}
  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = TRAXCIS_COLORS.primary.DEFAULT}
>
  Button Text
</button>
```

**Button Variants:**
- **Primary**: Blue background, white text
- **Accent**: Orange background, white text (for CTAs)
- **Secondary**: Transparent with border
- **Ghost**: Transparent, colored text

### 3. Pill-Style Tabs

```typescript
<FeedbackTabs
  activeTab={activeTab}
  onTabChange={setActiveTab}
  showAdminTabs={isAdmin}
/>
```

**Features:**
- Active tab has accent color background
- Inactive tabs are transparent with hover states
- Icons + labels for clarity
- Smooth transitions
- Rounded pill shape (12px radius)

### 4. Form Inputs

**Text Input:**
```typescript
<input
  type="text"
  style={{
    width: '100%',
    padding: '10px 12px',
    border: `1px solid ${inputBorder}`,
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: "'Outfit', sans-serif",
    backgroundColor: inputBg,
    color: textColor,
  }}
  onFocus={(e) => {
    e.target.style.outline = `2px solid ${TRAXCIS_COLORS.primary.DEFAULT}`;
    e.target.style.outlineOffset = '2px';
  }}
  onBlur={(e) => {
    e.target.style.outline = 'none';
  }}
/>
```

**Features:**
- Blue focus ring for accessibility
- Consistent 8px border radius
- Smooth transitions
- Proper contrast in both themes

### 5. KPI Cards

```typescript
<KPICard
  name="Active Goals"
  value={42}
  icon={Target}
  color="primary"
  progress={75}
/>
```

**Features:**
- Colored icon background
- Large numeric display
- Optional progress bar
- Hover animations

### 6. Empty States

```typescript
<div style={{
  backgroundColor: cardBg,
  borderRadius: '16px',
  boxShadow: '...',
  padding: '64px',
  textAlign: 'center',
}}>
  <Icon style={{ width: '64px', height: '64px', opacity: 0.3, margin: '0 auto 16px' }} />
  <h3>No data yet</h3>
  <p>Description</p>
</div>
```

### 7. Loading States

```typescript
<div style={{
  width: '48px',
  height: '48px',
  border: `3px solid ${cardBorder}`,
  borderTop: `3px solid ${TRAXCIS_COLORS.primary.DEFAULT}`,
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
  margin: '0 auto',
}} />
```

---

## 📐 Layout Patterns

### Dashboard Layout

```
┌─────────────────────────────────────────┐
│            Header/TopBar                 │
├──────────┬──────────────────────────────┤
│          │                              │
│ Sidebar  │     Main Content Area        │
│          │                              │
│          │  ┌──────────────────────┐   │
│          │  │  Page Title          │   │
│          │  │  Subtitle            │   │
│          │  └──────────────────────┘   │
│          │                              │
│          │  ┌──────────────────────┐   │
│          │  │  Tabs/Filters        │   │
│          │  └──────────────────────┘   │
│          │                              │
│          │  ┌──────────────────────┐   │
│          │  │  Cards/Content       │   │
│          │  │                      │   │
│          │  └──────────────────────┘   │
│          │                              │
└──────────┴──────────────────────────────┘
```

### Spacing System

- **Page padding**: 24px
- **Card padding**: 24px
- **Element gaps**: 12-24px (based on hierarchy)
- **Section gaps**: 24px
- **Button padding**: 10px 20px (vertical, horizontal)
- **Input padding**: 10px 12px

---

## 🌓 Dark Mode

### Implementation Pattern

Every component includes dark mode detection:

```typescript
const [isDark, setIsDark] = useState(false);

useEffect(() => {
  const checkDarkMode = () => {
    setIsDark(document.documentElement.classList.contains('dark'));
  };
  checkDarkMode();
  
  const observer = new MutationObserver(checkDarkMode);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  });
  
  return () => observer.disconnect();
}, []);

// Then use theme-aware colors:
const cardBg = isDark ? TRAXCIS_COLORS.secondary[900] : '#FFFFFF';
```

### Dark Mode Color Mappings

| Element | Light | Dark |
|---------|-------|------|
| Page BG | `neutral.light` | `secondary[900]` |
| Card BG | `#FFFFFF` | `secondary[900]` |
| Border | `secondary[200]` | `secondary[700]` |
| Text | `secondary.DEFAULT` | `secondary[100]` |
| Subtext | `secondary[500]` | `secondary[400]` |
| Input BG | `secondary[50]` | `secondary[800]` |
| Input Border | `secondary[300]` | `secondary[600]` |

---

## 🛠️ Implementation Guide

### File Structure

```
frontend/src/
├── theme/
│   └── traxcis.ts                    # Color system
├── components/
│   ├── Feedback/
│   │   ├── FeedbackTabs.tsx          # Pill tabs
│   │   └── FeedbackThread.tsx        # Card with replies
│   ├── Performance/
│   │   ├── PerformanceTabs.tsx       # Pill tabs
│   │   ├── GoalCard.tsx              # Standard card
│   │   ├── FiltersBar.tsx            # Filter controls
│   │   └── PerformanceStats.tsx      # KPI display
│   ├── OrgChart/
│   │   ├── ZoomControls.tsx          # Zoom buttons
│   │   └── DepartmentFilter.tsx      # Dropdown filter
│   └── shared/
│       └── KPICard.tsx               # Reusable KPI card
└── pages/
    ├── Feedback/
    │   └── FeedbackPage.tsx
    ├── Performance/
    │   └── PerformancePage.tsx
    └── OrgChart/
        └── OrgChartPage.tsx
```

### Creating a New Page

**Step 1: Import Dependencies**
```typescript
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import TRAXCIS_COLORS from '../../theme/traxcis';
```

**Step 2: Set Up Dark Mode**
```typescript
const [isDark, setIsDark] = useState(false);

useEffect(() => {
  const checkDarkMode = () => {
    setIsDark(document.documentElement.classList.contains('dark'));
  };
  checkDarkMode();
  
  const observer = new MutationObserver(checkDarkMode);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  });
  
  return () => observer.disconnect();
}, []);
```

**Step 3: Define Theme Colors**
```typescript
const textColor = isDark ? TRAXCIS_COLORS.secondary[100] : TRAXCIS_COLORS.secondary.DEFAULT;
const subTextColor = isDark ? TRAXCIS_COLORS.secondary[400] : TRAXCIS_COLORS.secondary[500];
const cardBg = isDark ? TRAXCIS_COLORS.secondary[900] : '#FFFFFF';
const cardBorder = isDark ? TRAXCIS_COLORS.secondary[700] : TRAXCIS_COLORS.secondary[200];
```

**Step 4: Build Layout**
```typescript
return (
  <div style={{ 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '24px',
    fontFamily: "'Outfit', sans-serif",
  }}>
    {/* Page Header */}
    <div>
      <h1 style={{
        fontSize: '28px',
        fontWeight: '500',
        color: textColor,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        <Icon style={{ width: '28px', height: '28px' }} />
        Page Title
      </h1>
      <p style={{ 
        color: subTextColor, 
        fontWeight: '300',
        marginTop: '8px',
        fontSize: '15px',
      }}>
        Page subtitle
      </p>
    </div>

    {/* Content Cards */}
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        backgroundColor: cardBg,
        borderRadius: '16px',
        boxShadow: isDark ? '0 1px 3px 0 rgba(0, 0, 0, 0.3)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        border: `1px solid ${cardBorder}`,
        padding: '24px',
      }}
    >
      {/* Card content */}
    </motion.div>
  </div>
);
```

---

## 📱 Responsive Design

### Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### Responsive Patterns

```typescript
// Stack on mobile, grid on desktop
style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: '16px',
}}

// Flex wrap for controls
style={{
  display: 'flex',
  flexWrap: 'wrap',
  gap: '12px',
}}
```

---

## ✅ Checklist for New Components

- [ ] Import `TRAXCIS_COLORS` from theme
- [ ] Set up dark mode detection hook
- [ ] Define theme-aware color variables
- [ ] Use Outfit font family
- [ ] Add Framer Motion animations
- [ ] Include hover states for interactive elements
- [ ] Test in both light and dark modes
- [ ] Ensure proper focus states for accessibility
- [ ] Use consistent spacing (12px, 16px, 24px)
- [ ] Apply consistent border radius (8px, 12px, 16px)

---

## 🎯 Examples

### Complete Module Structure

See implemented examples:
- **Performance Module**: `/frontend/src/pages/Performance/PerformancePage.tsx`
- **Feedback Module**: `/frontend/src/pages/Feedback/FeedbackPage.tsx`
- **Org Chart Module**: `/frontend/src/pages/OrgChart/OrgChartPage.tsx`

All three modules demonstrate complete implementation of the TRAXCIS design system with:
- Consistent color usage
- Modern pill-style tabs
- Animated cards and components
- Full dark mode support
- Proper typography
- Professional spacing and layout

---

## 📚 Additional Resources

- **Color System**: `frontend/src/theme/traxcis.ts`
- **Global Styles**: `frontend/src/index.css`
- **Component Examples**: `frontend/src/components/`
- **Page Templates**: `frontend/src/pages/`

---

**Last Updated**: October 29, 2025  
**Version**: 1.0  
**Maintained By**: TRAXCIS HR Platform Team



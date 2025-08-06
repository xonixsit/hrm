# Consistent Page Layout Design - Design Document

## Overview

This design document addresses the inconsistent page layouts across the HR management system, specifically focusing on standardizing the Dashboard and Leave Management pages to use the same modern PageLayout design system. The goal is to create a unified user experience where all pages follow the same header structure, spacing, and visual hierarchy.

## Current State Analysis

### Inconsistencies Identified

1. **Dashboard Page**: Uses older layout pattern with custom header structure
2. **Leave Management Page**: Uses modern PageLayout with proper title/subtitle structure
3. **Mixed Implementation**: Some pages use PageLayout while others use custom layouts
4. **Header Variations**: Different typography, spacing, and action button placement

### Target Design Pattern

All pages should follow the Leave Management page pattern using:
- `PageLayout` component as the main wrapper
- Consistent page titles and descriptive subtitles
- Standardized breadcrumb navigation
- Unified action button placement in top-right area
- Consistent content spacing and card layouts

## Architecture

### Standardized Page Structure

```
AuthenticatedLayout
└── PageLayout
    ├── PageHeader (automatic)
    │   ├── BreadcrumbNavigation
    │   ├── Title + Subtitle
    │   └── Action Buttons
    └── Content Area
        └── ContentSection
            └── ContentCard (optional)
```

### Component Hierarchy

```
┌─────────────────────────────────────────────────────────┐
│                 AuthenticatedLayout                     │
├─────────────────────────────────────────────────────────┤
│  Breadcrumbs > Current Page                             │
├─────────────────────────────────────────────────────────┤
│  Page Title                    [Action Buttons]         │
│  Page Subtitle                                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │              Content Area                       │   │
│  │  ┌─────────────────────────────────────────┐    │   │
│  │  │          Content Card               │    │   │
│  │  │                                     │    │   │
│  │  │  Dashboard widgets, tables, forms   │    │   │
│  │  │                                     │    │   │
│  │  └─────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Dashboard Page Redesign

#### Current Structure (Inconsistent)
```vue
<template>
  <AuthenticatedLayout>
    <template #header>
      <h2>Welcome back, Admin User!</h2>
      <p>Here's your comprehensive system overview...</p>
    </template>
    <!-- Custom dashboard content -->
  </AuthenticatedLayout>
</template>
```

#### Target Structure (Consistent)
```vue
<template>
  <AuthenticatedLayout>
    <PageLayout
      title="Dashboard"
      subtitle="Welcome back! Here's your comprehensive system overview and management tools."
      :breadcrumbs="breadcrumbs"
      :actions="headerActions"
    >
      <ContentSection>
        <!-- Dashboard widgets and content -->
      </ContentSection>
    </PageLayout>
  </AuthenticatedLayout>
</template>
```

### 2. Leave Management Page (Reference Pattern)

#### Current Structure (Target Pattern)
```vue
<template>
  <AuthenticatedLayout>
    <PageLayout
      title="Leave Management"
      subtitle="Manage leave requests and approvals"
      :breadcrumbs="breadcrumbs"
      :actions="headerActions"
    >
      <ContentSection>
        <ContentCard>
          <!-- Leave management content -->
        </ContentCard>
      </ContentSection>
    </PageLayout>
  </AuthenticatedLayout>
</template>
```

### 3. Standardized Page Props Interface

```typescript
interface StandardPageProps {
  title: string;                    // Main page title
  subtitle: string;                 // Descriptive subtitle
  breadcrumbs: BreadcrumbItem[];    // Navigation breadcrumbs
  actions?: ActionButton[];         // Header action buttons
  loading?: boolean;                // Loading state
  error?: ErrorState;               // Error state
}

interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface ActionButton {
  id: string;
  label: string;
  icon?: string;
  variant: 'primary' | 'secondary' | 'ghost' | 'danger';
  handler: () => void;
  disabled?: boolean;
}
```

## Design Tokens and Styling

### Typography Hierarchy

```css
/* Page Titles */
.page-title {
  font-size: 2rem;           /* 32px */
  font-weight: 700;          /* Bold */
  line-height: 1.2;
  color: var(--neutral-900);
  margin-bottom: 0.5rem;
}

/* Page Subtitles */
.page-subtitle {
  font-size: 1rem;           /* 16px */
  font-weight: 400;          /* Regular */
  line-height: 1.5;
  color: var(--neutral-600);
  margin-bottom: 2rem;
}

/* Breadcrumbs */
.breadcrumb-text {
  font-size: 0.875rem;       /* 14px */
  font-weight: 500;          /* Medium */
  color: var(--neutral-500);
}
```

### Spacing System

```css
/* Page Layout Spacing */
.page-layout {
  padding: 2rem 1rem;        /* 32px 16px */
}

.page-header {
  margin-bottom: 2rem;       /* 32px */
}

.content-section {
  margin-bottom: 1.5rem;     /* 24px */
}

.content-card {
  padding: 1.5rem;           /* 24px */
  border-radius: 0.5rem;     /* 8px */
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
```

### Action Button Styling

```css
/* Primary Actions */
.action-primary {
  background: var(--primary-600);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
}

/* Secondary Actions */
.action-secondary {
  background: white;
  color: var(--neutral-700);
  border: 1px solid var(--neutral-300);
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
}
```

## Implementation Strategy

### Phase 1: Dashboard Page Migration

1. **Update Dashboard.vue** to use PageLayout component
2. **Standardize header structure** with proper title and subtitle
3. **Add breadcrumb navigation** (Dashboard as root)
4. **Implement consistent action buttons** if needed
5. **Wrap content in ContentSection/ContentCard** components

### Phase 2: Verification and Testing

1. **Visual consistency check** across all pages
2. **Responsive behavior testing** on different screen sizes
3. **Accessibility compliance** verification
4. **User experience testing** for navigation flow

### Phase 3: Documentation and Guidelines

1. **Create page layout guidelines** for developers
2. **Document component usage patterns**
3. **Establish design review process** for new pages

## Migration Checklist

### Dashboard Page Updates Required

- [ ] Replace custom header with PageLayout component
- [ ] Add proper page title: "Dashboard"
- [ ] Add descriptive subtitle: "Welcome back! Here's your comprehensive system overview and management tools."
- [ ] Implement breadcrumb navigation (Dashboard as root)
- [ ] Wrap dashboard widgets in ContentSection components
- [ ] Ensure responsive behavior matches other pages
- [ ] Test accessibility compliance

### Leave Management Page (Reference)

- [x] Already uses PageLayout ✅
- [x] Has proper title and subtitle ✅
- [x] Includes breadcrumb navigation ✅
- [x] Uses ContentSection/ContentCard structure ✅

## Success Metrics

### Visual Consistency
- All pages use identical header structure
- Consistent typography hierarchy across pages
- Uniform spacing and layout patterns
- Standardized action button placement

### User Experience
- Predictable navigation patterns
- Clear page hierarchy understanding
- Consistent interaction patterns
- Improved perceived professionalism

### Developer Experience
- Reduced code duplication
- Easier maintenance and updates
- Clear component usage guidelines
- Consistent development patterns

This design ensures that the Dashboard and Leave Management pages (and all other pages) follow the same modern, consistent layout pattern, creating a unified and professional user experience throughout the HR management system.
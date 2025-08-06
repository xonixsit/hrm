# Inner Pages Design System - Design Document

## Overview

This design document outlines the comprehensive design system for inner pages that addresses the current lack of consistent headers, theming, and layout structure. The design follows Human Factor International Standards and modern UX principles to create a cohesive, accessible, and user-friendly experience across all application pages.

## Architecture

### Design System Hierarchy

```
Application Layout
├── Global Navigation (Top Level)
├── Page Layout Framework
│   ├── Page Header Component
│   ├── Content Area Framework
│   ├── Sidebar/Secondary Navigation
│   └── Footer Component
├── Component Library
│   ├── Layout Components
│   ├── Navigation Components
│   ├── Content Components
│   └── Interactive Components
└── Design Tokens
    ├── Colors & Themes
    ├── Typography Scale
    ├── Spacing System
    └── Animation Tokens
```

### Layout Framework Structure

```
┌─────────────────────────────────────────────────────────┐
│                    Global Header                        │
├─────────────────────────────────────────────────────────┤
│  Breadcrumbs > Current Page                             │
├─────────────────────────────────────────────────────────┤
│  Page Title                    [Action Buttons]         │
├─────────────────────────────────────────────────────────┤
│  [Tab Navigation] (if applicable)                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────┐  ┌─────────────────────────────┐   │
│  │   Sidebar       │  │     Main Content Area       │   │
│  │   (optional)    │  │                             │   │
│  │                 │  │                             │   │
│  │                 │  │                             │   │
│  │                 │  │                             │   │
│  └─────────────────┘  └─────────────────────────────┘   │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                    Footer (optional)                   │
└─────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Page Layout Framework

#### PageLayout.vue
```vue
<template>
  <div class="page-layout">
    <PageHeader 
      :title="title"
      :breadcrumbs="breadcrumbs"
      :actions="actions"
      :tabs="tabs"
    />
    <div class="page-content">
      <PageSidebar v-if="hasSidebar" :items="sidebarItems" />
      <main class="main-content">
        <slot />
      </main>
    </div>
    <PageFooter v-if="hasFooter" />
  </div>
</template>
```

**Props Interface:**
- `title: string` - Page title
- `breadcrumbs: BreadcrumbItem[]` - Navigation breadcrumbs
- `actions: ActionButton[]` - Header action buttons
- `tabs: TabItem[]` - Tab navigation items
- `hasSidebar: boolean` - Show/hide sidebar
- `hasFooter: boolean` - Show/hide footer

### 2. Page Header Component

#### PageHeader.vue
```vue
<template>
  <header class="page-header">
    <BreadcrumbNavigation :items="breadcrumbs" />
    <div class="header-main">
      <div class="header-content">
        <h1 class="page-title">{{ title }}</h1>
        <p v-if="subtitle" class="page-subtitle">{{ subtitle }}</p>
      </div>
      <div class="header-actions">
        <slot name="actions">
          <ActionButton 
            v-for="action in actions" 
            :key="action.id"
            v-bind="action"
          />
        </slot>
      </div>
    </div>
    <TabNavigation v-if="tabs?.length" :items="tabs" />
  </header>
</template>
```

**Features:**
- Responsive design with mobile-first approach
- Sticky positioning option for long pages
- Action button overflow handling
- Tab navigation integration
- Breadcrumb navigation with route awareness

### 3. Content Area Framework

#### ContentSection.vue
```vue
<template>
  <section :class="sectionClasses">
    <header v-if="title || $slots.header" class="section-header">
      <slot name="header">
        <h2 class="section-title">{{ title }}</h2>
        <p v-if="description" class="section-description">{{ description }}</p>
      </slot>
    </header>
    <div class="section-content">
      <slot />
    </div>
    <footer v-if="$slots.footer" class="section-footer">
      <slot name="footer" />
    </footer>
  </section>
</template>
```

### 4. Data Display Components

#### DataTable.vue
```vue
<template>
  <div class="data-table-container">
    <TableHeader 
      :title="title"
      :search="searchConfig"
      :filters="filterConfig"
      :actions="tableActions"
    />
    <div class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th v-for="column in columns" :key="column.key">
              {{ column.label }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in paginatedData" :key="row.id">
            <td v-for="column in columns" :key="column.key">
              <slot :name="`cell-${column.key}`" :row="row" :value="row[column.key]">
                {{ row[column.key] }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <TablePagination 
      :current-page="currentPage"
      :total-pages="totalPages"
      :page-size="pageSize"
      @page-change="handlePageChange"
    />
  </div>
</template>
```

### 5. Form Layout Components

#### FormLayout.vue
```vue
<template>
  <form :class="formClasses" @submit="handleSubmit">
    <div class="form-header" v-if="title || $slots.header">
      <slot name="header">
        <h2 class="form-title">{{ title }}</h2>
        <p v-if="description" class="form-description">{{ description }}</p>
      </slot>
    </div>
    
    <div class="form-content">
      <FormSection 
        v-for="section in sections" 
        :key="section.id"
        :title="section.title"
        :description="section.description"
      >
        <slot :name="`section-${section.id}`" />
      </FormSection>
      
      <slot />
    </div>
    
    <div class="form-actions">
      <slot name="actions">
        <BaseButton type="button" variant="secondary" @click="handleCancel">
          Cancel
        </BaseButton>
        <BaseButton type="submit" variant="primary" :loading="isSubmitting">
          {{ submitLabel }}
        </BaseButton>
      </slot>
    </div>
  </form>
</template>
```

## Data Models

### Design Tokens

```typescript
interface DesignTokens {
  colors: {
    primary: ColorScale;
    secondary: ColorScale;
    neutral: ColorScale;
    success: ColorScale;
    warning: ColorScale;
    error: ColorScale;
    info: ColorScale;
  };
  typography: {
    fontFamilies: FontFamily[];
    fontSizes: FontSizeScale;
    fontWeights: FontWeightScale;
    lineHeights: LineHeightScale;
  };
  spacing: SpacingScale;
  borderRadius: BorderRadiusScale;
  shadows: ShadowScale;
  animations: AnimationTokens;
}

interface ColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
}

interface SpacingScale {
  xs: string;    // 4px
  sm: string;    // 8px
  md: string;    // 16px
  lg: string;    // 24px
  xl: string;    // 32px
  '2xl': string; // 48px
  '3xl': string; // 64px
  '4xl': string; // 96px
}
```

### Layout Configuration

```typescript
interface PageConfig {
  title: string;
  subtitle?: string;
  breadcrumbs: BreadcrumbItem[];
  actions?: ActionButton[];
  tabs?: TabItem[];
  layout: {
    hasSidebar: boolean;
    hasFooter: boolean;
    maxWidth: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    padding: keyof SpacingScale;
  };
}

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: Component;
  current?: boolean;
}

interface ActionButton {
  id: string;
  label: string;
  icon?: Component;
  variant: 'primary' | 'secondary' | 'ghost' | 'danger';
  size: 'sm' | 'md' | 'lg';
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}
```

## Error Handling

### Error Boundary System

```vue
<!-- ErrorBoundary.vue -->
<template>
  <div v-if="hasError" class="error-boundary">
    <div class="error-content">
      <Icon name="exclamation-triangle" class="error-icon" />
      <h2 class="error-title">Something went wrong</h2>
      <p class="error-message">{{ errorMessage }}</p>
      <div class="error-actions">
        <BaseButton @click="retry" variant="primary">
          Try Again
        </BaseButton>
        <BaseButton @click="reportError" variant="secondary">
          Report Issue
        </BaseButton>
      </div>
    </div>
  </div>
  <slot v-else />
</template>
```

### Empty State Components

```vue
<!-- EmptyState.vue -->
<template>
  <div class="empty-state">
    <div class="empty-content">
      <Icon :name="icon" class="empty-icon" />
      <h3 class="empty-title">{{ title }}</h3>
      <p class="empty-description">{{ description }}</p>
      <div v-if="actions?.length" class="empty-actions">
        <BaseButton 
          v-for="action in actions"
          :key="action.id"
          v-bind="action"
        >
          {{ action.label }}
        </BaseButton>
      </div>
    </div>
  </div>
</template>
```

## Testing Strategy

### Component Testing
- Unit tests for all layout components
- Integration tests for page composition
- Accessibility testing with axe-core
- Visual regression testing with Chromatic
- Responsive design testing across breakpoints

### User Experience Testing
- Usability testing for navigation patterns
- Performance testing for page load times
- Cross-browser compatibility testing
- Mobile device testing for touch interactions
- Screen reader testing for accessibility compliance

### Design System Testing
- Token consistency validation
- Component API testing
- Theme switching functionality
- Dark mode compatibility testing
- High contrast mode validation

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
- Design token system implementation
- Base layout components creation
- Page header and navigation components
- Basic responsive framework

### Phase 2: Content Components (Week 3-4)
- Data table and list components
- Form layout and input components
- Card and section components
- Loading and empty state components

### Phase 3: Advanced Features (Week 5-6)
- Search and filtering components
- Advanced navigation patterns
- Animation and transition system
- Error handling and recovery

### Phase 4: Integration and Testing (Week 7-8)
- Existing page migration
- Comprehensive testing suite
- Performance optimization
- Documentation and guidelines

This design system will transform the current standalone inner pages into a cohesive, professional, and user-friendly application interface that meets modern standards and accessibility requirements.
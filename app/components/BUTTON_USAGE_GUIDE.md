# Dashboard Button System - Usage Guide

## Overview

The unified button system provides a comprehensive set of button variants, sizes, and states designed specifically for the dashboard. All buttons follow consistent styling patterns and support icons, loading states, and various interaction states.

## Basic Usage

```tsx
import { Button } from "./ui/button";
import { Plus, Save, Trash2 } from "lucide-react";

// Basic button
<Button variant="primaryOutline" size="dashboard">
  Click Me
</Button>

// Button with icon
<Button variant="primaryOutline" size="dashboard" icon={<Plus className="w-4 h-4" />}>
  Add Item
</Button>

// Icon-only button
<Button variant="ghost" size="icon" iconOnly icon={<Trash2 className="w-4 h-4" />} />

// Loading button
<Button variant="success" size="dashboard" loading>
  Saving...
</Button>
```

## Button Variants

### Primary Actions
- **`primary`**: White background, black text - for main actions
- **`primaryOutline`**: Transparent background, white border - for secondary primary actions

### Status Actions
- **`success`**: Green theme - for confirmations, completions
- **`warning`**: Yellow theme - for warnings, pending states
- **`danger`**: Red theme - for dangerous actions
- **`info`**: Blue theme - for informational actions
- **`cancel`**: Pink theme - for cancellations

### Destructive Actions
- **`destructive`**: Solid red - for delete actions

### Secondary Actions
- **`secondary`**: Transparent with border - for secondary actions
- **`ghost`**: No background - for subtle actions

### Navigation & Tabs
- **`tabActive`**: White background - for active tab
- **`tabInactive`**: Transparent - for inactive tabs

### Category Filters
- **`filterActive`**: White background - for active filter
- **`filterInactive`**: Transparent with border - for inactive filters

### Specialized Actions
- **`payment`**: Yellow theme - for payment-related actions
- **`devTools`**: Subtle gray - for development tools
- **`import`**: Blue theme - for import actions
- **`export`**: Green theme - for export actions

## Button Sizes

### Standard Sizes
- **`xs`**: Extra small (h-6)
- **`sm`**: Small (h-8)
- **`default`**: Default (h-9)
- **`lg`**: Large (h-10)
- **`xl`**: Extra large (h-12)

### Icon Sizes
- **`iconSm`**: Small icon button (size-8)
- **`icon`**: Default icon button (size-9)
- **`iconLg`**: Large icon button (size-10)
- **`iconXl`**: Extra large icon button (size-12)

### Dashboard Specific Sizes
- **`dashboardXs`**: Small dashboard button (px-4 py-2)
- **`dashboardSm`**: Medium dashboard button (px-6 py-3)
- **`dashboard`**: Standard dashboard button (px-8 py-3)
- **`payment`**: Payment button (py-6)

## Button States

- **`default`**: Normal state
- **`loading`**: Shows spinner, disables interaction
- **`disabled`**: Disabled state
- **`success`**: Success state (visual feedback)
- **`error`**: Error state (visual feedback)

## Icon Support

### Icon Positioning
- **`left`**: Icon on the left (default)
- **`right`**: Icon on the right

### Icon-Only Buttons
Set `iconOnly={true}` to create icon-only buttons:

```tsx
<Button 
  variant="ghost" 
  size="icon" 
  iconOnly 
  icon={<Edit2 className="w-4 h-4" />} 
/>
```

## Common Use Cases

### 1. Add/Create Buttons
```tsx
// Primary add button
<Button variant="primaryOutline" size="dashboard" icon={<Plus className="w-4 h-4" />}>
  Hinzufügen
</Button>

// Secondary add button
<Button variant="primary" size="dashboard" icon={<Plus className="w-4 h-4" />}>
  Neue Kategorie
</Button>
```

### 2. Save/Submit Buttons
```tsx
// Save button
<Button variant="success" size="dashboard" icon={<Save className="w-4 h-4" />}>
  Speichern
</Button>

// Loading save
<Button variant="success" size="dashboard" loading>
  Speichern...
</Button>
```

### 3. Cancel Buttons
```tsx
<Button variant="secondary" size="dashboard">
  Abbrechen
</Button>
```

### 4. Edit/Delete Actions
```tsx
// Edit icon button
<Button variant="ghost" size="icon" iconOnly icon={<Edit2 className="w-4 h-4" />} />

// Delete button
<Button variant="destructive" size="dashboard">
  Löschen
</Button>
```

### 5. Status Management
```tsx
// Appointment status buttons
<Button variant="success" size="dashboardSm">Bestätigen</Button>
<Button variant="info" size="dashboardSm">Abgeschlossen</Button>
<Button variant="cancel" size="dashboardSm">Stornieren</Button>
<Button variant="secondary" size="dashboardSm">Ausstehend</Button>
```

### 6. Tab Navigation
```tsx
<div className="flex border border-white/20">
  <Button variant="tabActive" size="dashboardSm" className="flex-1 rounded-none">
    TERMINE
  </Button>
  <Button variant="tabInactive" size="dashboardSm" className="flex-1 rounded-none">
    SERVICES
  </Button>
</div>
```

### 7. Category Filters
```tsx
<div className="flex flex-wrap gap-2">
  <Button variant="filterActive" size="sm">Alle</Button>
  <Button variant="filterInactive" size="sm">ALLGEMEIN</Button>
  <Button variant="filterInactive" size="sm">HERREN</Button>
</div>
```

### 8. Payment Actions
```tsx
// Payment trigger
<Button variant="payment" size="icon" iconOnly icon={<CreditCard className="w-4 h-4" />} />

// Payment methods
<Button variant="secondary" size="payment">KARTE</Button>
<Button variant="secondary" size="payment">BAR</Button>
```

### 9. Utility Actions
```tsx
// Refresh button
<Button variant="secondary" size="dashboard" icon={<RefreshCw className="w-4 h-4" />}>
  Aktualisieren
</Button>

// Calendar toggle
<Button variant="secondary" size="dashboard" icon={<CalendarIcon className="w-4 h-4" />}>
  Kalender
</Button>
```

### 10. Development Tools
```tsx
// Dev tools toggle
<Button variant="devTools" size="icon" iconOnly icon={<Settings className="w-4 h-4" />} />

// Import/Export
<Button variant="import" size="sm" icon={<Upload className="w-4 h-4" />}>
  YAML Import
</Button>
<Button variant="export" size="sm" icon={<Download className="w-4 h-4" />}>
  YAML Export
</Button>
```

### 11. Expand/Collapse
```tsx
<Button variant="ghost" size="icon" iconOnly icon={<ChevronDown className="w-5 h-5" />} />
<Button variant="ghost" size="icon" iconOnly icon={<ChevronRight className="w-5 h-5" />} />
```

## Best Practices

1. **Consistent Sizing**: Use `dashboard` size for main actions, `dashboardSm` for secondary actions
2. **Icon Usage**: Always use consistent icon sizes (w-4 h-4 for most, w-5 h-5 for chevrons)
3. **Loading States**: Always show loading state for async operations
4. **Disabled States**: Disable buttons during loading or when action is not available
5. **Color Semantics**: Use appropriate colors for different action types (green for success, red for danger, etc.)
6. **Accessibility**: Always provide meaningful text or aria-labels for icon-only buttons

## Migration Guide

When migrating existing buttons to the new system:

1. Replace custom button classes with appropriate variants
2. Use consistent sizing with `dashboard` sizes
3. Add proper icons using the `icon` prop
4. Implement loading states for async operations
5. Use semantic colors for different action types

## Examples

See `ButtonExamples.tsx` for comprehensive examples of all button types and use cases.

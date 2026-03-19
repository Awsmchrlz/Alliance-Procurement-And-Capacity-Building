# Visual Design Guide

## Color Palette

### Primary Colors
```
Dark Blue (#1C356B)
  - Used for: Main headings, primary buttons, borders
  - RGB: 28, 53, 107
  - HSL: 217°, 59%, 26%

Teal (#1C5B7D)
  - Used for: Secondary buttons, accents, hover states
  - RGB: 28, 91, 125
  - HSL: 200°, 63%, 30%

Light Blue (#87CEEB)
  - Used for: Highlights, accent text, decorative elements
  - RGB: 135, 206, 235
  - HSL: 197°, 71%, 73%
```

### Semantic Colors
```
Success (Green #16A34A)
  - Used for: Success messages, checkmarks, confirmations

Error (Red #DC2626)
  - Used for: Error messages, validation errors, destructive actions

Warning (Yellow #EAB308)
  - Used for: Warning messages, alerts

Info (Blue #3B82F6)
  - Used for: Information messages, hints
```

### Neutral Colors
```
Gray 50 (#F9FAFB) - Very light background
Gray 100 (#F3F4F6) - Light background
Gray 200 (#E5E7EB) - Light border
Gray 300 (#D1D5DB) - Border
Gray 600 (#4B5563) - Secondary text
Gray 900 (#111827) - Primary text
```

## Typography

### Font Family
```
Primary: Inter
Fallback: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
```

### Font Sizes & Usage
```
48px (text-5xl) - Page title (desktop)
36px (text-4xl) - Page title (tablet)
30px (text-3xl) - Page title (mobile)

24px (text-2xl) - Section heading (desktop)
20px (text-xl) - Section heading (mobile)

18px (text-lg) - Subsection heading

16px (text-base) - Body text (desktop)
14px (text-sm) - Body text (mobile)

12px (text-xs) - Labels, captions
```

### Font Weights
```
400 (normal) - Body text
500 (medium) - Emphasis
600 (semibold) - Labels, secondary headings
700 (bold) - Headings, important text
```

### Line Heights
```
1.5 - Body text
1.6 - Headings
1.4 - Labels
```

## Spacing System

### Vertical Spacing
```
Mobile:
  Section padding: 48px (py-12)
  Card padding: 24px (p-6)
  Field spacing: 20px (space-y-5)
  Margin bottom: 48px (mb-12)

Tablet:
  Section padding: 64px (py-16)
  Card padding: 32px (p-8)
  Field spacing: 24px (space-y-6)
  Margin bottom: 56px (mb-14)

Desktop:
  Section padding: 80px (py-20)
  Card padding: 48px (p-12)
  Field spacing: 24px (space-y-6)
  Margin bottom: 64px (mb-16)
```

### Horizontal Spacing
```
Mobile:
  Container padding: 16px (px-4)
  Card padding: 24px (p-6)
  Gap: 24px (gap-6)

Tablet:
  Container padding: 24px (px-6)
  Card padding: 32px (p-8)
  Gap: 32px (gap-8)

Desktop:
  Container padding: 32px (px-8)
  Card padding: 48px (p-12)
  Gap: 32px (gap-8)
```

## Component Styling

### Buttons
```
Primary Button:
  Background: #1C5B7D (Teal)
  Text: White
  Padding: 10px 16px (mobile), 12px 24px (desktop)
  Height: 40px (mobile), 48px (desktop)
  Border Radius: 8px
  Font Size: 14px (mobile), 16px (desktop)
  Font Weight: 600
  Hover: Darker teal (#1C5B7D/90)
  Transition: 300ms

Secondary Button:
  Background: White
  Border: 2px solid #D1D5DB
  Text: #374151
  Padding: 10px 16px (mobile), 12px 24px (desktop)
  Height: 40px (mobile), 48px (desktop)
  Border Radius: 8px
  Font Size: 14px (mobile), 16px (desktop)
  Font Weight: 600
  Hover: Light gray background
  Transition: 300ms

Success Button:
  Background: #16A34A (Green)
  Text: White
  Padding: 10px 16px (mobile), 12px 24px (desktop)
  Height: 40px (mobile), 48px (desktop)
  Border Radius: 8px
  Font Size: 14px (mobile), 16px (desktop)
  Font Weight: 600
  Hover: Darker green
  Transition: 300ms
```

### Input Fields
```
Text Input:
  Background: White
  Border: 1px solid #D1D5DB
  Border Radius: 8px
  Padding: 12px 16px
  Height: 40px (mobile), 48px (desktop)
  Font Size: 14px (mobile), 16px (desktop)
  Focus: Border #1C5B7D, Ring #1C5B7D
  Placeholder: #9CA3AF
  Transition: 200ms

Select Dropdown:
  Same as text input
  Arrow icon on right
  Dropdown background: White
  Dropdown border: 1px solid #D1D5DB
  Dropdown shadow: 0 4px 6px rgba(0,0,0,0.1)
```

### Checkboxes
```
Checkbox:
  Size: 16px (mobile), 20px (desktop)
  Border: 2px solid #D1D5DB
  Border Radius: 4px
  Checked: Background #1C5B7D, checkmark white
  Hover: Border #1C5B7D
  Transition: 200ms
```

### Cards
```
Card:
  Background: White
  Border Radius: 12px (mobile), 16px (tablet), 24px (desktop)
  Shadow: 0 4px 6px rgba(0,0,0,0.1) (default)
  Shadow: 0 10px 15px rgba(0,0,0,0.1) (hover)
  Padding: 24px (mobile), 32px (tablet), 48px (desktop)
  Transition: 300ms
  Border: 2px solid transparent (hover: #1C5B7D)
```

### Labels
```
Label:
  Font Size: 12px (mobile), 14px (desktop)
  Font Weight: 600
  Color: #111827
  Margin Bottom: 12px (mobile), 16px (desktop)
  Display: Block
```

## Shadows

### Shadow Levels
```
Subtle (shadow-md):
  0 4px 6px rgba(0, 0, 0, 0.1)

Medium (shadow-lg):
  0 10px 15px rgba(0, 0, 0, 0.1)

Strong (shadow-xl):
  0 20px 25px rgba(0, 0, 0, 0.1)

Extra Strong (shadow-2xl):
  0 25px 50px rgba(0, 0, 0, 0.15)
```

### Usage
```
Cards: shadow-md (default), shadow-xl (hover)
Buttons: shadow-lg (default), shadow-xl (hover)
Modals: shadow-2xl
Dropdowns: shadow-lg
```

## Border Radius

### Radius Scale
```
Small (rounded-lg): 8px
  - Input fields
  - Buttons
  - Small elements

Medium (rounded-xl): 12px
  - Cards
  - Containers
  - Medium elements

Large (rounded-2xl): 16px
  - Large cards
  - Modals
  - Large containers

Extra Large (rounded-3xl): 24px
  - Hero sections
  - Large modals
  - Extra large containers
```

## Transitions & Animations

### Timing
```
Fast: 200ms - Hover states, focus states
Normal: 300ms - Button clicks, state changes
Slow: 500ms - Page transitions, major changes
```

### Easing
```
ease-in-out - Default for most transitions
ease-in - Entering animations
ease-out - Exiting animations
linear - Continuous animations
```

### Common Transitions
```
Hover: 300ms ease-in-out
Focus: 200ms ease-in-out
Active: 150ms ease-in-out
Disabled: 200ms ease-in-out
```

## Responsive Breakpoints

### Screen Sizes
```
Mobile: 375px - 480px
  - Single column
  - Smaller text
  - Compact spacing
  - Touch-friendly

Tablet: 640px - 1024px
  - Two columns
  - Medium text
  - Balanced spacing
  - Touch-friendly

Desktop: 1024px - 1280px
  - Multi-column
  - Full text
  - Generous spacing
  - Mouse-friendly

Large: 1280px+
  - Full layout
  - Large text
  - Extra spacing
  - Mouse-friendly
```

## Accessibility

### Color Contrast
```
Text on Background: 4.5:1 (WCAG AA)
Large Text: 3:1 (WCAG AA)
UI Components: 3:1 (WCAG AA)
```

### Touch Targets
```
Minimum: 44px x 44px
Recommended: 48px x 48px
Spacing: 8px between targets
```

### Focus States
```
Outline: 2px solid #1C5B7D
Offset: 2px
Visible on all interactive elements
```

## Imagery

### Image Sizing
```
Mobile: 100% width, max 480px
Tablet: 100% width, max 768px
Desktop: 100% width, max 1200px
```

### Image Optimization
```
Format: WebP with fallback
Compression: Optimized for web
Lazy Loading: Enabled
Responsive: srcset for different sizes
```

## Gradients

### Background Gradients
```
Primary Gradient:
  from-[#1C356B] to-[#0f1e3d]
  Direction: 135deg

Light Gradient:
  from-gray-50 to-gray-100
  Direction: 135deg

Success Gradient:
  from-green-50 to-green-100
  Direction: 135deg
```

## Spacing Reference

### Common Spacing Values
```
4px (0.25rem) - xs
8px (0.5rem) - sm
12px (0.75rem) - md
16px (1rem) - lg
20px (1.25rem) - xl
24px (1.5rem) - 2xl
32px (2rem) - 3xl
40px (2.5rem) - 4xl
48px (3rem) - 5xl
64px (4rem) - 6xl
```

## Design Consistency Checklist

- [ ] Colors match palette
- [ ] Typography follows scale
- [ ] Spacing follows system
- [ ] Border radius consistent
- [ ] Shadows appropriate
- [ ] Transitions smooth
- [ ] Responsive at all breakpoints
- [ ] Accessibility standards met
- [ ] Touch targets 44px+
- [ ] Color contrast 4.5:1
- [ ] Focus states visible
- [ ] Hover states clear
- [ ] Loading states shown
- [ ] Error states clear
- [ ] Success states visible

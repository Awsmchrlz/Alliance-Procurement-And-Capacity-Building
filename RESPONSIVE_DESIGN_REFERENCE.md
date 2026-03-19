# Responsive Design Reference Guide

## Quick Reference for Consistent Styling

### Responsive Text Sizes
```
Heading 1 (Page Title):
  text-3xl sm:text-4xl md:text-5xl font-bold

Heading 2 (Section Title):
  text-xl sm:text-2xl font-bold

Heading 3 (Subsection):
  text-lg sm:text-xl font-semibold

Body Text:
  text-sm sm:text-base

Small Text (Labels):
  text-xs sm:text-sm

Extra Small (Captions):
  text-xs
```

### Responsive Padding
```
Container Padding:
  px-4 sm:px-6 lg:px-8

Card Padding:
  p-6 sm:p-8 md:p-12

Section Padding:
  py-12 sm:py-16 md:py-20

Form Field Padding:
  p-3 sm:p-4
```

### Responsive Margins
```
Large Spacing:
  mb-12 sm:mb-14 md:mb-16
  mt-12 sm:mt-14 md:mt-16

Medium Spacing:
  mb-6 sm:mb-8
  mt-6 sm:mt-8

Small Spacing:
  mb-3 sm:mb-4
  mt-3 sm:mt-4
```

### Responsive Gaps (Grid/Flex)
```
Large Gap:
  gap-6 sm:gap-8

Medium Gap:
  gap-4 sm:gap-6

Small Gap:
  gap-2 sm:gap-3
```

### Responsive Heights
```
Input Fields:
  h-10 sm:h-12

Buttons:
  py-2.5 sm:py-3

Icons:
  w-4 h-4 sm:w-5 sm:h-5
  w-16 h-16 sm:w-20 sm:h-20
```

### Responsive Rounded Corners
```
Small Radius:
  rounded-lg

Medium Radius:
  rounded-xl sm:rounded-2xl

Large Radius:
  rounded-2xl sm:rounded-3xl

Extra Large Radius:
  rounded-3xl
```

### Responsive Shadows
```
Subtle:
  shadow-md

Medium:
  shadow-lg

Strong:
  shadow-xl

Extra Strong:
  shadow-2xl

Hover Effect:
  hover:shadow-xl transition-all
```

## Common Patterns

### Responsive Grid (2 columns on desktop, 1 on mobile)
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
  {/* Items */}
</div>
```

### Responsive Flex (Column on mobile, row on desktop)
```tsx
<div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
  {/* Items */}
</div>
```

### Responsive Container
```tsx
<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
  {/* Content */}
</div>
```

### Responsive Card
```tsx
<div className="bg-white rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl p-6 sm:p-8">
  {/* Content */}
</div>
```

### Responsive Form Field
```tsx
<div>
  <Label className="text-xs sm:text-sm font-semibold mb-1.5 sm:mb-2 block">
    Label
  </Label>
  <Input className="h-10 sm:h-12 text-sm sm:text-base" />
</div>
```

### Responsive Button
```tsx
<Button className="py-2.5 sm:py-3 text-sm sm:text-base font-semibold rounded-lg">
  Click Me
</Button>
```

## Breakpoint Reference

| Breakpoint | Min Width | Use Case |
|-----------|-----------|----------|
| (default) | 0px | Mobile phones |
| sm: | 640px | Large phones, small tablets |
| md: | 768px | Tablets |
| lg: | 1024px | Desktops |
| xl: | 1280px | Large desktops |
| 2xl: | 1536px | Extra large screens |

## Color Palette

```
Primary Colors:
  #1C356B (Dark Blue) - Main brand color
  #1C5B7D (Teal) - Secondary brand color
  #87CEEB (Light Blue) - Accent color

Semantic Colors:
  green-600 - Success
  red-600 - Error/Destructive
  yellow-600 - Warning
  blue-600 - Info

Neutral Colors:
  gray-50 - Very light background
  gray-100 - Light background
  gray-200 - Light border
  gray-300 - Border
  gray-600 - Secondary text
  gray-900 - Primary text
```

## Typography Scale

```
Font Sizes:
  text-xs: 12px
  text-sm: 14px
  text-base: 16px
  text-lg: 18px
  text-xl: 20px
  text-2xl: 24px
  text-3xl: 30px
  text-4xl: 36px
  text-5xl: 48px

Font Weights:
  font-normal: 400
  font-medium: 500
  font-semibold: 600
  font-bold: 700
```

## Spacing Scale

```
Spacing Units (in rem, 1rem = 16px):
  0.5: 8px
  1: 16px
  1.5: 24px
  2: 32px
  2.5: 40px
  3: 48px
  4: 64px
  6: 96px
  8: 128px
```

## Common Responsive Patterns

### Hero Section
```tsx
<section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8">
  <div className="max-w-5xl mx-auto">
    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
      Title
    </h1>
    <p className="text-base sm:text-lg text-gray-600 max-w-2xl">
      Description
    </p>
  </div>
</section>
```

### Card Grid
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
  {items.map(item => (
    <div key={item.id} className="bg-white rounded-xl shadow-md p-6 sm:p-8">
      {/* Card content */}
    </div>
  ))}
</div>
```

### Form
```tsx
<form className="max-w-2xl mx-auto space-y-5 sm:space-y-6">
  <div>
    <Label className="text-xs sm:text-sm font-semibold mb-1.5 sm:mb-2 block">
      Field Label
    </Label>
    <Input className="h-10 sm:h-12 text-sm sm:text-base" />
  </div>
  
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
    <div>
      <Label className="text-xs sm:text-sm font-semibold mb-1.5 sm:mb-2 block">
        Field 1
      </Label>
      <Input className="h-10 sm:h-12 text-sm sm:text-base" />
    </div>
    <div>
      <Label className="text-xs sm:text-sm font-semibold mb-1.5 sm:mb-2 block">
        Field 2
      </Label>
      <Input className="h-10 sm:h-12 text-sm sm:text-base" />
    </div>
  </div>
  
  <Button className="w-full py-2.5 sm:py-3 text-sm sm:text-base">
    Submit
  </Button>
</form>
```

## Testing Responsive Design

### Mobile (375px)
```
- Heading 1: 30px (text-3xl)
- Heading 2: 20px (text-xl)
- Body: 14px (text-sm)
- Padding: 16px (px-4)
- Gap: 24px (gap-6)
```

### Tablet (768px)
```
- Heading 1: 36px (sm:text-4xl)
- Heading 2: 24px (sm:text-2xl)
- Body: 16px (sm:text-base)
- Padding: 24px (sm:px-6)
- Gap: 32px (sm:gap-8)
```

### Desktop (1280px)
```
- Heading 1: 48px (md:text-5xl)
- Heading 2: 30px (md:text-3xl)
- Body: 16px (text-base)
- Padding: 32px (lg:px-8)
- Gap: 32px (gap-8)
```

## Debugging Tips

1. **Use browser DevTools** to test different screen sizes
2. **Check for horizontal scrolling** on mobile
3. **Verify touch targets** are at least 44px
4. **Test text readability** without zooming
5. **Check image scaling** on all devices
6. **Verify spacing** looks balanced
7. **Test form inputs** on mobile
8. **Check button sizes** for easy tapping

## Performance Notes

- Responsive classes are compiled at build time
- No runtime overhead
- CSS is optimized by Tailwind
- Mobile-first approach reduces CSS size
- No JavaScript needed for responsive behavior

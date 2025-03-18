# UI Components Documentation

This document provides an overview of the key user interface components used throughout the AI CMS application, describing their functionality, properties, and implementation details.

## Core Components

### Stepper Component

**Location:** Implemented directly in pages (primarily `index.tsx`)

**Purpose:** Visualizes progress through the multi-step workflow for website creation

**Implementation:**
```tsx
<div className="mb-6">
  <div className="grid grid-cols-6 gap-0">
    {[1, 2, 3, 4, 5, 6].map((stepNumber) => (
      <div key={stepNumber} className="flex flex-col items-center">
        <div className="flex items-center w-full">
          {stepNumber > 1 && (
            <div 
              className={`h-1 w-full ${
                step >= stepNumber ? 'bg-primary' : 'bg-gray-300'
              }`}
            ></div>
          )}
          
          <div 
            className={`flex items-center justify-center w-8 h-8 rounded-full border-2 shrink-0 ${
              step === stepNumber 
                ? 'border-primary bg-primary text-white' 
                : step > stepNumber 
                  ? 'border-primary text-primary' 
                  : 'border-gray-300 text-gray-400'
            }`}
          >
            {step > stepNumber ? '✓' : stepNumber}
          </div>
          
          {stepNumber < 6 && (
            <div 
              className={`h-1 w-full ${
                step > stepNumber ? 'bg-primary' : 'bg-gray-300'
              }`}
            ></div>
          )}
        </div>
        
        <span className="mt-2 text-xs text-gray-500 text-center w-full">
          {stepNumber === 1 && "Grunnupplýsingar"}
          {stepNumber === 2 && "Matseðill"}
          {stepNumber === 3 && "Samskipti"}
          {stepNumber === 4 && "Vefkort"}
          {stepNumber === 5 && "Stíll"}
          {stepNumber === 6 && "Lokið"}
        </span>
      </div>
    ))}
  </div>
</div>
```

**Features:**
- Uses CSS Grid for consistent spacing and alignment
- Dynamically styles steps based on current progress
- Shows checkmarks for completed steps
- Displays connecting lines between steps
- Supports 6 predefined steps in the workflow

### SitemapDisplay Component

**Location:** `src/components/sitemap/SitemapDisplay.tsx`

**Purpose:** Visualizes the sitemap structure with page hierarchy and sections

**Props:**
- `sitemap: Sitemap` - The sitemap data to display
- `businessName: string` - The restaurant name
- `onEdit?: () => void` - Optional callback to enter edit mode
- `onContinue?: () => void` - Optional callback to continue to next step

**Features:**
- Visual representation of sitemap hierarchy
- Displays pages as cards with sections
- Uses icons to represent different page types
- Shows empty state when no sitemap is available
- Provides edit and continue actions

### Layout Component

**Location:** `src/components/layout/Layout.tsx`

**Purpose:** Provides consistent page layout with header, footer, and content area

**Props:**
- `children: React.ReactNode` - Content to render in the layout

**Features:**
- Consistent header with navigation links
- Footer with copyright information
- Responsive container for main content
- Consistent styling across all pages

## Form Components

These components are used throughout the application for collecting user input.

### Card Components (from shadcn/ui)

**Components:**
- `Card` - Container component
- `CardHeader` - Header section with title and description
- `CardContent` - Main content area
- `CardFooter` - Footer section with actions
- `CardTitle` - Title text component
- `CardDescription` - Description text component

**Usage:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Grunnupplýsingar veitingastaðar</CardTitle>
    <CardDescription>Fylltu út grunnupplýsingar um veitingastaðinn þinn</CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    {/* Form fields */}
  </CardContent>
  <CardFooter className="flex justify-between">
    <Button variant="outline">Til baka</Button>
    <Button>Næsta</Button>
  </CardFooter>
</Card>
```

### Input Components

**Components:**
- `Input` - Text input field
- `Textarea` - Multi-line text input
- `Label` - Label for form fields

**Usage:**
```tsx
<div className="space-y-2">
  <Label htmlFor="name">Nafn veitingastaðar</Label>
  <Input 
    id="name" 
    placeholder="t.d. Kopar Veitingahús" 
    value={restaurantData.name}
    onChange={(e) => updateField('name', e.target.value)}
  />
</div>
```

### Button Component

**Location:** Based on shadcn/ui Button

**Variants:**
- `default` - Primary action button
- `outline` - Secondary action button
- `ghost` - Minimal styling
- `link` - Appears as a text link

**Sizes:**
- `default` - Standard size
- `sm` - Small size
- `lg` - Large size
- `icon` - Square icon button

**Usage:**
```tsx
<Button onClick={nextStep}>Næsta</Button>
<Button variant="outline" onClick={prevStep}>Til baka</Button>
<Button size="lg" onClick={generateWebsite}>Hefja vefsíðugerð</Button>
```

## Other Components

### Color Palette Preview

**Purpose:** Displays a color palette as a series of colored circles

**Implementation:**
```tsx
<div className="flex space-x-2 mb-2">
  {palette.colors.map((color, colorIndex) => (
    <div 
      key={colorIndex} 
      className="w-8 h-8 rounded-full" 
      style={{ backgroundColor: color }}
    ></div>
  ))}
</div>
```

### Font Pair Preview

**Purpose:** Displays a preview of font pairings

**Implementation:**
```tsx
<div className="border-t pt-2">
  <div className="font-serif text-xl">Playfair Display fyrir fyrirsagnir</div>
  <div className="font-sans text-sm mt-1">Montserrat fyrir meginmál og aðra texta</div>
</div>
```

### Loading Spinner

**Purpose:** Indicates loading state for async operations

**Implementation:**
```tsx
<div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
```

## Component Integration

The components are integrated in the following ways:

1. **Page Structure:**
   - Each page uses the `Layout` component for consistent structure
   - Content is organized in `Card` components
   - Navigation uses `Button` components

2. **Data Flow:**
   - Form components capture user input
   - Data is stored in state and `sessionStorage`
   - Display components visualize the data

3. **Styling:**
   - Components use Tailwind CSS for styling
   - Consistent color scheme applied across components
   - Responsive design for all screen sizes

## Future Component Enhancements

1. **Website Preview Component:** A component to show a live preview of the generated website
2. **Code Snippet Viewer:** For displaying generated code with syntax highlighting
3. **Theme Selector:** Allow switching between light and dark themes
4. **Feedback Component:** Collect user feedback on generated content 
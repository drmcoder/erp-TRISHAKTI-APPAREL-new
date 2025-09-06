# TSA ERP Design System

A comprehensive design system and component library built for the TSA ERP application using React, TypeScript, and Tailwind CSS.

## 🎯 Overview

This design system provides a consistent, accessible, and scalable foundation for building the TSA ERP user interface. It includes:

- **Base UI Components**: Buttons, inputs, modals, cards, badges, and more
- **Typography System**: Consistent text styles and hierarchy
- **Layout Components**: Grid, flexbox, containers, and spacing utilities
- **Responsive Design**: Mobile-first approach with breakpoint utilities
- **Design Tokens**: Colors, spacing, typography, and other design values
- **Accessibility**: WCAG 2.1 AA compliant components
- **Dark Mode**: Full dark mode support across all components

## 📦 Components

### Base Components

#### Button
Interactive buttons with multiple variants and states.

```tsx
import { Button } from '@/shared/components/ui';

// Basic usage
<Button variant="primary" size="md" onClick={handleClick}>
  Click me
</Button>

// With icons
<Button leftIcon={<IconPlus />} loading={isLoading}>
  Add Item
</Button>

// Variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="success">Success</Button>
<Button variant="warning">Warning</Button>
<Button variant="danger">Danger</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="outline">Outline</Button>
<Button variant="link">Link</Button>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost' | 'outline' | 'link'
- `size`: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
- `loading`: boolean
- `disabled`: boolean
- `fullWidth`: boolean
- `leftIcon`, `rightIcon`: React.ReactNode

#### Input
Form input components with validation and various states.

```tsx
import { Input, Textarea, SearchInput, PasswordInput } from '@/shared/components/ui';

// Text input with validation
<Input
  label="Email Address"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={emailError}
  hint="We'll never share your email"
  required
/>

// Search input
<SearchInput
  placeholder="Search products..."
  clearable
  onClear={() => setSearchTerm('')}
/>

// Password input with toggle
<PasswordInput
  label="Password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
/>
```

**Props:**
- `label`: string
- `error`: string
- `hint`: string
- `size`: 'sm' | 'md' | 'lg'
- `variant`: 'default' | 'filled' | 'borderless'
- `leftIcon`, `rightIcon`: React.ReactNode
- `clearable`: boolean

#### Modal
Dialog components for overlays and confirmations.

```tsx
import { Modal, ModalHeader, ModalBody, ModalFooter, ConfirmationModal } from '@/shared/components/ui';

// Basic modal
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Edit Item"
  size="lg"
>
  <ModalBody>
    <p>Modal content goes here</p>
  </ModalBody>
  <ModalFooter>
    <Button variant="outline" onClick={() => setIsOpen(false)}>
      Cancel
    </Button>
    <Button onClick={handleSave}>
      Save Changes
    </Button>
  </ModalFooter>
</Modal>

// Confirmation modal
<ConfirmationModal
  isOpen={showConfirm}
  onClose={() => setShowConfirm(false)}
  onConfirm={handleDelete}
  title="Delete Item"
  message="Are you sure you want to delete this item? This action cannot be undone."
  variant="danger"
  confirmText="Delete"
/>
```

**Props:**
- `size`: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
- `closeOnOverlayClick`: boolean
- `closeOnEscape`: boolean
- `showCloseButton`: boolean

#### Card
Content containers with various styles.

```tsx
import { Card, CardHeader, CardBody, CardFooter, StatsCard, ActionCard } from '@/shared/components/ui';

// Basic card
<Card variant="default" size="md">
  <CardHeader>
    <H3>Card Title</H3>
    <Text color="muted">Card description</Text>
  </CardHeader>
  <CardBody>
    <Text>Card content</Text>
  </CardBody>
  <CardFooter>
    <Button size="sm">Action</Button>
  </CardFooter>
</Card>

// Stats card
<StatsCard
  title="Total Revenue"
  value="$45,678"
  subtitle="Last 30 days"
  trend={{ value: 12, isPositive: true }}
  icon={<IconDollar />}
/>
```

**Props:**
- `variant`: 'default' | 'outlined' | 'elevated' | 'filled'
- `size`: 'sm' | 'md' | 'lg'
- `hoverable`: boolean

#### Badge
Status indicators and labels.

```tsx
import { Badge, StatusBadge, PriorityBadge, NotificationBadge } from '@/shared/components/ui';

// Basic badge
<Badge variant="primary" size="md">
  New
</Badge>

// ERP-specific badges
<StatusBadge status="completed" />
<PriorityBadge priority="high" />

// Notification badge
<NotificationBadge count={5}>
  <IconBell />
</NotificationBadge>
```

**Props:**
- `variant`: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'
- `size`: 'sm' | 'md' | 'lg'
- `shape`: 'rounded' | 'pill' | 'square'
- `outline`: boolean
- `dismissible`: boolean

#### Dropdown
Select components with search and multi-select.

```tsx
import { Dropdown, DropdownOption } from '@/shared/components/ui';

const options: DropdownOption[] = [
  { value: 'opt1', label: 'Option 1', icon: <IconUser /> },
  { value: 'opt2', label: 'Option 2' },
  { value: 'opt3', label: 'Option 3', disabled: true },
];

<Dropdown
  label="Select Option"
  options={options}
  value={selectedValue}
  onSelectionChange={setSelectedValue}
  searchable
  clearable
  multiple
  placeholder="Choose options..."
/>
```

**Props:**
- `options`: DropdownOption[]
- `searchable`: boolean
- `clearable`: boolean
- `multiple`: boolean
- `size`: 'sm' | 'md' | 'lg'
- `variant`: 'default' | 'filled' | 'borderless'

### Typography Components

```tsx
import { H1, H2, H3, H4, H5, H6, Text, Lead, Body, Small, Caption } from '@/shared/components/ui';

// Headings
<H1>Page Title</H1>
<H2>Section Title</H2>
<H3>Subsection Title</H3>

// Text components
<Lead>Lead paragraph text for introductions</Lead>
<Body>Regular body text for main content</Body>
<Small>Small text for secondary information</Small>
<Caption>Caption text for metadata</Caption>

// Custom text
<Text size="lg" weight="semibold" color="primary">
  Custom text styling
</Text>
```

### Layout Components

```tsx
import { Container, Stack, Flex, Grid, Divider, Spacer } from '@/shared/components/ui';

// Container
<Container size="xl" centered>
  <Stack spacing={6}>
    <H1>Page Content</H1>
    
    <Grid cols={1} colsMd={2} colsLg={3} gap={4}>
      <Card>Card 1</Card>
      <Card>Card 2</Card>
      <Card>Card 3</Card>
    </Grid>
    
    <Divider />
    
    <Flex justify="between" align="center" gap={4}>
      <Text>Footer content</Text>
      <Button>Action</Button>
    </Flex>
  </Stack>
</Container>
```

### Responsive Utilities

```tsx
import { useBreakpoint, useIsMobile, Show, Hide } from '@/shared/components/ui';

function ResponsiveComponent() {
  const breakpoint = useBreakpoint();
  const isMobile = useIsMobile();
  
  return (
    <div>
      <Show above="lg">
        <Text>Only visible on desktop</Text>
      </Show>
      
      <Hide above="md">
        <Text>Only visible on mobile</Text>
      </Hide>
      
      <Button size={isMobile ? 'lg' : 'md'}>
        Responsive button
      </Button>
    </div>
  );
}
```

## 🎨 Design Tokens

### Colors

The design system uses a consistent color palette:

- **Primary**: Blue tones for main actions and branding
- **Secondary**: Gray tones for text and backgrounds
- **Success**: Green tones for positive states
- **Warning**: Yellow/orange tones for warnings
- **Danger**: Red tones for errors and destructive actions
- **Info**: Blue tones for informational content

Each color has 10 shades (50-950) for different use cases.

### Typography Scale

- **Display**: Large headings (2xl-6xl)
- **Heading**: Section headings (xs-xl)
- **Body**: Regular text content (xs-2xl)
- **Caption**: Small text and metadata

### Spacing Scale

Based on a 4px grid system:
- 1 = 4px
- 2 = 8px
- 3 = 12px
- 4 = 16px
- 6 = 24px
- 8 = 32px
- 12 = 48px
- 16 = 64px
- 20 = 80px
- 24 = 96px

### Breakpoints

- **xs**: 475px
- **sm**: 640px
- **md**: 768px (tablet portrait)
- **lg**: 1024px (tablet landscape)
- **xl**: 1280px (desktop)
- **2xl**: 1536px (desktop wide)
- **3xl**: 1920px (large desktop)

## 🌙 Dark Mode

All components support dark mode out of the box. Dark mode is controlled by adding the `dark` class to the root element.

```tsx
// Toggle dark mode
const toggleDarkMode = () => {
  document.documentElement.classList.toggle('dark');
};
```

## ♿ Accessibility

The design system follows WCAG 2.1 AA guidelines:

- **Keyboard Navigation**: All interactive components support keyboard navigation
- **Screen Readers**: Proper ARIA labels and semantic HTML
- **Color Contrast**: Sufficient contrast ratios for all text
- **Focus Management**: Visible focus indicators and proper focus flow
- **Responsive**: Mobile-friendly and touch-accessible

## 📱 Responsive Design

Mobile-first approach with responsive utilities:

- **Breakpoint Hooks**: `useBreakpoint()`, `useIsMobile()`, `useIsTablet()`
- **Conditional Rendering**: `<Show>` and `<Hide>` components
- **Responsive Props**: Most components accept responsive prop values
- **Grid System**: Flexible grid with breakpoint-specific columns

## 🚀 Usage Guidelines

### Import Components

```tsx
// Import specific components
import { Button, Card, Text } from '@/shared/components/ui';

// Import types
import type { ButtonProps, CardProps } from '@/shared/components/ui';
```

### Component Composition

Build complex interfaces by composing smaller components:

```tsx
function ProductCard({ product }) {
  return (
    <Card variant="elevated" hoverable>
      <CardHeader>
        <Flex justify="between" align="center">
          <H4>{product.name}</H4>
          <StatusBadge status={product.status} />
        </Flex>
      </CardHeader>
      
      <CardBody>
        <Stack spacing={3}>
          <Text color="muted">{product.description}</Text>
          <PriorityBadge priority={product.priority} />
        </Stack>
      </CardBody>
      
      <CardFooter>
        <Flex gap={2}>
          <Button size="sm" variant="outline">
            Edit
          </Button>
          <Button size="sm" variant="primary">
            View Details
          </Button>
        </Flex>
      </CardFooter>
    </Card>
  );
}
```

### ERP-Specific Patterns

The design system includes patterns specific to ERP applications:

- **Status Management**: Consistent status badges and colors
- **Data Tables**: Responsive table patterns
- **Form Layouts**: Standardized form components and validation
- **Dashboard Cards**: Stats cards and metric displays
- **Navigation**: Breadcrumbs, tabs, and menu components

## 🔧 Customization

### Extending Components

Create custom variants by extending base components:

```tsx
const CustomButton = styled(Button)`
  // Custom styles
`;

// Or use className prop
<Button className="custom-button-styles">
  Custom Button
</Button>
```

### Theme Customization

Customize the theme in `tailwind.config.js`:

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          // Custom primary colors
        }
      }
    }
  }
};
```

## 📚 Resources

- **Component Showcase**: `/src/shared/components/ui/ComponentShowcase.tsx`
- **Responsive Demo**: `/src/shared/components/ui/ResponsiveDemo.tsx`
- **Global Styles**: `/src/shared/styles/globals.css`
- **Tailwind Config**: `/tailwind.config.js`

## 🤝 Contributing

When adding new components:

1. Follow existing patterns and conventions
2. Include TypeScript types and props interface
3. Add responsive behavior where applicable
4. Ensure accessibility compliance
5. Include dark mode support
6. Add examples to the component showcase
7. Update this documentation

## 📄 License

This design system is part of the TSA ERP application and follows the same license terms.
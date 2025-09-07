import React, { useState } from 'react';
import { 
  Container, Stack, Grid, Card, CardHeader, CardBody, 
  H1, H2, H3, Text, Button, Input, Modal, Badge, 
  Dropdown, DropdownOption, StatusBadge, PriorityBadge,
  Flex, Divider, Code, List, ListItem
} from './index';
import { Search, Settings, User, Bell, ChevronDown } from 'lucide-react';

/**
 * Component Showcase - Living documentation for the design system
 * This serves as both documentation and visual testing for all components
 */
export const ComponentShowcase: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [dropdownValue, setDropdownValue] = useState('');

  const dropdownOptions: DropdownOption[] = [
    { value: 'option1', label: 'Option 1', icon: <User className="w-4 h-4" /> },
    { value: 'option2', label: 'Option 2', icon: <Settings className="w-4 h-4" /> },
    { value: 'option3', label: 'Option 3', icon: <Bell className="w-4 h-4" /> },
    { value: 'option4', label: 'Disabled Option', disabled: true },
  ];

  const ComponentSection: React.FC<{ 
    title: string; 
    description?: string; 
    children: React.ReactNode 
  }> = ({ title, description, children }) => (
    <Card className="mb-8">
      <CardHeader>
        <H3 className="mb-2">{title}</H3>
        {description && (
          <Text color="muted" size="sm">
            {description}
          </Text>
        )}
      </CardHeader>
      <CardBody>
        <Stack spacing={6}>
          {children}
        </Stack>
      </CardBody>
    </Card>
  );

  const CodeExample: React.FC<{ 
    title?: string; 
    code: string; 
    children: React.ReactNode 
  }> = ({ title, code, children }) => (
    <div className="space-y-4">
      {title && <Text weight="medium">{title}</Text>}
      <div className="p-6 bg-secondary-50 rounded-lg border">
        {children}
      </div>
      <details className="group">
        <summary className="cursor-pointer text-sm text-primary-600 hover:text-primary-700 flex items-center gap-2">
          <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
          View Code
        </summary>
        <Code inline={false} className="mt-2">
          {code}
        </Code>
      </details>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Container size="2xl">
        <Stack spacing={8}>
          {/* Header */}
          <div className="text-center">
            <H1 className="mb-4">TSA ERP Design System</H1>
            <Text size="xl" color="muted" className="mb-8">
              Component Library and Style Guide
            </Text>
            <Divider />
          </div>

          {/* Typography Section */}
          <ComponentSection 
            title="Typography" 
            description="Text components with consistent styling and hierarchy"
          >
            <CodeExample
              title="Headings"
              code={`<H1>Page Title</H1>
<H2>Section Title</H2>
<H3>Subsection Title</H3>
<H4>Component Title</H4>
<H5>Small Title</H5>
<H6>Tiny Title</H6>`}
            >
              <Stack spacing={3}>
                <H1>Page Title (H1)</H1>
                <H2>Section Title (H2)</H2>
                <H3>Subsection Title (H3)</H3>
                <H4>Component Title (H4)</H4>
                <H5>Small Title (H5)</H5>
                <H6>Tiny Title (H6)</H6>
              </Stack>
            </CodeExample>

            <CodeExample
              title="Body Text"
              code={`<Text size="xl">Large body text</Text>
<Text size="lg">Large text</Text>
<Text>Default body text</Text>
<Text size="sm">Small text</Text>
<Text size="xs">Extra small text</Text>`}
            >
              <Stack spacing={2}>
                <Text size="xl">Large body text for important content</Text>
                <Text size="lg">Large text for emphasis</Text>
                <Text>Default body text for regular content</Text>
                <Text size="sm">Small text for secondary information</Text>
                <Text size="xs">Extra small text for captions and metadata</Text>
              </Stack>
            </CodeExample>

            <CodeExample
              title="Text Colors and Weights"
              code={`<Text color="primary" weight="bold">Primary Bold</Text>
<Text color="success" weight="medium">Success Medium</Text>
<Text color="warning">Warning Normal</Text>
<Text color="danger" weight="semibold">Danger Semibold</Text>
<Text color="muted" size="sm">Muted Small</Text>`}
            >
              <Stack spacing={2}>
                <Text color="primary" weight="bold">Primary Bold Text</Text>
                <Text color="success" weight="medium">Success Medium Text</Text>
                <Text color="warning">Warning Normal Text</Text>
                <Text color="danger" weight="semibold">Danger Semibold Text</Text>
                <Text color="muted" size="sm">Muted Small Text</Text>
              </Stack>
            </CodeExample>
          </ComponentSection>

          {/* Buttons Section */}
          <ComponentSection 
            title="Buttons" 
            description="Interactive buttons with various styles and states"
          >
            <CodeExample
              title="Button Variants"
              code={`<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="success">Success</Button>
<Button variant="warning">Warning</Button>
<Button variant="danger">Danger</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="outline">Outline</Button>
<Button variant="link">Link</Button>`}
            >
              <Flex wrap gap={3}>
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="success">Success</Button>
                <Button variant="warning">Warning</Button>
                <Button variant="danger">Danger</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="link">Link</Button>
              </Flex>
            </CodeExample>

            <CodeExample
              title="Button Sizes"
              code={`<Button size="xs">Extra Small</Button>
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
<Button size="xl">Extra Large</Button>`}
            >
              <Flex align="center" gap={3}>
                <Button size="xs">Extra Small</Button>
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
                <Button size="xl">Extra Large</Button>
              </Flex>
            </CodeExample>

            <CodeExample
              title="Button States"
              code={`<Button leftIcon={<User className="w-4 h-4" />}>With Left Icon</Button>
<Button rightIcon={<Settings className="w-4 h-4" />}>With Right Icon</Button>
<Button loading>Loading</Button>
<Button disabled>Disabled</Button>
<Button fullWidth>Full Width</Button>`}
            >
              <Stack spacing={3}>
                <Flex gap={3}>
                  <Button leftIcon={<User className="w-4 h-4" />}>
                    With Left Icon
                  </Button>
                  <Button rightIcon={<Settings className="w-4 h-4" />}>
                    With Right Icon
                  </Button>
                  <Button loading>Loading</Button>
                  <Button disabled>Disabled</Button>
                </Flex>
                <Button fullWidth>Full Width Button</Button>
              </Stack>
            </CodeExample>
          </ComponentSection>

          {/* Input Components */}
          <ComponentSection 
            title="Input Components" 
            description="Form inputs with validation and various states"
          >
            <CodeExample
              title="Text Inputs"
              code={`<Input
  label="Name"
  placeholder="Enter your name"
  value={inputValue}
  onChange={(e) => setInputValue(e.target.value)}
/>
<Input
  label="Email"
  type="email"
  error="Please enter a valid email address"
  placeholder="your@email.com"
/>
<Input
  label="Search"
  leftIcon={<Search className="w-4 h-4" />}
  clearable
  placeholder="Search items..."
/>`}
            >
              <Grid cols={1} gap={4}>
                <Input
                  label="Name"
                  placeholder="Enter your name"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
                <Input
                  label="Email"
                  type="email"
                  error="Please enter a valid email address"
                  placeholder="your@email.com"
                />
                <Input
                  label="Search"
                  leftIcon={<Search className="w-4 h-4" />}
                  clearable
                  placeholder="Search items..."
                />
              </Grid>
            </CodeExample>

            <CodeExample
              title="Input Variants"
              code={`<Input variant="default" placeholder="Default variant" />
<Input variant="filled" placeholder="Filled variant" />
<Input variant="borderless" placeholder="Borderless variant" />`}
            >
              <Grid cols={1} gap={4}>
                <Input variant="default" placeholder="Default variant" />
                <Input variant="filled" placeholder="Filled variant" />
                <Input variant="borderless" placeholder="Borderless variant" />
              </Grid>
            </CodeExample>
          </ComponentSection>

          {/* Badges Section */}
          <ComponentSection 
            title="Badges" 
            description="Status indicators and labels"
          >
            <CodeExample
              title="Badge Variants"
              code={`<Badge variant="default">Default</Badge>
<Badge variant="primary">Primary</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="danger">Danger</Badge>
<Badge variant="info">Info</Badge>`}
            >
              <Flex wrap gap={2}>
                <Badge variant="default">Default</Badge>
                <Badge variant="primary">Primary</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="danger">Danger</Badge>
                <Badge variant="info">Info</Badge>
              </Flex>
            </CodeExample>

            <CodeExample
              title="ERP-Specific Badges"
              code={`<StatusBadge status="pending" />
<StatusBadge status="in-progress" />
<StatusBadge status="completed" />
<StatusBadge status="cancelled" />
<PriorityBadge priority="low" />
<PriorityBadge priority="high" />
<PriorityBadge priority="critical" />`}
            >
              <div className="space-y-3">
                <div>
                  <Text size="sm" weight="medium" className="mb-2">Status Badges:</Text>
                  <Flex wrap gap={2}>
                    <StatusBadge status="pending" />
                    <StatusBadge status="in-progress" />
                    <StatusBadge status="completed" />
                    <StatusBadge status="cancelled" />
                    <StatusBadge status="on-hold" />
                  </Flex>
                </div>
                <div>
                  <Text size="sm" weight="medium" className="mb-2">Priority Badges:</Text>
                  <Flex wrap gap={2}>
                    <PriorityBadge priority="low" />
                    <PriorityBadge priority="medium" />
                    <PriorityBadge priority="high" />
                    <PriorityBadge priority="critical" />
                  </Flex>
                </div>
              </div>
            </CodeExample>
          </ComponentSection>

          {/* Dropdown Section */}
          <ComponentSection 
            title="Dropdown" 
            description="Select components with search and multi-select capabilities"
          >
            <CodeExample
              title="Basic Dropdown"
              code={`<Dropdown
  label="Select Option"
  options={dropdownOptions}
  value={dropdownValue}
  onSelectionChange={(value) => setDropdownValue(value as string)}
  placeholder="Choose an option..."
/>`}
            >
              <Grid cols={1} colsMd={2} gap={4}>
                <Dropdown
                  label="Select Option"
                  options={dropdownOptions}
                  value={dropdownValue}
                  onSelectionChange={(value) => setDropdownValue(value as string)}
                  placeholder="Choose an option..."
                />
                <Dropdown
                  label="Searchable Dropdown"
                  options={dropdownOptions}
                  searchable
                  clearable
                  placeholder="Search and select..."
                />
              </Grid>
            </CodeExample>
          </ComponentSection>

          {/* Modal Section */}
          <ComponentSection 
            title="Modals" 
            description="Dialog boxes and overlays"
          >
            <CodeExample
              title="Basic Modal"
              code={`<Button onClick={() => setShowModal(true)}>
  Open Modal
</Button>

<Modal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title="Sample Modal"
  size="md"
>
  <ModalBody>
    <Text>This is a modal dialog example.</Text>
  </ModalBody>
  <ModalFooter>
    <Button variant="outline" onClick={() => setShowModal(false)}>
      Cancel
    </Button>
    <Button onClick={() => setShowModal(false)}>
      Confirm
    </Button>
  </ModalFooter>
</Modal>`}
            >
              <Button onClick={() => setShowModal(true)}>
                Open Modal Example
              </Button>
            </CodeExample>
          </ComponentSection>

          {/* Cards Section */}
          <ComponentSection 
            title="Cards" 
            description="Content containers with various styles"
          >
            <CodeExample
              title="Card Variants"
              code={`<Card variant="default">
  <CardHeader>
    <H4>Default Card</H4>
    <Text color="muted">Card with default styling</Text>
  </CardHeader>
  <CardBody>
    <Text>Card content goes here.</Text>
  </CardBody>
</Card>`}
            >
              <Grid cols={1} colsMd={2} gap={4}>
                <Card variant="default">
                  <CardHeader>
                    <H4>Default Card</H4>
                    <Text color="muted" size="sm">Card with default styling</Text>
                  </CardHeader>
                  <CardBody>
                    <Text>This is the card body content.</Text>
                  </CardBody>
                </Card>

                <Card variant="outlined">
                  <CardHeader>
                    <H4>Outlined Card</H4>
                    <Text color="muted" size="sm">Card with outlined border</Text>
                  </CardHeader>
                  <CardBody>
                    <Text>This card has a prominent border.</Text>
                  </CardBody>
                </Card>

                <Card variant="elevated">
                  <CardHeader>
                    <H4>Elevated Card</H4>
                    <Text color="muted" size="sm">Card with shadow elevation</Text>
                  </CardHeader>
                  <CardBody>
                    <Text>This card appears elevated with shadow.</Text>
                  </CardBody>
                </Card>

                <Card variant="filled">
                  <CardHeader>
                    <H4>Filled Card</H4>
                    <Text color="muted" size="sm">Card with filled background</Text>
                  </CardHeader>
                  <CardBody>
                    <Text>This card has a filled background.</Text>
                  </CardBody>
                </Card>
              </Grid>
            </CodeExample>
          </ComponentSection>

          {/* Design Tokens */}
          <ComponentSection 
            title="Design Tokens" 
            description="Colors, spacing, and other design values"
          >
            <div className="space-y-6">
              <div>
                <H4 className="mb-4">Color Palette</H4>
                <Grid cols={2} colsMd={4} gap={4}>
                  {[
                    { name: 'Primary', class: 'bg-primary-500' },
                    { name: 'Secondary', class: 'bg-secondary-500' },
                    { name: 'Success', class: 'bg-success-500' },
                    { name: 'Warning', class: 'bg-warning-500' },
                    { name: 'Danger', class: 'bg-danger-500' },
                    { name: 'Info', class: 'bg-info-500' },
                  ].map((color) => (
                    <div key={color.name} className="text-center">
                      <div className={`w-full h-16 rounded-lg ${color.class} mb-2`} />
                      <Text size="sm" weight="medium">{color.name}</Text>
                    </div>
                  ))}
                </Grid>
              </div>

              <div>
                <H4 className="mb-4">Spacing Scale</H4>
                <Stack spacing={2}>
                  {[1, 2, 3, 4, 6, 8, 12, 16, 20, 24].map((space) => (
                    <Flex key={space} align="center" gap={4}>
                      <div className="w-16">
                        <Code>{space * 4}px</Code>
                      </div>
                      <div className={`h-4 bg-primary-500 rounded`} style={{ width: `${space * 4}px` }} />
                      <Text size="sm" color="muted">space-{space}</Text>
                    </Flex>
                  ))}
                </Stack>
              </div>
            </div>
          </ComponentSection>
        </Stack>
      </Container>

      {/* Modal Example */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Sample Modal"
        size="md"
      >
        <div className="p-6">
          <Text className="mb-4">
            This is a sample modal dialog. It can contain any content including forms, 
            images, or other components.
          </Text>
          <List>
            <ListItem>Modal supports various sizes</ListItem>
            <ListItem>Can be closed by clicking overlay or escape key</ListItem>
            <ListItem>Fully accessible with focus management</ListItem>
            <ListItem>Supports animations and transitions</ListItem>
          </List>
        </div>
        <div className="flex justify-end space-x-3 px-6 py-4 border-t border-secondary-200">
          <Button variant="outline" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button onClick={() => setShowModal(false)}>
            Confirm
          </Button>
        </div>
      </Modal>
    </div>
  );
};
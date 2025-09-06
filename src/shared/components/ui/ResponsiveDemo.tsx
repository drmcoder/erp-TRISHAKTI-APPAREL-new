import React from 'react';
import { 
  Container, Grid, Stack, Card, CardHeader, CardBody, 
  H2, H3, Text, Badge, Button, Show, Hide, 
  useBreakpoint, useIsMobile, useIsTablet, useIsDesktop 
} from './index';
import { useResponsiveValue } from '../../hooks/useBreakpoint';

/**
 * Demo component showcasing responsive behavior
 * This serves as both documentation and testing for the design system
 */
export const ResponsiveDemo: React.FC = () => {
  const currentBreakpoint = useBreakpoint();
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isDesktop = useIsDesktop();
  
  // Responsive values example
  const _gridCols = useResponsiveValue({
    xs: 1,
    sm: 1,
    md: 2,
    lg: 3,
    xl: 4,
    '2xl': 4,
  });
  
  const cardPadding = useResponsiveValue({
    xs: 'sm',
    md: 'md',
    lg: 'lg',
  }) as 'sm' | 'md' | 'lg';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Container size="2xl">
        <Stack spacing={8}>
          {/* Header Section */}
          <div className="text-center">
            <H2 className="mb-4">TSA ERP Design System</H2>
            <Text size="lg" color="muted" className="mb-6">
              Responsive components and layout system
            </Text>
            
            {/* Current Breakpoint Info */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Badge variant="primary">
                Current: {currentBreakpoint}
              </Badge>
              <Badge variant={isMobile ? 'success' : 'secondary'}>
                Mobile: {isMobile ? 'Yes' : 'No'}
              </Badge>
              <Badge variant={isTablet ? 'success' : 'secondary'}>
                Tablet: {isTablet ? 'Yes' : 'No'}
              </Badge>
              <Badge variant={isDesktop ? 'success' : 'secondary'}>
                Desktop: {isDesktop ? 'Yes' : 'No'}
              </Badge>
            </div>
          </div>

          {/* Responsive Grid Demo */}
          <Card>
            <CardHeader>
              <H3>Responsive Grid Layout</H3>
              <Text color="muted">
                Grid adapts from 1 column on mobile to 4 columns on desktop
              </Text>
            </CardHeader>
            <CardBody>
              <Grid 
                cols={1} 
                colsMd={2} 
                colsLg={3} 
                gap={4}
                className="xl:grid-cols-4"
              >
                {Array.from({ length: 8 }, (_, i) => (
                  <Card 
                    key={i} 
                    variant="outlined" 
                    size={cardPadding}
                    className="text-center"
                  >
                    <Text weight="medium">Card {i + 1}</Text>
                    <Text size="sm" color="muted">
                      Size: {cardPadding}
                    </Text>
                  </Card>
                ))}
              </Grid>
            </CardBody>
          </Card>

          {/* Conditional Rendering Demo */}
          <Card>
            <CardHeader>
              <H3>Conditional Rendering</H3>
              <Text color="muted">
                Content that shows/hides based on screen size
              </Text>
            </CardHeader>
            <CardBody>
              <Stack spacing={4}>
                {/* Show/Hide Components */}
                <div className="space-y-4">
                  <Show above="lg">
                    <Card variant="filled" className="p-4 bg-green-50 border-green-200">
                      <Text color="primary" weight="medium">
                        ✅ This content only shows on desktop (lg+)
                      </Text>
                    </Card>
                  </Show>

                  <Show only={['md', 'tablet-portrait']}>
                    <Card variant="filled" className="p-4 bg-yellow-50 border-yellow-200">
                      <Text color="warning" weight="medium">
                        📱 This content only shows on tablets
                      </Text>
                    </Card>
                  </Show>

                  <Hide above="md">
                    <Card variant="filled" className="p-4 bg-blue-50 border-blue-200">
                      <Text color="primary" weight="medium">
                        📱 This content only shows on mobile
                      </Text>
                    </Card>
                  </Hide>

                  <div className="p-4 bg-secondary-50 rounded-lg">
                    <Text weight="medium" className="mb-2">
                      Always Visible Content
                    </Text>
                    <Text size="sm" color="muted">
                      This content is always visible regardless of screen size.
                    </Text>
                  </div>
                </div>
              </Stack>
            </CardBody>
          </Card>

          {/* Button Responsive Demo */}
          <Card>
            <CardHeader>
              <H3>Responsive Button Layouts</H3>
              <Text color="muted">
                Button layouts that adapt to screen size
              </Text>
            </CardHeader>
            <CardBody>
              <Stack spacing={6}>
                {/* Mobile: Stack buttons, Desktop: Inline */}
                <div>
                  <Text weight="medium" className="mb-3">
                    Action Buttons
                  </Text>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button variant="primary" className="sm:w-auto w-full">
                      Primary Action
                    </Button>
                    <Button variant="outline" className="sm:w-auto w-full">
                      Secondary Action
                    </Button>
                    <Button variant="ghost" className="sm:w-auto w-full">
                      Tertiary Action
                    </Button>
                  </div>
                </div>

                {/* Responsive button sizes */}
                <div>
                  <Text weight="medium" className="mb-3">
                    Responsive Button Sizes
                  </Text>
                  <div className="flex flex-col sm:flex-row gap-3 items-start">
                    <Button 
                      size={isMobile ? 'lg' : 'md'} 
                      variant="primary"
                    >
                      {isMobile ? 'Large on Mobile' : 'Medium on Desktop'}
                    </Button>
                    <Button 
                      size={isDesktop ? 'lg' : 'md'} 
                      variant="outline"
                    >
                      {isDesktop ? 'Large on Desktop' : 'Medium Otherwise'}
                    </Button>
                  </div>
                </div>
              </Stack>
            </CardBody>
          </Card>

          {/* Typography Responsive Demo */}
          <Card>
            <CardHeader>
              <H3>Responsive Typography</H3>
              <Text color="muted">
                Typography that scales with screen size
              </Text>
            </CardHeader>
            <CardBody>
              <Stack spacing={4}>
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-secondary-900 dark:text-secondary-100 mb-2">
                    Responsive Heading
                  </h1>
                  <Text color="muted">
                    This heading scales from 2xl on mobile to 5xl on desktop
                  </Text>
                </div>
                
                <div>
                  <Text 
                    size={isMobile ? 'sm' : 'md'}
                    className="mb-2"
                  >
                    This paragraph uses smaller text on mobile devices for better readability.
                    On desktop, it uses the standard text size.
                  </Text>
                  <Text size="xs" color="muted">
                    Current text size: {isMobile ? 'small' : 'medium'}
                  </Text>
                </div>
              </Stack>
            </CardBody>
          </Card>

          {/* ERP-Specific Responsive Patterns */}
          <Card>
            <CardHeader>
              <H3>ERP-Specific Responsive Patterns</H3>
              <Text color="muted">
                Common responsive patterns for ERP interfaces
              </Text>
            </CardHeader>
            <CardBody>
              <Stack spacing={6}>
                {/* Data Table Responsive */}
                <div>
                  <Text weight="medium" className="mb-3">
                    Data Table (Responsive)
                  </Text>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-secondary-200">
                      <thead className="bg-secondary-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                            ID
                          </th>
                          <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                            Description
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-secondary-200">
                        {Array.from({ length: 3 }, (_, i) => (
                          <tr key={i}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-secondary-900">
                              #{1000 + i}
                            </td>
                            <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                              Item description {i + 1}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge variant="success" size="sm">
                                Active
                              </Badge>
                            </td>
                            <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                              2024-01-{15 + i}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <Button size="sm" variant="ghost">
                                {isMobile ? 'Edit' : 'Edit Item'}
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Stats Grid */}
                <div>
                  <Text weight="medium" className="mb-3">
                    Statistics Grid
                  </Text>
                  <Grid cols={2} colsLg={4} gap={4}>
                    {[
                      { label: 'Total Orders', value: '1,234', trend: { value: 12, isPositive: true } },
                      { label: 'Revenue', value: '$45,678', trend: { value: 8, isPositive: true } },
                      { label: 'Active Users', value: '987', trend: { value: -2, isPositive: false } },
                      { label: 'Completion Rate', value: '94%', trend: { value: 5, isPositive: true } },
                    ].map((stat, i) => (
                      <Card key={i} variant="outlined" size="sm">
                        <div className="text-center">
                          <Text size="sm" color="muted" className="mb-1">
                            {stat.label}
                          </Text>
                          <Text size={isMobile ? 'lg' : 'xl'} weight="bold">
                            {stat.value}
                          </Text>
                          {!isMobile && (
                            <Text 
                              size="xs" 
                              color={stat.trend.isPositive ? 'success' : 'danger'}
                              className="mt-1"
                            >
                              {stat.trend.isPositive ? '+' : ''}{stat.trend.value}%
                            </Text>
                          )}
                        </div>
                      </Card>
                    ))}
                  </Grid>
                </div>
              </Stack>
            </CardBody>
          </Card>
        </Stack>
      </Container>
    </div>
  );
};
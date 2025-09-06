import React from 'react';
import { Flex, Text, Divider, Link } from '@/shared/components/ui';
import { cn } from '@/shared/utils';

interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={cn(
      'bg-white dark:bg-secondary-900 border-t border-secondary-200 dark:border-secondary-700',
      'mt-auto', // Push to bottom
      className
    )}>
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto">
          {/* Main footer content */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Company Info */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <Text weight="bold" className="text-white text-sm">T</Text>
                </div>
                <Text weight="bold" size="lg">
                  TSA ERP System
                </Text>
              </div>
              <Text color="muted" size="sm" className="mb-4 max-w-md">
                Streamlining textile manufacturing operations with integrated 
                production management, quality control, and workforce optimization.
              </Text>
              <Text size="xs" color="muted">
                Version 2.0.1 • Build 2024.01.15
              </Text>
            </div>

            {/* Quick Links */}
            <div>
              <Text weight="semibold" size="sm" className="mb-4">
                Quick Links
              </Text>
              <div className="space-y-3">
                <Link href="/dashboard" className="block">
                  <Text size="sm">Dashboard</Text>
                </Link>
                <Link href="/help" className="block">
                  <Text size="sm">Help Center</Text>
                </Link>
                <Link href="/reports" className="block">
                  <Text size="sm">Reports</Text>
                </Link>
                <Link href="/settings" className="block">
                  <Text size="sm">System Settings</Text>
                </Link>
              </div>
            </div>

            {/* Support */}
            <div>
              <Text weight="semibold" size="sm" className="mb-4">
                Support
              </Text>
              <div className="space-y-3">
                <div>
                  <Text size="sm" color="muted">Technical Support</Text>
                  <Link href="tel:+977-1-5555555" className="block">
                    <Text size="sm">+977-1-5555555</Text>
                  </Link>
                </div>
                <div>
                  <Text size="sm" color="muted">Email Support</Text>
                  <Link href="mailto:support@tsa-erp.com" className="block">
                    <Text size="sm">support@tsa-erp.com</Text>
                  </Link>
                </div>
                <div>
                  <Text size="sm" color="muted">Business Hours</Text>
                  <Text size="sm">Mon-Fri: 9:00 AM - 6:00 PM</Text>
                </div>
              </div>
            </div>
          </div>

          <Divider className="mb-6" />

          {/* Bottom section */}
          <Flex 
            direction={{ base: 'col', md: 'row' } as any}
            justify="between" 
            align={{ base: 'start', md: 'center' } as any}
            gap={4}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Text size="sm" color="muted">
                © {currentYear} TSA Manufacturing Ltd. All rights reserved.
              </Text>
              <div className="flex items-center gap-4">
                <Link href="/privacy" underline="hover">
                  <Text size="sm">Privacy Policy</Text>
                </Link>
                <Link href="/terms" underline="hover">
                  <Text size="sm">Terms of Service</Text>
                </Link>
                <Link href="/security" underline="hover">
                  <Text size="sm">Security</Text>
                </Link>
              </div>
            </div>

            {/* System Status */}
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse" />
              <Text size="sm" color="muted">
                All Systems Operational
              </Text>
            </div>
          </Flex>
        </div>
      </div>
    </footer>
  );
};
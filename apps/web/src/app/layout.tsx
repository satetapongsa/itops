import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Sidebar } from '@/components/layout/sidebar';
import { Navbar } from '@/components/layout/navbar';
import { AuthProvider } from '@/lib/auth-context';
import { LayoutProvider } from '@/lib/layout-context';

export const metadata: Metadata = {
  title: 'OpsPilot — IT Operations Command Center',
  description: 'Enterprise IT Service & Operations Management Platform',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className="h-full">
      <body className="h-full bg-slate-50 text-slate-900 antialiased overflow-x-hidden">
        <AuthProvider>
          <LayoutProvider>
            <div className="flex h-screen w-full overflow-hidden">
              <Sidebar />
              <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
                <Navbar />
                <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8">
                  {children}
                </main>
              </div>
            </div>
          </LayoutProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

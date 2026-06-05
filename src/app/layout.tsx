// layout file for the app
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Farm Weather Dashboard',
  description: 'Hyperlocal weather and forecasts for your fields',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
        {children}
  <footer className="mt-10 pt-4 border-t border-gray-200 dark:border-gray-700 text-center text-xs text-gray-400 dark:text-gray-500">
          Made with ☕ by Brian Kioko
        </footer>
      </body>
    </html>
  );
}
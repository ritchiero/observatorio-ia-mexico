import type { Metadata } from 'next';
import SessionProvider from '@/components/SessionProvider';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    noarchive: true,
  },
};

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <SessionProvider>{children}</SessionProvider>;
}

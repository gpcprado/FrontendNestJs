'use client';

import { useRouter } from 'next/navigation';
import { getToken, logoutUser } from '@/lib/auth';

export default function DashboardLayout({ children }: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const token = getToken();

  if (!token) {
    router.push('/');
    return null;
  }

  function handleLogout() {
    logoutUser();
    router.push('/');
  }

  return (
    <div className="p-6 bg-gradient-to-br from-[#0c0a1e] via-[#1b0a4d] to-[#2d1b69]">
      {children}
    </div>
  );
}

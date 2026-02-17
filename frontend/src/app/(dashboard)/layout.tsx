'use client';

import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';
import { DemoBanner } from '@/components/demo/DemoBanner';
import { UserSwitcher } from '@/components/demo/UserSwitcher';
import { WelcomeModal } from '@/components/demo/WelcomeModal';
import { PageTransition } from '@/components/animations/PageTransition';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Demo mode - no authentication required

  return (
    <div className="min-h-screen bg-secondary">
      <DemoBanner />
      <Navbar />
      <Sidebar />

      {/* Main content with page transitions - accounting for taller mobile nav */}
      <main className="lg:pl-64 pb-[88px] lg:pb-0">
        <PageTransition className="min-h-[calc(100vh-4rem)]">
          {children}
        </PageTransition>
      </main>

      <MobileNav />
      <UserSwitcher />
      <WelcomeModal />
    </div>
  );
}

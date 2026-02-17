'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { MOBILE_NAV_LINKS } from '@/lib/constants';

// Map navigation paths to tour step identifiers
function getTourAttribute(href: string): string | undefined {
  switch (href) {
    case '/':
      return 'browse';
    case '/explore':
      return 'recommendations';
    case '/my-times':
      return 'join';
    case '/messages':
      return 'messages';
    default:
      return undefined;
  }
}

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-primary/5 bg-card/95 backdrop-blur-lg lg:hidden safe-left safe-right">
      {/* Safe area spacer for bottom */}
      <div className="flex items-center justify-around h-[72px] pb-safe">
        {MOBILE_NAV_LINKS.map((link) => {
          const isActive = link.href === '/post'
            ? false
            : pathname === link.href || pathname.startsWith(link.href + '/');
          const isPostButton = link.href === '/post';

          const tourAttribute = getTourAttribute(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              data-tour={tourAttribute}
              className={cn(
                'relative flex flex-col items-center justify-center rounded-xl transition-all duration-200 touch-manipulation select-none-mobile',
                isPostButton
                  ? 'bg-accent text-white rounded-full h-14 w-14 -mt-5 shadow-button active:scale-95 active:shadow-none'
                  : 'min-h-[56px] min-w-[64px] px-3 py-2 active:bg-primary/5',
                isActive && !isPostButton && 'text-primary',
                !isActive && !isPostButton && 'text-text-muted'
              )}
            >
              {/* Active indicator */}
              {isActive && !isPostButton && (
                <motion.div
                  layoutId="mobile-nav-indicator"
                  className="absolute -top-0.5 left-1/2 -translate-x-1/2 h-1 w-8 bg-accent rounded-full"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              <MobileNavIcon
                name={link.icon}
                className={cn(
                  'h-6 w-6 transition-transform',
                  isPostButton && 'h-7 w-7',
                  isActive && !isPostButton && 'scale-110'
                )}
              />
              {!isPostButton && (
                <span className={cn(
                  'text-[11px] font-medium mt-0.5 transition-colors',
                  isActive ? 'text-primary' : 'text-text-muted'
                )}>
                  {link.label}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function MobileNavIcon({ name, className }: { name: string; className?: string }) {
  switch (name) {
    case 'list':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
      );
    case 'map':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
        </svg>
      );
    case 'plus':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      );
    case 'message':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
        </svg>
      );
    case 'user':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      );
    default:
      return null;
  }
}

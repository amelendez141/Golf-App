'use client';

import { forwardRef } from 'react';
import Image from 'next/image';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn, getInitials } from '@/lib/utils';

const avatarVariants = cva(
  'relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary font-medium',
  {
    variants: {
      size: {
        xs: 'h-6 w-6 text-[10px]',
        sm: 'h-8 w-8 text-xs',
        md: 'h-10 w-10 text-sm',
        lg: 'h-12 w-12 text-base',
        xl: 'h-16 w-16 text-lg',
        '2xl': 'h-20 w-20 text-xl',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

const sizeMap = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
  '2xl': 80,
};

export interface AvatarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarVariants> {
  src?: string | null;
  alt?: string;
  firstName?: string | null;
  lastName?: string | null;
  fallback?: string;
}

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  (
    { className, size = 'md', src, alt, firstName, lastName, fallback, ...props },
    ref
  ) => {
    const initials = fallback || (firstName && lastName ? getInitials(firstName, lastName) : '?');
    const dimension = sizeMap[size || 'md'];

    return (
      <div
        ref={ref}
        className={cn(avatarVariants({ size, className }))}
        {...props}
      >
        {src ? (
          <Image
            src={src}
            alt={alt || `${firstName} ${lastName}`}
            width={dimension}
            height={dimension}
            className="h-full w-full object-cover"
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  max?: number;
  size?: VariantProps<typeof avatarVariants>['size'];
  children: React.ReactNode;
}

const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ className, max = 4, size = 'md', children, ...props }, ref) => {
    const childrenArray = Array.isArray(children) ? children : [children];
    const visibleChildren = childrenArray.slice(0, max);
    const remainingCount = childrenArray.length - max;

    return (
      <div
        ref={ref}
        className={cn('flex -space-x-2', className)}
        {...props}
      >
        {visibleChildren.map((child, index) => (
          <div
            key={index}
            className="ring-2 ring-card rounded-full"
            style={{ zIndex: visibleChildren.length - index }}
          >
            {child}
          </div>
        ))}
        {remainingCount > 0 && (
          <div
            className={cn(
              avatarVariants({ size }),
              'ring-2 ring-card bg-secondary-300 text-text-secondary'
            )}
            style={{ zIndex: 0 }}
          >
            +{remainingCount}
          </div>
        )}
      </div>
    );
  }
);

AvatarGroup.displayName = 'AvatarGroup';

export { Avatar, AvatarGroup, avatarVariants };

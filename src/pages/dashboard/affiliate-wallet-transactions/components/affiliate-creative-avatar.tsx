import { useState } from 'react';
import { cn } from '@/utils/utils';

import {
  initialsFromName,
  resolveAffiliateImageUrl,
  affiliateGradientFromName,
} from '../utils/affiliate-display';

type Size = 'sm' | 'md' | 'lg' | 'hero';

const sizeMap: Record<Size, { box: string; text: string }> = {
  sm: { box: 'h-11 w-11 min-h-11 min-w-11', text: 'text-sm' },
  md: { box: 'h-16 w-16 min-h-16 min-w-16', text: 'text-xl' },
  lg: { box: 'h-20 w-20 min-h-20 min-w-20', text: 'text-2xl' },
  hero: { box: 'h-28 w-28 min-h-28 min-w-28 sm:h-32 sm:w-32 sm:min-h-32 sm:min-w-32', text: 'text-3xl sm:text-4xl' },
};

type Props = {
  name?: string;
  imageUrl?: string | null;
  size?: Size;
  className?: string;
  rounded?: 'full' | '2xl';
};

/**
 * Shows the affiliate photo when the API returns a real file URL; otherwise a deterministic
 * gradient + initials “badge” (no third-party avatar APIs).
 */
export function AffiliateCreativeAvatar({
  name,
  imageUrl,
  size = 'sm',
  className,
  rounded = 'full',
}: Props) {
  const [broken, setBroken] = useState(false);
  const resolved = resolveAffiliateImageUrl(imageUrl ?? undefined);
  const showImage = Boolean(resolved) && !broken;
  const g = affiliateGradientFromName(name);
  const initials = initialsFromName(name);
  const dim = sizeMap[size];

  return (
    <div
      className={cn(
        'relative shrink-0 overflow-hidden shadow-lg',
        rounded === 'full' ? 'rounded-full' : 'rounded-2xl',
        dim.box,
        className
      )}
      style={
        !showImage
          ? {
              background: `linear-gradient(145deg, ${g.from}, ${g.to})`,
              boxShadow: `0 8px 32px -8px ${g.ring}, 0 0 0 1px rgba(255,255,255,0.12) inset`,
            }
          : { boxShadow: '0 8px 28px -10px rgba(0,0,0,0.35)' }
      }
    >
      {showImage ? (
        <img
          src={resolved!}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setBroken(true)}
        />
      ) : (
        <>
          <span
            className={cn(
              'flex h-full w-full items-center justify-center font-bold tracking-tight text-white',
              dim.text,
              'drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]'
            )}
          >
            {initials}
          </span>
          <span
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              background:
                'linear-gradient(140deg, transparent 35%, rgba(255,255,255,0.45) 48%, transparent 62%)',
            }}
          />
          <span className="pointer-events-none absolute -bottom-1/2 -right-1/2 h-full w-full rounded-full bg-white/10 blur-2xl" />
        </>
      )}
    </div>
  );
}

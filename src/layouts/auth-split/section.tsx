import type { HTMLAttributes } from 'react';

import { RouterLink } from 'src/routes/components';

import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

export type AuthSplitSectionProps = HTMLAttributes<HTMLDivElement> & {
  title?: string;
  method?: string;
  imgUrl?: string;
  subtitle?: string;
  layoutQuery?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  methods?: {
    path: string;
    icon: string;
    label: string;
  }[];
};

export function AuthSplitSection({
  method,
  methods,
  layoutQuery = 'md',
  title = 'Manage the job',
  imgUrl = `${CONFIG.assetsDir}/assets/illustrations/illustration-dashboard.webp`,
  subtitle = 'More effectively with optimized workflows.',
  className,
  ...other
}: AuthSplitSectionProps) {
  const displayClass = layoutQuery === 'md' 
    ? 'hidden md:flex' 
    : layoutQuery === 'lg' 
    ? 'hidden lg:flex'
    : layoutQuery === 'xl'
    ? 'hidden xl:flex'
    : layoutQuery === '2xl'
    ? 'hidden 2xl:flex'
    : 'hidden sm:flex';

  const backgroundImage = `linear-gradient(0deg, rgba(var(--background-default-channel, 255, 255, 255), 0.92), rgba(var(--background-default-channel, 255, 255, 255), 0.92)), url(${CONFIG.assetsDir}/assets/background/background-3-blur.webp)`;

  return (
    <div
      className={`
        ${displayClass}
        px-3 pb-3 w-full max-w-[480px] relative pt-[var(--layout-header-desktop-height)]
        gap-8 items-center flex-col justify-center
        bg-cover bg-center bg-no-repeat
        ${className || ''}
      `}
      style={{
        backgroundImage,
      }}
      {...other}
    >
      <div>
        <h3 className="text-center text-3xl font-bold">
          {title}
        </h3>

        {subtitle && (
          <p className="text-center mt-4 text-muted-foreground">
            {subtitle}
          </p>
        )}
      </div>

      <img
        alt="Dashboard illustration"
        src={imgUrl}
        className="w-full aspect-[4/3] object-cover"
      />

      {!!methods?.length && method && (
        <ul className="gap-2 flex">
          {methods.map((option) => {
            const selected = method === option.label.toLowerCase();

            return (
              <li
                key={option.label}
                className={!selected ? 'cursor-not-allowed grayscale' : ''}
                title={option.label}
              >
                <RouterLink
                  href={option.path}
                  className={!selected ? 'pointer-events-none' : ''}
                >
                  <img
                    alt={option.label}
                    src={option.icon}
                    className="w-8 h-8"
                  />
                </RouterLink>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

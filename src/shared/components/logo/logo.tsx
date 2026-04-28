import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { mergeClasses } from 'minimal-shared/utils';

import { RouterLink } from 'src/routes/components';

import { logoClasses } from './classes';

// ----------------------------------------------------------------------

export type LogoProps = React.ComponentProps<typeof RouterLink> & {
  isSingle?: boolean;
  disabled?: boolean;
  className?: string;
};

export function Logo({ disabled, className, href = '/', isSingle = true, ...other }: LogoProps) {
  const uniqueId = useId();
  const { t } = useTranslation('common');

  // Using CSS variables for colors that can be customized
  const TEXT_PRIMARY = 'var(--color-text-primary, #111827)';
  const PRIMARY_LIGHT = 'var(--color-primary-light, #60a5fa)';
  const PRIMARY_MAIN = 'var(--color-primary-main, #3b82f6)';
  const PRIMARY_DARKER = 'var(--color-primary-darker, #1d4ed8)';

  const singleLogo = (
    // <svg
    //   width="100%"
    //   height="100%"
    //   viewBox="0 0 512 512"
    //   fill="none"
    //   xmlns="http://www.w3.org/2000/svg"
    // >
    //   <defs>
    //     <linearGradient
    //       id={`${uniqueId}-1`}
    //       x1="152"
    //       y1="167.79"
    //       x2="65.523"
    //       y2="259.624"
    //       gradientUnits="userSpaceOnUse"
    //     >
    //       <stop stopColor={PRIMARY_DARKER} />
    //       <stop offset="1" stopColor={PRIMARY_MAIN} />
    //     </linearGradient>
    //     <linearGradient
    //       id={`${uniqueId}-2`}
    //       x1="86"
    //       y1="128"
    //       x2="86"
    //       y2="384"
    //       gradientUnits="userSpaceOnUse"
    //     >
    //       <stop stopColor={PRIMARY_LIGHT} />
    //       <stop offset="1" stopColor={PRIMARY_MAIN} />
    //     </linearGradient>
    //     <linearGradient
    //       id={`${uniqueId}-3`}
    //       x1="402"
    //       y1="288"
    //       x2="402"
    //       y2="384"
    //       gradientUnits="userSpaceOnUse"
    //     >
    //       <stop stopColor={PRIMARY_LIGHT} />
    //       <stop offset="1" stopColor={PRIMARY_MAIN} />
    //     </linearGradient>
    //   </defs>
    //   <path
    //     fill={`url(#${`${uniqueId}-1`})`}
    //     d="M86.352 246.358C137.511 214.183 161.836 245.017 183.168 285.573C165.515 317.716 153.837 337.331 148.132 344.418C137.373 357.788 125.636 367.911 111.202 373.752C80.856 388.014 43.132 388.681 14 371.048L86.352 246.358Z"
    //   />
    //   <path
    //     fill={`url(#${`${uniqueId}-2`})`}
    //     fillRule="evenodd"
    //     clipRule="evenodd"
    //     d="M444.31 229.726C398.04 148.77 350.21 72.498 295.267 184.382C287.751 198.766 282.272 226.719 270 226.719V226.577C257.728 226.577 252.251 198.624 244.735 184.24C189.79 72.356 141.96 148.628 95.689 229.584C92.207 235.69 88.862 241.516 86 246.58C192.038 179.453 183.11 382.247 270 383.858V384C356.891 382.389 347.962 179.595 454 246.72C451.139 241.658 447.794 235.832 444.31 229.726Z"
    //   />
    //   <path
    //     fill={`url(#${`${uniqueId}-3`})`}
    //     fillRule="evenodd"
    //     clipRule="evenodd"
    //     d="M450 384C476.509 384 498 362.509 498 336C498 309.491 476.509 288 450 288C423.491 288 402 309.491 402 336C402 362.509 423.491 384 450 384Z"
    //   />
    // </svg>
    <img src="logo/logo.jpg" alt="logo" className="w-34 h-12" />
  );

  const fullLogo = (
    <div className="flex items-center gap-2">
      {/* Logo Icon - Stylized S or B */}
      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient
            id={`${uniqueId}-logo-1`}
            x1="0"
            y1="0"
            x2="40"
            y2="40"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#1d4ed8" />
            <stop offset="1" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
        <circle cx="20" cy="20" r="18" fill={`url(#${`${uniqueId}-logo-1`})`} />
        <text
          x="20"
          y="28"
          fontSize="20"
          fontWeight="bold"
          fontFamily="Arial, sans-serif"
          fill="#FFD700"
          textAnchor="middle"
        >
          S
        </text>
      </svg>
      {/* Text */}
      <div className="flex items-center">
        <span className="text-xl font-bold text-[#FFD700]">Tik</span>
        <span className="text-xl font-bold text-[#1d4ed8] ms-1">mool</span>
      </div>
    </div>
  );

  return (
    <RouterLink
      href={href}
      aria-label={t('logoAria')}
      className={mergeClasses([
        logoClasses.root,
        'shrink-0 inline-flex align-middle items-center',
        isSingle ? 'w-48 h-10' : 'w-auto h-12',
        disabled ? 'pointer-events-none' : '',
        className,
      ])}
      {...other}
    >
      {isSingle ? singleLogo : fullLogo}
    </RouterLink>
  );
}

import type { HTMLAttributes } from 'react';

import { useTranslation } from 'react-i18next';

import { RouterLink } from 'src/routes/components';

// ----------------------------------------------------------------------
// Brand palette (reference swatches)
// #FFA000 orange · #1F2937 slate · #F3F4F6 / #F1F1F1 grays · #FFE8A3 / #FFF4CC warm highlights

const BRAND = {
  orange: '#FFA000',
  slate: '#1F2937',
  grayCool: '#F3F4F6',
  grayNeutral: '#F1F1F1',
  yellowSoft: '#FFE8A3',
  cream: '#FFF4CC',
} as const;

function HexBg() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <svg
        className="absolute -right-10 -top-14 h-80 w-80 text-white/12 [animation:auth-login-hex-spin_120s_linear_infinite]"
        viewBox="0 0 100 100"
        fill="currentColor"
      >
        <polygon points="50,5 90,27.5 90,72.5 50,95 10,72.5 10,27.5" />
      </svg>
      <svg
        className="absolute -left-20 bottom-4 h-[28rem] w-[28rem] text-white/7"
        viewBox="0 0 100 100"
        fill="currentColor"
      >
        <polygon points="50,5 90,27.5 90,72.5 50,95 10,72.5 10,27.5" />
      </svg>
      <svg
        className="absolute -right-6 top-[28%] h-56 w-56 text-white/14"
        viewBox="0 0 100 100"
        fill="currentColor"
      >
        <polygon points="50,5 90,27.5 90,72.5 50,95 10,72.5 10,27.5" />
      </svg>
      <svg
        className="absolute bottom-[12%] left-[8%] h-32 w-32 text-[#FFE8A3]/20"
        viewBox="0 0 100 100"
        fill="currentColor"
      >
        <polygon points="50,5 90,27.5 90,72.5 50,95 10,72.5 10,27.5" />
      </svg>
    </div>
  );
}

function MarketingAurora() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="auth-login-blob-a absolute -left-1/4 top-0 h-[55%] w-[70%] rounded-full blur-[100px]"
        style={{
          backgroundColor: 'rgba(255, 160, 0, 0.22)',
          mixBlendMode: 'screen',
        }}
      />
      <div
        className="auth-login-blob-b absolute -right-[20%] bottom-0 h-[50%] w-[65%] rounded-full blur-[90px]"
        style={{
          backgroundColor: 'rgba(255, 232, 163, 0.2)',
          mixBlendMode: 'screen',
        }}
      />
      <div
        className="auth-login-blob-c absolute left-1/3 top-1/2 h-[40%] w-[45%] -translate-y-1/2 rounded-full blur-[80px]"
        style={{
          backgroundColor: 'rgba(255, 244, 204, 0.18)',
          mixBlendMode: 'overlay',
        }}
      />
    </div>
  );
}

function DashboardMockup() {
  return (
    <div className="relative mx-auto w-full max-w-[min(100%,420px)] [animation:float_7s_ease-in-out_infinite]">
      {/* Floating small card */}
      <div className="absolute -left-2 top-4 z-10 hidden w-[38%] rounded-xl border border-white/60 bg-white p-2.5 shadow-[0_8px_30px_-8px_rgba(0,0,0,0.25)] sm:block md:-left-4 md:top-8">
        <div className="mb-1.5 flex items-center justify-between gap-1">
          <span className="text-[10px] font-semibold text-slate-700">Sales</span>
          <span className="text-[9px] font-medium text-emerald-600">+12%</span>
        </div>
        <svg viewBox="0 0 80 20" className="h-6 w-full text-emerald-500/90">
          <path
            d="M0 16 L12 10 L24 14 L36 6 L48 11 L60 4 L72 8 L80 2"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Logo chip */}
      <div className="absolute -right-1 top-0 z-10 flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-md sm:-right-2 sm:-top-2 sm:h-10 sm:w-10">
        <span className="text-sm font-bold text-primary">T</span>
      </div>

      {/* Main dashboard frame */}
      <div className="relative mx-auto w-[88%] rounded-2xl border border-white/50 bg-white p-3 shadow-[0_24px_64px_-24px_rgba(0,0,0,0.35)] sm:p-4">
        <div className="flex gap-3">
          <div
            className="flex w-10 shrink-0 flex-col gap-1.5 rounded-lg p-1.5"
            style={{ backgroundColor: BRAND.grayNeutral }}
          >
            <div className="h-1.5 w-full rounded bg-[#1F2937]/15" />
            <div className="h-1.5 w-full rounded bg-[#1F2937]/10" />
            <div className="h-1.5 w-full rounded bg-[#1F2937]/10" />
            <div className="mt-1 h-1.5 w-full rounded bg-[#FFA000]/35" />
            <div className="h-1.5 w-full rounded bg-[#1F2937]/10" />
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="h-2 w-20 rounded bg-[#1F2937]/12" />
              <div className="h-2 w-8 rounded-full bg-[#1F2937]/10" />
            </div>
            <div className="rounded-lg p-2" style={{ backgroundColor: BRAND.grayCool }}>
              <svg viewBox="0 0 120 40" className="h-12 w-full text-[#FFA000]/50">
                <path
                  d="M0 32 L15 18 L30 24 L45 12 L60 20 L75 8 L90 16 L105 4 L120 10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M0 32 L15 18 L30 24 L45 12 L60 20 L75 8 L90 16 L105 4 L120 10 L120 40 L0 40 Z"
                  fill="currentColor"
                  stroke="none"
                  opacity="0.12"
                />
              </svg>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <div
                className="rounded-md border p-1.5"
                style={{ borderColor: BRAND.grayNeutral, backgroundColor: `${BRAND.grayCool}cc` }}
              >
                <div className="mb-1 h-1 w-10 rounded bg-[#1F2937]/12" />
                <div className="h-1.5 w-14 rounded bg-[#1F2937]/18" />
              </div>
              <div
                className="rounded-md border p-1.5"
                style={{ borderColor: BRAND.grayNeutral, backgroundColor: `${BRAND.grayCool}cc` }}
              >
                <div className="mb-1 h-1 w-10 rounded bg-[#1F2937]/12" />
                <div className="h-1.5 w-14 rounded bg-[#1F2937]/18" />
              </div>
            </div>
            <div
              className="flex items-center gap-2 rounded-lg border bg-white p-1.5"
              style={{ borderColor: BRAND.grayNeutral }}
            >
              <div
                className="h-6 w-6 rounded-full bg-gradient-to-br from-[#FFA000] to-[#FFE8A3]"
              />
              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="h-1.5 w-16 rounded bg-[#1F2937]/12" />
                <div className="h-1 w-12 rounded" style={{ backgroundColor: BRAND.grayCool }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------

export type AuthSplitSectionProps = HTMLAttributes<HTMLDivElement> & {
  title?: string;
  method?: string;
  subtitle?: string;
  layoutQuery?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  /** When true, panel sits inside the unified login card (tighter padding). */
  unifiedCard?: boolean;
  /** `warm` = cream/yellow highlights; `cool` = cool gray mist + same base gradient. */
  marketingVariant?: 'warm' | 'cool';
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
  title: titleProp,
  subtitle: subtitleProp,
  unifiedCard = false,
  marketingVariant = 'warm',
  className,
  ...other
}: AuthSplitSectionProps) {
  const { t } = useTranslation('common');
  const title = titleProp ?? t('authMarketingTitle');
  const subtitle = subtitleProp ?? t('authMarketingSubtitle');

  // Base: slate → brand orange (#1F2937 → #FFA000); both variants share palette, overlay differs.
  const panelBackground = `linear-gradient(155deg, ${BRAND.slate} 0%, ${BRAND.slate} 40%, ${BRAND.orange} 100%)`;

  const overlayGradient =
    marketingVariant === 'cool'
      ? `linear-gradient(125deg, rgba(243, 244, 246, 0.14) 0%, transparent 42%, rgba(241, 241, 241, 0.08) 55%, rgba(255, 160, 0, 0.28) 100%)`
      : `linear-gradient(125deg, rgba(255, 232, 163, 0.22) 0%, transparent 42%, rgba(255, 244, 204, 0.14) 100%)`;

  const displayClass =
    layoutQuery === 'md'
      ? 'hidden md:flex'
      : layoutQuery === 'lg'
        ? 'hidden lg:flex'
        : layoutQuery === 'xl'
          ? 'hidden xl:flex'
          : layoutQuery === '2xl'
            ? 'hidden 2xl:flex'
            : 'hidden sm:flex';

  return (
    <div
      className={`
        ${displayClass}
        relative min-h-0 w-full min-w-0 shrink-0 flex-col justify-center overflow-hidden
        px-0 pb-0 pt-[var(--layout-header-desktop-height)]
        md:max-w-none md:flex-1 md:rounded-none md:px-8 md:pb-10
        ${unifiedCard ? 'md:!pt-10 md:!pb-10' : 'md:pt-[calc(var(--layout-header-desktop-height)+1rem)]'}
        ${className || ''}
      `}
      style={{
        background: panelBackground,
        backgroundSize: '200% 200%',
      }}
      {...other}
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-90 [animation:gradientShift_22s_ease_infinite]"
        style={{
          background: overlayGradient,
          backgroundSize: '200% 200%',
        }}
      />
      <MarketingAurora />
      <HexBg />

      <div className="relative z-[1] flex w-full max-w-[520px] flex-col items-center gap-8 md:mx-auto">
        <div className="flex w-full flex-col items-center px-4 text-center">
          <DashboardMockup />
        </div>

        <div className="px-6 pb-4 text-center md:px-8">
          <h3 className="text-center text-2xl font-bold leading-[1.2] tracking-tight text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.35)] sm:text-3xl">
            {title}
          </h3>
          {subtitle && (
            <p className="mt-3 text-center text-sm font-normal leading-relaxed text-white/88 sm:text-base">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {!!methods?.length && method && (
        <ul className="relative z-[1] mb-6 flex gap-2">
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

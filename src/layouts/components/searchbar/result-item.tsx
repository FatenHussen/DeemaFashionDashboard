import type { HTMLAttributes } from 'react';

import { isExternalLink } from 'minimal-shared/utils';

import { RouterLink } from 'src/routes/components';

import { Label } from 'src/shared/components/label';

// ----------------------------------------------------------------------

type Props = Omit<HTMLAttributes<HTMLAnchorElement>, 'title'> & {
  href: string;
  labels: string[];
  title: { text: string; highlight: boolean }[];
  path: { text: string; highlight: boolean }[];
};

export function ResultItem({ title, path, labels, href, className, ...other }: Props) {
  const linkProps = isExternalLink(href)
    ? { href, target: '_blank', rel: 'noopener noreferrer' }
    : { href };

  const LinkComponent = isExternalLink(href) ? 'a' : RouterLink;

  return (
    <LinkComponent
      {...linkProps}
      className={`block w-full px-3 py-2 border border-dashed border-transparent border-b-border hover:rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors ${className || ''}`}
      {...other}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="mb-0.5">
            {title.map((part, index) => (
              <span key={index} className={part.highlight ? 'text-primary' : ''}>
                {part.text}
              </span>
            ))}
          </div>
          <div className="text-xs text-muted-foreground truncate">
            {path.map((part, index) => (
              <span key={index} className={`${part.highlight ? 'text-primary font-semibold' : ''}`}>
                {part.text}
              </span>
            ))}
          </div>
        </div>

        <div className="flex gap-1.5 flex-shrink-0">
          {[...labels].reverse().map((label) => (
            <Label key={label} color="default">
              {label}
            </Label>
          ))}
        </div>
      </div>
    </LinkComponent>
  );
}

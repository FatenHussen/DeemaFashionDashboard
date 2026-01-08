import { mergeClasses } from 'minimal-shared/utils';

import { Box } from 'src/shared/ui';

// ----------------------------------------------------------------------

type SignUpTermsProps = React.HTMLAttributes<HTMLSpanElement> & {
  className?: string;
};

export function SignUpTerms({ className, ...other }: SignUpTermsProps) {
  return (
    <Box
      component="span"
      className={mergeClasses([
        'mt-6 block text-center text-xs text-muted-foreground',
        className,
      ])}
      {...other}
    >
      {'By signing up, I agree to '}
      <a
        href="#"
        className="underline text-foreground hover:text-foreground/80"
      >
        Terms of service
      </a>
      {' and '}
      <a
        href="#"
        className="underline text-foreground hover:text-foreground/80"
      >
        Privacy policy
      </a>
      .
    </Box>
  );
}

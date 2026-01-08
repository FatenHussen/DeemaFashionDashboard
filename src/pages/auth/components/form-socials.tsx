import { Box, IconButton } from 'src/shared/ui';

import { Iconify } from 'src/shared/components/iconify';

// ----------------------------------------------------------------------

type FormSocialsProps = React.HTMLAttributes<HTMLDivElement> & {
  signInWithGoogle?: () => void;
  singInWithGithub?: () => void;
  signInWithTwitter?: () => void;
  className?: string;
};

export function FormSocials({
  className,
  signInWithGoogle,
  singInWithGithub,
  signInWithTwitter,
  ...other
}: FormSocialsProps) {
  return (
    <Box className={`gap-3 flex justify-center ${className || ''}`} {...other}>
      <IconButton color="default" onClick={signInWithGoogle}>
        <Iconify width={22} icon="socials:google" />
      </IconButton>
      <IconButton color="default" onClick={singInWithGithub}>
        <Iconify width={22} icon="socials:github" />
      </IconButton>
      <IconButton color="default" onClick={signInWithTwitter}>
        <Iconify width={22} icon="socials:twitter" />
      </IconButton>
    </Box>
  );
}

import { Button } from '@/shared/ui/button';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import { useFetchRecipeById } from '@/pages/dashboard/recipes/hooks/recipe';

import { CONFIG } from 'src/global-config';
import { Box, Typography } from 'src/shared/ui';
import { LoadingScreen } from 'src/shared/components/loading-screen';

const metadata = { title: `Recipe Details | Dashboard - ${CONFIG.appName}` };

export default function DetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: response, isLoading, error } = useFetchRecipeById(id || '');
  const item = response?.data;

  if (isLoading) return <LoadingScreen />;
  if (error || !item) {
    return (
      <Box className="flex items-center justify-center min-h-[400px] p-6">
        <Box className="w-full max-w-md rounded-xl border border-border/50 shadow-lg bg-background p-6">
          <Typography variant="h6" className="text-destructive mb-2">Error Loading Recipe</Typography>
          <Button variant="outlined" onClick={() => navigate('/recipes')}>Back to Recipes</Button>
        </Box>
      </Box>
    );
  }

  const nameStr = typeof item.name === 'object' ? (item.name as any)?.en || (item.name as any)?.ar || '-' : String(item.name || '-');
  const descStr = typeof item.description === 'object' ? (item.description as any)?.en || (item.description as any)?.ar : item.description;

  return (
    <>
      <title>{metadata.title}</title>
      <Box className="relative min-h-screen overflow-hidden bg-background p-6">
        <Box className="pointer-events-none fixed inset-0 bg-gradient-to-br from-background via-background to-muted/30" />
        <Box className="relative max-w-4xl mx-auto">
          <Box className="mb-6">
            <Button variant="text" onClick={() => navigate('/recipes')} className="mb-4 -ml-2 text-muted-foreground hover:text-foreground">
              <Iconify icon="solar:arrow-left-bold" width={20} className="mr-2" /> Back to Recipes
            </Button>
            <Box className="flex items-center gap-4 mb-2">
              <Box className="w-16 h-16 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Iconify icon="solar:chef-hat-bold" className="text-primary" width={32} height={32} />
              </Box>
              <Box className="flex-1">
                <Typography variant="h4" className="font-bold text-foreground mb-1">{nameStr}</Typography>
                {descStr && <Typography variant="body2" className="text-muted-foreground">{descStr}</Typography>}
              </Box>
              <Button variant="contained" onClick={() => navigate(`/recipes/update/${id}`)} className="gap-2">
                <Iconify icon="solar:pen-bold" width={18} /> Edit
              </Button>
            </Box>
          </Box>

          <Box className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm shadow-sm overflow-hidden mb-4">
            <Box className="p-6">
              <Typography variant="h6" className="font-semibold mb-4">Recipe Information</Typography>
              <Box className="grid gap-4 sm:grid-cols-3">
                <Box><Typography variant="caption" className="text-muted-foreground">Prepare Time</Typography><Typography variant="body1" className="font-medium">{item.prepare_time || '-'}</Typography></Box>
                <Box><Typography variant="caption" className="text-muted-foreground">Serves</Typography><Typography variant="body1" className="font-medium">{item.serves ?? '-'}</Typography></Box>
                <Box><Typography variant="caption" className="text-muted-foreground">Discount</Typography><Typography variant="body1" className="font-medium">{item.discount ?? '-'}</Typography></Box>
              </Box>
            </Box>
          </Box>

          {item.steps && item.steps.length > 0 && (
            <Box className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm shadow-sm overflow-hidden mb-4">
              <Box className="p-6">
                <Typography variant="h6" className="font-semibold mb-4">Steps</Typography>
                {item.steps.map((step) => (
                  <Box key={step.step_number} className="mb-3 p-3 border border-border/40 rounded-lg">
                    <Typography variant="caption" className="text-muted-foreground">Step {step.step_number}</Typography>
                    <Typography variant="body1">{typeof step.instruction === 'object' ? step.instruction.en || step.instruction.ar : step.instruction}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {item.items && item.items.length > 0 && (
            <Box className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm shadow-sm overflow-hidden">
              <Box className="p-6">
                <Typography variant="h6" className="font-semibold mb-4">Ingredients</Typography>
                {item.items.map((recipeItem, idx) => (
                  <Box key={idx} className="mb-2 flex items-center gap-2">
                    <Typography variant="body2" className="font-medium">{recipeItem.main_item?.name}</Typography>
                    <Typography variant="caption" className="text-muted-foreground">x{recipeItem.terms.default_quantity}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
}

import { Button } from '@/shared/ui/button';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import { formatTranslated } from '@/utils/format-translated';
import { useFetchProductById } from '@/pages/dashboard/products/hooks/product';

import { CONFIG } from 'src/global-config';
import { Box, Typography } from 'src/shared/ui';
import { Separator } from 'src/shared/ui/separator';
import { LoadingScreen } from 'src/shared/components/loading-screen';

// ----------------------------------------------------------------------

const metadata = { title: `Product Details | Dashboard - ${CONFIG.appName}` };

export default function DetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: productResponse, isLoading, error } = useFetchProductById(id || '');

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error || !productResponse) {
    return (
      <Box className="flex items-center justify-center min-h-[400px] p-6">
        <Box className="w-full max-w-md rounded-xl border border-border/50 shadow-lg bg-background p-6">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:danger-bold" className="w-5 h-5 text-destructive" />
            <Typography variant="h6" className="text-destructive">
              Error Loading Product
            </Typography>
          </Box>
          <Typography variant="body2" className="text-muted-foreground mb-4">
            {error instanceof Error ? error.message : 'Failed to load product information'}
          </Typography>
          <Button variant="outlined" onClick={() => navigate('/products/product')}>
            Back to Products
          </Button>
        </Box>
      </Box>
    );
  }

  const product = productResponse;
  const img = (product as any).images?.[0] ?? (product as any);
  const imageUrl = img?.url
    ? (String(img.url).startsWith('http') ? img.url : `${CONFIG.serverUrl}/${img.url}`)
    : (product as any).image
      ? `${CONFIG.serverUrl}/${(product as any).image}`
      : null;

  return (
    <>
      <title>{metadata.title}</title>
      <Box className="relative min-h-screen overflow-hidden bg-background p-6">
        {/* Subtle background gradient */}
        <Box className="pointer-events-none fixed inset-0 bg-gradient-to-br from-background via-background to-muted/30" />

        {/* Refined grid overlay */}
        <Box className="pointer-events-none fixed inset-0 opacity-[0.03] dark:opacity-[0.05]">
          <Box className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:32px_32px]" />
        </Box>

        <Box className="relative max-w-4xl mx-auto">
          {/* Header */}
          <Box className="mb-6">
            <Button
              variant="text"
              onClick={() => navigate('/products/product')}
              className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
            >
              <Iconify icon="solar:arrow-left-bold" width={20} className="mr-2" />
              Back to Products
            </Button>

            <Box className="flex items-center gap-4 mb-2">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={formatTranslated(product.name)}
                  className="w-16 h-16 rounded-xl object-cover border border-border/60"
                />
              ) : (
                <Box className="w-16 h-16 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Iconify
                    icon="solar:box-bold"
                    className="text-primary"
                    width={32}
                    height={32}
                  />
                </Box>
              )}
              <Box className="flex-1">
                <Typography variant="h4" className="font-bold text-foreground mb-1">
                  {formatTranslated(product.name)}
                </Typography>
                <Typography variant="body2" className="text-muted-foreground">
                  Product Details
                </Typography>
              </Box>
              <Button
                variant="contained"
                onClick={() => navigate(`/products/product/update/${id}`)}
                className="gap-2"
              >
                <Iconify icon="solar:pen-bold" width={18} />
                Edit Product
              </Button>
            </Box>
          </Box>

          {/* Details Card */}
          <Box className="rounded-xl border border-border/50 shadow-lg bg-background/95 backdrop-blur-sm overflow-hidden">
            <Box className="p-6 space-y-6">
              {/* Basic Information */}
              <Box>
                <Typography
                  variant="h6"
                  className="font-semibold text-foreground mb-4 flex items-center gap-2"
                >
                  <Iconify icon="solar:info-circle-bold" width={20} />
                  Basic Information
                </Typography>
                <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Box className="space-y-2">
                    <Typography variant="body2" className="text-muted-foreground font-medium">
                      Product ID
                    </Typography>
                    <Box className="flex items-center gap-2">
                      <Box className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <span className="text-xs font-semibold text-primary">{product.id}</span>
                      </Box>
                    </Box>
                  </Box>

                  <Box className="space-y-2">
                    <Typography variant="body2" className="text-muted-foreground font-medium">
                      Product Name
                    </Typography>
                    <Typography variant="body1" className="text-foreground">
                      {formatTranslated(product.name)}
                    </Typography>
                  </Box>

                  <Box className="space-y-2">
                    <Typography variant="body2" className="text-muted-foreground font-medium">
                      Category
                    </Typography>
                    <Typography variant="body1" className="text-foreground">
                      {formatTranslated(product.category?.name) ?? product.category_id}
                    </Typography>
                  </Box>

                  <Box className="space-y-2">
                    <Typography variant="body2" className="text-muted-foreground font-medium">
                      Price
                    </Typography>
                    <Typography variant="body1" className="text-foreground font-semibold">
                      ${product.price}
                    </Typography>
                  </Box>

                  <Box className="space-y-2">
                    <Typography variant="body2" className="text-muted-foreground font-medium">
                      Quantity
                    </Typography>
                    <Typography variant="body1" className="text-foreground">
                      {product.quantity || 'N/A'}
                    </Typography>
                  </Box>

                  <Box className="space-y-2">
                    <Typography variant="body2" className="text-muted-foreground font-medium">
                      SKU
                    </Typography>
                    <Typography variant="body1" className="text-foreground">
                      {product.sku || 'N/A'}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Separator />

              {/* Description */}
              <Box>
                <Typography
                  variant="h6"
                  className="font-semibold text-foreground mb-4 flex items-center gap-2"
                >
                  <Iconify icon="solar:document-text-bold" width={20} />
                  Description
                </Typography>
                <Typography variant="body1" className="text-foreground">
                  {formatTranslated(product.description)}
                </Typography>
              </Box>

              {/* TODO: Add more sections for variants, category details, extra details, etc. */}
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}

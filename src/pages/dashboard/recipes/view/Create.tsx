import type { RecipeData } from '@/pages/dashboard/recipes/types/recipe.types';

import { toast } from 'react-toastify';
import { Button } from '@/shared/ui/button';
import { useTranslation } from 'react-i18next';
import { useRef, useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Iconify } from '@/shared/components/iconify';
import { useParams, useNavigate, useLocation } from 'react-router';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { _ShopApi } from '@/pages/dashboard/vendor/api/shop.services';
import { InfiniteScrollSelect } from '@/shared/components/infinite-scroll-select';
import { _CategoryApi } from '@/pages/dashboard/categories/api/category.services';
import { _ShopProductVariantApi } from '@/shared/api/shop-product-variant.services';
import { RecipeSchema, type RecipeFormValues } from '@/pages/dashboard/recipes/validation/recipe.validation';
import { useCreateRecipe, useUpdateRecipe, useFetchRecipeById } from '@/pages/dashboard/recipes/hooks/recipe';

import { CONFIG } from 'src/global-config';
import { Box, Switch, Typography } from 'src/shared/ui';
import { LoadingScreen } from 'src/shared/components/loading-screen';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { RHFBadgeSelector } from 'src/shared/components/hook-form/rhf-badge-selector';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';

// ----------------------------------------------------------------------

const metadata = { title: `Recipe ${CONFIG.appName}` };

const getTranslation = (val: any, lang: 'ar' | 'en') => {
  if (!val) return '';
  if (typeof val === 'string') return lang === 'en' ? val : '';
  return val[lang] || '';
};

// Per-item cascading selects state
interface ItemSelectState {
  categoryId: number;
  shopId: number;
}

export default function CreatePage() {
  const { t } = useTranslation('table');
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const fromState = location.state?.recipe as RecipeData | undefined;
  const isEditMode = !!id;

  const { data: detailsResponse, isLoading: isLoadingDetails } = useFetchRecipeById(id || '');
  const createMutation = useCreateRecipe();
  const updateMutation = useUpdateRecipe();

  const [itemSelects, setItemSelects] = useState<ItemSelectState[]>([{ categoryId: 0, shopId: 0 }]);
  const [itemVariantLabels, setItemVariantLabels] = useState<string[]>(['']);
  const [itemSwitchableLabels, setItemSwitchableLabels] = useState<string[]>(['']);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const defaultValues: RecipeFormValues = {
    name: { en: '', ar: '' },
    description: { en: '', ar: '' },
    image: null,
    video_url: '',
    discount: 0,
    delivery_price: 0,
    serves: '',
    prepare_time: '',
    badges: [],
    items: [{ shop_product_variant_id: 0, switchable_category_id: undefined, quantity: 1, is_required: true, min_quantity: 1, max_quantity: 1 }],
    steps: [],
  };

  const methods = useForm<RecipeFormValues>({
    resolver: zodResolver(RecipeSchema) as any,
    defaultValues,
  });

  const { handleSubmit, reset, control, setValue } = methods;

  const { fields: itemFields, append: appendItem, remove: removeItem } = useFieldArray({ control, name: 'items' });
  const { fields: stepFields, append: appendStep, remove: removeStep } = useFieldArray({ control, name: 'steps' });

  useEffect(() => {
    const source = isEditMode ? (detailsResponse?.data ?? fromState) : null;
    if (source) {
      reset({
        name: { en: getTranslation(source.name, 'en'), ar: getTranslation(source.name, 'ar') },
        description: { en: getTranslation(source.description, 'en'), ar: getTranslation(source.description, 'ar') },
        image: null,
        video_url: source.video_url || '',
        discount: Number(source.discount) || 0,
        delivery_price: source.delivery_price || 0,
        serves: (source as any).serves ?? '',
        prepare_time: (source as any).prepare_time ?? '',
        badges: source.badges?.length
          ? source.badges.map((b: any) => ({
              id: b.id,
              position: b.postion || b.position || 'top',
            }))
          : [],
        items: source.items?.length
          ? source.items.map((it: any) => ({
              // API returns nested: terms + main_item
              shop_product_variant_id: it.main_item?.shop_product_variant_id ?? it.shop_product_variant_id ?? 0,
              switchable_category_id: it.terms?.switchable_category_id ?? it.switchable_category_id,
              quantity: it.terms?.default_quantity ?? it.quantity ?? 1,
              is_required: it.terms?.is_required ?? it.is_required ?? true,
              min_quantity: it.terms?.min_quantity ?? it.min_quantity ?? 1,
              max_quantity: it.terms?.max_quantity ?? it.max_quantity ?? 1,
            }))
          : [{ shop_product_variant_id: 0, switchable_category_id: undefined, quantity: 1, is_required: true, min_quantity: 1, max_quantity: 1 }],
        steps: source.steps?.length
          ? source.steps.map((s) => ({
              step_number: s.step_number,
              heat_level: { en: getTranslation(s.heat_level, 'en'), ar: getTranslation(s.heat_level, 'ar') },
              time_minutes: { en: getTranslation(s.time_minutes, 'en'), ar: getTranslation(s.time_minutes, 'ar') },
              instruction: { en: getTranslation(s.instruction, 'en'), ar: getTranslation(s.instruction, 'ar') },
            }))
          : [],
      });
      if (source.items?.length) {
        setItemSelects(source.items.map(() => ({ categoryId: 0, shopId: 0 })));
        setItemVariantLabels(source.items.map((it: any) => it.main_item?.name || ''));
        setItemSwitchableLabels(source.items.map((it: any) => {
          const sc = it.terms?.switchable_category ?? it.switchable_category;
          return sc?.name ? (typeof sc.name === 'object' ? getTranslation(sc.name, 'en') : sc.name) : '';
        }));
      }
      if (source.image) setImagePreview(source.image);
    }
  }, [detailsResponse?.data, fromState, isEditMode, reset]);

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const errorMessage = createMutation.error?.message || updateMutation.error?.message || null;

  const updateItemSelect = (index: number, field: keyof ItemSelectState, value: number) => {
    setItemSelects((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      if (field === 'categoryId') next[index].shopId = 0;
      return next;
    });
  };

  const onSubmit = async (data: RecipeFormValues) => {
    try {
      const payload = {
        ...data,
        items: data.items.filter((it) => it.shop_product_variant_id > 0),
      };
      if (isEditMode && id) {
        await updateMutation.mutateAsync({ id, data: payload as any });
        toast.success('Recipe updated successfully');
      } else {
        await createMutation.mutateAsync(payload as any);
        toast.success('Recipe created successfully');
      }
      navigate('/recipes');
    } catch (error: any) {
      console.error('Error saving recipe:', error);
    }
  };

  if (isEditMode && isLoadingDetails && !fromState) return <LoadingScreen />;

  return (
    <>
      <title>{isEditMode ? `Edit Recipe | ${metadata.title}` : `Create Recipe | ${metadata.title}`}</title>

      <CreateFormLayout
        methods={methods as any}
        onSubmit={handleSubmit(onSubmit as any)}
        onCancel={() => navigate('/recipes')}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        title={isEditMode ? 'Edit Recipe' : 'Create New Recipe'}
        description={isEditMode ? 'Update recipe details' : 'Add a new recipe'}
        isEditMode={isEditMode}
        isLoading={isEditMode && isLoadingDetails}
        loadingText={t('form.loadingRecipe')}
        maxWidth="2xl"
        submitLabel={isEditMode ? 'Update Recipe' : 'Create Recipe'}
        submittingLabel={isEditMode ? 'Updating...' : 'Creating...'}
      >
        {/* Name */}
        <Box className="group">
          <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('columns.name')}</Typography>
          <div className="flex flex-col gap-2">
            <RHFTextField name="name.en" placeholder={t('form.recipeNameEn')} fullWidth />
            <RHFTextField name="name.ar" placeholder={t('form.recipeNameAr')} dir="rtl" fullWidth />
          </div>
        </Box>

        {/* Description */}
        <Box className="group">
          <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('columns.description')}</Typography>
          <div className="flex flex-col gap-2">
            <RHFTextField name="description.en" placeholder={t('form.descriptionEnPlaceholder')} fullWidth />
            <RHFTextField name="description.ar" placeholder={t('form.descriptionArPlaceholder')} dir="rtl" fullWidth />
          </div>
        </Box>

        {/* Image */}
        <Box className="group">
          <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">
            Image <span className="text-destructive">*</span>
          </Typography>
          <Controller
            name="image"
            control={control}
            render={({ field: f, fieldState }) => (
              <div className="flex flex-col gap-2">
                {/* Preview */}
                {imagePreview && (
                  <div className="relative w-full h-40 rounded-lg overflow-hidden border border-border">
                    <img src={imagePreview} alt="Recipe preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        f.onChange(null);
                      }}
                      className="absolute top-2 right-2 bg-destructive text-white rounded-full p-1 hover:bg-destructive/80"
                    >
                      <Iconify icon="solar:close-circle-bold" width={16} />
                    </button>
                  </div>
                )}

                {/* Upload area */}
                {!imagePreview && (
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="w-full h-32 rounded-lg border-2 border-dashed border-border hover:border-primary/50 bg-muted/20 hover:bg-muted/40 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground"
                  >
                    <Iconify icon="solar:camera-add-bold" width={28} />
                    <span className="text-sm">Click to upload image</span>
                    <span className="text-xs">PNG, JPG, WEBP</span>
                  </button>
                )}

                {imagePreview && (
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="text-xs text-primary hover:underline text-left"
                  >
                    Change image
                  </button>
                )}

                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      f.onChange(file);
                      setImagePreview(URL.createObjectURL(file));
                    }
                    e.target.value = '';
                  }}
                />

                {fieldState.error && (
                  <span className="text-xs text-destructive">{fieldState.error.message}</span>
                )}
              </div>
            )}
          />
        </Box>

        {/* Video URL */}
        <Box className="group">
          <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.videoUrl')}</Typography>
          <RHFTextField name="video_url" placeholder={t('form.videoUrlPlaceholder')} fullWidth />
        </Box>

        {/* Numeric fields */}
        <Box className="flex gap-4 flex-wrap">
          <Box className="flex-1 min-w-[130px]">
            <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">Discount</Typography>
            <RHFTextField name="discount" type="number" placeholder="0" fullWidth />
          </Box>
          <Box className="flex-1 min-w-[130px]">
            <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('form.deliveryPrice')}</Typography>
            <RHFTextField name="delivery_price" type="number" placeholder="0" fullWidth />
          </Box>
          <Box className="flex-1 min-w-[130px]">
            <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('columns.servings')}</Typography>
            <RHFTextField name="serves" placeholder={t('form.servesPlaceholder')} fullWidth />
          </Box>
          <Box className="flex-1 min-w-[130px]">
            <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">{t('columns.prepTime')}</Typography>
            <RHFTextField name="prepare_time" placeholder={t('form.prepareTimePlaceholder')} fullWidth />
          </Box>
        </Box>

        {/* Badges */}
        <Box className="group">
          <RHFBadgeSelector
            name="badges"
            label="Badges"
            helperText="Select badges to display with this recipe"
          />
        </Box>

        {/* ── Items ── */}
        <Box className="group">
          <Box className="flex items-center justify-between mb-3">
            <Typography variant="subtitle2" className="font-semibold text-foreground">Recipe Items</Typography>
            <Button
              type="button"
              variant="outlined"
              onClick={() => {
                appendItem({ shop_product_variant_id: 0, switchable_category_id: undefined, quantity: 1, is_required: true, min_quantity: 1, max_quantity: 1 });
                setItemSelects((prev) => [...prev, { categoryId: 0, shopId: 0 }]);
                setItemVariantLabels((prev) => [...prev, '']);
                setItemSwitchableLabels((prev) => [...prev, '']);
              }}
              className="text-xs"
            >
              <Iconify icon="solar:add-circle-bold" width={16} className="mr-1" />
              Add Item
            </Button>
          </Box>

          {itemFields.map((field, index) => {
            const sel = itemSelects[index] ?? { categoryId: 0, shopId: 0 };
            return (
              <Box key={field.id} className="border border-border rounded-lg p-3 mb-3 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Item #{index + 1}</span>
                  {itemFields.length > 1 && (
                    <Button
                      type="button"
                      variant="text"
                      onClick={() => {
                        removeItem(index);
                        setItemSelects((prev) => prev.filter((_, i) => i !== index));
                        setItemVariantLabels((prev) => prev.filter((_, i) => i !== index));
                        setItemSwitchableLabels((prev) => prev.filter((_, i) => i !== index));
                      }}
                      className="text-destructive"
                    >
                      <Iconify icon="solar:trash-bin-trash-bold" width={16} />
                    </Button>
                  )}
                </div>

                {/* Row 1: Category + Shop */}
                <div className="flex gap-2 flex-wrap">
                  <Box className="flex-1 min-w-[150px]">
                    <Typography variant="subtitle2" className="mb-1 text-xs text-muted-foreground">Filter by Category</Typography>
                    <InfiniteScrollSelect
                      value={sel.categoryId}
                      onChange={(val) => updateItemSelect(index, 'categoryId', val)}
                      queryKey={['category', 'recipe-filter', index]}
                      fetcher={(page) =>
                        _CategoryApi.getListCategoriesPaginated({ page, per_page: 15 }).then((res) => ({
                          data: {
                            items:
                              page === 1
                                ? [{ id: 0, label: 'All categories' }, ...res.data.items.map((c: any) => ({ id: c.id, label: typeof c.name === 'object' ? c.name : c.name || '' }))]
                                : res.data.items.map((c: any) => ({ id: c.id, label: typeof c.name === 'object' ? c.name : c.name || '' })),
                            pagination: res.data.pagination,
                          },
                        }))
                      }
                      placeholder={t('form.allCategories')}
                    />
                  </Box>

                  <Box className="flex-1 min-w-[150px]">
                    <Typography variant="subtitle2" className="mb-1 text-xs text-muted-foreground">
                      Select Shop <span className="text-destructive">*</span>
                    </Typography>
                    <InfiniteScrollSelect
                      value={sel.shopId}
                      onChange={(val) => updateItemSelect(index, 'shopId', val)}
                      queryKey={['shop', 'recipe-filter', index]}
                      fetcher={(page) =>
                        _ShopApi.getListShop({ page, per_page: 15 }).then((res) => ({
                          data: {
                            items: res.data.items.map((s: any) => ({
                              id: s.id,
                              label: typeof s.name === 'object' ? s.name : s.name || '',
                            })),
                            pagination: res.data.pagination,
                          },
                        }))
                      }
                      placeholder={t('form.selectShop')}
                    />
                  </Box>
                </div>

                {/* Row 2: Product Variant */}
                <Box>
                  <Typography variant="subtitle2" className="mb-1 text-xs text-muted-foreground">
                    Product Variant <span className="text-destructive">*</span>
                  </Typography>
                  <Controller
                    name={`items.${index}.shop_product_variant_id`}
                    control={control}
                    render={({ field: f }) => (
                      <InfiniteScrollSelect
                        value={f.value || 0}
                        onChange={(val) => {
                          f.onChange(val);
                          // Clear initialLabel once user picks a new item
                          setItemVariantLabels((prev) => {
                            const next = [...prev];
                            next[index] = '';
                            return next;
                          });
                        }}
                        queryKey={['shopProductVariant', 'recipe-item', index, sel.shopId, sel.categoryId]}
                        fetcher={(page) =>
                          _ShopProductVariantApi.getList({
                            page,
                            per_page: 10,
                            shop_id: sel.shopId || undefined,
                            category_id: sel.categoryId || undefined,
                          })
                        }
                        placeholder={sel.shopId ? 'Select product variant...' : 'Select a shop first'}
                        initialLabel={itemVariantLabels[index]}
                      />
                    )}
                  />
                </Box>

                {/* Row 3: Switchable Category */}
                <Box>
                  <Typography variant="subtitle2" className="mb-1 text-xs text-muted-foreground">Switchable Category (optional)</Typography>
                  <Controller
                    name={`items.${index}.switchable_category_id`}
                    control={control}
                    render={({ field: f }) => (
                      <InfiniteScrollSelect
                        value={f.value ?? 0}
                        onChange={(val) => {
                          f.onChange(val === 0 ? undefined : val);
                          setItemSwitchableLabels((prev) => {
                            const next = [...prev];
                            next[index] = '';
                            return next;
                          });
                        }}
                        queryKey={['category', 'recipe-switchable', index]}
                        fetcher={(page) =>
                          _CategoryApi.getListCategoriesPaginated({ page, per_page: 15 }).then((res) => ({
                            data: {
                              items:
                                page === 1
                                  ? [{ id: 0, label: 'No switchable category' }, ...res.data.items.map((c: any) => ({ id: c.id, label: typeof c.name === 'object' ? c.name : c.name || '' }))]
                                  : res.data.items.map((c: any) => ({ id: c.id, label: typeof c.name === 'object' ? c.name : c.name || '' })),
                              pagination: res.data.pagination,
                            },
                          }))
                        }
                        placeholder={t('form.noSwitchableCategory')}
                        initialLabel={itemSwitchableLabels[index]}
                      />
                    )}
                  />
                </Box>

                {/* Row 4: Quantity fields + is_required */}
                <div className="flex gap-2 flex-wrap items-end">
                  <Box className="flex-1 min-w-[80px]">
                    <Typography variant="subtitle2" className="mb-1 text-xs text-muted-foreground">{t('form.quantity')}</Typography>
                    <RHFTextField name={`items.${index}.quantity`} type="number" placeholder="1" fullWidth />
                  </Box>
                  <Box className="flex-1 min-w-[80px]">
                    <Typography variant="subtitle2" className="mb-1 text-xs text-muted-foreground">Min Qty</Typography>
                    <RHFTextField name={`items.${index}.min_quantity`} type="number" placeholder="1" fullWidth />
                  </Box>
                  <Box className="flex-1 min-w-[80px]">
                    <Typography variant="subtitle2" className="mb-1 text-xs text-muted-foreground">Max Qty</Typography>
                    <RHFTextField name={`items.${index}.max_quantity`} type="number" placeholder="1" fullWidth />
                  </Box>
                  <Box className="flex-1 min-w-[100px] flex items-center pb-1">
                    <Controller
                      name={`items.${index}.is_required`}
                      control={control}
                      render={({ field: f }) => (
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={f.value}
                            onChange={(e) => f.onChange((e.target as HTMLInputElement).checked)}
                          />
                          <Typography variant="body2" className="text-xs">Required</Typography>
                        </div>
                      )}
                    />
                  </Box>
                </div>
              </Box>
            );
          })}
        </Box>

        {/* ── Steps ── */}
        <Box className="group">
          <Box className="flex items-center justify-between mb-3">
            <Typography variant="subtitle2" className="font-semibold text-foreground">Recipe Steps</Typography>
            <Button
              type="button"
              variant="outlined"
              onClick={() =>
                appendStep({
                  step_number: stepFields.length + 1,
                  heat_level: { en: '', ar: '' },
                  time_minutes: { en: '', ar: '' },
                  instruction: { en: '', ar: '' },
                })
              }
              className="text-xs"
            >
              <Iconify icon="solar:add-circle-bold" width={16} className="mr-1" />
              Add Step
            </Button>
          </Box>

          {stepFields.length === 0 && (
            <div className="text-center py-6 text-sm text-muted-foreground border border-dashed border-border rounded-lg">
              No steps added yet. Click &quot;Add Step&quot; to begin.
            </div>
          )}

          {stepFields.map((field, index) => (
            <Box key={field.id} className="border border-border rounded-lg p-3 mb-3 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">Step {index + 1}</span>
                <Button
                  type="button"
                  variant="text"
                  onClick={() => removeStep(index)}
                  className="text-destructive"
                >
                  <Iconify icon="solar:trash-bin-trash-bold" width={16} />
                </Button>
              </div>

              {/* Heat Level */}
              <Box>
                <Typography variant="subtitle2" className="mb-1 text-xs text-muted-foreground">Heat Level</Typography>
                <div className="flex flex-col gap-1">
                  <RHFTextField name={`steps.${index}.heat_level.en`} placeholder={t('form.heatLevelEn')} fullWidth />
                  <RHFTextField name={`steps.${index}.heat_level.ar`} placeholder={t('form.heatLevelAr')} dir="rtl" fullWidth />
                </div>
              </Box>

              {/* Time */}
              <Box>
                <Typography variant="subtitle2" className="mb-1 text-xs text-muted-foreground">Time</Typography>
                <div className="flex flex-col gap-1">
                  <RHFTextField name={`steps.${index}.time_minutes.en`} placeholder={t('form.timeMinutesEn')} fullWidth />
                  <RHFTextField name={`steps.${index}.time_minutes.ar`} placeholder={t('form.timeMinutesAr')} dir="rtl" fullWidth />
                </div>
              </Box>

              {/* Instruction */}
              <Box>
                <Typography variant="subtitle2" className="mb-1 text-xs text-muted-foreground">Instruction</Typography>
                <div className="flex flex-col gap-1">
                  <RHFTextField name={`steps.${index}.instruction.en`} placeholder={t('form.stepInstructionsEn')} fullWidth />
                  <RHFTextField name={`steps.${index}.instruction.ar`} placeholder={t('form.stepInstructionsAr')} dir="rtl" fullWidth />
                </div>
              </Box>
            </Box>
          ))}
        </Box>
      </CreateFormLayout>
    </>
  );
}

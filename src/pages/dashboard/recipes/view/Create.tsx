import type { RecipeData } from '@/pages/dashboard/recipes/types/recipe.types';
import type { CategoryData } from '@/pages/dashboard/categories/types/category.types';

import { toast } from 'react-toastify';
import { Button } from '@/shared/ui/button';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { Iconify } from '@/shared/components/iconify';
import { useParams, useNavigate, useLocation } from 'react-router';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { _ShopApi } from '@/pages/dashboard/vendor/api/shop.services';
import { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { InfiniteScrollSelect } from '@/shared/components/infinite-scroll-select';
import { _CategoryApi } from '@/pages/dashboard/categories/api/category.services';
import { _ShopProductVariantApi } from '@/shared/api/shop-product-variant.services';
import { TinyMCEEditorField } from '@/shared/components/tinymce-editor/tinymce-editor';
import { stripBilingualDescriptionForForm } from '@/utils/optional-bilingual-api-placeholder';
import { RecipeSchema, type RecipeFormValues } from '@/pages/dashboard/recipes/validation/recipe.validation';
import { useCreateRecipe, useUpdateRecipe, useFetchRecipeById } from '@/pages/dashboard/recipes/hooks/recipe';
import { resolveStorageImageUrl, shopVariantOptionImage, shopVariantOptionColorHex } from '@/utils/shop-variant-image';
import { buildCategorySelectRows, paginateSelectRowsLocal } from '@/pages/dashboard/categories/utils/build-parent-picker-options';

import { CONFIG } from 'src/global-config';
import { Box, Switch, Typography } from 'src/shared/ui';
import { LoadingScreen } from 'src/shared/components/loading-screen';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';
import { RHFBadgeSelector } from 'src/shared/components/hook-form/rhf-badge-selector';

// ----------------------------------------------------------------------

function FieldErrorText({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <Typography variant="caption" className="text-destructive mt-1 block">
      {message}
    </Typography>
  );
}

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
  const [existingImages, setExistingImages] = useState<Array<{ id: number; url: string }>>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const imagesInputRef = useRef<HTMLInputElement>(null);

  const defaultValues: RecipeFormValues = {
    name: { en: '', ar: '' },
    description: { en: '', ar: '' },
    image: null,
    images: [],
    existing_images_ids: [],
    video_url: '',
    video_title: { en: '', ar: '' },
    video_desc: { en: '', ar: '' },
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

  const { handleSubmit, reset, control, watch, setValue } = methods;

  const { data: recipeCategoriesTreeResp } = useQuery({
    queryKey: ['categories', 'recipe-form-tree'],
    queryFn: () => _CategoryApi.getListCategoriesPaginated({ page: 1, per_page: 500 }),
  });

  const recipeFilterCategoryRows = useMemo(
    () =>
      buildCategorySelectRows((recipeCategoriesTreeResp?.data?.items ?? []) as CategoryData[], {
        leading: { id: 0, label: t('form.allCategories') },
      }),
    [recipeCategoriesTreeResp?.data?.items, t]
  );

  const recipeSwitchableCategoryRows = useMemo(
    () =>
      buildCategorySelectRows((recipeCategoriesTreeResp?.data?.items ?? []) as CategoryData[], {
        leading: { id: 0, label: t('form.noSwitchableCategory') },
      }),
    [recipeCategoriesTreeResp?.data?.items, t]
  );

  const recipeFilterCategoryFetcher = useCallback(
    (page: number, limit: number) =>
      Promise.resolve(paginateSelectRowsLocal(recipeFilterCategoryRows, page, limit)),
    [recipeFilterCategoryRows]
  );

  const recipeSwitchableCategoryFetcher = useCallback(
    (page: number, limit: number) =>
      Promise.resolve(paginateSelectRowsLocal(recipeSwitchableCategoryRows, page, limit)),
    [recipeSwitchableCategoryRows]
  );

  const { fields: itemFields, append: appendItem, remove: removeItem } = useFieldArray({ control, name: 'items' });
  const { fields: stepFields, append: appendStep, remove: removeStep } = useFieldArray({ control, name: 'steps' });

  useEffect(() => {
    const source = isEditMode ? (detailsResponse?.data ?? fromState) : null;
    if (source) {
      const sourceExistingImageIds = Array.isArray(source.images)
        ? source.images.map((img: any) => Number(img.id)).filter((x) => !Number.isNaN(x))
        : [];
      reset({
        name: { en: getTranslation(source.name, 'en'), ar: getTranslation(source.name, 'ar') },
        description: {
          en: stripBilingualDescriptionForForm(getTranslation(source.description, 'en')),
          ar: stripBilingualDescriptionForForm(getTranslation(source.description, 'ar')),
        },
        image: null,
        images: [],
        existing_images_ids: sourceExistingImageIds,
        video_url: source.video_url || '',
        video_title: { en: getTranslation((source as any).video_title, 'en'), ar: getTranslation((source as any).video_title, 'ar') },
        video_desc: { en: getTranslation((source as any).video_desc, 'en'), ar: getTranslation((source as any).video_desc, 'ar') },
        discount: Number(source.discount) || 0,
        delivery_price: source.delivery_price || 0,
        serves: (source as any).serves ?? '',
        prepare_time: (source as any).prepare_time ?? '',
        badges: source.badges?.length
          ? source.badges.map((b: any) => (typeof b === 'number' ? b : b.id))
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
      if (Array.isArray(source.images)) {
        setExistingImages(
          source.images
            .filter((img: any) => img && img.id != null && img.url)
            .map((img: any) => ({ id: Number(img.id), url: String(img.url) }))
        );
      } else {
        setExistingImages([]);
      }
      setNewImagePreviews([]);
    }
  }, [detailsResponse?.data, fromState, isEditMode, reset]);

  useEffect(() => () => {
    newImagePreviews.forEach((url) => URL.revokeObjectURL(url));
  }, [newImagePreviews]);

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
        toast.success(t('form.recipeUpdatedSuccess'));
      } else {
        await createMutation.mutateAsync(payload as any);
        toast.success(t('form.recipeCreatedSuccess'));
      }
      navigate('/recipes');
    } catch (error: any) {
      console.error('Error saving recipe:', error);
    }
  };

  if (isEditMode && isLoadingDetails && !fromState) return <LoadingScreen />;

  return (
    <>
      <title>
        {isEditMode
          ? t('form.recipeEditDocumentTitle', { appName: CONFIG.appName })
          : t('form.recipeCreateDocumentTitle', { appName: CONFIG.appName })}
      </title>

      <CreateFormLayout
        methods={methods as any}
        onSubmit={handleSubmit(onSubmit as any)}
        onCancel={() => navigate('/recipes')}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        title={isEditMode ? t('form.editRecipe') : t('form.createRecipe')}
        description={isEditMode ? t('form.editRecipeDesc') : t('form.createRecipeDesc')}
        isEditMode={isEditMode}
        isLoading={isEditMode && isLoadingDetails}
        loadingText={t('form.loadingRecipe')}
        submitLabel={isEditMode ? t('form.updateRecipeSubmit') : t('form.createRecipeSubmit')}
        submittingLabel={isEditMode ? t('form.updatingRecipe') : t('form.creatingRecipe')}
      >
        {/* ── Section: Names ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-primary/[0.06] via-primary/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:chef-hat-bold" className="text-primary" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('columns.name')} & {t('columns.description')}
            </Typography>
          </Box>
          <Box className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <Box className="group">
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground flex items-center gap-1.5">
                <Iconify icon="solar:text-bold" className="text-primary" width={16} />
                {t('form.recipeNameEn')}
              </Typography>
              <RHFTextField name="name.en" placeholder={t('form.recipeNameEn')} fullWidth />
            </Box>
            <Box className="group">
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground flex items-center gap-1.5">
                <Iconify icon="solar:text-bold" className="text-primary" width={16} />
                {t('form.recipeNameAr')}
              </Typography>
              <RHFTextField name="name.ar" placeholder={t('form.recipeNameAr')} dir="rtl" fullWidth />
            </Box>

            <Box className="md:col-span-2 border-t border-border pt-5 mt-2 space-y-5">
              <Box className="group">
                <Box className="flex items-center gap-2 mb-2">
                  <Iconify icon="solar:document-bold" className="text-primary" width={20} />
                  <Typography variant="subtitle2" className="font-semibold text-foreground">
                    {t('form.productFullDescAr')}
                  </Typography>
                </Box>
                <Controller
                  name="description.ar"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <div>
                      <TinyMCEEditorField
                        value={field.value ?? ''}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        placeholder={t('form.fullDescArPlaceholder')}
                        dir="rtl"
                        menubar
                        toolsMenuWordCount
                        height={320}
                      />
                      <FieldErrorText message={error?.message} />
                    </div>
                  )}
                />
              </Box>

              <Box className="group">
                <Box className="flex items-center gap-2 mb-2">
                  <Iconify icon="solar:document-bold" className="text-primary" width={20} />
                  <Typography variant="subtitle2" className="font-semibold text-foreground">
                    {t('form.productFullDescEn')}
                  </Typography>
                </Box>
                <Controller
                  name="description.en"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <div>
                      <TinyMCEEditorField
                        value={field.value ?? ''}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        placeholder={t('form.fullDescPlaceholder')}
                        dir="ltr"
                        menubar
                        toolsMenuWordCount
                        height={320}
                      />
                      <FieldErrorText message={error?.message} />
                    </div>
                  )}
                />
              </Box>
            </Box>
          </Box>
        </Box>

        {/* ── Section: Media ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-amber-500/[0.06] via-amber-500/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:camera-add-bold" className="text-amber-500" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.recipeImageRequiredLabel')} & {t('form.videoUrl')}
            </Typography>
          </Box>
          <Box className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <Box className="group">
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">
                {t('form.recipeImageRequiredLabel')} <span className="text-destructive">*</span>
              </Typography>
              <Controller
                name="image"
                control={control}
                render={({ field: f, fieldState }) => (
                  <div className="flex flex-col gap-2">
                    {imagePreview && (
                      <div className="relative w-full h-36 rounded-xl overflow-hidden border border-border">
                        <img src={imagePreview} alt={t('form.recipePreviewAlt')} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => { setImagePreview(null); f.onChange(null); }}
                          className="absolute top-2 right-2 bg-destructive text-white rounded-full p-1 hover:bg-destructive/80"
                        >
                          <Iconify icon="solar:close-circle-bold" width={16} />
                        </button>
                      </div>
                    )}
                    {!imagePreview && (
                      <button
                        type="button"
                        onClick={() => imageInputRef.current?.click()}
                        className="w-full h-36 rounded-xl border-2 border-dashed border-border hover:border-primary/50 bg-muted/20 hover:bg-muted/40 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground"
                      >
                        <Iconify icon="solar:camera-add-bold" width={28} />
                        <span className="text-sm">{t('form.recipeClickToUploadImage')}</span>
                        <span className="text-xs">{t('form.recipeImageFormatsHint')}</span>
                      </button>
                    )}
                    {imagePreview && (
                      <button type="button" onClick={() => imageInputRef.current?.click()} className="text-xs text-primary hover:underline text-left">
                        {t('form.recipeChangeImage')}
                      </button>
                    )}
                    <input ref={imageInputRef} type="file" accept="image/*" className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) { f.onChange(file); setImagePreview(URL.createObjectURL(file)); }
                        e.target.value = '';
                      }}
                    />
                    {fieldState.error && <span className="text-xs text-destructive">{fieldState.error.message}</span>}
                  </div>
                )}
              />
            </Box>

            <Box className="group">
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground">
                {t('form.videoUrl')}
              </Typography>
              <RHFTextField name="video_url" placeholder={t('form.videoUrlPlaceholder')} fullWidth />
            </Box>

            <Box className="md:col-span-2 border-t border-border pt-5 mt-2 grid grid-cols-1 md:grid-cols-2 gap-5">
              <Box>
                <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground flex items-center gap-1.5">
                  <Iconify icon="solar:videocamera-record-bold" className="text-primary" width={16} />
                  {t('form.recipeVideoTitleEn')}
                </Typography>
                <RHFTextField name="video_title.en" placeholder={t('form.recipeVideoTitleEn')} fullWidth />
              </Box>
              <Box>
                <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground flex items-center gap-1.5">
                  <Iconify icon="solar:videocamera-record-bold" className="text-primary" width={16} />
                  {t('form.recipeVideoTitleAr')}
                </Typography>
                <RHFTextField name="video_title.ar" placeholder={t('form.recipeVideoTitleAr')} dir="rtl" fullWidth />
              </Box>
              <Box>
                <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground flex items-center gap-1.5">
                  <Iconify icon="solar:document-bold" className="text-primary" width={16} />
                  {t('form.recipeVideoDescEn')}
                </Typography>
                <RHFTextField name="video_desc.en" placeholder={t('form.recipeVideoDescEn')} fullWidth />
              </Box>
              <Box>
                <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground flex items-center gap-1.5">
                  <Iconify icon="solar:document-bold" className="text-primary" width={16} />
                  {t('form.recipeVideoDescAr')}
                </Typography>
                <RHFTextField name="video_desc.ar" placeholder={t('form.recipeVideoDescAr')} dir="rtl" fullWidth />
              </Box>
            </Box>

            <Box className="md:col-span-2 border-t border-border pt-5 mt-2">
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground flex items-center gap-1.5">
                <Iconify icon="solar:gallery-add-bold" className="text-amber-500" width={18} />
                {t('form.recipeImagesLabel')}
              </Typography>
              <Controller
                name="images"
                control={control}
                render={({ field: f, fieldState }) => {
                  const files = (Array.isArray(f.value) ? f.value : []) as File[];
                  return (
                    <div className="flex flex-col gap-3">
                      {(existingImages.length > 0 || newImagePreviews.length > 0) && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          {existingImages.map((img) => (
                            <div key={`existing-${img.id}`} className="relative h-28 rounded-xl overflow-hidden border border-border bg-muted/20">
                              <img src={img.url} alt="" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => {
                                  setExistingImages((prev) => prev.filter((x) => x.id !== img.id));
                                  const currentIds = (watch('existing_images_ids') ?? []) as number[];
                                  setValue(
                                    'existing_images_ids',
                                    currentIds.filter((imgId) => imgId !== img.id),
                                    { shouldDirty: true }
                                  );
                                }}
                                className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1 hover:bg-destructive/80"
                              >
                                <Iconify icon="solar:close-circle-bold" width={14} />
                              </button>
                            </div>
                          ))}
                          {newImagePreviews.map((src, idx) => (
                            <div key={`new-${idx}`} className="relative h-28 rounded-xl overflow-hidden border border-border bg-muted/20">
                              <img src={src} alt="" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => {
                                  URL.revokeObjectURL(src);
                                  setNewImagePreviews((prev) => prev.filter((_, i) => i !== idx));
                                  const nextFiles = files.filter((_, i) => i !== idx);
                                  f.onChange(nextFiles);
                                }}
                                className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1 hover:bg-destructive/80"
                              >
                                <Iconify icon="solar:close-circle-bold" width={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => imagesInputRef.current?.click()}
                        className="w-full h-24 rounded-xl border-2 border-dashed border-border hover:border-primary/50 bg-muted/20 hover:bg-muted/40 transition-colors flex flex-col items-center justify-center gap-1 text-muted-foreground"
                      >
                        <Iconify icon="solar:gallery-add-bold" width={22} />
                        <span className="text-sm">{t('form.recipeClickToUploadImages')}</span>
                        <span className="text-xs">{t('form.recipeImageFormatsHint')}</span>
                      </button>
                      <input
                        ref={imagesInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          const picked = Array.from(e.target.files ?? []);
                          if (picked.length) {
                            const previews = picked.map((file) => URL.createObjectURL(file));
                            setNewImagePreviews((prev) => [...prev, ...previews]);
                            f.onChange([...files, ...picked]);
                          }
                          e.target.value = '';
                        }}
                      />
                      {fieldState.error && (
                        <span className="text-xs text-destructive">{fieldState.error.message}</span>
                      )}
                    </div>
                  );
                }}
              />
            </Box>
          </Box>
        </Box>

        {/* ── Section: Details ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-violet-500/[0.06] via-violet-500/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:graph-new-bold" className="text-violet-500" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.recipeDiscountLabel')} · {t('form.deliveryPrice')} · {t('columns.servings')} · {t('columns.prepTime')}
            </Typography>
          </Box>
          <Box className="p-6 grid grid-cols-2 md:grid-cols-4 gap-5">
            <Box>
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground text-sm">{t('form.recipeDiscountLabel')}</Typography>
              <RHFTextField name="discount" type="number" placeholder={t('form.placeholderZero')} fullWidth />
            </Box>
            <Box>
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground text-sm">{t('form.deliveryPrice')}</Typography>
              <RHFTextField name="delivery_price" type="number" placeholder={t('form.placeholderZero')} fullWidth />
            </Box>
            <Box>
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground text-sm">{t('columns.servings')}</Typography>
              <RHFTextField name="serves" placeholder={t('form.servesPlaceholder')} fullWidth />
            </Box>
            <Box>
              <Typography variant="subtitle2" className="mb-2 font-semibold text-foreground text-sm">{t('columns.prepTime')}</Typography>
              <RHFTextField name="prepare_time" placeholder={t('form.prepareTimePlaceholder')} fullWidth />
            </Box>
          </Box>
        </Box>

        {/* Badges */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center gap-3 px-6 py-4 border-b border-border/40 bg-gradient-to-r from-sky-500/[0.06] via-sky-500/[0.02] to-transparent">
            <Box className="h-8 w-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
              <Iconify icon="solar:medal-ribbons-star-bold" className="text-sky-500" width={15} />
            </Box>
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.badgesLabel')}
            </Typography>
          </Box>
          <Box className="p-6">
            <RHFBadgeSelector
              name="badges"
              label={t('form.badgesLabel')}
              helperText={t('form.badgesHelperRecipe')}
            />
          </Box>
        </Box>

        {/* ── Items ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-gradient-to-r from-emerald-500/[0.06] via-emerald-500/[0.02] to-transparent">
            <Box className="flex items-center gap-3">
              <Box className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <Iconify icon="solar:cart-large-2-bold" className="text-emerald-500" width={15} />
              </Box>
              <Typography variant="subtitle2" className="font-semibold text-foreground">
                {t('form.recipeItemsSectionTitle')}
              </Typography>
            </Box>
            <Button
              type="button"
              variant="outlined"
              size="small"
              onClick={() => {
                appendItem({ shop_product_variant_id: 0, switchable_category_id: undefined, quantity: 1, is_required: true, min_quantity: 1, max_quantity: 1 });
                setItemSelects((prev) => [...prev, { categoryId: 0, shopId: 0 }]);
                setItemVariantLabels((prev) => [...prev, '']);
                setItemSwitchableLabels((prev) => [...prev, '']);
              }}
              className="text-xs"
            >
              <Iconify icon="solar:add-circle-bold" width={16} className="mr-1" />
              {t('form.recipeAddItem')}
            </Button>
          </Box>
        <Box className="p-6 flex flex-col gap-4">

          {itemFields.map((field, index) => {
            const sel = itemSelects[index] ?? { categoryId: 0, shopId: 0 };
            return (
              <Box key={field.id} className="border border-border rounded-lg p-3 mb-3 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    {t('form.recipeItemNumber', { number: index + 1 })}
                  </span>
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
                    <Typography variant="subtitle2" className="mb-1 text-xs text-muted-foreground">
                      {t('form.recipeFilterByCategory')}
                    </Typography>
                    <InfiniteScrollSelect
                      value={sel.categoryId}
                      onChange={(val) => updateItemSelect(index, 'categoryId', val)}
                      queryKey={['category', 'recipe-filter-hier', index]}
                      fetcher={recipeFilterCategoryFetcher}
                      pageSize={15}
                      placeholder={t('form.allCategories')}
                    />
                  </Box>

                  <Box className="flex-1 min-w-[150px]">
                    <Typography variant="subtitle2" className="mb-1 text-xs text-muted-foreground">
                      {t('form.recipeSelectShopRequired')} <span className="text-destructive">*</span>
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
                    {t('form.recipeProductVariantRequired')} <span className="text-destructive">*</span>
                  </Typography>
                  <Controller
                    name={`items.${index}.shop_product_variant_id`}
                    control={control}
                    render={({ field: f }) => {
                      const recipeSrc = detailsResponse?.data ?? fromState;
                      const rawLine = recipeSrc?.items?.[index] as
                        | { main_item?: { image_url?: string | null }; variant_image?: string | null }
                        | undefined;
                      const initialVariantImage = resolveStorageImageUrl(
                        rawLine?.main_item?.image_url ?? rawLine?.variant_image
                      );
                      return (
                        <InfiniteScrollSelect
                          value={f.value || 0}
                          onChange={(val) => {
                            f.onChange(val);
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
                          placeholder={
                            sel.shopId ? t('form.recipeSelectProductVariant') : t('form.recipeSelectShopFirst')
                          }
                          initialLabel={itemVariantLabels[index]}
                          initialImage={initialVariantImage}
                          getOptionImage={(item) => shopVariantOptionImage(item)}
                          getOptionColorHex={(item) => shopVariantOptionColorHex(item)}
                        />
                      );
                    }}
                  />
                </Box>

                {/* Row 3: Switchable Category */}
                <Box>
                  <Typography variant="subtitle2" className="mb-1 text-xs text-muted-foreground">
                    {t('form.recipeSwitchableCategoryOptional')}
                  </Typography>
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
                        queryKey={['category', 'recipe-switchable-hier', index]}
                        fetcher={recipeSwitchableCategoryFetcher}
                        pageSize={15}
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
                    <RHFTextField name={`items.${index}.quantity`} type="number" placeholder={t('form.placeholderOne')} fullWidth />
                  </Box>
                  <Box className="flex-1 min-w-[80px]">
                    <Typography variant="subtitle2" className="mb-1 text-xs text-muted-foreground">
                      {t('form.recipeMinQty')}
                    </Typography>
                    <RHFTextField name={`items.${index}.min_quantity`} type="number" placeholder={t('form.placeholderOne')} fullWidth />
                  </Box>
                  <Box className="flex-1 min-w-[80px]">
                    <Typography variant="subtitle2" className="mb-1 text-xs text-muted-foreground">
                      {t('form.recipeMaxQty')}
                    </Typography>
                    <RHFTextField name={`items.${index}.max_quantity`} type="number" placeholder={t('form.placeholderOne')} fullWidth />
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
                          <Typography variant="body2" className="text-xs">
                            {t('form.recipeRequiredToggle')}
                          </Typography>
                        </div>
                      )}
                    />
                  </Box>
                </div>
              </Box>
            );
          })}
        </Box>
        </Box>

        {/* ── Steps ── */}
        <Box className="rounded-2xl border border-border/50 bg-card/50 shadow-sm">
          <Box className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-gradient-to-r from-rose-500/[0.06] via-rose-500/[0.02] to-transparent">
            <Box className="flex items-center gap-3">
              <Box className="h-8 w-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                <Iconify icon="solar:list-check-bold" className="text-rose-500" width={15} />
              </Box>
              <Typography variant="subtitle2" className="font-semibold text-foreground">
                {t('form.recipeStepsSectionTitle')}
              </Typography>
            </Box>
            <Button
              type="button"
              variant="outlined"
              size="small"
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
              {t('form.recipeAddStep')}
            </Button>
          </Box>
          <Box className="p-6 flex flex-col gap-4">
            {stepFields.length === 0 && (
              <div className="text-center py-8 text-sm text-muted-foreground border border-dashed border-border/50 rounded-xl">
                {t('form.recipeStepsEmptyHint')}
              </div>
            )}

            {stepFields.map((field, index) => (
              <Box key={field.id} className="rounded-xl border border-border/50 bg-background/60 overflow-hidden">
                <Box className="flex items-center justify-between px-4 py-3 border-b border-border/40 bg-muted/30">
                  <span className="text-sm font-semibold text-foreground">
                    {t('form.recipeStepNumber', { number: index + 1 })}
                  </span>
                  <Button type="button" variant="text" onClick={() => removeStep(index)} className="text-destructive">
                    <Iconify icon="solar:trash-bin-trash-bold" width={16} />
                  </Button>
                </Box>
                <Box className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Box>
                    <Typography variant="subtitle2" className="mb-1 text-xs text-muted-foreground">{t('form.recipeHeatLevelLabel')}</Typography>
                    <div className="flex flex-col gap-1">
                      <RHFTextField name={`steps.${index}.heat_level.en`} placeholder={t('form.heatLevelEn')} fullWidth />
                      <RHFTextField name={`steps.${index}.heat_level.ar`} placeholder={t('form.heatLevelAr')} dir="rtl" fullWidth />
                    </div>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" className="mb-1 text-xs text-muted-foreground">{t('form.recipeTimeLabel')}</Typography>
                    <div className="flex flex-col gap-1">
                      <RHFTextField name={`steps.${index}.time_minutes.en`} placeholder={t('form.timeMinutesEn')} fullWidth />
                      <RHFTextField name={`steps.${index}.time_minutes.ar`} placeholder={t('form.timeMinutesAr')} dir="rtl" fullWidth />
                    </div>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" className="mb-1 text-xs text-muted-foreground">{t('form.recipeInstructionLabel')}</Typography>
                    <div className="flex flex-col gap-1">
                      <RHFTextField name={`steps.${index}.instruction.en`} placeholder={t('form.stepInstructionsEn')} fullWidth />
                      <RHFTextField name={`steps.${index}.instruction.ar`} placeholder={t('form.stepInstructionsAr')} dir="rtl" fullWidth />
                    </div>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </CreateFormLayout>
    </>
  );
}

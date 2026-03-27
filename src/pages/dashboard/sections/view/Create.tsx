import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useRef, useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import { useInfiniteManualItems } from '@/pages/dashboard/sections/hooks/useManualItems';
import {
  SectionSchema,
  type SectionFormValues,
} from '@/pages/dashboard/sections/validation/section.validation';
import {
  useCreateSection,
  useUpdateSection,
  useFetchSectionDetails,
} from '@/pages/dashboard/sections/hooks/useSections';

import { CONFIG } from 'src/global-config';
import { Box, Button, Typography } from 'src/shared/ui';
import { RHFSelect } from 'src/shared/components/hook-form/rhf-select';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';

// ----------------------------------------------------------------------

export default function CreatePage() {
  const { t } = useTranslation('table');
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const sentinelRef = useRef<HTMLDivElement>(null);

  const { data: sectionData, isLoading: isLoadingSection } = useFetchSectionDetails(id || '');
  const createSectionMutation = useCreateSection();
  const updateSectionMutation = useUpdateSection();

  const { itemTypesQuery, infiniteQuery, allItems } = useInfiniteManualItems(selectedModel || null, {
    limit: 10,
    search: searchTerm,
  });

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && infiniteQuery.hasNextPage && !infiniteQuery.isFetchingNextPage) {
          infiniteQuery.fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [infiniteQuery]);

  const defaultValues: SectionFormValues = {
    name: {
      ar: '',
      en: '',
    },
    manual_model: '',
    item_ids: [],
  };

  const methods = useForm<SectionFormValues>({
    resolver: zodResolver(SectionSchema),
    defaultValues,
  });

  const { handleSubmit, reset, watch, setValue } = methods;

  const watchedManualModel = watch('manual_model');

  useEffect(() => {
    if (watchedManualModel) {
      setSelectedModel(watchedManualModel);
    }
  }, [watchedManualModel]);

  useEffect(() => {
    if (isEditMode && sectionData?.data && !isLoadingSection) {
      const section = sectionData.data;
      const nameObj = section.admin_name || section.name;
      const nameEn = typeof nameObj === 'object' && nameObj !== null ? (nameObj as any).en || '' : String(nameObj || '');
      const nameAr = typeof nameObj === 'object' && nameObj !== null ? (nameObj as any).ar || '' : String(nameObj || '');

      const manualModel = section.manual?.manual_model || '';

      reset({
        name: {
          en: nameEn,
          ar: nameAr,
        },
        manual_model: manualModel,
        item_ids: section.items.map((item: any, index: number) => ({
          item_id: item.item?.id ?? item.id,
          link: item.link || `/item/${item.item?.id ?? item.id}`,
          order: item.order ?? index + 1,
        })),
      });
      // Set selected model directly so items list loads immediately
      if (manualModel) {
        setSelectedModel(manualModel);
      }
      // Set selected items from existing section — use the actual item id, not the pivot id
      const existingItemIds = new Set(section.items.map((item: any) => item.item?.id ?? item.id));
      setSelectedItems(existingItemIds);
    }
  }, [sectionData, isEditMode, isLoadingSection, reset]);

  const isSubmitting = createSectionMutation.isPending || updateSectionMutation.isPending;
  const errorMessage =
    createSectionMutation.error?.message || updateSectionMutation.error?.message || null;

  const onSubmit = async (data: SectionFormValues) => {
    try {
      // Convert selected items to item_ids array
      const item_ids = Array.from(selectedItems).map((itemId, index) => ({
        item_id: itemId,
        link: `/item/${itemId}`,
        order: index + 1,
      }));

      const payload = {
        name: {
          en: data.name.en,
          ar: data.name.ar,
        },
        manual_model: data.manual_model || selectedModel,
        item_ids,
      };

      if (isEditMode && id) {
        await updateSectionMutation.mutateAsync({ id, data: payload });
        toast.success(t('form.sectionUpdatedSuccess'));
        navigate('/sections');
      } else {
        await createSectionMutation.mutateAsync(payload);
        toast.success(t('form.sectionCreatedSuccess'));
        navigate('/sections');
      }
    } catch (error: any) {
      console.error('Error saving section:', error);
    }
  };

  const handleCancel = () => {
    navigate('/sections');
  };

  const handleToggleItem = (itemId: number) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (!allItems.length) return;
    setSelectedItems(new Set(allItems.map((item: any) => item.id)));
  };

  const handleClearAll = () => {
    setSelectedItems(new Set());
  };

  const itemTypeOptions = itemTypesQuery.data?.data
    ? Object.entries(itemTypesQuery.data.data)
        .filter(([_, value]) => !Array.isArray(value))
        .map(([key]) => ({
          value: key,
          label: key.charAt(0).toUpperCase() + key.slice(1).replace(/-/g, ' '),
        }))
    : [];

  // In edit mode, re-set manual_model when options load to ensure Select displays it
  useEffect(() => {
    if (isEditMode && selectedModel && itemTypeOptions.length > 0) {
      setValue('manual_model', selectedModel, { shouldValidate: true });
    }
  }, [isEditMode, selectedModel, itemTypeOptions.length, setValue]);

  const infoText = isEditMode ? t('form.sectionFormInfoEdit') : t('form.sectionFormInfoCreate');

  return (
    <>
      <title>
        {isEditMode
          ? t('form.sectionEditDocumentTitle', { appName: CONFIG.appName })
          : t('form.sectionCreateDocumentTitle', { appName: CONFIG.appName })}
      </title>

      <CreateFormLayout
        methods={methods}
        onSubmit={handleSubmit(onSubmit)}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        title={isEditMode ? t('form.editSection') : t('form.createSection')}
        description={isEditMode ? t('form.editSectionDesc') : t('form.createSectionDesc')}
        isEditMode={isEditMode}
        isLoading={isLoadingSection}
        loadingText={t('form.loadingSection')}
        maxWidth="4xl"
        infoText={infoText}
        submitLabel={isEditMode ? t('form.updateSectionSubmit') : t('form.createSectionSubmit')}
        submittingLabel={isEditMode ? t('form.updatingSection') : t('form.creatingSection')}
      >
        {/* English Name */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:text-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.sectionNameEnglishLabel')}
            </Typography>
          </Box>
          <RHFTextField
            name="name.en"
            placeholder={t('form.sectionNameEnPlaceholder')}
            helperText={t('form.sectionNameEnHelper2')}
            className="transition-all duration-200"
          />
        </Box>

        {/* Arabic Name */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:text-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.sectionNameArabicLabel')}
            </Typography>
          </Box>
          <RHFTextField
            name="name.ar"
            placeholder={t('form.sectionNameArPlaceholder')}
            helperText={t('form.sectionNameArHelper2')}
            className="transition-all duration-200"
            dir="rtl"
          />
        </Box>

        {/* Manual Model */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:widget-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              {t('form.manualModelLabel')}
            </Typography>
          </Box>
          <RHFSelect
            name="manual_model"
            options={itemTypeOptions}
            placeholder={t('form.selectModelType')}
            helperText={
              isEditMode
                ? t('form.manualModelHelperEdit')
                : t('form.manualModelHelperCreate')
            }
            className="transition-all duration-200"
            disabled={isEditMode}
          />
        </Box>

        {/* Items Selection Section */}
        {selectedModel && (
          <Box className="group">
            <Box className="flex items-center justify-between mb-2">
              <Box className="flex items-center gap-2">
                <Iconify icon="solar:checklist-bold" className="text-primary" width={24} height={24} />
                <Typography variant="subtitle2" className="font-semibold text-foreground">
                  {t('form.selectItemsHeading')}
                  {selectedItems.size > 0 && (
                    <Typography component="span" variant="body2" className="text-muted-foreground ml-2">
                      {t('form.itemsSelectedCount', { count: selectedItems.size })}
                    </Typography>
                  )}
                </Typography>
              </Box>
              <Box className="flex gap-2">
                <Button
                  type="button"
                  onClick={handleSelectAll}
                  variant="outlined"
                  size="small"
                  disabled={!allItems.length}
                >
                  {t('form.selectAllItems')}
                </Button>
                <Button
                  type="button"
                  onClick={handleClearAll}
                  variant="outlined"
                  size="small"
                  disabled={selectedItems.size === 0}
                >
                  {t('form.clearAllItems')}
                </Button>
              </Box>
            </Box>

            {/* Search Input */}
            <Box className="mb-4">
              <RHFTextField
                name="search"
                value={searchTerm}
                onChange={(e: any) => setSearchTerm(e.target.value)}
                placeholder={t('form.searchItems')}
                className="w-full"
              />
            </Box>

            {/* Loading State */}
            {infiniteQuery.isLoading && (
              <Box className="text-center p-8 border border-dashed rounded-lg">
                <Iconify
                  icon="solar:refresh-circle-bold"
                  className="w-12 h-12 text-primary mx-auto mb-2 animate-spin"
                />
                <Typography variant="body2" className="text-muted-foreground">
                  {t('form.loadingItems')}
                </Typography>
              </Box>
            )}

            {/* Error State */}
            {infiniteQuery.isError && (
              <Box className="text-center p-8 border border-destructive/50 rounded-lg bg-destructive/5">
                <Iconify icon="solar:danger-bold" className="w-12 h-12 text-destructive mx-auto mb-2" />
                <Typography variant="body2" className="text-destructive">
                  {t('form.itemsLoadError')}
                </Typography>
              </Box>
            )}

            {/* Items List */}
            {!infiniteQuery.isLoading && !infiniteQuery.isError && (
              <Box className="border rounded-lg overflow-hidden">
                {allItems.length === 0 ? (
                  <Box className="text-center p-8">
                    <Iconify
                      icon="solar:inbox-line-bold"
                      className="w-12 h-12 text-muted-foreground/50 mx-auto mb-2"
                    />
                    <Typography variant="body2" className="text-muted-foreground">
                      {t('form.noItemsFoundShort')}
                    </Typography>
                  </Box>
                ) : (
                  <Box className="divide-y divide-border">
                    {allItems.map((item: any) => {
                      const isSelected = selectedItems.has(item.id);
                      return (
                        <Box
                          key={item.id}
                          onClick={() => handleToggleItem(item.id)}
                          className={`p-4 flex items-center gap-4 cursor-pointer transition-colors hover:bg-muted/50 ${
                            isSelected ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleItem(item.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-5 h-5 rounded border-border text-primary focus:ring-primary cursor-pointer"
                          />
                          <Box className="flex-1 min-w-0">
                            <Box className="flex items-center gap-2 mb-1">
                              <Typography variant="body1" className="font-semibold text-foreground">
                                {item.name ||
                                  item.title ||
                                  t('form.itemNumberFallback', { id: item.id })}
                              </Typography>
                              <Box className="px-2 py-0.5 rounded bg-muted text-xs text-muted-foreground">
                                {t('form.itemIdBadgeShort', { id: item.id })}
                              </Box>
                            </Box>
                            {item.desc && (
                              <Typography variant="body2" className="text-muted-foreground text-sm line-clamp-1">
                                {item.desc}
                              </Typography>
                            )}
                          </Box>
                          {isSelected && (
                            <Iconify
                              icon="solar:check-circle-bold"
                              className="text-primary shrink-0"
                              width={24}
                              height={24}
                            />
                          )}
                        </Box>
                      );
                    })}
                    {/* Sentinel for infinite scroll */}
                    <div ref={sentinelRef} className="py-2 text-center">
                      {infiniteQuery.isFetchingNextPage && (
                        <Typography variant="body2" className="text-muted-foreground">
                          {t('form.loadingMoreItems')}
                        </Typography>
                      )}
                    </div>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        )}

        {/* Show message when no model is selected */}
        {!selectedModel && (
          <Box className="text-center p-8 border border-dashed rounded-lg">
            <Iconify
              icon="solar:widget-bold"
              className="w-12 h-12 text-muted-foreground/50 mx-auto mb-2"
            />
            <Typography variant="body2" className="text-muted-foreground">
              {t('form.selectManualModelFirst')}
            </Typography>
          </Box>
        )}
      </CreateFormLayout>
    </>
  );
}

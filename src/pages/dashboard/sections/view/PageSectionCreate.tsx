import type { SectionItem, FilterConfig } from '../types/page-section.types';

import { axiosInstance } from '@/api';
import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import { useForm , Controller, useFormContext } from 'react-hook-form';
import { useFetchSectionDetails } from '@/pages/dashboard/sections/hooks/useSections';
import { RHFInfiniteSelect } from '@/shared/components/hook-form/rhf-infinite-select';
import { _PageSectionApi } from '@/pages/dashboard/sections/api/page-section.services';
import {
  PageSectionSchema,
  type PageSectionFormValues,
} from '@/pages/dashboard/sections/validation/page-section.validation';
import {
  useCreatePageSection,
  useUpdatePageSection,
  useFetchPageSectionDetails,
  useFetchSectionsForDropdown,
} from '@/pages/dashboard/sections/hooks/usePageSections';

import { CONFIG } from 'src/global-config';
import { Box, Typography } from 'src/shared/ui';
import { RHFSelect } from 'src/shared/components/hook-form/rhf-select';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { RHFColorPicker } from 'src/shared/components/hook-form/rhf-color-picker';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';
import { InfiniteScrollSelect } from 'src/shared/components/infinite-scroll-select';

// ----------------------------------------------------------------------

const metadata = { title: `Page Section ${CONFIG.appName}` };

const sectionFetcher = (page: number, limit: number) =>
  _PageSectionApi.getSections(page, limit).then((r) => ({
    data: {
      items: (r.data?.items ?? []).map((s: any) => ({ id: s.id, label: s.name })),
      pagination:
        r.data?.pagination ?? { current_page: 1, last_page: 1, per_page: limit, total: 0 },
    },
  }));

const pageFetcher = async () => {
  const r = await _PageSectionApi.getPages();
  const items = (r.data ?? []).map((p: any) => ({ id: p.id, label: p.title }));
  return {
    data: {
      items,
      pagination: { current_page: 1, last_page: 1, per_page: items.length, total: items.length },
    },
  };
};


export default function CreatePage() {
  const { t } = useTranslation('table');
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  const [selectedSection, setSelectedSection] = useState<SectionItem | null>(null);
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});

  const { data: pageSectionData, isLoading: isLoadingPageSection } = useFetchPageSectionDetails(
    id || ''
  );
  const { data: sectionsData } = useFetchSectionsForDropdown();
  const createPageSectionMutation = useCreatePageSection();
  const updatePageSectionMutation = useUpdatePageSection();

  const defaultValues = {
    name: {
      ar: '',
      en: '',
    },
    section_id: '',
    page_id: '',
    display_type_id: '',
    position: 'after' as const,
    order: 1,
    background_color: '',
    background_card_color: '',
    filters: {},
  };

  const methods = useForm<PageSectionFormValues>({
    resolver: zodResolver(PageSectionSchema),
    defaultValues,
  });

  const { handleSubmit, reset, watch, setValue } = methods;

  const watchedSectionId = watch('section_id');
  const sectionIdForDetails =
    typeof watchedSectionId === 'string' ? parseInt(watchedSectionId, 10) : Number(watchedSectionId);
  const { data: sectionDetailsData } = useFetchSectionDetails(sectionIdForDetails || '');

  // Update selected section when section_id changes
  useEffect(() => {
    const sectionId =
      typeof watchedSectionId === 'string' ? parseInt(watchedSectionId, 10) : Number(watchedSectionId);
    if (!sectionId || !sectionsData?.data?.items) {
      setSelectedSection(null);
      setSelectedSectionId(null);
      return;
    }
    const section = sectionsData.data.items.find((s: SectionItem) => s.id === sectionId);
    if (section) {
      setSelectedSection(section);
      setSelectedSectionId(sectionId);
    } else {
      setSelectedSection(null);
      setSelectedSectionId(null);
    }
  }, [watchedSectionId, sectionsData]);

  useEffect(() => {
    if (isEditMode && pageSectionData?.data && !isLoadingPageSection) {
      const pageSection = pageSectionData.data;
      const ps = pageSection as any;
      const nameObj =
        typeof pageSection.name === 'object' &&
        pageSection.name &&
        !Array.isArray(pageSection.name)
          ? (pageSection.name as { en?: string; ar?: string })
          : null;
      const nameStr = typeof pageSection.name === 'string' ? pageSection.name : '';
      reset({
        name: {
          en: nameObj?.en ?? nameStr,
          ar: nameObj?.ar ?? nameStr,
        },
        section_id: ps.section_id ?? pageSection.id,
        page_id: ps.page_id ?? pageSection.id,
        display_type_id: pageSection.display_type_id,
        position: pageSection.position,
        order: pageSection.order,
        background_color: pageSection.background_color || '',
        background_card_color: pageSection.background_card_color || '',
        filters: {},
      });
    }
  }, [pageSectionData, isEditMode, isLoadingPageSection, reset]);

  const isSubmitting = createPageSectionMutation.isPending || updatePageSectionMutation.isPending;
  const errorMessage =
    createPageSectionMutation.error?.message || updatePageSectionMutation.error?.message || null;

  const onSubmit = async (data: PageSectionFormValues) => {
    // console.log(filterValues);

    try {
      const payload = {
        name: {
          en: data.name.en,
          ar: data.name.ar,
        },
        section_id:
          typeof data.section_id === 'string' ? parseInt(data.section_id) : data.section_id,
        page_id: typeof data.page_id === 'string' ? parseInt(data.page_id) : data.page_id,
        display_type_id:
          typeof data.display_type_id === 'string'
            ? parseInt(data.display_type_id)
            : data.display_type_id,
        position: data.position,
        order: typeof data.order === 'string' ? parseInt(data.order) : data.order,
        background_color: data.background_color || undefined,
        background_card_color: data.background_card_color || undefined,
        filters: Object.keys(filterValues).length > 0 ? filterValues : undefined,
      };

      if (isEditMode && id) {
        await updatePageSectionMutation.mutateAsync({ id, data: payload });
        toast.success('Page Section updated successfully');
        navigate('/sections/page-sections');
      } else {
        await createPageSectionMutation.mutateAsync(payload);
        toast.success('Page Section created successfully');
        navigate('/sections/page-sections');
      }
    } catch (error: any) {
      console.error('Error saving page section:', error);
    }
  };

  const handleCancel = () => {
    navigate('/sections/page-sections');
  };

  const handleFilterChange = (filterKey: string, value: any) => {
    setFilterValues((prev) => ({
      ...prev,
      [filterKey]: value,
    }));
  };

  const positionOptions = [
    { value: 'before', label: 'Before' },
    { value: 'after', label: 'After' },
  ];

  const infoText = isEditMode
    ? 'You can update any field. Make sure all required fields are filled.'
    : 'Fill in all required fields to create a new page section.';

  // Get filters from selected section
  const sectionFilters =
    selectedSection?.filters &&
    typeof selectedSection.filters === 'object' &&
    !Array.isArray(selectedSection.filters)
      ? (selectedSection.filters as Record<string, FilterConfig>)
      : {};

  return (
    <>
      <title>
        {isEditMode
          ? `Edit Page Section | ${metadata.title}`
          : `Create Page Section | ${metadata.title}`}
      </title>

      <CreateFormLayout
        methods={methods}
        onSubmit={handleSubmit(onSubmit, (errors) => {
          console.log('PageSection form validation errors:', errors);
        })}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        title={isEditMode ? 'Edit Page Section' : 'Create New Page Section'}
        description={
          isEditMode ? 'Update page section information' : 'Add a new page section to your system'
        }
        isEditMode={isEditMode}
        isLoading={isLoadingPageSection}
        loadingText={t('form.loadingPageSection')}
        maxWidth="4xl"
        infoText={infoText}
        submitLabel={isEditMode ? 'Update Page Section' : 'Create Page Section'}
        submittingLabel={isEditMode ? 'Updating...' : 'Creating...'}
      >
        {/* Section - First: select section to enable display types with manual_model */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:widget-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              Section
            </Typography>
          </Box>
          <RHFInfiniteSelect
            name="section_id"
            queryKey={['pageSection', 'sections', 'infinite']}
            fetcher={sectionFetcher}
            placeholder={t('form.selectSection')}
            helperText={t('form.selectSectionHelper')}
            initialLabel={
              sectionsData?.data?.items?.find(
                (s: SectionItem) =>
                  s.id === Number((pageSectionData?.data as any)?.section_id ?? 0)
              )?.name
            }
          />
        </Box>

        {/* English Name */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:text-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              Name (English)
            </Typography>
          </Box>
          <RHFTextField
            name="name.en"
            placeholder={t('form.sectionNameEnPlaceholder')}
            helperText={t('form.sectionNameEnHelper')}
            className="transition-all duration-200"
          />
        </Box>

        {/* Arabic Name */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:text-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              Name (Arabic)
            </Typography>
          </Box>
          <RHFTextField
            name="name.ar"
            placeholder={t('form.sectionNameArPlaceholder')}
            helperText={t('form.sectionNameArHelper')}
            className="transition-all duration-200"
            dir="rtl"
          />
        </Box>

        {/* Page */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:document-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              Page
            </Typography>
          </Box>
          <RHFInfiniteSelect
            name="page_id"
            queryKey={['pageSection', 'pages', 'infinite']}
            fetcher={() => pageFetcher()}
            placeholder={t('form.selectPage')}
            helperText={t('form.selectPageHelper')}
            initialLabel={
              (pageSectionData?.data as any)?.page_title ??
              (pageSectionData?.data as any)?.page?.title
            }
          />
        </Box>

        {/* Display Type - fetches with manual_model from selected section, shows as images */}
        <DisplayTypeImageSelect
          name="display_type_id"
          manualModel={
            selectedSection?.manual?.manual_model ??
            (sectionDetailsData?.data as any)?.manual?.manual_model ??
            null
          }
          selectedSection={selectedSection}
          sectionId={sectionIdForDetails || null}
          helperText={t('form.selectDisplayHelper')}
          currentDisplayTypeId={pageSectionData?.data?.display_type_id}
        />

        {/* Position */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify
              icon="solar:align-vertical-spacing-bold"
              className="text-primary"
              width={24}
              height={24}
            />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              Position
            </Typography>
          </Box>
          <RHFSelect
            name="position"
            options={positionOptions}
            placeholder={t('form.selectPosition')}
            helperText={t('form.selectPositionHelper')}
            className="transition-all duration-200"
          />
        </Box>

        {/* Order */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:sort-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              Order
            </Typography>
          </Box>
          <RHFTextField
            name="order"
            type="number"
            placeholder={t('form.displayOrderPlaceholder')}
            helperText={t('form.displayOrderHelper')}
            className="transition-all duration-200"
          />
        </Box>

        {/* Background Color */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:pallete-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              Background Color (Optional)
            </Typography>
          </Box>
          <RHFColorPicker name="background_color" helperText={t('form.bgColorHelper')} />
        </Box>

        {/* Background Card Color */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:pallete-2-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              Background Card Color (Optional)
            </Typography>
          </Box>
          <RHFColorPicker name="background_card_color" helperText={t('form.bgCardColorHelper')} />
        </Box>

        {/* Dynamic Filters Section */}
        {selectedSection && Object.keys(sectionFilters).length > 0 && (
          <Box className="col-span-2">
            <Box className="flex items-center gap-2 mb-4">
              <Iconify icon="solar:filter-bold" className="text-primary" width={24} height={24} />
              <Typography variant="h6" className="font-semibold text-foreground">
                Filters
              </Typography>
            </Box>
            <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(sectionFilters).map(([filterKey, filterConfig]) => (
                <DynamicFilterField
                  key={filterKey}
                  filterKey={filterKey}
                  filterConfig={filterConfig}
                  value={filterValues[filterKey]}
                  onChange={(value) => handleFilterChange(filterKey, value)}
                />
              ))}
            </Box>
          </Box>
        )}
      </CreateFormLayout>
    </>
  );
}

function DisplayTypeImageSelect({
  name,
  manualModel,
  selectedSection,
  sectionId,
  helperText,
  currentDisplayTypeId,
}: {
  name: string;
  manualModel?: string | null;
  selectedSection: SectionItem | null;
  sectionId?: number | null;
  helperText?: string;
  currentDisplayTypeId?: number;
}) {
  const { control } = useFormContext();
  const displayTypesQuery = useQuery({
    queryKey: ['pageSection', 'displayTypes', manualModel || ''],
    queryFn: () => _PageSectionApi.getDisplayTypes(manualModel || undefined),
    // Enable as long as a section is selected (either found in list or by id)
    enabled: !!(selectedSection || sectionId),
  });

  const displayTypes = displayTypesQuery.data?.data ?? [];

  return (
    <Box className="group">
      <Box className="flex items-center gap-2 mb-2">
        <Iconify icon="solar:gallery-bold" className="text-primary" width={24} height={24} />
        <Typography variant="subtitle2" className="font-semibold text-foreground">
          Display Type
        </Typography>
      </Box>
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState: { error } }) => (
          <Box>
            {!(selectedSection || sectionId) ? (
              <Box className="p-6 border border-dashed rounded-lg text-center">
                <Iconify
                  icon="solar:widget-bold"
                  className="w-12 h-12 text-muted-foreground/50 mx-auto mb-2"
                />
                <Typography variant="body2" className="text-muted-foreground">
                  Select a section first to load display types
                </Typography>
              </Box>
            ) : displayTypesQuery.isLoading ? (
              <Box className="flex justify-center gap-2 py-8">
                <Iconify
                  icon="solar:refresh-circle-bold"
                  className="w-8 h-8 text-primary animate-spin"
                />
                <Typography variant="body2" className="text-muted-foreground">
                  Loading display types...
                </Typography>
              </Box>
            ) : displayTypes.length === 0 ? (
              <Box className="p-6 border border-dashed rounded-lg text-center">
                <Typography variant="body2" className="text-muted-foreground">
                  No display types found for this section
                </Typography>
              </Box>
            ) : (
              <Box className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {displayTypes.map((dt: { id: number; image_url: string }) => {
                  const parsedValue = typeof field.value === 'string'
                    ? parseInt(field.value, 10)
                    : Number(field.value);
                  const isSelected = parsedValue > 0 && parsedValue === dt.id;
                  return (
                    <button
                      key={dt.id}
                      type="button"
                      onClick={() => field.onChange(dt.id)}
                      className={`relative rounded-lg border-2 overflow-hidden transition-all hover:border-primary/50 ${
                        isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                      }`}
                    >
                      <img
                        src={dt.image_url}
                        alt={`Display type ${dt.id}`}
                        className="w-full aspect-[4/3] object-cover"
                      />
                      {isSelected && (
                        <Box className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                          <Iconify
                            icon="solar:check-circle-bold"
                            className="text-primary w-8 h-8"
                          />
                        </Box>
                      )}
                    </button>
                  );
                })}
              </Box>
            )}
            {error && (
              <Typography variant="caption" className="text-destructive mt-1 block">
                {error.message}
              </Typography>
            )}
            {!error && helperText && (
              <Typography variant="caption" className="text-muted-foreground mt-1 block">
                {helperText}
              </Typography>
            )}
          </Box>
        )}
      />
    </Box>
  );
}

function DynamicFilterField({
  filterKey,
  filterConfig,
  value,
  onChange,
}: {
  filterKey: string;
  filterConfig: FilterConfig;
  value: any;
  onChange: (value: any) => void;
}) {
  const label = filterKey.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

  if (filterConfig.type === 'number') {
    return (
      <Box className="group">
        <Typography variant="subtitle2" className="font-semibold text-foreground mb-2">
          {label}
        </Typography>
        <input
          type="number"
          value={value || ''}
          onChange={(e) => onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
          className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder={`Enter ${filterKey.replace(/_/g, ' ')}`}
        />
      </Box>
    );
  }

  if (filterConfig.type === 'select' && filterConfig.url) {
    const url = filterConfig.url;
    const fetcher = (page: number, limit: number) =>
      axiosInstance.get(url, { params: { page, limit } }).then((r) => {
        const responseData = r.data?.data;
        const items = responseData?.items ?? (Array.isArray(responseData) ? responseData : []);
        const pagination = responseData?.pagination ?? {
          current_page: 1,
          last_page: 1,
          per_page: items.length,
          total: items.length,
        };
        return {
          data: {
            items: items.map((item: any) => ({
              id: item.id,
              label: item.name || item.title || `Item ${item.id}`,
            })),
            pagination,
          },
        };
      });

    return (
      <Box className="group">
        <Typography variant="subtitle2" className="font-semibold text-foreground mb-2">
          {label}
        </Typography>
        <InfiniteScrollSelect
          value={value || 0}
          onChange={(val) => onChange(val || undefined)}
          queryKey={['filter-data', url, 'infinite']}
          fetcher={fetcher}
          placeholder={`Select ${filterKey.replace(/_/g, ' ')}`}
        />
      </Box>
    );
  }

  return null;
}

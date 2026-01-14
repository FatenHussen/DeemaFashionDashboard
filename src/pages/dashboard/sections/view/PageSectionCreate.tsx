import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import {
  PageSectionSchema,
  type PageSectionFormValues,
} from '@/pages/dashboard/sections/validation/page-section.validation';
import {
  useCreatePageSection,
  useUpdatePageSection,
  useFetchPageSectionDetails,
  useFetchPages,
  useFetchDisplayTypes,
  useFetchSectionsForDropdown,
  useFetchFilterData,
} from '@/pages/dashboard/sections/hooks/usePageSections';
import type { SectionItem, FilterConfig } from '../types/page-section.types';

import { CONFIG } from 'src/global-config';
import { Box, Typography } from 'src/shared/ui';
import { RHFTextField } from 'src/shared/components/hook-form/rhf-text-field';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';
import { RHFSelect } from 'src/shared/components/hook-form/rhf-select';

// ----------------------------------------------------------------------

const metadata = { title: `Page Section ${CONFIG.appName}` };

export default function CreatePage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  const [selectedSection, setSelectedSection] = useState<SectionItem | null>(null);
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});

  const { data: pageSectionData, isLoading: isLoadingPageSection } = useFetchPageSectionDetails(
    id || ''
  );
  const { data: pagesData, isLoading: isLoadingPages } = useFetchPages();
  const { data: displayTypesData, isLoading: isLoadingDisplayTypes } = useFetchDisplayTypes();
  const { data: sectionsData, isLoading: isLoadingSections } = useFetchSectionsForDropdown();
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

  // Update selected section when section_id changes
  useEffect(() => {
    if (watchedSectionId && sectionsData?.data?.items) {
      const sectionId =
        typeof watchedSectionId === 'string' ? parseInt(watchedSectionId) : watchedSectionId;
      const section = sectionsData.data.items.find((s: SectionItem) => s.id === sectionId);
      console.log(section);

      if (section) {
        setSelectedSection(section);
        setSelectedSectionId(sectionId);
      }
    }
  }, [watchedSectionId, sectionsData]);

  useEffect(() => {
    if (isEditMode && pageSectionData?.data && !isLoadingPageSection) {
      const pageSection = pageSectionData.data;
      reset({
        name: {
          en: pageSection.name,
          ar: pageSection.name,
        },
        section_id: pageSection.id,
        page_id: pageSection.id,
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

  // Prepare options for dropdowns
  const pageOptions =
    pagesData?.data?.map((page) => ({
      value: page.id.toString(),
      label: page.title,
    })) || [];

  const displayTypeOptions =
    displayTypesData?.data?.map((type) => ({
      value: type.id,
      label: `${type.manual_model} (ID: ${type.id})`,
    })) || [];

  const sectionOptions =
    sectionsData?.data?.items?.map((section: SectionItem) => ({
      value: section.id.toString(),
      label: section.name,
    })) || [];

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
        onSubmit={handleSubmit(onSubmit)}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        title={isEditMode ? 'Edit Page Section' : 'Create New Page Section'}
        description={
          isEditMode ? 'Update page section information' : 'Add a new page section to your system'
        }
        isEditMode={isEditMode}
        isLoading={isLoadingPageSection}
        loadingText="Loading page section data..."
        maxWidth="4xl"
        infoText={infoText}
        submitLabel={isEditMode ? 'Update Page Section' : 'Create Page Section'}
        submittingLabel={isEditMode ? 'Updating...' : 'Creating...'}
      >
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
            placeholder="e.g., Featured Products"
            helperText="Enter the page section name in English"
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
            placeholder="e.g., منتجات مميزة"
            helperText="Enter the page section name in Arabic"
            className="transition-all duration-200"
            dir="rtl"
          />
        </Box>

        {/* Section */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:widget-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              Section
            </Typography>
          </Box>
          <RHFSelect
            name="section_id"
            options={sectionOptions}
            placeholder="Select a section"
            helperText="Select the section for this page section"
            className="transition-all duration-200"
            disabled={isLoadingSections}
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
          <RHFSelect
            name="page_id"
            options={pageOptions}
            placeholder="Select a page"
            helperText="Select the page for this section"
            className="transition-all duration-200"
            disabled={isLoadingPages}
          />
        </Box>

        {/* Display Type */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:gallery-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              Display Type
            </Typography>
          </Box>
          <RHFSelect
            name="display_type_id"
            options={displayTypeOptions}
            placeholder="Select a display type"
            helperText="Select how this section will be displayed"
            className="transition-all duration-200"
            disabled={isLoadingDisplayTypes}
          />
        </Box>

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
            placeholder="Select position"
            helperText="Select whether this section appears before or after"
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
            placeholder="e.g., 1"
            helperText="Enter the display order (1 = first)"
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
          <RHFTextField
            name="background_color"
            placeholder="e.g., #FF5733 or red"
            helperText="Enter a background color (optional)"
            className="transition-all duration-200"
          />
        </Box>

        {/* Background Card Color */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:pallete-2-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              Background Card Color (Optional)
            </Typography>
          </Box>
          <RHFTextField
            name="background_card_color"
            placeholder="e.g., #3498DB or blue"
            helperText="Enter a background card color (optional)"
            className="transition-all duration-200"
          />
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
  const { data: filterData, isLoading } = useFetchFilterData(
    filterConfig.type === 'select' && filterConfig.url ? filterConfig.url : null
  );

  if (filterConfig.type === 'number') {
    return (
      <Box className="group">
        <Typography variant="subtitle2" className="font-semibold text-foreground mb-2">
          {filterKey.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
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
    const options =
      filterData?.data?.items?.map((item: any) => ({
        value: item.id,
        label: item.name || item.title || `Item ${item.id}`,
      })) ||
      filterData?.data?.map((item: any) => ({
        value: item.id,
        label: item.name || item.title || `Item ${item.id}`,
      })) ||
      [];

    return (
      <Box className="group">
        <Typography variant="subtitle2" className="font-semibold text-foreground mb-2">
          {filterKey.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
        </Typography>
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value ? parseInt(e.target.value) : undefined)}
          className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={isLoading}
        >
          <option value="">Select {filterKey.replace(/_/g, ' ')}</option>
          {options.map((option: any) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </Box>
    );
  }

  return null;
}

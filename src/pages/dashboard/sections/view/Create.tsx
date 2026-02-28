import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import { useFetchManualItems } from '@/pages/dashboard/sections/hooks/useManualItems';
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

const metadata = { title: `Section ${CONFIG.appName}` };

export default function CreatePage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const { data: sectionData, isLoading: isLoadingSection } = useFetchSectionDetails(id || '');
  const createSectionMutation = useCreateSection();
  const updateSectionMutation = useUpdateSection();

  const { itemTypesQuery, itemsQuery } = useFetchManualItems(selectedModel || null, {
    page: currentPage,
    limit: 10,
    search: searchTerm,
  });

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

  const { handleSubmit, reset, watch } = methods;

  const watchedManualModel = watch('manual_model');

  useEffect(() => {
    if (watchedManualModel) {
      setSelectedModel(watchedManualModel);
    }
  }, [watchedManualModel]);

  useEffect(() => {
    if (isEditMode && sectionData?.data && !isLoadingSection) {
      const section = sectionData.data;
      reset({
        name: {
          en: section.name,
          ar: section.name,
        },
        manual_model: section.manual?.manual_model || '',
        item_ids: section.items.map((item, index) => ({
          item_id: item.id,
          link: `/item/${item.id}`,
          order: index + 1,
        })),
      });
      // Set selected items from existing section
      const existingItemIds = new Set(section.items.map((item) => item.id));
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
        manual_model: data.manual_model,
        item_ids,
      };

      if (isEditMode && id) {
        await updateSectionMutation.mutateAsync({ id, data: payload });
        toast.success('Section updated successfully');
        navigate('/sections');
      } else {
        await createSectionMutation.mutateAsync(payload);
        toast.success('Section created successfully');
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
    if (!itemsQuery.data?.data?.items) return;
    const allItemIds = itemsQuery.data.data.items.map((item: any) => item.id);
    setSelectedItems(new Set(allItemIds));
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

  const infoText = isEditMode
    ? 'You can update any field. Make sure all required fields are filled.'
    : 'Fill in all required fields to create a new section. Add items by specifying item IDs, links, and order.';

  return (
    <>
      <title>
        {isEditMode ? `Edit Section | ${metadata.title}` : `Create Section | ${metadata.title}`}
      </title>

      <CreateFormLayout
        methods={methods}
        onSubmit={handleSubmit(onSubmit)}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        title={isEditMode ? 'Edit Section' : 'Create New Section'}
        description={isEditMode ? 'Update section information' : 'Add a new section to your system'}
        isEditMode={isEditMode}
        isLoading={isLoadingSection}
        loadingText="Loading section data..."
        maxWidth="4xl"
        infoText={infoText}
        submitLabel={isEditMode ? 'Update Section' : 'Create Section'}
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
            helperText="Enter the section name in English"
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
            helperText="Enter the section name in Arabic"
            className="transition-all duration-200"
            dir="rtl"
          />
        </Box>

        {/* Manual Model */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:widget-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              Manual Model
            </Typography>
          </Box>
          <RHFSelect
            name="manual_model"
            options={itemTypeOptions}
            placeholder="Select a model type"
            helperText="Select the type of items for this section"
            className="transition-all duration-200"
          />
        </Box>

        {/* Items Selection Section */}
        {selectedModel && (
          <Box className="group">
            <Box className="flex items-center justify-between mb-2">
              <Box className="flex items-center gap-2">
                <Iconify icon="solar:checklist-bold" className="text-primary" width={24} height={24} />
                <Typography variant="subtitle2" className="font-semibold text-foreground">
                  Select Items
                  {selectedItems.size > 0 && (
                    <Typography component="span" variant="body2" className="text-muted-foreground ml-2">
                      ({selectedItems.size} selected)
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
                  disabled={!itemsQuery.data?.data?.items?.length}
                >
                  Select All
                </Button>
                <Button
                  type="button"
                  onClick={handleClearAll}
                  variant="outlined"
                  size="small"
                  disabled={selectedItems.size === 0}
                >
                  Clear All
                </Button>
              </Box>
            </Box>

            {/* Search Input */}
            <Box className="mb-4">
              <RHFTextField
                name="search"
                value={searchTerm}
                onChange={(e: any) => setSearchTerm(e.target.value)}
                placeholder="Search items..."
                className="w-full"
              />
            </Box>

            {/* Loading State */}
            {itemsQuery.isLoading && (
              <Box className="text-center p-8 border border-dashed rounded-lg">
                <Iconify
                  icon="solar:refresh-circle-bold"
                  className="w-12 h-12 text-primary mx-auto mb-2 animate-spin"
                />
                <Typography variant="body2" className="text-muted-foreground">
                  Loading items...
                </Typography>
              </Box>
            )}

            {/* Error State */}
            {itemsQuery.isError && (
              <Box className="text-center p-8 border border-destructive/50 rounded-lg bg-destructive/5">
                <Iconify icon="solar:danger-bold" className="w-12 h-12 text-destructive mx-auto mb-2" />
                <Typography variant="body2" className="text-destructive">
                  Failed to load items. Please try again.
                </Typography>
              </Box>
            )}

            {/* Items List */}
            {!itemsQuery.isLoading && !itemsQuery.isError && itemsQuery.data?.data?.items && (
              <Box className="border rounded-lg overflow-hidden">
                {itemsQuery.data.data.items.length === 0 ? (
                  <Box className="text-center p-8">
                    <Iconify
                      icon="solar:inbox-line-bold"
                      className="w-12 h-12 text-muted-foreground/50 mx-auto mb-2"
                    />
                    <Typography variant="body2" className="text-muted-foreground">
                      No items found
                    </Typography>
                  </Box>
                ) : (
                  <Box className="divide-y divide-border">
                    {itemsQuery.data.data.items.map((item: any) => {
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
                            className="w-5 h-5 rounded border-border text-primary focus:ring-primary cursor-pointer"
                          />
                          <Box className="flex-1 min-w-0">
                            <Box className="flex items-center gap-2 mb-1">
                              <Typography variant="body1" className="font-semibold text-foreground">
                                {item.name || item.title || `Item #${item.id}`}
                              </Typography>
                              <Box className="px-2 py-0.5 rounded bg-muted text-xs text-muted-foreground">
                                ID: {item.id}
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
                  </Box>
                )}

                {/* Pagination */}
                {itemsQuery.data?.data?.pagination && itemsQuery.data.data.pagination.last_page > 1 && (
                  <Box className="flex items-center justify-between p-4 bg-muted/20 border-t">
                    <Typography variant="body2" className="text-muted-foreground">
                      Page {itemsQuery.data.data.pagination.current_page} of{' '}
                      {itemsQuery.data.data.pagination.last_page}
                    </Typography>
                    <Box className="flex gap-2">
                      <Button
                        type="button"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        variant="outlined"
                        size="small"
                      >
                        Previous
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setCurrentPage((p) => p + 1)}
                        disabled={currentPage >= itemsQuery.data.data.pagination.last_page}
                        variant="outlined"
                        size="small"
                      >
                        Next
                      </Button>
                    </Box>
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
              Please select a manual model first to view and select items
            </Typography>
          </Box>
        )}
      </CreateFormLayout>
    </>
  );
}

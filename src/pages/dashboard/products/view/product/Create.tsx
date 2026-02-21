import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import {
  ProductSchema,
  type ProductFormValues,
} from '@/pages/dashboard/products/validation/product.validation';
import {
  useCreateProduct,
  useUpdateProduct,
  useFetchProductById,
} from '@/pages/dashboard/products/hooks/product';
import { useFetchCategories } from '@/pages/dashboard/categories/hooks/category';

import { Box, Typography, Input, Button } from 'src/shared/ui';
import { CONFIG } from 'src/global-config';
import { CreateFormLayout } from 'src/shared/components/forms/create-form-layout';
import { Label } from 'src/shared/components/label';
import { useFetchCategoryAttributes } from '@/pages/dashboard/categories/hooks/category-attribute';

// ----------------------------------------------------------------------

const metadata = { title: `Product ${CONFIG.appName}` };

export default function CreatePage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [previewImages, setPreviewImages] = useState<string[]>([]);

  // Fetch data
  const { data: categoriesResponse } = useFetchCategories();
  const { data: productResponse, isLoading: isLoadingProduct } = useFetchProductById(id || '');
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();

  const categories = categoriesResponse?.data.items || [];

  // console.log(categoriesResponse.data.items);

  const defaultValues: ProductFormValues = {
    category_id: 0,
    name: { en: '', ar: '' },
    description: { en: '', ar: '' },
    full_description: { en: '', ar: '' },
    country: { en: '', ar: '' },
    price: 0,
    quantity: 0,
    sku: '',
    model: '',
    barcode: '',
    time_prepare: '',
    is_instant_delivery: 0,
    images: [],
    variants: [],
    category_details: [],
    extra_details: [],
    bought_with: [],
    shop_variants: [],
  };

  const methods = useForm<ProductFormValues>({
    resolver: zodResolver(ProductSchema),
    defaultValues,
  });

  const { handleSubmit, reset, control, watch, setValue } = methods;
  const categoryId = watch('category_id');
  const imagesFiles = watch('images');

  const { data: categoryAttributesAll, isLoading: isLoadingAttributes } =
    useFetchCategoryAttributes(categoryId ? Number(categoryId) : undefined, 1, 25);

  const categoryAttributes = categoryAttributesAll?.data.items;

  // console.log('categoryAttributes', categoryAttributes.data.items);

  // Field Arrays
  const {
    fields: variantsFields,
    append: appendVariant,
    remove: removeVariant,
  } = useFieldArray({
    control,
    name: 'variants',
  });

  const {
    fields: extraDetailsFields,
    append: appendExtraDetail,
    remove: removeExtraDetail,
  } = useFieldArray({
    control,
    name: 'extra_details',
  });

  // Fetch product data if in edit mode
  useEffect(() => {
    if (isEditMode && productResponse?.data && !isLoadingProduct) {
      const product = productResponse.data;
      reset({
        category_id: Number(product.category_id),
        name: { en: product.name, ar: product.name },
        description: { en: product.description, ar: product.description },
        price: product.price,
        quantity: product.quantity || 0,
        is_instant_delivery: product.is_instant_delivery,
        sku: product.sku || '',
        model: product.model || '',
        barcode: product.barcode || '',
        time_prepare: product.time_prepare || '',
      });
    }
  }, [productResponse, isEditMode, isLoadingProduct, reset]);

  // Update preview when images change
  useEffect(() => {
    if (imagesFiles && imagesFiles.length > 0) {
      const previews: string[] = [];
      Array.from(imagesFiles).forEach((file) => {
        if (file instanceof File) {
          const reader = new FileReader();
          reader.onloadend = () => {
            previews.push(reader.result as string);
            if (previews.length === imagesFiles.length) {
              setPreviewImages(previews);
            }
          };
          reader.readAsDataURL(file);
        }
      });
    } else {
      setPreviewImages([]);
    }
  }, [imagesFiles]);

  const isSubmitting = createProductMutation.isPending || updateProductMutation.isPending;
  const errorMessage =
    createProductMutation.error?.message || updateProductMutation.error?.message || null;

  const onSubmit = async (data: ProductFormValues) => {
    try {
      if (isEditMode && id) {
        await updateProductMutation.mutateAsync({ id, data });
        toast.success('Product updated successfully');
        navigate('/products');
      } else {
        await createProductMutation.mutateAsync(data);
        toast.success('Product created successfully');
        navigate('/products');
      }
    } catch (error: any) {
      console.error('Error saving product:', error);
    }
  };

  const handleCancel = () => {
    navigate('/products');
  };

  const infoText = isEditMode
    ? 'Update product information, variants, and details.'
    : 'Create a new product with all required information.';

  return (
    <>
      <title>
        {isEditMode ? `Edit Product | ${metadata.title}` : `Create Product | ${metadata.title}`}
      </title>

      <CreateFormLayout
        methods={methods}
        onSubmit={handleSubmit(onSubmit)}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        title={isEditMode ? 'Edit Product' : 'Create New Product'}
        description={
          isEditMode ? 'Update product information and details' : 'Add a new product to your system'
        }
        isEditMode={isEditMode}
        isLoading={isLoadingProduct}
        loadingText="Loading product data..."
        maxWidth="6xl"
        infoText={infoText}
        submitLabel={isEditMode ? 'Update Product' : 'Create Product'}
        submittingLabel={isEditMode ? 'Updating...' : 'Creating...'}
      >
        {/* Category Selection */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:folder-bold" className="text-primary" width={24} height={24} />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              Category *
            </Typography>
          </Box>
          <Controller
            name="category_id"
            control={control}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <div className="w-full">
                <select
                  value={value}
                  onChange={(e) => {
                    const newValue = Number(e.target.value);
                    onChange(newValue);
                  }}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value={0}>Select Category</option>
                  {categories.map((category: any) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {error && (
                  <Typography variant="caption" className="text-destructive mt-1">
                    {error.message}
                  </Typography>
                )}
              </div>
            )}
          />
        </Box>

        {/* Basic Info - Name */}
        <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Box className="group">
            <Box className="flex items-center gap-2 mb-2">
              <Iconify icon="solar:letter-bold" className="text-primary" width={24} height={24} />
              <Typography variant="subtitle2" className="font-semibold text-foreground">
                English Name *
              </Typography>
            </Box>
            <Controller
              name="name.en"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <div>
                  <input
                    {...field}
                    type="text"
                    placeholder="e.g., iPhone 15"
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {error && (
                    <Typography variant="caption" className="text-destructive mt-1">
                      {error.message}
                    </Typography>
                  )}
                  <Typography variant="caption" className="text-muted-foreground mt-1">
                    Enter the product name in English
                  </Typography>
                </div>
              )}
            />
          </Box>

          <Box className="group">
            <Box className="flex items-center gap-2 mb-2">
              <Iconify icon="solar:letter-bold" className="text-primary" width={24} height={24} />
              <Typography variant="subtitle2" className="font-semibold text-foreground">
                Arabic Name *
              </Typography>
            </Box>
            <Controller
              name="name.ar"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <div>
                  <input
                    {...field}
                    type="text"
                    dir="rtl"
                    placeholder="e.g., ايفون 15"
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {error && (
                    <Typography variant="caption" className="text-destructive mt-1">
                      {error.message}
                    </Typography>
                  )}
                  <Typography variant="caption" className="text-muted-foreground mt-1">
                    Enter the product name in Arabic
                  </Typography>
                </div>
              )}
            />
          </Box>
        </Box>

        {/* Description */}
        <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Box className="group">
            <Box className="flex items-center gap-2 mb-2">
              <Iconify
                icon="solar:document-text-bold"
                className="text-primary"
                width={24}
                height={24}
              />
              <Typography variant="subtitle2" className="font-semibold text-foreground">
                English Description *
              </Typography>
            </Box>
            <Controller
              name="description.en"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <div>
                  <textarea
                    {...field}
                    rows={3}
                    placeholder="Product description in English"
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {error && (
                    <Typography variant="caption" className="text-destructive mt-1">
                      {error.message}
                    </Typography>
                  )}
                </div>
              )}
            />
          </Box>

          <Box className="group">
            <Box className="flex items-center gap-2 mb-2">
              <Iconify
                icon="solar:document-text-bold"
                className="text-primary"
                width={24}
                height={24}
              />
              <Typography variant="subtitle2" className="font-semibold text-foreground">
                Arabic Description *
              </Typography>
            </Box>
            <Controller
              name="description.ar"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <div>
                  <textarea
                    {...field}
                    rows={3}
                    dir="rtl"
                    placeholder="وصف المنتج بالعربية"
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {error && (
                    <Typography variant="caption" className="text-destructive mt-1">
                      {error.message}
                    </Typography>
                  )}
                </div>
              )}
            />
          </Box>
        </Box>

        {/* Price and Quantity */}
        <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Box className="group">
            <Box className="flex items-center gap-2 mb-2">
              <Iconify icon="solar:dollar-bold" className="text-primary" width={24} height={24} />
              <Typography variant="subtitle2" className="font-semibold text-foreground">
                Price *
              </Typography>
            </Box>
            <Controller
              name="price"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <div>
                  <input
                    {...field}
                    type="number"
                    placeholder="0.00"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {error && (
                    <Typography variant="caption" className="text-destructive mt-1">
                      {error.message}
                    </Typography>
                  )}
                  <Typography variant="caption" className="text-muted-foreground mt-1">
                    Product price
                  </Typography>
                </div>
              )}
            />
          </Box>

          <Box className="group">
            <Box className="flex items-center gap-2 mb-2">
              <Iconify icon="solar:box-bold" className="text-primary" width={24} height={24} />
              <Typography variant="subtitle2" className="font-semibold text-foreground">
                Quantity *
              </Typography>
            </Box>
            <Controller
              name="quantity"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <div>
                  <input
                    {...field}
                    type="number"
                    placeholder="0"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {error && (
                    <Typography variant="caption" className="text-destructive mt-1">
                      {error.message}
                    </Typography>
                  )}
                  <Typography variant="caption" className="text-muted-foreground mt-1">
                    Available quantity
                  </Typography>
                </div>
              )}
            />
          </Box>
        </Box>

        {/* SKU, Model, Barcode */}
        <Box className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Box className="group">
            <Box className="flex items-center gap-2 mb-2">
              <Iconify icon="solar:tag-bold" className="text-primary" width={24} height={24} />
              <Typography variant="subtitle2" className="font-semibold text-foreground">
                SKU
              </Typography>
            </Box>
            <Controller
              name="sku"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <div>
                  <input
                    {...field}
                    type="text"
                    placeholder="e.g., SKU-001"
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {error && (
                    <Typography variant="caption" className="text-destructive mt-1">
                      {error.message}
                    </Typography>
                  )}
                  <Typography variant="caption" className="text-muted-foreground mt-1">
                    Stock keeping unit
                  </Typography>
                </div>
              )}
            />
          </Box>

          <Box className="group">
            <Box className="flex items-center gap-2 mb-2">
              <Iconify icon="solar:widget-bold" className="text-primary" width={24} height={24} />
              <Typography variant="subtitle2" className="font-semibold text-foreground">
                Model
              </Typography>
            </Box>
            <Controller
              name="model"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <div>
                  <input
                    {...field}
                    type="text"
                    placeholder="e.g., iPhone15Pro"
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {error && (
                    <Typography variant="caption" className="text-destructive mt-1">
                      {error.message}
                    </Typography>
                  )}
                  <Typography variant="caption" className="text-muted-foreground mt-1">
                    Product model
                  </Typography>
                </div>
              )}
            />
          </Box>

          <Box className="group">
            <Box className="flex items-center gap-2 mb-2">
              <Iconify icon="solar:qr-code-bold" className="text-primary" width={24} height={24} />
              <Typography variant="subtitle2" className="font-semibold text-foreground">
                Barcode
              </Typography>
            </Box>
            <Controller
              name="barcode"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <div>
                  <input
                    {...field}
                    type="text"
                    placeholder="e.g., 123456789"
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {error && (
                    <Typography variant="caption" className="text-destructive mt-1">
                      {error.message}
                    </Typography>
                  )}
                  <Typography variant="caption" className="text-muted-foreground mt-1">
                    Product barcode
                  </Typography>
                </div>
              )}
            />
          </Box>
        </Box>

        {/* Images Upload */}
        <Box className="group">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify
              icon="solar:gallery-add-bold"
              className="text-primary"
              width={24}
              height={24}
            />
            <Typography variant="subtitle2" className="font-semibold text-foreground">
              Product Images
            </Typography>
          </Box>
          <Controller
            name="images"
            control={control}
            render={({ field: { onChange, value, ...field }, fieldState: { error } }) => (
              <div className="w-full">
                <Input
                  {...field}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = e.target.files ? Array.from(e.target.files) : [];
                    onChange(files);
                  }}
                  error={!!error}
                  helperText={error?.message || 'Upload product images (multiple files allowed)'}
                  fullWidth
                />
                {previewImages.length > 0 && (
                  <Box className="mt-4 grid grid-cols-4 gap-4">
                    {previewImages.map((preview, index) => (
                      <img
                        key={index}
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-border/60"
                      />
                    ))}
                  </Box>
                )}
              </div>
            )}
          />
        </Box>

        {/* Instant Delivery */}
        <Box className="group">
          <Controller
            name="is_instant_delivery"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={value === 1}
                  onChange={(e) => onChange(e.target.checked ? 1 : 0)}
                  className="w-4 h-4 rounded border-border"
                />
                <Typography variant="body2" className="text-foreground">
                  Instant Delivery Available
                </Typography>
              </Label>
            )}
          />
        </Box>

        {/* Category Attributes → Variants */}
        <Box className="border-t border-border pt-6">
          <Box className="flex items-center justify-between mb-4">
            <Box className="flex items-center gap-2">
              <Iconify icon="solar:settings-bold" className="text-primary" width={24} height={24} />
              <Typography variant="h6" className="font-semibold text-foreground">
                Variants (Attributes)
              </Typography>
            </Box>

            <Button
              type="button"
              variant="outlined"
              size="sm"
              disabled={!categoryId || categoryId === 0 || categoryAttributes?.length === 0}
              onClick={() =>
                appendVariant({
                  attributes_values_ids: [],
                  price: 0,
                })
              }
            >
              <Iconify icon="solar:add-circle-bold" width={18} className="mr-1" />
              Add Variant
            </Button>
          </Box>

          {!categoryId || categoryId === 0 ? (
            <Typography variant="body2" className="text-muted-foreground">
              Select a category first to load attributes.
            </Typography>
          ) : isLoadingAttributes ? (
            <Typography variant="body2" className="text-muted-foreground">
              Loading attributes...
            </Typography>
          ) : categoryAttributes.length === 0 ? (
            <Typography variant="body2" className="text-muted-foreground">
              No attributes found for this category.
            </Typography>
          ) : (
            <Box className="space-y-4">
              {variantsFields.length === 0 && (
                <Typography variant="body2" className="text-muted-foreground">
                  Add a variant, then choose values (e.g., Color + Size) and set a price.
                </Typography>
              )}

              {variantsFields.map((variant, variantIndex) => (
                <Box key={variant.id} className="p-4 border border-border rounded-lg space-y-4">
                  <Box className="flex items-center justify-between">
                    <Typography variant="subtitle2" className="font-semibold text-foreground">
                      Variant #{variantIndex + 1}
                    </Typography>

                    <Button
                      type="button"
                      variant="text"
                      size="sm"
                      onClick={() => removeVariant(variantIndex)}
                      className="text-destructive"
                    >
                      <Iconify icon="solar:trash-bin-bold" width={18} className="mr-1" />
                      Remove
                    </Button>
                  </Box>

                  {/* Attributes selects */}
                  <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {categoryAttributes.map((attr: any, attrIndex: number) => {
                      const selectedIds =
                        watch(`variants.${variantIndex}.attributes_values_ids`) || [];

                      return (
                        <Box key={attr.id} className="group">
                          <Typography variant="caption" className="text-muted-foreground mb-1">
                            {attr.name} ({attr.type})
                          </Typography>

                          <select
                            value={(() => {
                              // get selected value for this attribute (one value per attribute)
                              // since API doesn't tell which value belongs to which attribute in payload,
                              // we assume user picks one value from this attribute values[].
                              // We'll store it in attributes_values_ids array.
                              const idsSet = new Set<number>(selectedIds);
                              const found = (attr.values || []).find((v: any) =>
                                idsSet.has(Number(v.id))
                              );
                              return found ? Number(found.id) : 0;
                            })()}
                            onChange={(e) => {
                              const pickedId = Number(e.target.value);
                              const current = (watch(
                                `variants.${variantIndex}.attributes_values_ids`
                              ) || []) as number[];

                              // Remove any previously selected value belonging to the same attribute
                              const attrValueIds = new Set<number>(
                                (attr.values || []).map((v: any) => Number(v.id))
                              );
                              const filtered = current.filter(
                                (idNum) => !attrValueIds.has(Number(idNum))
                              );

                              // Add new if not 0
                              const next = pickedId ? [...filtered, pickedId] : filtered;

                              setValue(`variants.${variantIndex}.attributes_values_ids`, next, {
                                shouldValidate: true,
                                shouldDirty: true,
                              });
                            }}
                            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          >
                            <option value={0}>Select {attr.name}</option>
                            {(attr.values || []).map((val: any) => (
                              <option key={val.id} value={val.id}>
                                {val.name}
                              </option>
                            ))}
                          </select>

                          {/* Optional color preview */}
                          {attr.type === 'color' &&
                            (() => {
                              const idsSet = new Set<number>(selectedIds);
                              const found = (attr.values || []).find((v: any) =>
                                idsSet.has(Number(v.id))
                              );
                              if (!found) return null;
                              return (
                                <Box className="mt-2 flex items-center gap-2">
                                  <span
                                    className="inline-block w-5 h-5 rounded border border-border"
                                    style={{ background: String(found.name) }}
                                  />
                                  <Typography variant="caption" className="text-muted-foreground">
                                    {found.name}
                                  </Typography>
                                </Box>
                              );
                            })()}
                        </Box>
                      );
                    })}
                  </Box>

                  {/* Variant Price */}
                  <Box className="group">
                    <Typography variant="caption" className="text-muted-foreground mb-1">
                      Variant Price
                    </Typography>

                    <Controller
                      name={`variants.${variantIndex}.price`}
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <div>
                          <input
                            {...field}
                            type="number"
                            placeholder="0.00"
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                          {error && (
                            <Typography variant="caption" className="text-destructive mt-1">
                              {error.message}
                            </Typography>
                          )}
                        </div>
                      )}
                    />
                  </Box>

                  {/* Debug view (optional) */}
                  <Typography variant="caption" className="text-muted-foreground">
                    Selected Value IDs:{' '}
                    {JSON.stringify(watch(`variants.${variantIndex}.attributes_values_ids`) || [])}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </Box>

        {/* Extra Details Section */}
        <Box className="border-t border-border pt-6">
          <Box className="flex items-center justify-between mb-4">
            <Box className="flex items-center gap-2">
              <Iconify
                icon="solar:add-circle-bold"
                className="text-primary"
                width={24}
                height={24}
              />
              <Typography variant="h6" className="font-semibold text-foreground">
                Extra Details (Optional)
              </Typography>
            </Box>
            <Button
              type="button"
              variant="outlined"
              size="sm"
              onClick={() =>
                appendExtraDetail({
                  detail_key: { en: '', ar: '' },
                  detail_value: { en: '', ar: '' },
                })
              }
            >
              <Iconify icon="solar:add-circle-bold" width={18} className="mr-1" />
              Add Detail
            </Button>
          </Box>

          {extraDetailsFields.map((field, index) => (
            <Box
              key={field.id}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 border border-border rounded-lg"
            >
              <Box>
                <Typography variant="caption" className="text-muted-foreground mb-1">
                  Key (EN)
                </Typography>
                <Controller
                  name={`extra_details.${index}.detail_key.en`}
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      placeholder="e.g., Warranty"
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                    />
                  )}
                />
              </Box>
              <Box>
                <Typography variant="caption" className="text-muted-foreground mb-1">
                  Key (AR)
                </Typography>
                <Controller
                  name={`extra_details.${index}.detail_key.ar`}
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      dir="rtl"
                      placeholder="e.g., الضمان"
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                    />
                  )}
                />
              </Box>
              <Box>
                <Typography variant="caption" className="text-muted-foreground mb-1">
                  Value (EN)
                </Typography>
                <Controller
                  name={`extra_details.${index}.detail_value.en`}
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      placeholder="e.g., 1 Year"
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                    />
                  )}
                />
              </Box>
              <Box>
                <Typography variant="caption" className="text-muted-foreground mb-1">
                  Value (AR)
                </Typography>
                <Controller
                  name={`extra_details.${index}.detail_value.ar`}
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      dir="rtl"
                      placeholder="e.g., سنة واحدة"
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                    />
                  )}
                />
              </Box>
              <Box className="col-span-2 flex justify-end">
                <Button
                  type="button"
                  variant="text"
                  size="sm"
                  onClick={() => removeExtraDetail(index)}
                  className="text-destructive"
                >
                  <Iconify icon="solar:trash-bin-bold" width={18} className="mr-1" />
                  Remove
                </Button>
              </Box>
            </Box>
          ))}
        </Box>
      </CreateFormLayout>
    </>
  );
}

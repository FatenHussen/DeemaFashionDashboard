import { useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { usePermissions } from '@/auth/hooks/use-permissions';
import { recipeColumns, type RecipeFormValues } from '@/columns/one/recipes/one';
import { useFetchRecipes, useDeleteRecipe } from '@/pages/dashboard/recipes/hooks/recipe';

import { CONFIG } from 'src/global-config';

const metadata = { title: `Recipes | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  const { t } = useTranslation('table');
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data: response, isLoading, error } = useFetchRecipes(currentPage, pageSize);
  const deleteMutation = useDeleteRecipe();

  if (error) console.error('Error fetching recipes:', error);

  const onDelete = (id: number) => setDeletingId(id);
  const onDeleteConfirm = async () => {
    if (deletingId) {
      try {
        await deleteMutation.mutateAsync(deletingId);
        toast.success(t('deleteSuccess') || 'Recipe deleted successfully');
        setDeletingId(null);
      } catch { return; }
    }
  };
  const onDeleteCancel = () => setDeletingId(null);
  const handleEdit = (row: { original: RecipeFormValues }) => {
    navigate(`/recipes/update/${row.original.id}`, { state: { recipe: row.original } });
  };

  const items: RecipeFormValues[] = response?.data?.items || [];
  const apiPagination = response?.data?.pagination;
  const pagination = apiPagination
    ? { current_page: apiPagination.current_page, last_page: apiPagination.last_page, per_page: apiPagination.per_page, total: apiPagination.total, from: (apiPagination.current_page - 1) * apiPagination.per_page + 1, to: Math.min(apiPagination.current_page * apiPagination.per_page, apiPagination.total) }
    : { current_page: 1, last_page: 1, per_page: 10, total: 0, from: 0, to: 0 };

  const { can } = usePermissions();
  const hasPermission = (action: string, resource: string) => can(`${resource}.${action}`);

  return (
    <>
      <title>{metadata.title}</title>
      <DataTable
        tableName="Recipe"
        columns={recipeColumns(
          { update: hasPermission('update', 'recipe'), delete: hasPermission('delete', 'recipe') },
          t, onDelete, deleteMutation.isPending, deletingId !== null, onDeleteConfirm, onDeleteCancel, deletingId, handleEdit
        )}
        data={items}
        createPath="/recipes/create"
        hasDetails
        detailsLink="/recipes/details"
        permissions={{ create: hasPermission('create', 'recipe'), update: hasPermission('update', 'recipe'), delete: hasPermission('delete', 'recipe') }}
        isLoading={isLoading}
        columnTranslations={{ id: 'ID', name: 'Name', prep_time: 'Prep', cook_time: 'Cook', servings: 'Servings', is_active: 'Status', actions: 'Actions' }}
        pagination={pagination}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={(page: number) => setCurrentPage(page)}
        onPageSizeChange={(size: number) => { setPageSize(size); setCurrentPage(1); }}
      />
    </>
  );
}

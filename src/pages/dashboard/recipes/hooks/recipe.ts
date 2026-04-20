import type { RecipeCreateUpdatePayload } from '../types/recipe.types';

import { queryKeys } from '@/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { _RecipeApi } from '../api/recipe.services';

export const useFetchRecipes = (page: number = 1, perPage: number = 10, search?: string) =>
  useQuery({
    queryKey: queryKeys.recipe.list({ page, per_page: perPage, search }),
    queryFn: () => _RecipeApi.getListRecipes({ page, per_page: perPage, search }),
  });

export const useFetchRecipeById = (id: number | string) =>
  useQuery({
    queryKey: queryKeys.recipe.details(id),
    queryFn: () => _RecipeApi.getRecipeById(id),
    enabled: !!id,
  });

export const useCreateRecipe = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RecipeCreateUpdatePayload) => _RecipeApi.createRecipe(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['recipe', 'list'] }); },
  });
};

export const useUpdateRecipe = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: RecipeCreateUpdatePayload }) =>
      _RecipeApi.updateRecipe(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['recipe', 'list'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.recipe.details(variables.id) });
    },
  });
};

export const useDeleteRecipe = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => _RecipeApi.deleteRecipe(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['recipe', 'list'] }); },
  });
};

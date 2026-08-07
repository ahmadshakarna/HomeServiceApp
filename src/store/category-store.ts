import { create } from "zustand";

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  sortOrder: number;
  isActive: boolean;
  servicesCount: number;
  createdAt: string;
  updatedAt: string;
};

type CategoriesResponse = {
  categories: Category[];
};

type CategoryStore = {
  categories: Category[];
  isLoading: boolean;
  error: string | null;

  loadCategories: () => Promise<void>;
};

export const useCategoryStore = create<CategoryStore>((set) => ({
  categories: [],
  isLoading: false,
  error: null,

  loadCategories: async () => {
    set({
      isLoading: true,
      error: null,
    });

    try {
      const response = await fetch("/api/categories");

      const text = await response.text();

      if (!response.ok) {
        throw new Error(
          `Failed to load categories (${response.status})`
        );
      }

      const data = JSON.parse(text) as CategoriesResponse;

      set({
        categories: data.categories,
      });
    } catch (error) {
      console.error("LOAD CATEGORIES ERROR:", error);

      set({
        error: "Failed to load categories",
      });
    } finally {
      set({
        isLoading: false,
      });
    }
  },
}));
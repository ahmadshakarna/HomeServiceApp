import { create } from "zustand";

export type Service = {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ServiceCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type CategoryServicesResponse = {
  category: ServiceCategory;
  services: Service[];
};

type ServiceStore = {
  category: ServiceCategory | null;
  services: Service[];
  isLoading: boolean;
  error: string | null;

  loadCategoryServices: (
    categoryId: string
  ) => Promise<void>;

  clearCategoryServices: () => void;
};

export const useServiceStore = create<ServiceStore>(
  (set) => ({
    category: null,
    services: [],
    isLoading: false,
    error: null,

    loadCategoryServices: async (categoryId) => {
      set({
        isLoading: true,
        error: null,
      });

      try {
        const response = await fetch(
          `/api/categories/${categoryId}/services`
        );

        const text = await response.text();

        if (!response.ok) {
          throw new Error(
            `Failed to load services (${response.status})`
          );
        }

        const data = JSON.parse(
          text
        ) as CategoryServicesResponse;

        set({
          category: data.category,
          services: data.services,
        });
      } catch (error) {
        console.error(
          "LOAD CATEGORY SERVICES ERROR:",
          error
        );

        set({
          error: "Failed to load services",
        });
      } finally {
        set({
          isLoading: false,
        });
      }
    },

    clearCategoryServices: () => {
      set({
        category: null,
        services: [],
        error: null,
      });
    },
  })
);
import { create } from "zustand";

export type ServiceDetails = {
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
  icon: string | null;
};

type ServiceDetailsResponse = {
  service: ServiceDetails;
  category: ServiceCategory;
};

type ServiceDetailsStore = {
  service: ServiceDetails | null;
  category: ServiceCategory | null;

  isLoading: boolean;
  error: string | null;

  loadService: (serviceId: string) => Promise<void>;
  clearService: () => void;
};

export const useServiceDetailsStore =
  create<ServiceDetailsStore>((set) => ({
    service: null,
    category: null,

    isLoading: false,
    error: null,

    loadService: async (serviceId) => {
      set({
        isLoading: true,
        error: null,
      });

      try {
        const response = await fetch(
          `/api/services/${serviceId}`
        );

        const text = await response.text();

        if (!response.ok) {
          throw new Error(
            `Failed to load service (${response.status})`
          );
        }

        const data = JSON.parse(
          text
        ) as ServiceDetailsResponse;

        set({
          service: data.service,
          category: data.category,
        });
      } catch (error) {
        console.error(
          "LOAD SERVICE DETAILS ERROR:",
          error
        );

        set({
          error: "Failed to load service details",
        });
      } finally {
        set({
          isLoading: false,
        });
      }
    },

    clearService: () => {
      set({
        service: null,
        category: null,
        error: null,
      });
    },
  }));
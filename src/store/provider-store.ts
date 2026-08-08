import { create } from "zustand";

export type Provider = {
  id: string;
  fullName: string;
  phone: string | null;
  email: string | null;
  profileImage: string | null;
  bio: string | null;
  city: string | null;
  experienceYears: number;
  isVerified: boolean;
};

export type ServiceProvider = {
  providerServiceId: string;
  priceAgorot: number;
  provider: Provider;
};

type ProvidersResponse = {
  providers: ServiceProvider[];
};

type ProviderStore = {
  providers: ServiceProvider[];

  isLoading: boolean;
  error: string | null;

  loadProviders: (
    serviceId: string
  ) => Promise<void>;

  clearProviders: () => void;
};

export const useProviderStore =
  create<ProviderStore>((set) => ({
    providers: [],

    isLoading: false,
    error: null,

    loadProviders: async (serviceId) => {
      set({
        isLoading: true,
        error: null,
      });

      try {
        const response = await fetch(
          `/api/services/${serviceId}/providers`
        );

        if (!response.ok) {
          throw new Error(
            `Failed to load providers (${response.status})`
          );
        }

        const data =
          (await response.json()) as ProvidersResponse;

        set({
          providers: data.providers,
        });
      } catch (error) {
        console.error(
          "LOAD PROVIDERS ERROR:",
          error
        );

        set({
          providers: [],
          error:
            "Failed to load service providers",
        });
      } finally {
        set({
          isLoading: false,
        });
      }
    },

    clearProviders: () => {
      set({
        providers: [],
        error: null,
      });
    },
  }));
import { create } from "zustand";

export type ProviderDetails = {
  id: string;
  clerkUserId: string | null;
  fullName: string;
  phone: string | null;
  email: string | null;
  profileImage: string | null;
  bio: string | null;
  city: string | null;
  experienceYears: number;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ProviderService = {
  providerServiceId: string;
  priceAgorot: number;

  service: {
    id: string;
    categoryId: string;
    name: string;
    slug: string;
    description: string | null;
    icon: string | null;
  };
};

type ProviderDetailsResponse = {
  provider: ProviderDetails;
  services: ProviderService[];
  availability: ProviderAvailability[];
};

type ProviderDetailsStore = {
  provider: ProviderDetails | null;
  services: ProviderService[];
  availability: ProviderAvailability[];

  isLoading: boolean;
  error: string | null;

  loadProvider: (
    providerId: string
  ) => Promise<void>;

  clearProvider: () => void;
};

export type ProviderAvailability = {
  id: string;
  dayOfWeek: number;
  startTime: string | null;
  endTime: string | null;
  isAvailable: boolean;
};

export const useProviderDetailsStore =
  create<ProviderDetailsStore>((set) => ({
    provider: null,
    services: [],
    availability: [],

    isLoading: false,
    error: null,

    loadProvider: async (providerId) => {
      set({
        isLoading: true,
        error: null,
      });

      try {
        const response = await fetch(
          `/api/providers/${providerId}`
        );

        if (!response.ok) {
          throw new Error(
            `Failed to load provider (${response.status})`
          );
        }

        const data =
          (await response.json()) as ProviderDetailsResponse;

        set({
          provider: data.provider,
          services: data.services,
          availability: data.availability,
        });
      } catch (error) {
        console.error(
          "LOAD PROVIDER ERROR:",
          error
        );

        set({
          provider: null,
          services: [],
          availability: [],
          error:
            "Failed to load provider details",
        });
      } finally {
        set({
          isLoading: false,
        });
      }
    },

    clearProvider: () => {
      set({
        provider: null,
        services: [],
        availability: [],
        error: null,
      });
    },
  }));
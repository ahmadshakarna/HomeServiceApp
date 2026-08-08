import { create } from "zustand";

export type CustomerBooking = {
  booking: {
    id: string;
    customerId: string;

    providerId: string;
    serviceId: string;

    priceAgorot: number;

    bookingDate: string;
    startTime: string;

    address: string;
    notes: string | null;

    status: string;

    createdAt: string;
  };

  service: {
    id: string;
    name: string;
    icon: string | null;
  };

  category: {
    id: string;
    name: string;
  };

  provider: {
    id: string;
    fullName: string;
    city: string | null;
    isVerified: boolean;
  };
};

type BookingStore = {
  bookings: CustomerBooking[];

  isLoading: boolean;
  error: string | null;

  loadBookings: (
    customerId: string
  ) => Promise<void>;

  clearBookings: () => void;
};

export const useBookingStore =
  create<BookingStore>((set) => ({
    bookings: [],

    isLoading: false,
    error: null,

    loadBookings: async (
      customerId
    ) => {
      set({
        isLoading: true,
        error: null,
      });

      try {
        const response =
          await fetch(
            `/api/bookings?customerId=${encodeURIComponent(
              customerId
            )}`
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Failed to load bookings"
          );
        }

        set({
          bookings:
            data.bookings,
        });
      } catch (error) {
        console.error(
          "LOAD BOOKINGS ERROR:",
          error
        );

        set({
          bookings: [],

          error:
            error instanceof Error
              ? error.message
              : "Failed to load bookings",
        });
      } finally {
        set({
          isLoading: false,
        });
      }
    },

    clearBookings: () => {
      set({
        bookings: [],
        error: null,
      });
    },
  }));
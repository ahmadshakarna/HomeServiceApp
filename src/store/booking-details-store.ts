import {
  CustomerBooking,
} from "./booking-store";

import { create } from "zustand";

type BookingDetailsStore = {
  booking: CustomerBooking | null;

  isLoading: boolean;
  isCancelling: boolean;

  error: string | null;

  loadBooking: (
    bookingId: string,
    customerId: string
  ) => Promise<void>;

  cancelBooking: (
    bookingId: string,
    customerId: string
  ) => Promise<boolean>;

  clearBooking: () => void;
};

export const useBookingDetailsStore =
  create<BookingDetailsStore>(
    (set) => ({
      booking: null,

      isLoading: false,
      isCancelling: false,

      error: null,

      loadBooking: async (
        bookingId,
        customerId
      ) => {
        set({
          isLoading: true,
          error: null,
        });

        try {
          const response =
            await fetch(
              `/api/bookings/${bookingId}?customerId=${encodeURIComponent(
                customerId
              )}`
            );

          const data =
            await response.json();

          if (!response.ok) {
            throw new Error(
              data.error ||
                "Failed to load booking"
            );
          }

          set({
            booking:
              data.booking,
          });
        } catch (error) {
          set({
            booking: null,

            error:
              error instanceof Error
                ? error.message
                : "Failed to load booking",
          });
        } finally {
          set({
            isLoading: false,
          });
        }
      },

      cancelBooking: async (
        bookingId,
        customerId
      ) => {
        set({
          isCancelling: true,
          error: null,
        });

        try {
          const response =
            await fetch(
              `/api/bookings/${bookingId}`,
              {
                method: "PATCH",

                headers: {
                  "Content-Type":
                    "application/json",
                },

                body: JSON.stringify({
                  customerId,
                  action: "cancel",
                }),
              }
            );

          const data =
            await response.json();

          if (!response.ok) {
            throw new Error(
              data.error ||
                "Failed to cancel booking"
            );
          }

          set((state) => ({
            booking:
              state.booking
                ? {
                    ...state.booking,

                    booking: {
                      ...state.booking
                        .booking,

                      status:
                        "cancelled",
                    },
                  }
                : null,
          }));

          return true;
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to cancel booking",
          });

          return false;
        } finally {
          set({
            isCancelling: false,
          });
        }
      },

      clearBooking: () => {
        set({
          booking: null,
          error: null,
        });
      },
    })
  );
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
    updatedAt?: string;
  };

  service: {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    icon: string | null;
  };

  category: {
    id: string;
    name: string;
    slug: string;
  };

  provider: {
    id: string;
    fullName: string;
    phone?: string | null;
    city: string | null;
    isVerified: boolean;
  };
};


type BookingStore = {
  bookings: CustomerBooking[];

  isLoading: boolean;
  error: string | null;

  loadBookings: (
    token: string
  ) => Promise<void>;

  clearBookings: () => void;
};


export const useBookingStore =
  create<BookingStore>(
    (set) => ({
      bookings: [],

      isLoading: false,
      error: null,


      // ========================================
      // LOAD MY BOOKINGS
      // ========================================

      loadBookings: async (
        token
      ) => {
        set({
          isLoading: true,
          error: null,
        });


        try {
          if (!token) {
            throw new Error(
              "Authentication required"
            );
          }


          const response =
            await fetch(
              "/api/bookings",
              {
                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
              }
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
              Array.isArray(
                data.bookings
              )
                ? data.bookings
                : [],
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
    })
  );
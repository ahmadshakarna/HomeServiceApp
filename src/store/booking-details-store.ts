import {
  CustomerBooking,
} from "./booking-store";

import { create } from "zustand";


type BookingDetailsStore = {
  booking:
    CustomerBooking | null;

  isLoading:
    boolean;

  isCancelling:
    boolean;

  error:
    string | null;


  loadBooking: (
    bookingId: string,
    token: string
  ) => Promise<void>;


  cancelBooking: (
    bookingId: string,
    token: string
  ) => Promise<boolean>;


  clearBooking:
    () => void;
};


export const useBookingDetailsStore =
  create<BookingDetailsStore>(
    (set) => ({
      booking:
        null,

      isLoading:
        false,

      isCancelling:
        false,

      error:
        null,


      // ========================================
      // LOAD BOOKING DETAILS
      // ========================================

      loadBooking:
        async (
          bookingId,
          token
        ) => {
          set({
            isLoading:
              true,

            error:
              null,
          });


          try {
            if (
              !bookingId ||
              !token
            ) {
              throw new Error(
                "Authentication required"
              );
            }


            const response =
              await fetch(
                `/api/bookings/${bookingId}`,
                {
                  headers: {
                    Authorization:
                      `Bearer ${token}`,
                  },
                }
              );


            const data =
              await response.json();


            if (
              !response.ok
            ) {
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
            console.error(
              "LOAD BOOKING DETAILS ERROR:",
              error
            );


            set({
              booking:
                null,

              error:
                error instanceof Error
                  ? error.message
                  : "Failed to load booking",
            });

          } finally {
            set({
              isLoading:
                false,
            });
          }
        },


      // ========================================
      // CANCEL BOOKING
      // ========================================

      cancelBooking:
        async (
          bookingId,
          token
        ) => {
          set({
            isCancelling:
              true,

            error:
              null,
          });


          try {
            if (
              !bookingId ||
              !token
            ) {
              throw new Error(
                "Authentication required"
              );
            }


            const response =
              await fetch(
                `/api/bookings/${bookingId}`,
                {
                  method:
                    "PATCH",

                  headers: {
                    "Content-Type":
                      "application/json",

                    Authorization:
                      `Bearer ${token}`,
                  },

                  body:
                    JSON.stringify({
                      action:
                        "cancel",
                    }),
                }
              );


            const data =
              await response.json();


            if (
              !response.ok
            ) {
              throw new Error(
                data.error ||
                  "Failed to cancel booking"
              );
            }


            set(
              (state) => ({
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
              })
            );


            return true;

          } catch (error) {
            console.error(
              "CANCEL BOOKING ERROR:",
              error
            );


            set({
              error:
                error instanceof Error
                  ? error.message
                  : "Failed to cancel booking",
            });


            return false;

          } finally {
            set({
              isCancelling:
                false,
            });
          }
        },


      clearBooking:
        () => {
          set({
            booking:
              null,

            error:
              null,
          });
        },
    })
  );
import { useBookingDetailsStore } from "@/store/booking-details-store";
import { useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import React, {
  useEffect,
} from "react";

import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

export default function BookingDetailsScreen() {
  const { user } = useUser();

  const params =
    useLocalSearchParams<{
      id: string | string[];
    }>();

  const bookingId =
    Array.isArray(params.id)
      ? params.id[0]
      : params.id;

  const booking =
    useBookingDetailsStore(
      (state) => state.booking
    );

  const isLoading =
    useBookingDetailsStore(
      (state) => state.isLoading
    );

  const isCancelling =
    useBookingDetailsStore(
      (state) =>
        state.isCancelling
    );

  const error =
    useBookingDetailsStore(
      (state) => state.error
    );

  const loadBooking =
    useBookingDetailsStore(
      (state) =>
        state.loadBooking
    );

  const cancelBooking =
    useBookingDetailsStore(
      (state) =>
        state.cancelBooking
    );

  const clearBooking =
    useBookingDetailsStore(
      (state) =>
        state.clearBooking
    );

  useEffect(() => {
    if (
      !bookingId ||
      !user?.id
    ) {
      return;
    }

    loadBooking(
      bookingId,
      user.id
    );

    return () => {
      clearBooking();
    };
  }, [
    bookingId,
    user?.id,
    loadBooking,
    clearBooking,
  ]);

  const formatTime = (
    time: string
  ) => time.slice(0, 5);

  const canCancel =
    booking?.booking.status ===
      "pending" ||
    booking?.booking.status ===
      "confirmed";

  const handleCancel = () => {
    if (
      !bookingId ||
      !user?.id
    ) {
      return;
    }

    Alert.alert(
      "Cancel Booking",
      "Are you sure you want to cancel this booking?",
      [
        {
          text: "Keep Booking",
          style: "cancel",
        },

        {
          text: "Cancel Booking",
          style: "destructive",

          onPress: async () => {
            await cancelBooking(
              bookingId,
              user.id
            );
          },
        },
      ]
    );
  };

  if (
    isLoading &&
    !booking
  ) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#F8FAFC]">
        <ActivityIndicator
          size="large"
          color="#2563EB"
        />
      </SafeAreaView>
    );
  }

  if (
    error &&
    !booking
  ) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#F8FAFC] px-5">

        <Ionicons
          name="alert-circle-outline"
          size={50}
          color="#EF4444"
        />

        <Text className="mt-4 text-lg font-bold">
          Couldn't load booking
        </Text>

        <Text className="mt-2 text-center text-[#64748B]">
          {error}
        </Text>

      </SafeAreaView>
    );
  }

  if (!booking) {
    return null;
  }

  const price =
    booking.booking
      .priceAgorot / 100;

  return (
    <SafeAreaView
      className="flex-1 bg-[#F8FAFC]"
      edges={["top"]}
    >
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 50,
        }}
      >
        {/* Header */}

        <View className="mt-3 flex-row items-center">

          <Pressable
            onPress={() =>
              router.back()
            }
            className="h-11 w-11 items-center justify-center rounded-full bg-white"
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color="#0F172A"
            />
          </Pressable>

          <Text className="ml-4 text-xl font-bold text-[#0F172A]">
            Booking Details
          </Text>

        </View>

        {/* Status */}

        <View className="mt-6 rounded-2xl bg-white p-5">

          <Text className="text-xs font-semibold uppercase text-[#94A3B8]">
            Booking Status
          </Text>

          <View className="mt-2 flex-row items-center">

            <Ionicons
              name={
                booking.booking
                  .status ===
                "cancelled"
                  ? "close-circle"
                  : "time"
              }
              size={22}
              color={
                booking.booking
                  .status ===
                "cancelled"
                  ? "#EF4444"
                  : "#F59E0B"
              }
            />

            <Text className="ml-2 text-lg font-bold capitalize text-[#0F172A]">
              {booking.booking.status.replace(
                "_",
                " "
              )}
            </Text>

          </View>

        </View>

        {/* Service */}

        <View className="mt-5 rounded-2xl bg-white p-5">

          <View className="flex-row items-center">

            <View className="h-14 w-14 items-center justify-center rounded-xl bg-[#EFF6FF]">

              <Ionicons
                name={
                  (booking.service
                    .icon ||
                    "construct-outline") as keyof typeof Ionicons.glyphMap
                }
                size={27}
                color="#2563EB"
              />

            </View>

            <View className="ml-4 flex-1">

              <Text className="text-lg font-bold text-[#0F172A]">
                {
                  booking.service
                    .name
                }
              </Text>

              <Text className="mt-1 text-sm text-[#64748B]">
                {
                  booking.category
                    .name
                }
              </Text>

            </View>

            <Text className="text-xl font-bold text-[#2563EB]">
              {price} ₪
            </Text>

          </View>

        </View>

        {/* Provider */}

        <View className="mt-5 rounded-2xl bg-white p-5">

          <Text className="text-sm font-bold text-[#0F172A]">
            Service Provider
          </Text>

          <View className="mt-4 flex-row items-center">

            <View className="h-12 w-12 items-center justify-center rounded-full bg-[#EFF6FF]">

              <Ionicons
                name="person"
                size={23}
                color="#2563EB"
              />

            </View>

            <View className="ml-3">

              <View className="flex-row items-center">

                <Text className="font-bold text-[#0F172A]">
                  {
                    booking.provider
                      .fullName
                  }
                </Text>

                {booking.provider
                  .isVerified ? (
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color="#2563EB"
                    style={{
                      marginLeft: 5,
                    }}
                  />
                ) : null}

              </View>

              <Text className="mt-1 text-sm text-[#64748B]">
                {
                  booking.provider
                    .city
                }
              </Text>

            </View>

          </View>

        </View>

        {/* Appointment */}

        <View className="mt-5 rounded-2xl bg-white p-5">

          <Text className="font-bold text-[#0F172A]">
            Appointment
          </Text>

          <View className="mt-4 flex-row items-center">

            <Ionicons
              name="calendar-outline"
              size={20}
              color="#2563EB"
            />

            <Text className="ml-3 text-[#475569]">
              {
                booking.booking
                  .bookingDate
              }
            </Text>

          </View>

          <View className="mt-4 flex-row items-center">

            <Ionicons
              name="time-outline"
              size={20}
              color="#2563EB"
            />

            <Text className="ml-3 text-[#475569]">
              {formatTime(
                booking.booking
                  .startTime
              )}
            </Text>

          </View>

          <View className="mt-4 flex-row items-start">

            <Ionicons
              name="location-outline"
              size={20}
              color="#2563EB"
            />

            <Text className="ml-3 flex-1 text-[#475569]">
              {
                booking.booking
                  .address
              }
            </Text>

          </View>

        </View>

        {/* Notes */}

        {booking.booking.notes ? (
          <View className="mt-5 rounded-2xl bg-white p-5">

            <Text className="font-bold text-[#0F172A]">
              Notes
            </Text>

            <Text className="mt-3 leading-6 text-[#64748B]">
              {
                booking.booking
                  .notes
              }
            </Text>

          </View>
        ) : null}

        {/* Error */}

        {error ? (
          <View className="mt-5 rounded-xl bg-red-50 p-4">
            <Text className="text-center font-semibold text-red-600">
              {error}
            </Text>
          </View>
        ) : null}

        {/* Cancel */}

        {canCancel ? (
          <Pressable
            disabled={isCancelling}
            onPress={
              handleCancel
            }
            className="mt-7 items-center rounded-2xl border border-red-200 bg-red-50 py-4"
          >
            {isCancelling ? (
              <ActivityIndicator
                color="#EF4444"
              />
            ) : (
              <Text className="font-bold text-red-600">
                Cancel Booking
              </Text>
            )}
          </Pressable>
        ) : null}

      </ScrollView>
    </SafeAreaView>
  );
}
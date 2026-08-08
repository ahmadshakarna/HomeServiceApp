import { useBookingStore } from "@/store/booking-store";
import { useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";

import React, {
  useCallback,
} from "react";

import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

export default function BookingsScreen() {
  const { user } = useUser();

  const bookings =
    useBookingStore(
      (state) => state.bookings
    );

  const isLoading =
    useBookingStore(
      (state) => state.isLoading
    );

  const error =
    useBookingStore(
      (state) => state.error
    );

  const loadBookings =
    useBookingStore(
      (state) => state.loadBookings
    );

  // كل مرة المستخدم يدخل Tab الحجوزات
  // نجيب أحدث البيانات
  useFocusEffect(
    useCallback(() => {
      if (!user?.id) {
        return;
      }

      loadBookings(user.id);
    }, [
      user?.id,
      loadBookings,
    ])
  );

  const formatTime = (
    time: string
  ) => {
    return time.slice(0, 5);
  };

  const getStatusInfo = (
    status: string
  ) => {
    switch (status) {
      case "pending":
        return {
          label: "Pending",
          background:
            "bg-amber-50",
          text:
            "text-amber-700",
          icon:
            "time-outline" as const,
        };

      case "confirmed":
        return {
          label: "Confirmed",
          background:
            "bg-blue-50",
          text:
            "text-blue-700",
          icon:
            "checkmark-circle-outline" as const,
        };

      case "on_the_way":
        return {
          label: "On The Way",
          background:
            "bg-purple-50",
          text:
            "text-purple-700",
          icon:
            "car-outline" as const,
        };

      case "in_progress":
        return {
          label: "In Progress",
          background:
            "bg-cyan-50",
          text:
            "text-cyan-700",
          icon:
            "construct-outline" as const,
        };

      case "completed":
        return {
          label: "Completed",
          background:
            "bg-green-50",
          text:
            "text-green-700",
          icon:
            "checkmark-done-outline" as const,
        };

      case "cancelled":
        return {
          label: "Cancelled",
          background:
            "bg-red-50",
          text:
            "text-red-600",
          icon:
            "close-circle-outline" as const,
        };

      default:
        return {
          label: status,
          background:
            "bg-[#F1F5F9]",
          text:
            "text-[#64748B]",
          icon:
            "help-circle-outline" as const,
        };
    }
  };

  return (
    <SafeAreaView
      className="flex-1 bg-[#F8FAFC]"
      edges={["top"]}
    >
      <FlatList
        data={bookings}
        keyExtractor={(item) =>
          item.booking.id
        }
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 30,
          flexGrow: 1,
        }}

        ListHeaderComponent={
          <View className="mb-6 mt-3">
            <Text className="text-2xl font-bold text-[#0F172A]">
              My Bookings
            </Text>

            <Text className="mt-1 text-sm text-[#94A3B8]">
              Track and manage your home services
            </Text>
          </View>
        }

        ListEmptyComponent={
          isLoading ? (
            <View className="flex-1 items-center justify-center pb-32">
              <ActivityIndicator
                size="large"
                color="#2563EB"
              />

              <Text className="mt-3 text-[#64748B]">
                Loading bookings...
              </Text>
            </View>
          ) : error ? (
            <View className="items-center pt-16">

              <Ionicons
                name="alert-circle-outline"
                size={42}
                color="#EF4444"
              />

              <Text className="mt-3 font-bold text-[#0F172A]">
                Couldn't load bookings
              </Text>

              <Text className="mt-1 text-center text-sm text-[#64748B]">
                {error}
              </Text>

              <Pressable
                onPress={() => {
                  if (user?.id) {
                    loadBookings(
                      user.id
                    );
                  }
                }}
                className="mt-5 rounded-xl bg-[#2563EB] px-5 py-3"
              >
                <Text className="font-bold text-white">
                  Try Again
                </Text>
              </Pressable>

            </View>
          ) : (
            <View className="items-center pt-16">

              <View className="h-20 w-20 items-center justify-center rounded-full bg-[#EFF6FF]">
                <Ionicons
                  name="calendar-outline"
                  size={38}
                  color="#2563EB"
                />
              </View>

              <Text className="mt-4 text-lg font-bold text-[#0F172A]">
                No bookings yet
              </Text>

              <Text className="mt-2 text-center text-sm leading-5 text-[#64748B]">
                Your service bookings will appear here.
              </Text>

            </View>
          )
        }

        renderItem={({ item }) => {
          const status =
            getStatusInfo(
              item.booking.status
            );

          const price =
            item.booking
              .priceAgorot / 100;

          return (
            <Pressable
                onPress={() => {
                  router.push({
                    pathname:
                      "/booking/details/[id]",

                    params: {
                      id:
                        item.booking.id,
                    },
                  });
                }}
                className="mb-4 rounded-2xl border border-[#E2E8F0] bg-white p-5 active:opacity-80"
              >

              {/* Header */}
              <View className="flex-row items-center justify-between">

                <View
                  className={`flex-row items-center rounded-lg px-3 py-1.5 ${status.background}`}
                >
                  <Ionicons
                    name={status.icon}
                    size={15}
                    color="#64748B"
                  />

                  <Text
                    className={`ml-1.5 text-xs font-bold ${status.text}`}
                  >
                    {status.label}
                  </Text>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={21}
                  color="#94A3B8"
                />

              </View>

              {/* Service */}
              <View className="mt-4 flex-row">

                <View className="h-12 w-12 items-center justify-center rounded-xl bg-[#EFF6FF]">
                  <Ionicons
                    name={
                      (item.service.icon ||
                        "construct-outline") as keyof typeof Ionicons.glyphMap
                    }
                    size={23}
                    color="#2563EB"
                  />
                </View>

                <View className="ml-3 flex-1">

                  <Text className="text-base font-bold text-[#0F172A]">
                    {item.service.name}
                  </Text>

                  <Text className="mt-1 text-sm text-[#64748B]">
                    {
                      item.category
                        .name
                    }
                  </Text>

                </View>

                <Text className="text-lg font-bold text-[#2563EB]">
                  {price} ₪
                </Text>

              </View>

              <View className="my-4 h-[1px] bg-[#E2E8F0]" />

              {/* Provider */}
              <View className="flex-row items-center">

                <Ionicons
                  name="person-outline"
                  size={18}
                  color="#64748B"
                />

                <Text className="ml-2 text-sm text-[#475569]">
                  {
                    item.provider
                      .fullName
                  }
                </Text>

                {item.provider
                  .isVerified ? (
                  <Ionicons
                    name="checkmark-circle"
                    size={15}
                    color="#2563EB"
                    style={{
                      marginLeft: 5,
                    }}
                  />
                ) : null}

              </View>

              {/* Date */}
              <View className="mt-3 flex-row items-center">

                <Ionicons
                  name="calendar-outline"
                  size={18}
                  color="#64748B"
                />

                <Text className="ml-2 text-sm text-[#475569]">
                  {
                    item.booking
                      .bookingDate
                  }
                  {"  •  "}
                  {formatTime(
                    item.booking
                      .startTime
                  )}
                </Text>

              </View>

              {/* Address */}
              <View className="mt-3 flex-row items-center">

                <Ionicons
                  name="location-outline"
                  size={18}
                  color="#64748B"
                />

                <Text
                  numberOfLines={1}
                  className="ml-2 flex-1 text-sm text-[#475569]"
                >
                  {
                    item.booking
                      .address
                  }
                </Text>

              </View>

            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
}
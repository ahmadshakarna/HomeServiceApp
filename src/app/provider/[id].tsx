import { useProviderDetailsStore } from "@/store/provider-details-store";
import { Ionicons } from "@expo/vector-icons";
import {
  router,
  useLocalSearchParams,
} from "expo-router";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProviderDetailsScreen() {
  const params = useLocalSearchParams<{
    id: string | string[];
  }>();

  const providerId = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  const provider = useProviderDetailsStore(
    (state) => state.provider
  );

  const services = useProviderDetailsStore(
    (state) => state.services
  );

  const availability = useProviderDetailsStore(
    (state) => state.availability
  );

  const isLoading = useProviderDetailsStore(
    (state) => state.isLoading
  );

  const error = useProviderDetailsStore(
    (state) => state.error
  );

  const loadProvider = useProviderDetailsStore(
    (state) => state.loadProvider
  );

  const clearProvider = useProviderDetailsStore(
    (state) => state.clearProvider
  );

  useEffect(() => {
    if (!providerId) {
      return;
    }

    loadProvider(providerId);

    return () => {
      clearProvider();
    };
  }, [
    providerId,
    loadProvider,
    clearProvider,
  ]);

  // ========================================
  // Days
  // ========================================

  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  // PostgreSQL يرجع الوقت مثل 09:00:00
  // نحن نعرض فقط 09:00
  const formatTime = (
    time: string | null
  ) => {
    if (!time) {
      return "";
    }

    return time.slice(0, 5);
  };

  // ========================================
  // Loading
  // ========================================

  if (isLoading && !provider) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#F8FAFC]">
        <ActivityIndicator
          size="large"
          color="#2563EB"
        />

        <Text className="mt-3 text-[#64748B]">
          Loading provider...
        </Text>
      </SafeAreaView>
    );
  }

  // ========================================
  // Error
  // ========================================

  if (error && !provider) {
    return (
      <SafeAreaView className="flex-1 bg-[#F8FAFC] px-5">
        <Pressable
          onPress={() => router.back()}
          className="mt-3 h-11 w-11 items-center justify-center rounded-full bg-white"
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color="#0F172A"
          />
        </Pressable>

        <View className="flex-1 items-center justify-center pb-20">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <Ionicons
              name="alert-circle-outline"
              size={32}
              color="#EF4444"
            />
          </View>

          <Text className="mt-4 text-lg font-bold text-[#0F172A]">
            Couldn't load provider
          </Text>

          <Text className="mt-2 text-center text-sm text-[#64748B]">
            Something went wrong while loading this provider.
          </Text>

          <Pressable
            onPress={() => {
              if (providerId) {
                loadProvider(providerId);
              }
            }}
            className="mt-5 rounded-xl bg-[#2563EB] px-6 py-3"
          >
            <Text className="font-semibold text-white">
              Try Again
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // ========================================
  // Screen
  // ========================================

  return (
    <SafeAreaView
      className="flex-1 bg-[#F8FAFC]"
      edges={["top"]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 50,
        }}
      >
        {/* Header */}
        <View className="mt-3 flex-row items-center">
          <Pressable
            onPress={() => router.back()}
            className="h-11 w-11 items-center justify-center rounded-full bg-white"
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color="#0F172A"
            />
          </Pressable>

          <Text className="ml-4 text-xl font-bold text-[#0F172A]">
            Provider Profile
          </Text>
        </View>

        {/* Provider Card */}
        <View className="mt-6 items-center rounded-[28px] bg-white p-6">
          <View className="h-24 w-24 items-center justify-center rounded-full bg-[#EFF6FF]">
            <Ionicons
              name="person"
              size={44}
              color="#2563EB"
            />
          </View>

          <View className="mt-4 flex-row items-center">
            <Text className="text-2xl font-bold text-[#0F172A]">
              {provider?.fullName}
            </Text>

            {provider?.isVerified ? (
              <Ionicons
                name="checkmark-circle"
                size={22}
                color="#2563EB"
                style={{
                  marginLeft: 7,
                }}
              />
            ) : null}
          </View>

          {provider?.city ? (
            <View className="mt-2 flex-row items-center">
              <Ionicons
                name="location-outline"
                size={17}
                color="#64748B"
              />

              <Text className="ml-1 text-[#64748B]">
                {provider.city}
              </Text>
            </View>
          ) : null}

          {/* Stats */}
          <View className="mt-5 flex-row">
            <View className="items-center px-5">
              <Text className="text-xl font-bold text-[#2563EB]">
                {provider?.experienceYears ?? 0}
              </Text>

              <Text className="mt-1 text-xs text-[#64748B]">
                Years Experience
              </Text>
            </View>

            <View className="h-12 w-[1px] bg-[#E2E8F0]" />

            <View className="items-center px-5">
              <Text className="text-xl font-bold text-[#2563EB]">
                {services.length}
              </Text>

              <Text className="mt-1 text-xs text-[#64748B]">
                Services
              </Text>
            </View>
          </View>
        </View>

        {/* About */}
        <View className="mt-7">
          <Text className="text-lg font-bold text-[#0F172A]">
            About
          </Text>

          <View className="mt-3 rounded-2xl bg-white p-5">
            <Text className="leading-6 text-[#64748B]">
              {provider?.bio ||
                "Professional home service provider."}
            </Text>
          </View>
        </View>

        {/* Services */}
        <View className="mt-7">
          <Text className="text-lg font-bold text-[#0F172A]">
            Services
          </Text>

          {services.map((item) => {
            const price =
              item.priceAgorot / 100;

            return (
              <View
                key={item.providerServiceId}
                className="mt-3 rounded-2xl border border-[#E2E8F0] bg-white p-4"
              >
                <View className="flex-row items-center">
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
                    <Text className="font-bold text-[#0F172A]">
                      {item.service.name}
                    </Text>

                    <Text className="mt-1 text-sm text-[#64748B]">
                      Starting price
                    </Text>
                  </View>

                  <Text className="text-lg font-bold text-[#2563EB]">
                    {price} ₪
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Working Hours */}
        <View className="mt-7">
          <View className="flex-row items-center">
            <View className="h-11 w-11 items-center justify-center rounded-xl bg-[#EFF6FF]">
              <Ionicons
                name="time-outline"
                size={22}
                color="#2563EB"
              />
            </View>

            <View className="ml-3">
              <Text className="text-lg font-bold text-[#0F172A]">
                Working Hours
              </Text>

              <Text className="mt-1 text-sm text-[#64748B]">
                Provider weekly availability
              </Text>
            </View>
          </View>

          {/* No availability */}
          {availability.length === 0 ? (
            <View className="mt-4 items-center rounded-2xl border border-[#E2E8F0] bg-white p-5">
              <Ionicons
                name="calendar-outline"
                size={28}
                color="#94A3B8"
              />

              <Text className="mt-2 text-sm text-[#64748B]">
                No working hours available
              </Text>
            </View>
          ) : (
            <View className="mt-4 overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white">
              {availability.map(
                (day, index) => {
                  const isLast =
                    index ===
                    availability.length - 1;

                  return (
                    <View
                      key={day.id}
                      className={`flex-row items-center justify-between px-4 py-4 ${
                        !isLast
                          ? "border-b border-[#E2E8F0]"
                          : ""
                      }`}
                    >
                      {/* Day */}
                      <View className="flex-row items-center">
                        <View
                          className={`h-9 w-9 items-center justify-center rounded-lg ${
                            day.isAvailable
                              ? "bg-[#EFF6FF]"
                              : "bg-[#F1F5F9]"
                          }`}
                        >
                          <Ionicons
                            name={
                              day.isAvailable
                                ? "calendar-outline"
                                : "close-circle-outline"
                            }
                            size={18}
                            color={
                              day.isAvailable
                                ? "#2563EB"
                                : "#94A3B8"
                            }
                          />
                        </View>

                        <Text className="ml-3 font-semibold text-[#0F172A]">
                          {
                            dayNames[
                              day.dayOfWeek
                            ]
                          }
                        </Text>
                      </View>

                      {/* Time */}
                      {day.isAvailable ? (
                        <View className="rounded-lg bg-green-50 px-3 py-2">
                          <Text className="text-sm font-semibold text-green-700">
                            {formatTime(
                              day.startTime
                            )}{" "}
                            -{" "}
                            {formatTime(
                              day.endTime
                            )}
                          </Text>
                        </View>
                      ) : (
                        <View className="rounded-lg bg-[#F1F5F9] px-3 py-2">
                          <Text className="text-sm font-semibold text-[#94A3B8]">
                            Closed
                          </Text>
                        </View>
                      )}
                    </View>
                  );
                }
              )}
            </View>
          )}
        </View>

        {/* Book Button */}
        <Pressable
          className="mt-8 items-center rounded-2xl bg-[#2563EB] py-4"
        >
          <Text className="text-base font-bold text-white">
            Book Provider
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
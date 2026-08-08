import { Ionicons } from "@expo/vector-icons";
import {
  router,
  useLocalSearchParams,
} from "expo-router";

import React from "react";

import {
  Pressable,
  Text,
  View,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

export default function BookingSuccessScreen() {
  const params =
    useLocalSearchParams<{
      bookingId?: string;
    }>();

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC] px-5">
      <View className="flex-1 items-center justify-center">

        <View className="h-24 w-24 items-center justify-center rounded-full bg-green-50">
          <Ionicons
            name="checkmark-circle"
            size={64}
            color="#16A34A"
          />
        </View>

        <Text className="mt-6 text-center text-2xl font-bold text-[#0F172A]">
          Booking Requested
        </Text>

        <Text className="mt-3 max-w-[300px] text-center leading-6 text-[#64748B]">
          Your booking has been sent to the service provider.
        </Text>

        <View className="mt-6 rounded-2xl bg-white px-5 py-4">
          <Text className="text-xs text-[#94A3B8]">
            Booking ID
          </Text>

          <Text className="mt-1 font-semibold text-[#0F172A]">
            {params.bookingId}
          </Text>
        </View>

        <View className="mt-8 w-full">

          <Pressable
            onPress={() => {
              router.replace(
                "/(tabs)/bookings"
              );
            }}
            className="items-center rounded-2xl bg-[#2563EB] py-4"
          >
            <Text className="font-bold text-white">
              View My Bookings
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              router.replace(
                "/(tabs)"
              );
            }}
            className="mt-3 items-center rounded-2xl bg-white py-4"
          >
            <Text className="font-bold text-[#2563EB]">
              Back to Home
            </Text>
          </Pressable>

        </View>

      </View>
    </SafeAreaView>
  );
}
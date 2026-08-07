import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const bookings = [
  {
    id: "1",
    category: "Cleaning",
    service: "Living Room Cleaning",
    date: "Mon, Oct 02, 2026",
    time: "10:00 AM",
    price: 190,
    status: "completed",
  },
  {
    id: "2",
    category: "Plumbing",
    service: "Flush Tank Repair",
    date: "Mon, Oct 02, 2026",
    time: "10:00 AM",
    price: 85,
    status: "cancelled",
  },
  {
    id: "3",
    category: "Carpentry",
    service: "Main Door Repair",
    date: "Mon, Oct 02, 2026",
    time: "10:00 AM",
    price: 150,
    status: "completed",
  },
];

export default function BookingsScreen() {
  return (
    <SafeAreaView
      className="flex-1 bg-[#F8FAFC]"
      edges={["top"]}
    >
      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 30,
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
        renderItem={({ item }) => {
          const isCompleted =
            item.status === "completed";

          return (
            <View className="mb-5">
              {/* Category */}
              <Text className="mb-3 text-base font-bold text-[#0F172A]">
                {item.category}
              </Text>

              {/* Booking Card */}
              <Pressable className="rounded-2xl border border-[#E2E8F0] bg-white p-4 active:opacity-80">
                
                {/* Status */}
                <View className="flex-row items-start justify-between">
                  <View
                    className={`rounded-lg px-3 py-1 ${
                      isCompleted
                        ? "bg-[#EFF6FF]"
                        : "bg-[#FEF2F2]"
                    }`}
                  >
                    <Text
                      className={`text-[11px] font-bold uppercase ${
                        isCompleted
                          ? "text-[#2563EB]"
                          : "text-[#EF4444]"
                      }`}
                    >
                      {isCompleted
                        ? "Job Completed"
                        : "Booking Cancelled"}
                    </Text>
                  </View>

                  <Ionicons
                    name="chevron-forward"
                    size={22}
                    color="#64748B"
                  />
                </View>

                {/* Service */}
                <Text className="mt-3 text-[17px] font-bold text-[#0F172A]">
                  {item.service}
                </Text>

                {/* Date */}
                <Text className="mt-1 text-sm text-[#64748B]">
                  {item.date} at {item.time}
                </Text>

                {/* Completed Footer */}
                {isCompleted && (
                  <>
                    <View className="my-4 h-[1px] bg-[#E2E8F0]" />

                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center">
                        <View className="h-8 w-8 items-center justify-center rounded-full bg-[#EFF6FF]">
                          <Ionicons
                            name="checkmark"
                            size={18}
                            color="#2563EB"
                          />
                        </View>

                        <Text className="ml-2 text-sm text-[#475569]">
                          Amount Paid{" "}
                          <Text className="font-bold text-[#0F172A]">
                            ${item.price}
                          </Text>
                        </Text>
                      </View>

                      <Pressable
                        className="rounded-xl bg-[#2563EB] px-4 py-2.5 active:bg-[#1D4ED8]"
                        onPress={() => {
                          console.log(
                            "Book again:",
                            item.id
                          );
                        }}
                      >
                        <Text className="text-sm font-semibold text-white">
                          Book Again
                        </Text>
                      </Pressable>
                    </View>
                  </>
                )}
              </Pressable>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}
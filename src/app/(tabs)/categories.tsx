import { useCategoryStore } from "@/store/category-store";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { router } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CategoriesScreen() {
  const categories = useCategoryStore(
    (state) => state.categories
  );

  const isLoading = useCategoryStore(
    (state) => state.isLoading
  );

  const error = useCategoryStore(
    (state) => state.error
  );

  const loadCategories = useCategoryStore(
    (state) => state.loadCategories
  );

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // أول تحميل
  if (isLoading && categories.length === 0) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#F8FAFC]">
        <ActivityIndicator
          size="large"
          color="#2563EB"
        />

        <Text className="mt-3 text-sm text-[#64748B]">
          Loading categories...
        </Text>
      </SafeAreaView>
    );
  }

  // خطأ
  if (error && categories.length === 0) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#F8FAFC] px-6">
        <View className="h-16 w-16 items-center justify-center rounded-full bg-red-50">
          <Ionicons
            name="alert-circle-outline"
            size={32}
            color="#EF4444"
          />
        </View>

        <Text className="mt-4 text-lg font-bold text-[#0F172A]">
          Something went wrong
        </Text>

        <Text className="mt-2 text-center text-sm text-[#64748B]">
          We couldn't load the categories.
        </Text>

        <Pressable
          onPress={loadCategories}
          className="mt-5 rounded-xl bg-[#2563EB] px-6 py-3 active:opacity-80"
        >
          <Text className="font-semibold text-white">
            Try Again
          </Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1 bg-[#F8FAFC]"
      edges={["top"]}
    >
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}

        refreshing={isLoading}
        onRefresh={loadCategories}

        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 30,
          flexGrow: 1,
        }}

        ListHeaderComponent={
          <View className="mb-5 mt-3">
            <Text className="text-2xl font-bold text-[#0F172A]">
              All Categories
            </Text>

            <Text className="mt-1 text-sm text-[#64748B]">
              Find the service you need
            </Text>
          </View>
        }

        ListEmptyComponent={
          <View className="flex-1 items-center justify-center pb-24">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-[#EFF6FF]">
              <Ionicons
                name="grid-outline"
                size={30}
                color="#2563EB"
              />
            </View>

            <Text className="mt-4 text-lg font-bold text-[#0F172A]">
              No categories found
            </Text>

            <Text className="mt-1 text-sm text-[#64748B]">
              Categories will appear here.
            </Text>
          </View>
        }

        renderItem={({ item }) => (
          <Pressable
           onPress={() =>
            router.push({
              pathname: "/category/[id]",
              params: {
                id: item.id,
              },
            })
          }
            className="mb-4 flex-row items-center rounded-2xl border border-[#E2E8F0] bg-white p-4 active:opacity-70"
          >
            {/* Icon */}
            <View className="h-14 w-14 items-center justify-center rounded-2xl bg-[#EFF6FF]">
              <Ionicons
                name={
                  (item.icon ||
                    "grid-outline") as keyof typeof Ionicons.glyphMap
                }
                size={27}
                color="#2563EB"
              />
            </View>

            {/* Category information */}
            <View className="ml-4 flex-1">
              <Text className="text-[17px] font-bold text-[#0F172A]">
                {item.name}
              </Text>

              <Text className="mt-1 text-sm font-medium text-[#2563EB]">
                {item.servicesCount}{" "}
                {item.servicesCount === 1 ? "Service" : "Services"}
              </Text>

              {item.description ? (
                <Text
                  numberOfLines={1}
                  className="mt-1 text-xs text-[#94A3B8]"
                >
                  {item.description}
                </Text>
              ) : null}
            </View>

            {/* Arrow */}
            <View className="h-9 w-9 items-center justify-center rounded-full bg-[#F8FAFC]">
              <Ionicons
                name="chevron-forward"
                size={18}
                color="#94A3B8"
              />
            </View>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}
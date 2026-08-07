import { useServiceStore } from "@/store/service-store";
import { Ionicons } from "@expo/vector-icons";
import {
  router,
  useLocalSearchParams,
} from "expo-router";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CategoryDetailsScreen() {
  const params = useLocalSearchParams<{
    id: string | string[];
  }>();

  const categoryId = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  const category = useServiceStore(
    (state) => state.category
  );

  const services = useServiceStore(
    (state) => state.services
  );

  const isLoading = useServiceStore(
    (state) => state.isLoading
  );

  const error = useServiceStore(
    (state) => state.error
  );

  const loadCategoryServices = useServiceStore(
    (state) => state.loadCategoryServices
  );

  const clearCategoryServices = useServiceStore(
    (state) => state.clearCategoryServices
  );

  useEffect(() => {
    if (!categoryId) return;

    loadCategoryServices(categoryId);

    return () => {
      clearCategoryServices();
    };
  }, [
    categoryId,
    loadCategoryServices,
    clearCategoryServices,
  ]);

  if (isLoading && !category) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#F8FAFC]">
        <ActivityIndicator
          size="large"
          color="#2563EB"
        />

        <Text className="mt-3 text-sm text-[#64748B]">
          Loading services...
        </Text>
      </SafeAreaView>
    );
  }

  if (error && !category) {
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
            Couldn't load services
          </Text>

          <Pressable
            onPress={() => {
              if (categoryId) {
                loadCategoryServices(categoryId);
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

  return (
    <SafeAreaView
      className="flex-1 bg-[#F8FAFC]"
      edges={["top"]}
    >
      <FlatList
        data={services}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshing={isLoading}
        onRefresh={() => {
          if (categoryId) {
            loadCategoryServices(categoryId);
          }
        }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 30,
          flexGrow: 1,
        }}
        ListHeaderComponent={
          <View>
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
                {category?.name ?? "Services"}
              </Text>
            </View>

            {/* Category Hero */}
            <View className="mb-6 mt-6 rounded-3xl bg-[#2563EB] p-5">
              <View className="h-14 w-14 items-center justify-center rounded-2xl bg-white/20">
                <Ionicons
                  name={
                    (category?.icon ||
                      "grid-outline") as keyof typeof Ionicons.glyphMap
                  }
                  size={29}
                  color="white"
                />
              </View>

              <Text className="mt-4 text-2xl font-bold text-white">
                {category?.name}
              </Text>

              {category?.description ? (
                <Text className="mt-2 leading-5 text-white/80">
                  {category.description}
                </Text>
              ) : null}

              <Text className="mt-4 text-sm font-semibold text-white">
                {services.length}{" "}
                {services.length === 1
                  ? "Service"
                  : "Services"}{" "}
                available
              </Text>
            </View>

            <Text className="mb-4 text-lg font-bold text-[#0F172A]">
              Available Services
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center pb-20">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-[#EFF6FF]">
              <Ionicons
                name="construct-outline"
                size={30}
                color="#2563EB"
              />
            </View>

            <Text className="mt-4 text-lg font-bold text-[#0F172A]">
              No services yet
            </Text>

            <Text className="mt-1 text-sm text-[#64748B]">
              No services are available in this category.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/service/[id]",
                params: {
                  id: item.id,
                },
              })
            }
            className="mb-4 flex-row items-center rounded-2xl border border-[#E2E8F0] bg-white p-4 active:opacity-70"
          >
            {/* Service Icon */}
            <View className="h-14 w-14 items-center justify-center rounded-2xl bg-[#EFF6FF]">
              <Ionicons
                name={
                  (item.icon ||
                    "construct-outline") as keyof typeof Ionicons.glyphMap
                }
                size={27}
                color="#2563EB"
              />
            </View>

            {/* Service Info */}
            <View className="ml-4 flex-1">
              <Text className="text-[16px] font-bold text-[#0F172A]">
                {item.name}
              </Text>

              {item.description ? (
                <Text
                  numberOfLines={2}
                  className="mt-1 text-sm leading-5 text-[#64748B]"
                >
                  {item.description}
                </Text>
              ) : null}
            </View>

            <Ionicons
              name="chevron-forward"
              size={20}
              color="#94A3B8"
            />
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}
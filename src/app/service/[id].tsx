import { useServiceDetailsStore } from "@/store/service-details-store";
import { Ionicons } from "@expo/vector-icons";
import { useProviderStore } from "@/store/provider-store";
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

export default function ServiceDetailsScreen() {
  const params = useLocalSearchParams<{
    id: string | string[];
  }>();

  const serviceId = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  const service = useServiceDetailsStore(
    (state) => state.service
  );

  const category = useServiceDetailsStore(
    (state) => state.category
  );

  const isLoading = useServiceDetailsStore(
    (state) => state.isLoading
  );

  const error = useServiceDetailsStore(
    (state) => state.error
  );

  const loadService = useServiceDetailsStore(
    (state) => state.loadService
  );

  const clearService = useServiceDetailsStore(
    (state) => state.clearService
  );
  const providers = useProviderStore(
  (state) => state.providers
);

const providersLoading = useProviderStore(
  (state) => state.isLoading
);

const providersError = useProviderStore(
  (state) => state.error
);

const loadProviders = useProviderStore(
  (state) => state.loadProviders
);

const clearProviders = useProviderStore(
  (state) => state.clearProviders
);

  useEffect(() => {
  if (!serviceId) return;

  loadService(serviceId);
  loadProviders(serviceId);

  return () => {
    clearService();
    clearProviders();
  };
}, [
  serviceId,
  loadService,
  loadProviders,
  clearService,
  clearProviders,
]);

  // Loading
  if (isLoading && !service) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#F8FAFC]">
        <ActivityIndicator
          size="large"
          color="#2563EB"
        />

        <Text className="mt-3 text-sm text-[#64748B]">
          Loading service...
        </Text>
      </SafeAreaView>
    );
  }

  // Error
  if (error && !service) {
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
            Couldn't load service
          </Text>

          <Text className="mt-2 text-center text-sm text-[#64748B]">
            Something went wrong while loading this service.
          </Text>

          <Pressable
            onPress={() => {
              if (serviceId) {
                loadService(serviceId);
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
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 40,
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
            Service Details
          </Text>
        </View>

        {/* Main service card */}
        <View className="mt-6 rounded-[28px] bg-[#2563EB] p-6">
          <View className="h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
            <Ionicons
              name={
                (service?.icon ||
                  "construct-outline") as keyof typeof Ionicons.glyphMap
              }
              size={32}
              color="white"
            />
          </View>

          {/* Category */}
          <View className="mt-5 self-start rounded-full bg-white/15 px-3 py-1.5">
            <Text className="text-xs font-semibold text-white">
              {category?.name}
            </Text>
          </View>

          {/* Service name */}
          <Text className="mt-4 text-2xl font-bold text-white">
            {service?.name}
          </Text>

          {service?.description ? (
            <Text className="mt-3 text-[15px] leading-6 text-white/80">
              {service.description}
            </Text>
          ) : null}
        </View>

        {/* About */}
        <View className="mt-7">
          <Text className="text-lg font-bold text-[#0F172A]">
            About this service
          </Text>

          <View className="mt-3 rounded-2xl border border-[#E2E8F0] bg-white p-5">
            <Text className="text-[15px] leading-6 text-[#64748B]">
              {service?.description ||
                "Professional home service provided by trusted service providers."}
            </Text>
          </View>
        </View>

        {/* Information */}
        <View className="mt-6">
          <Text className="text-lg font-bold text-[#0F172A]">
            Service Information
          </Text>

          <View className="mt-3 rounded-2xl border border-[#E2E8F0] bg-white">
            {/* Category row */}
            <View className="flex-row items-center p-4">
              <View className="h-11 w-11 items-center justify-center rounded-xl bg-[#EFF6FF]">
                <Ionicons
                  name="grid-outline"
                  size={21}
                  color="#2563EB"
                />
              </View>

              <View className="ml-3">
                <Text className="text-xs text-[#94A3B8]">
                  Category
                </Text>

                <Text className="mt-1 font-semibold text-[#0F172A]">
                  {category?.name}
                </Text>
              </View>
            </View>

            <View className="mx-4 h-[1px] bg-[#E2E8F0]" />

            {/* Availability row */}
            <View className="flex-row items-center p-4">
              <View className="h-11 w-11 items-center justify-center rounded-xl bg-[#EFF6FF]">
                <Ionicons
                  name="checkmark-circle-outline"
                  size={22}
                  color="#2563EB"
                />
              </View>

              <View className="ml-3">
                <Text className="text-xs text-[#94A3B8]">
                  Status
                </Text>

                <Text className="mt-1 font-semibold text-[#0F172A]">
                  Available
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Providers section - next step */}
         {/* Providers */}
<View className="mt-7">
  <View className="flex-row items-center justify-between">
    <View>
      <Text className="text-lg font-bold text-[#0F172A]">
        Available Providers
      </Text>

      <Text className="mt-1 text-sm text-[#64748B]">
        Choose a provider for this service
      </Text>
    </View>

    {providers.length > 0 ? (
      <View className="rounded-full bg-[#DBEAFE] px-3 py-1.5">
        <Text className="text-xs font-bold text-[#2563EB]">
          {providers.length}
        </Text>
      </View>
    ) : null}
  </View>

  {/* Loading */}
  {providersLoading ? (
    <View className="mt-4 items-center rounded-2xl bg-white p-6">
      <ActivityIndicator
        size="small"
        color="#2563EB"
      />

      <Text className="mt-3 text-sm text-[#64748B]">
        Loading providers...
      </Text>
    </View>
  ) : null}

  {/* Error */}
  {!providersLoading && providersError ? (
    <View className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-5">
      <View className="flex-row items-center">
        <Ionicons
          name="alert-circle-outline"
          size={22}
          color="#EF4444"
        />

        <Text className="ml-2 flex-1 text-sm text-[#EF4444]">
          {providersError}
        </Text>
      </View>

      <Pressable
        onPress={() => {
          if (serviceId) {
            loadProviders(serviceId);
          }
        }}
        className="mt-4 self-start rounded-xl bg-[#EF4444] px-4 py-2.5"
      >
        <Text className="font-semibold text-white">
          Try Again
        </Text>
      </Pressable>
    </View>
  ) : null}

  {/* Empty */}
  {!providersLoading &&
  !providersError &&
  providers.length === 0 ? (
    <View className="mt-4 items-center rounded-2xl border border-[#E2E8F0] bg-white p-6">
      <View className="h-14 w-14 items-center justify-center rounded-full bg-[#F1F5F9]">
        <Ionicons
          name="people-outline"
          size={27}
          color="#64748B"
        />
      </View>

      <Text className="mt-3 font-bold text-[#0F172A]">
        No providers available
      </Text>

      <Text className="mt-1 text-center text-sm text-[#64748B]">
        There are currently no providers available for this service.
      </Text>
    </View>
  ) : null}

  {/* Providers List */}
  {!providersLoading &&
    providers.map((item) => {
      const price =
        item.priceAgorot / 100;

      return (
        <View
          key={item.providerServiceId}
          className="mt-4 rounded-2xl border border-[#E2E8F0] bg-white p-5"
        >
          {/* Provider top */}
          <View className="flex-row items-center">
            {/* Avatar */}
            <View className="h-14 w-14 items-center justify-center rounded-full bg-[#EFF6FF]">
              <Ionicons
                name="person-outline"
                size={26}
                color="#2563EB"
              />
            </View>

            <View className="ml-4 flex-1">
              <View className="flex-row items-center">
                <Text className="text-base font-bold text-[#0F172A]">
                  {item.provider.fullName}
                </Text>

                {item.provider.isVerified ? (
                  <Ionicons
                    name="checkmark-circle"
                    size={18}
                    color="#2563EB"
                    style={{
                      marginLeft: 6,
                    }}
                  />
                ) : null}
              </View>

              {item.provider.city ? (
                <View className="mt-1 flex-row items-center">
                  <Ionicons
                    name="location-outline"
                    size={14}
                    color="#64748B"
                  />

                  <Text className="ml-1 text-sm text-[#64748B]">
                    {item.provider.city}
                  </Text>
                </View>
              ) : null}
            </View>

            {/* Price */}
            <View className="items-end">
              <Text className="text-xs text-[#94A3B8]">
                Price
              </Text>

              <Text className="mt-1 text-lg font-bold text-[#2563EB]">
                {price} ₪
              </Text>
            </View>
          </View>

          {/* Bio */}
          {item.provider.bio ? (
            <Text
              numberOfLines={2}
              className="mt-4 text-sm leading-5 text-[#64748B]"
            >
              {item.provider.bio}
            </Text>
          ) : null}

          {/* Experience */}
          <View className="mt-4 flex-row items-center">
            <View className="flex-row items-center rounded-xl bg-[#F8FAFC] px-3 py-2">
              <Ionicons
                name="briefcase-outline"
                size={16}
                color="#64748B"
              />

              <Text className="ml-2 text-xs font-semibold text-[#475569]">
                {item.provider.experienceYears} years experience
              </Text>
            </View>

            {item.provider.isVerified ? (
              <View className="ml-2 flex-row items-center rounded-xl bg-green-50 px-3 py-2">
                <Ionicons
                  name="shield-checkmark-outline"
                  size={16}
                  color="#16A34A"
                />

                <Text className="ml-2 text-xs font-semibold text-green-700">
                  Verified
                </Text>
              </View>
            ) : null}
          </View>

          {/* Button */}
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/provider/[id]",
                params: {
                  id: item.provider.id,
                },
              })
            }
            className="mt-5 items-center rounded-xl bg-[#2563EB] py-3.5"
          >
            <Text className="font-bold text-white">
              View Provider
            </Text>
          </Pressable>
        </View>
      );
    })}
</View>
      </ScrollView>
    </SafeAreaView>
  );
}
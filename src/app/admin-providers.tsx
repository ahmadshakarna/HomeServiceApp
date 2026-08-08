import {
  useAuth,
} from "@clerk/expo";

import {
  Ionicons,
} from "@expo/vector-icons";

import {
  router,
} from "expo-router";

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

type ProviderApplication = {
  id: string;

  clerkUserId:
    string | null;

  fullName: string;

  phone:
    string | null;

  email:
    string | null;

  city:
    string | null;

  bio:
    string | null;

  experienceYears:
    number;

  profileImage:
    string | null;

  approvalStatus:
    string;

  isVerified:
    boolean;

  createdAt:
    string;

  updatedAt:
    string;
};

export default function AdminProvidersScreen() {
  

    const {
  getToken,
  isLoaded,
  userId,
} = useAuth();

const loadedForUser =
  useRef<string | null>(
    null
  );

  const [
    applications,
    setApplications,
  ] = useState<
    ProviderApplication[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);


  // ========================================
  // LOAD APPLICATIONS
  // ========================================

  const loadApplications =
    useCallback(
      async (
        refresh = false
      ) => {
        try {
          if (refresh) {
            setRefreshing(
              true
            );
          } else {
            setLoading(
              true
            );
          }

          setError(
            null
          );

          const token =
            await getToken();

          if (!token) {
            throw new Error(
              "Authentication required"
            );
          }

          const response =
            await fetch(
              "/api/admin/provider-applications",
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
                "Failed to load applications"
            );
          }

          setApplications(
            Array.isArray(
              data.applications
            )
              ? data.applications
              : []
          );

        } catch (error) {
          console.error(
            "LOAD ADMIN APPLICATIONS ERROR:",
            error
          );

          setError(
            error instanceof Error
              ? error.message
              : "Failed to load applications"
          );

        } finally {
          setLoading(
            false
          );

          setRefreshing(
            false
          );
        }
      },
      [getToken]
    );


 useEffect(() => {
  if (
    !isLoaded ||
    !userId
  ) {
    return;
  }

  if (
    loadedForUser.current ===
    userId
  ) {
    return;
  }

  loadedForUser.current =
    userId;

  loadApplications();

}, [
  isLoaded,
  userId,
  loadApplications,
]);


  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#F8FAFC]">

        <ActivityIndicator
          size="large"
          color="#2563EB"
        />

        <Text className="mt-3 text-[#64748B]">
          Loading applications...
        </Text>

      </SafeAreaView>
    );
  }


  // ========================================
  // SCREEN
  // ========================================

  return (
    <SafeAreaView
      className="flex-1 bg-[#F8FAFC]"
      edges={["top"]}
    >

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        refreshControl={
          <RefreshControl
            refreshing={
              refreshing
            }
            onRefresh={() =>
              loadApplications(
                true
              )
            }
          />
        }
        contentContainerStyle={{
          paddingHorizontal:
            20,

          paddingBottom:
            60,
        }}
      >

        {/* HEADER */}

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


          <View className="ml-4 flex-1">

            <Text className="text-xl font-bold text-[#0F172A]">
              Provider Applications
            </Text>

            <Text className="mt-1 text-xs text-[#64748B]">
              Review provider requests
            </Text>

          </View>


          <View className="min-w-[38px] items-center justify-center rounded-full bg-[#EFF6FF] px-3 py-2">

            <Text className="font-bold text-[#2563EB]">
              {
                applications.length
              }
            </Text>

          </View>

        </View>


        {/* INFO */}

        <View className="mt-6 rounded-2xl bg-[#EFF6FF] p-5">

          <View className="flex-row items-center">

            <Ionicons
              name="shield-checkmark-outline"
              size={25}
              color="#2563EB"
            />

            <View className="ml-3 flex-1">

              <Text className="font-bold text-[#0F172A]">
                Pending Applications
              </Text>

              <Text className="mt-1 text-sm leading-5 text-[#64748B]">
                Review the provider's information, services, prices and working hours before approval.
              </Text>

            </View>

          </View>

        </View>


        {/* ERROR */}

        {error ? (
          <View className="mt-6 rounded-2xl bg-red-50 p-4">

            <View className="flex-row items-center">

              <Ionicons
                name="alert-circle-outline"
                size={21}
                color="#DC2626"
              />

              <Text className="ml-2 flex-1 font-semibold text-red-600">
                {error}
              </Text>

            </View>

          </View>
        ) : null}


        {/* EMPTY */}

        {!error &&
        applications.length ===
          0 ? (
          <View className="mt-12 items-center">

            <View className="h-20 w-20 items-center justify-center rounded-full bg-white">

              <Ionicons
                name="file-tray-outline"
                size={36}
                color="#94A3B8"
              />

            </View>

            <Text className="mt-5 text-lg font-bold text-[#0F172A]">
              No pending applications
            </Text>

            <Text className="mt-2 max-w-[280px] text-center leading-5 text-[#64748B]">
              New provider applications will appear here.
            </Text>

          </View>
        ) : null}


        {/* APPLICATION CARDS */}

        {applications.map(
          (
            application
          ) => (
            <View
              key={
                application.id
              }
              className="mt-5 rounded-2xl border border-[#E2E8F0] bg-white p-5"
            >

              {/* NAME */}

              <View className="flex-row items-center">

                <View className="h-14 w-14 items-center justify-center rounded-full bg-[#EFF6FF]">

                  <Text className="text-xl font-bold text-[#2563EB]">
                    {application.fullName
                      .trim()
                      .charAt(0)
                      .toUpperCase()}
                  </Text>

                </View>


                <View className="ml-4 flex-1">

                  <Text className="text-base font-bold text-[#0F172A]">
                    {
                      application.fullName
                    }
                  </Text>


                  <View className="mt-2 flex-row items-center">

                    <Ionicons
                      name="location-outline"
                      size={15}
                      color="#64748B"
                    />

                    <Text className="ml-1 text-sm text-[#64748B]">
                      {
                        application.city ||
                        "No city"
                      }
                    </Text>

                  </View>

                </View>


                <View className="rounded-full bg-amber-50 px-3 py-1.5">

                  <Text className="text-xs font-bold text-amber-700">
                    Pending
                  </Text>

                </View>

              </View>


              {/* DETAILS */}

              <View className="mt-5 flex-row">

                <View className="mr-2 flex-1 rounded-xl bg-[#F8FAFC] p-3">

                  <Text className="text-xs text-[#64748B]">
                    Experience
                  </Text>

                  <Text className="mt-1 font-bold text-[#0F172A]">
                    {
                      application.experienceYears
                    }{" "}
                    years
                  </Text>

                </View>


                <View className="ml-2 flex-1 rounded-xl bg-[#F8FAFC] p-3">

                  <Text className="text-xs text-[#64748B]">
                    Status
                  </Text>

                  <Text className="mt-1 font-bold text-amber-600">
                    Pending
                  </Text>

                </View>

              </View>


              {/* CONTACT */}

              {application.phone ? (
                <View className="mt-4 flex-row items-center">

                  <Ionicons
                    name="call-outline"
                    size={17}
                    color="#64748B"
                  />

                  <Text className="ml-2 text-sm text-[#64748B]">
                    {
                      application.phone
                    }
                  </Text>

                </View>
              ) : null}


              {/* VIEW */}

              <Pressable
                onPress={() => {
                  router.push({
                    pathname:
                      "/admin-provider/[id]",

                    params: {
                      id:
                        application.id,
                    },
                  });
                }}
                className="mt-5 flex-row items-center justify-center rounded-xl bg-[#2563EB] py-3.5"
              >

                <Ionicons
                  name="eye-outline"
                  size={19}
                  color="white"
                />

                <Text className="ml-2 font-bold text-white">
                  View Application
                </Text>

              </Pressable>

            </View>
          )
        )}

      </ScrollView>

    </SafeAreaView>
  );
}
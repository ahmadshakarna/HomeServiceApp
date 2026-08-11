import {
  useBookingStore,
} from "@/store/booking-store";

import {
  useUser,
} from "@clerk/expo";

import {
  Ionicons,
} from "@expo/vector-icons";

import {
  router,
  useFocusEffect,
} from "expo-router";

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

import {
  useTranslation,
} from "react-i18next";


export default function BookingsScreen() {
  const {
    user,
  } = useUser();

  const {
    t,
    i18n,
  } = useTranslation();


  // ========================================
  // LANGUAGE
  // ========================================

  const isArabic =
    (
      i18n.resolvedLanguage ||
      i18n.language
    ).startsWith("ar");


  const locale =
    isArabic
      ? "ar"
      : "en-US";


  const textDirection = {
    textAlign:
      isArabic
        ? ("right" as const)
        : ("left" as const),
  };


  // ========================================
  // STORE
  // ========================================

  const bookings =
    useBookingStore(
      (state) =>
        state.bookings
    );

  const isLoading =
    useBookingStore(
      (state) =>
        state.isLoading
    );

  const error =
    useBookingStore(
      (state) =>
        state.error
    );

  const loadBookings =
    useBookingStore(
      (state) =>
        state.loadBookings
    );


  // ========================================
  // LOAD
  // ========================================

  useFocusEffect(
    useCallback(() => {
      if (!user?.id) {
        return;
      }

      loadBookings(
        user.id
      );

    }, [
      user?.id,
      loadBookings,
    ])
  );


  // ========================================
  // DATABASE TRANSLATION
  // ========================================

  const getServiceName = (
    service: {
      name: string;
      slug: string;
    }
  ) => {
    return t(
      `db.services.${service.slug}.name`,
      {
        defaultValue:
          service.name,
      }
    );
  };


  const getCategoryName = (
    category: {
      name: string;
      slug: string;
    }
  ) => {
    return t(
      `db.categories.${category.slug}.name`,
      {
        defaultValue:
          category.name,
      }
    );
  };


  // ========================================
  // TIME
  // ========================================

  const formatTime = (
    time: string
  ) => {
    return time.slice(
      0,
      5
    );
  };


  // ========================================
  // DATE
  // ========================================

  const formatDate = (
    value: string
  ) => {
    const [
      year,
      month,
      day,
    ] =
      value
        .split("-")
        .map(Number);


    const date =
      new Date(
        year,
        month - 1,
        day,
        12
      );


    return date.toLocaleDateString(
      locale,
      {
        day:
          "numeric",

        month:
          "short",

        year:
          "numeric",
      }
    );
  };


  // ========================================
  // STATUS
  // ========================================

  const getStatusInfo = (
    status: string
  ) => {
    switch (status) {
      case "pending":
        return {
          label:
            t(
              "status.pending"
            ),

          background:
            "bg-amber-50",

          text:
            "text-amber-700",

          icon:
            "time-outline" as const,
        };


      case "confirmed":
        return {
          label:
            t(
              "status.confirmed"
            ),

          background:
            "bg-blue-50",

          text:
            "text-blue-700",

          icon:
            "checkmark-circle-outline" as const,
        };


      case "on_the_way":
        return {
          label:
            t(
              "status.on_the_way"
            ),

          background:
            "bg-purple-50",

          text:
            "text-purple-700",

          icon:
            "car-outline" as const,
        };


      case "in_progress":
        return {
          label:
            t(
              "status.in_progress"
            ),

          background:
            "bg-cyan-50",

          text:
            "text-cyan-700",

          icon:
            "construct-outline" as const,
        };


      case "completed":
        return {
          label:
            t(
              "status.completed"
            ),

          background:
            "bg-green-50",

          text:
            "text-green-700",

          icon:
            "checkmark-done-outline" as const,
        };


      case "cancelled":
        return {
          label:
            t(
              "status.cancelled"
            ),

          background:
            "bg-red-50",

          text:
            "text-red-600",

          icon:
            "close-circle-outline" as const,
        };


      default:
        return {
          label:
            status,

          background:
            "bg-[#F1F5F9]",

          text:
            "text-[#64748B]",

          icon:
            "help-circle-outline" as const,
        };
    }
  };


  // ========================================
  // SCREEN
  // ========================================

  return (
    <SafeAreaView
      className="flex-1 bg-[#F8FAFC]"
      edges={[
        "top",
      ]}
    >

      <FlatList
        data={
          bookings
        }

        keyExtractor={(
          item
        ) =>
          item.booking.id
        }

        showsVerticalScrollIndicator={
          false
        }

        refreshing={
          isLoading
        }

        onRefresh={() => {
          if (
            user?.id
          ) {
            loadBookings(
              user.id
            );
          }
        }}

        contentContainerStyle={{
          paddingHorizontal:
            20,

          paddingBottom:
            30,

          flexGrow:
            1,
        }}


        // ==================================
        // HEADER
        // ==================================

        ListHeaderComponent={
          <View className="mb-6 mt-3">

            <Text
              className="text-2xl font-bold text-[#0F172A]"
              style={
                textDirection
              }
            >
              {t(
                "myBookings.title"
              )}
            </Text>


            <Text
              className="mt-1 text-sm text-[#94A3B8]"
              style={
                textDirection
              }
            >
              {t(
                "myBookings.subtitle"
              )}
            </Text>

          </View>
        }


        // ==================================
        // EMPTY / LOADING / ERROR
        // ==================================

        ListEmptyComponent={
          isLoading ? (

            <View className="flex-1 items-center justify-center pb-32">

              <ActivityIndicator
                size="large"
                color="#2563EB"
              />


              <Text className="mt-3 text-[#64748B]">
                {t(
                  "myBookings.loading"
                )}
              </Text>

            </View>

          ) : error ? (

            <View className="items-center pt-16">

              <Ionicons
                name="alert-circle-outline"
                size={42}
                color="#EF4444"
              />


              <Text
                className="mt-3 font-bold text-[#0F172A]"
                style={{
                  textAlign:
                    "center",
                }}
              >
                {t(
                  "myBookings.loadError"
                )}
              </Text>


              <Text
                className="mt-1 text-sm leading-5 text-[#64748B]"
                style={{
                  textAlign:
                    "center",
                }}
              >
                {t(
                  "myBookings.loadErrorDescription"
                )}
              </Text>


              <Pressable
                onPress={() => {
                  if (
                    user?.id
                  ) {
                    loadBookings(
                      user.id
                    );
                  }
                }}
                className="mt-5 rounded-xl bg-[#2563EB] px-5 py-3"
              >

                <Text className="font-bold text-white">
                  {t(
                    "common.retry"
                  )}
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


              <Text
                className="mt-4 text-lg font-bold text-[#0F172A]"
                style={{
                  textAlign:
                    "center",
                }}
              >
                {t(
                  "myBookings.empty"
                )}
              </Text>


              <Text
                className="mt-2 text-sm leading-5 text-[#64748B]"
                style={{
                  textAlign:
                    "center",
                }}
              >
                {t(
                  "myBookings.emptyDescription"
                )}
              </Text>

            </View>
          )
        }


        // ==================================
        // BOOKING
        // ==================================

        renderItem={({
          item,
        }) => {
          const status =
            getStatusInfo(
              item.booking.status
            );


          const price =
            item.booking
              .priceAgorot /
            100;


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

              {/* =============================
                  STATUS + ARROW
              ============================= */}

              <View
                style={{
                  flexDirection:
                    isArabic
                      ? "row-reverse"
                      : "row",

                  alignItems:
                    "center",

                  justifyContent:
                    "space-between",
                }}
              >

                <View
                  className={`rounded-lg px-3 py-1.5 ${status.background}`}
                  style={{
                    flexDirection:
                      isArabic
                        ? "row-reverse"
                        : "row",

                    alignItems:
                      "center",
                  }}
                >

                  <Ionicons
                    name={
                      status.icon
                    }
                    size={15}
                    color="#64748B"
                  />


                  <Text
                    className={`text-xs font-bold ${status.text}`}
                    style={{
                      marginStart:
                        6,
                    }}
                  >
                    {
                      status.label
                    }
                  </Text>

                </View>


                <Ionicons
                  name={
                    isArabic
                      ? "chevron-back"
                      : "chevron-forward"
                  }
                  size={21}
                  color="#94A3B8"
                />

              </View>


              {/* =============================
                  SERVICE
              ============================= */}

              <View
                className="mt-4"
                style={{
                  flexDirection:
                    isArabic
                      ? "row-reverse"
                      : "row",

                  alignItems:
                    "center",
                }}
              >

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


                <View
                  className="flex-1"
                  style={{
                    marginStart:
                      12,
                  }}
                >

                  <Text
                    className="text-base font-bold text-[#0F172A]"
                    style={
                      textDirection
                    }
                  >
                    {
                      getServiceName(
                        item.service
                      )
                    }
                  </Text>


                  <Text
                    className="mt-1 text-sm text-[#64748B]"
                    style={
                      textDirection
                    }
                  >
                    {
                      getCategoryName(
                        item.category
                      )
                    }
                  </Text>

                </View>


                <Text
                  className="text-lg font-bold text-[#2563EB]"
                  style={{
                    marginStart:
                      8,

                    writingDirection:
                      "ltr",
                  }}
                >
                  {price} ₪
                </Text>

              </View>


              <View className="my-4 h-[1px] bg-[#E2E8F0]" />


              {/* =============================
                  PROVIDER
              ============================= */}

              <View
                style={{
                  flexDirection:
                    isArabic
                      ? "row-reverse"
                      : "row",

                  alignItems:
                    "center",
                }}
              >

                <Ionicons
                  name="person-outline"
                  size={18}
                  color="#64748B"
                />


                <Text
                  className="flex-shrink text-sm text-[#475569]"
                  style={{
                    marginStart:
                      8,

                    ...textDirection,
                  }}
                >
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
                      marginStart:
                        5,
                    }}
                  />

                ) : null}

              </View>


              {/* =============================
                  DATE
              ============================= */}

              <View
                className="mt-3"
                style={{
                  flexDirection:
                    isArabic
                      ? "row-reverse"
                      : "row",

                  alignItems:
                    "center",
                }}
              >

                <Ionicons
                  name="calendar-outline"
                  size={18}
                  color="#64748B"
                />


                <Text
                  className="text-sm text-[#475569]"
                  style={{
                    marginStart:
                      8,

                    ...textDirection,
                  }}
                >
                  {formatDate(
                    item.booking
                      .bookingDate
                  )}
                  {"  •  "}
                  {formatTime(
                    item.booking
                      .startTime
                  )}
                </Text>

              </View>


              {/* =============================
                  ADDRESS
              ============================= */}

              <View
                className="mt-3"
                style={{
                  flexDirection:
                    isArabic
                      ? "row-reverse"
                      : "row",

                  alignItems:
                    "center",
                }}
              >

                <Ionicons
                  name="location-outline"
                  size={18}
                  color="#64748B"
                />


                <Text
                  numberOfLines={
                    1
                  }
                  className="flex-1 text-sm text-[#475569]"
                  style={{
                    marginStart:
                      8,

                    ...textDirection,
                  }}
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
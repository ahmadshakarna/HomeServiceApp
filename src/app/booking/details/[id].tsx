import {
  useBookingDetailsStore,
} from "@/store/booking-details-store";

import {
  useUser,
} from "@clerk/expo";

import {
  Ionicons,
} from "@expo/vector-icons";

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

import {
  useTranslation,
} from "react-i18next";


export default function BookingDetailsScreen() {
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
  // ROUTE
  // ========================================

  const params =
    useLocalSearchParams<{
      id:
        | string
        | string[];
    }>();


  const bookingId =
    Array.isArray(
      params.id
    )
      ? params.id[0]
      : params.id;


  // ========================================
  // STORE
  // ========================================

  const booking =
    useBookingDetailsStore(
      (state) =>
        state.booking
    );

  const isLoading =
    useBookingDetailsStore(
      (state) =>
        state.isLoading
    );

  const isCancelling =
    useBookingDetailsStore(
      (state) =>
        state.isCancelling
    );

  const error =
    useBookingDetailsStore(
      (state) =>
        state.error
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


  // ========================================
  // LOAD
  // ========================================

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


  // ========================================
  // DATABASE TRANSLATION
  // ========================================

  const getServiceName =
    () => {
      if (!booking) {
        return "";
      }


      return t(
        `db.services.${booking.service.slug}.name`,
        {
          defaultValue:
            booking.service.name,
        }
      );
    };


  const getCategoryName =
    () => {
      if (!booking) {
        return "";
      }


      return t(
        `db.categories.${booking.category.slug}.name`,
        {
          defaultValue:
            booking.category.name,
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
        weekday:
          "long",

        day:
          "numeric",

        month:
          "long",

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

          icon:
            "time-outline" as const,

          iconColor:
            "#D97706",

          background:
            "bg-amber-50",

          text:
            "text-amber-700",
        };


      case "confirmed":
        return {
          label:
            t(
              "status.confirmed"
            ),

          icon:
            "checkmark-circle-outline" as const,

          iconColor:
            "#2563EB",

          background:
            "bg-blue-50",

          text:
            "text-blue-700",
        };


      case "on_the_way":
        return {
          label:
            t(
              "status.on_the_way"
            ),

          icon:
            "car-outline" as const,

          iconColor:
            "#7C3AED",

          background:
            "bg-purple-50",

          text:
            "text-purple-700",
        };


      case "in_progress":
        return {
          label:
            t(
              "status.in_progress"
            ),

          icon:
            "construct-outline" as const,

          iconColor:
            "#0891B2",

          background:
            "bg-cyan-50",

          text:
            "text-cyan-700",
        };


      case "completed":
        return {
          label:
            t(
              "status.completed"
            ),

          icon:
            "checkmark-done-outline" as const,

          iconColor:
            "#16A34A",

          background:
            "bg-green-50",

          text:
            "text-green-700",
        };


      case "cancelled":
        return {
          label:
            t(
              "status.cancelled"
            ),

          icon:
            "close-circle-outline" as const,

          iconColor:
            "#EF4444",

          background:
            "bg-red-50",

          text:
            "text-red-600",
        };


      default:
        return {
          label:
            status,

          icon:
            "help-circle-outline" as const,

          iconColor:
            "#64748B",

          background:
            "bg-[#F1F5F9]",

          text:
            "text-[#64748B]",
        };
    }
  };


  // ========================================
  // CANCEL
  // ========================================

  const canCancel =
    booking?.booking.status ===
      "pending" ||
    booking?.booking.status ===
      "confirmed";


  const handleCancel =
    () => {
      if (
        !bookingId ||
        !user?.id
      ) {
        return;
      }


      Alert.alert(
        t(
          "bookingDetails.cancelTitle"
        ),

        t(
          "bookingDetails.cancelDescription"
        ),

        [
          {
            text:
              t(
                "bookingDetails.keepBooking"
              ),

            style:
              "cancel",
          },

          {
            text:
              t(
                "bookingDetails.cancelBooking"
              ),

            style:
              "destructive",

            onPress:
              async () => {
                const success =
                  await cancelBooking(
                    bookingId,
                    user.id
                  );


                if (success) {
                  Alert.alert(
                    t(
                      "bookingDetails.cancelledTitle"
                    ),

                    t(
                      "bookingDetails.cancelledDescription"
                    )
                  );
                }
              },
          },
        ]
      );
    };


  // ========================================
  // LOADING
  // ========================================

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


        <Text className="mt-3 text-[#64748B]">
          {t(
            "bookingDetails.loading"
          )}
        </Text>

      </SafeAreaView>
    );
  }


  // ========================================
  // ERROR
  // ========================================

  if (
    error &&
    !booking
  ) {
    return (
      <SafeAreaView className="flex-1 bg-[#F8FAFC] px-5">

        <Pressable
          onPress={() =>
            router.back()
          }
          className="mt-3 h-11 w-11 items-center justify-center rounded-full bg-white"
          style={{
            alignSelf:
              isArabic
                ? "flex-end"
                : "flex-start",
          }}
        >

          <Ionicons
            name={
              isArabic
                ? "arrow-forward"
                : "arrow-back"
            }
            size={22}
            color="#0F172A"
          />

        </Pressable>


        <View className="flex-1 items-center justify-center pb-20">

          <Ionicons
            name="alert-circle-outline"
            size={50}
            color="#EF4444"
          />


          <Text
            className="mt-4 text-lg font-bold text-[#0F172A]"
            style={{
              textAlign:
                "center",
            }}
          >
            {t(
              "bookingDetails.loadError"
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
              "bookingDetails.loadErrorDescription"
            )}
          </Text>


          <Pressable
            onPress={() => {
              if (
                bookingId &&
                user?.id
              ) {
                loadBooking(
                  bookingId,
                  user.id
                );
              }
            }}
            className="mt-5 rounded-xl bg-[#2563EB] px-6 py-3"
          >

            <Text className="font-bold text-white">
              {t(
                "common.retry"
              )}
            </Text>

          </Pressable>

        </View>

      </SafeAreaView>
    );
  }


  if (!booking) {
    return null;
  }


  // ========================================
  // VALUES
  // ========================================

  const price =
    booking.booking
      .priceAgorot /
    100;


  const status =
    getStatusInfo(
      booking.booking.status
    );


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

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={{
          paddingHorizontal:
            20,

          paddingBottom:
            50,
        }}
      >

        {/* ==================================
            HEADER
        ================================== */}

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

          <Pressable
            onPress={() =>
              router.back()
            }
            className="h-11 w-11 items-center justify-center rounded-full bg-white"
          >

            <Ionicons
              name={
                isArabic
                  ? "arrow-forward"
                  : "arrow-back"
              }
              size={22}
              color="#0F172A"
            />

          </Pressable>


          <Text
            className="flex-1 text-xl font-bold text-[#0F172A]"
            style={{
              marginStart:
                16,

              ...textDirection,
            }}
          >
            {t(
              "bookingDetails.title"
            )}
          </Text>

        </View>


        {/* ==================================
            STATUS
        ================================== */}

        <View className="mt-6 rounded-2xl bg-white p-5">

          <Text
            className="text-xs font-semibold text-[#94A3B8]"
            style={
              textDirection
            }
          >
            {t(
              "bookingDetails.status"
            )}
          </Text>


          <View
            className={`mt-3 rounded-xl px-4 py-3 ${status.background}`}
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
              size={22}
              color={
                status.iconColor
              }
            />


            <Text
              className={`text-base font-bold ${status.text}`}
              style={{
                marginStart:
                  8,
              }}
            >
              {
                status.label
              }
            </Text>

          </View>

        </View>


        {/* ==================================
            SERVICE
        ================================== */}

        <View className="mt-5 rounded-2xl bg-white p-5">

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

            <View className="h-14 w-14 items-center justify-center rounded-xl bg-[#EFF6FF]">

              <Ionicons
                name={
                  (booking.service.icon ||
                    "construct-outline") as keyof typeof Ionicons.glyphMap
                }
                size={27}
                color="#2563EB"
              />

            </View>


            <View
              className="flex-1"
              style={{
                marginStart:
                  14,
              }}
            >

              <Text
                className="text-lg font-bold text-[#0F172A]"
                style={
                  textDirection
                }
              >
                {
                  getServiceName()
                }
              </Text>


              <Text
                className="mt-1 text-sm text-[#64748B]"
                style={
                  textDirection
                }
              >
                {
                  getCategoryName()
                }
              </Text>

            </View>


            <Text
              className="text-xl font-bold text-[#2563EB]"
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

        </View>


        {/* ==================================
            PROVIDER
        ================================== */}

        <View className="mt-5 rounded-2xl bg-white p-5">

          <Text
            className="text-sm font-bold text-[#0F172A]"
            style={
              textDirection
            }
          >
            {t(
              "bookingDetails.provider"
            )}
          </Text>


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

            <View className="h-12 w-12 items-center justify-center rounded-full bg-[#EFF6FF]">

              <Ionicons
                name="person"
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

                <Text
                  className="font-bold text-[#0F172A]"
                  style={
                    textDirection
                  }
                >
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
                      marginStart:
                        5,
                    }}
                  />

                ) : null}

              </View>


              {booking.provider
                .city ? (

                <Text
                  className="mt-1 text-sm text-[#64748B]"
                  style={
                    textDirection
                  }
                >
                  {
                    booking.provider
                      .city
                  }
                </Text>

              ) : null}

            </View>

          </View>

        </View>


        {/* ==================================
            APPOINTMENT
        ================================== */}

        <View className="mt-5 rounded-2xl bg-white p-5">

          <Text
            className="font-bold text-[#0F172A]"
            style={
              textDirection
            }
          >
            {t(
              "bookingDetails.appointment"
            )}
          </Text>


          {/* DATE */}

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

            <Ionicons
              name="calendar-outline"
              size={20}
              color="#2563EB"
            />


            <Text
              className="flex-1 text-[#475569]"
              style={{
                marginStart:
                  12,

                ...textDirection,
              }}
            >
              {formatDate(
                booking.booking
                  .bookingDate
              )}
            </Text>

          </View>


          {/* TIME */}

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

            <Ionicons
              name="time-outline"
              size={20}
              color="#2563EB"
            />


            <Text
              className="text-[#475569]"
              style={{
                marginStart:
                  12,

                writingDirection:
                  "ltr",
              }}
            >
              {formatTime(
                booking.booking
                  .startTime
              )}
            </Text>

          </View>


          {/* ADDRESS */}

          <View
            className="mt-4"
            style={{
              flexDirection:
                isArabic
                  ? "row-reverse"
                  : "row",

              alignItems:
                "flex-start",
            }}
          >

            <Ionicons
              name="location-outline"
              size={20}
              color="#2563EB"
            />


            <Text
              className="flex-1 leading-5 text-[#475569]"
              style={{
                marginStart:
                  12,

                ...textDirection,
              }}
            >
              {
                booking.booking
                  .address
              }
            </Text>

          </View>

        </View>


        {/* ==================================
            NOTES
        ================================== */}

        {booking.booking.notes ? (

          <View className="mt-5 rounded-2xl bg-white p-5">

            <Text
              className="font-bold text-[#0F172A]"
              style={
                textDirection
              }
            >
              {t(
                "bookingDetails.notes"
              )}
            </Text>


            <Text
              className="mt-3 leading-6 text-[#64748B]"
              style={
                textDirection
              }
            >
              {
                booking.booking
                  .notes
              }
            </Text>

          </View>

        ) : null}


        {/* ==================================
            BOOKING ID
        ================================== */}

        <View className="mt-5 rounded-2xl bg-white p-5">

          <Text
            className="text-xs text-[#94A3B8]"
            style={
              textDirection
            }
          >
            {t(
              "bookingDetails.bookingId"
            )}
          </Text>


          <Text
            selectable
            className="mt-2 text-sm font-semibold text-[#475569]"
            style={{
              writingDirection:
                "ltr",

              textAlign:
                isArabic
                  ? "right"
                  : "left",
            }}
          >
            {
              booking.booking.id
            }
          </Text>

        </View>


        {/* ==================================
            ACTION ERROR
        ================================== */}

        {error ? (

          <View className="mt-5 rounded-xl bg-red-50 p-4">

            <Text
              className="font-semibold text-red-600"
              style={{
                textAlign:
                  "center",
              }}
            >
              {t(
                "bookingDetails.actionError"
              )}
            </Text>

          </View>

        ) : null}


        {/* ==================================
            CANCEL
        ================================== */}

        {canCancel ? (

          <Pressable
            disabled={
              isCancelling
            }
            onPress={
              handleCancel
            }
            className={`mt-7 items-center rounded-2xl border border-red-200 bg-red-50 py-4 ${
              isCancelling
                ? "opacity-60"
                : ""
            }`}
          >

            {isCancelling ? (

              <View
                style={{
                  flexDirection:
                    isArabic
                      ? "row-reverse"
                      : "row",

                  alignItems:
                    "center",

                  gap:
                    8,
                }}
              >

                <ActivityIndicator
                  size="small"
                  color="#EF4444"
                />


                <Text className="font-bold text-red-600">
                  {t(
                    "bookingDetails.cancelling"
                  )}
                </Text>

              </View>

            ) : (

              <Text className="font-bold text-red-600">
                {t(
                  "bookingDetails.cancelBooking"
                )}
              </Text>

            )}

          </Pressable>

        ) : null}

      </ScrollView>

    </SafeAreaView>
  );
}
import {
  Ionicons,
} from "@expo/vector-icons";

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

import {
  useTranslation,
} from "react-i18next";


export default function BookingSuccessScreen() {
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


  // ========================================
  // ROUTE PARAMS
  // ========================================

  const params =
    useLocalSearchParams<{
      bookingId?:
        | string
        | string[];
    }>();


  const bookingId =
    Array.isArray(
      params.bookingId
    )
      ? params.bookingId[0]
      : params.bookingId;


  // ========================================
  // SCREEN
  // ========================================

  return (
    <SafeAreaView
      className="flex-1 bg-[#F8FAFC]"
      edges={[
        "top",
        "bottom",
      ]}
    >

      <View className="flex-1 justify-center px-6 pb-8">

        {/* ==================================
            SUCCESS ICON
        ================================== */}

        <View className="items-center">

          <View className="h-24 w-24 items-center justify-center rounded-full bg-green-50">

            <Ionicons
              name="checkmark-circle"
              size={64}
              color="#16A34A"
            />

          </View>


          {/* TITLE */}

          <Text
            className="mt-6 text-2xl font-bold text-[#0F172A]"
            style={{
              textAlign:
                "center",
            }}
          >
            {t(
              "bookingSuccess.title"
            )}
          </Text>


          {/* DESCRIPTION */}

          <Text
            className="mt-3 max-w-[320px] leading-6 text-[#64748B]"
            style={{
              textAlign:
                "center",
            }}
          >
            {t(
              "bookingSuccess.description"
            )}
          </Text>

        </View>


        {/* ==================================
            BOOKING ID
        ================================== */}

        {bookingId ? (

          <View className="mt-7 rounded-2xl border border-[#E2E8F0] bg-white px-5 py-4">

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

              <View className="h-10 w-10 items-center justify-center rounded-xl bg-[#EFF6FF]">

                <Ionicons
                  name="receipt-outline"
                  size={20}
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
                  className="text-xs text-[#94A3B8]"
                  style={{
                    textAlign:
                      isArabic
                        ? "right"
                        : "left",
                  }}
                >
                  {t(
                    "bookingSuccess.bookingId"
                  )}
                </Text>


                <Text
                  numberOfLines={
                    1
                  }
                  selectable
                  className="mt-1 font-semibold text-[#0F172A]"
                  style={{
                    writingDirection:
                      "ltr",

                    textAlign:
                      isArabic
                        ? "right"
                        : "left",
                  }}
                >
                  {bookingId}
                </Text>

              </View>

            </View>

          </View>

        ) : null}


        {/* ==================================
            INFO
        ================================== */}

        <View className="mt-5 rounded-2xl bg-[#EFF6FF] p-4">

          <View
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
              name="information-circle-outline"
              size={22}
              color="#2563EB"
            />


            <Text
              className="flex-1 text-sm leading-5 text-[#475569]"
              style={{
                marginStart:
                  10,

                textAlign:
                  isArabic
                    ? "right"
                    : "left",
              }}
            >
              {t(
                "bookingSuccess.nextStep"
              )}
            </Text>

          </View>

        </View>


        {/* ==================================
            BUTTONS
        ================================== */}

        <View className="mt-8">

          {/* MY BOOKINGS */}

          <Pressable
            onPress={() => {
              router.replace(
                "/(tabs)/bookings"
              );
            }}
            className="items-center rounded-2xl bg-[#2563EB] py-4 active:opacity-80"
          >

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

              <Ionicons
                name="calendar-outline"
                size={19}
                color="white"
              />


              <Text className="text-base font-bold text-white">
                {t(
                  "bookingSuccess.viewBookings"
                )}
              </Text>

            </View>

          </Pressable>


          {/* HOME */}

          <Pressable
            onPress={() => {
              router.replace(
                "/(tabs)"
              );
            }}
            className="mt-3 items-center rounded-2xl border border-[#E2E8F0] bg-white py-4 active:opacity-70"
          >

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

              <Ionicons
                name="home-outline"
                size={19}
                color="#2563EB"
              />


              <Text className="text-base font-bold text-[#2563EB]">
                {t(
                  "bookingSuccess.backHome"
                )}
              </Text>

            </View>

          </Pressable>

        </View>

      </View>

    </SafeAreaView>
  );
}
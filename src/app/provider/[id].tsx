import {
  useProviderDetailsStore,
} from "@/store/provider-details-store";

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
  Image,
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


export default function ProviderDetailsScreen() {
  const {
    t,
    i18n,
  } = useTranslation();


  // ========================================
  // LANGUAGE
  // ========================================

  const isArabic =
    i18n.language === "ar";


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


  const providerId =
    Array.isArray(
      params.id
    )
      ? params.id[0]
      : params.id;


  // ========================================
  // STORE
  // ========================================

  const provider =
    useProviderDetailsStore(
      (state) =>
        state.provider
    );

  const services =
    useProviderDetailsStore(
      (state) =>
        state.services
    );

  const availability =
    useProviderDetailsStore(
      (state) =>
        state.availability
    );

  const isLoading =
    useProviderDetailsStore(
      (state) =>
        state.isLoading
    );

  const error =
    useProviderDetailsStore(
      (state) =>
        state.error
    );

  const loadProvider =
    useProviderDetailsStore(
      (state) =>
        state.loadProvider
    );

  const clearProvider =
    useProviderDetailsStore(
      (state) =>
        state.clearProvider
    );


  // ========================================
  // LOAD
  // ========================================

  useEffect(() => {
    if (!providerId) {
      return;
    }

    loadProvider(
      providerId
    );


    return () => {
      clearProvider();
    };

  }, [
    providerId,
    loadProvider,
    clearProvider,
  ]);


  // ========================================
  // SERVICE TRANSLATION
  // ========================================

  const getServiceName = (
    item: {
      service: {
        slug: string;
        name: string;
      };
    }
  ) => {
    return t(
      `db.services.${item.service.slug}.name`,
      {
        defaultValue:
          item.service.name,
      }
    );
  };


  // ========================================
  // TIME
  // ========================================

  const formatTime = (
    time:
      | string
      | null
  ) => {
    if (!time) {
      return "";
    }

    return time.slice(
      0,
      5
    );
  };


  // ========================================
  // DAY TRANSLATION
  // ========================================

  const getDayName = (
    dayOfWeek: number
  ) => {
    const days = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];

    const day =
      days[
        dayOfWeek
      ];

    if (!day) {
      return "";
    }

    return t(
      `weekdays.${day}`
    );
  };


  // ========================================
  // LOADING
  // ========================================

  if (
    isLoading &&
    !provider
  ) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#F8FAFC]">

        <ActivityIndicator
          size="large"
          color="#2563EB"
        />


        <Text className="mt-3 text-[#64748B]">
          {t(
            "providerProfile.loading"
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
    !provider
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

          <View className="h-16 w-16 items-center justify-center rounded-full bg-red-50">

            <Ionicons
              name="alert-circle-outline"
              size={32}
              color="#EF4444"
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
              "providerProfile.loadError"
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
              "providerProfile.loadErrorDescription"
            )}
          </Text>


          <Pressable
            onPress={() => {
              if (
                providerId
              ) {
                loadProvider(
                  providerId
                );
              }
            }}
            className="mt-5 rounded-xl bg-[#2563EB] px-6 py-3 active:opacity-80"
          >

            <Text className="font-semibold text-white">
              {t(
                "common.retry"
              )}
            </Text>

          </Pressable>

        </View>

      </SafeAreaView>
    );
  }


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
              "providerProfile.title"
            )}
          </Text>

        </View>


        {/* ==================================
            PROVIDER CARD
        ================================== */}

        <View className="mt-6 items-center rounded-[28px] bg-white p-6">

          {/* PROFILE IMAGE */}

          {provider
            ?.profileImage ? (

            <Image
              source={{
                uri:
                  provider.profileImage,
              }}
              className="h-24 w-24 rounded-full"
            />

          ) : (

            <View className="h-24 w-24 items-center justify-center rounded-full bg-[#EFF6FF]">

              <Ionicons
                name="person"
                size={44}
                color="#2563EB"
              />

            </View>

          )}


          {/* NAME + VERIFIED */}

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

            <Text className="text-2xl font-bold text-[#0F172A]">
              {
                provider
                  ?.fullName
              }
            </Text>


            {provider
              ?.isVerified ? (

              <Ionicons
                name="checkmark-circle"
                size={22}
                color="#2563EB"
                style={{
                  marginStart:
                    7,
                }}
              />

            ) : null}

          </View>


          {/* CITY */}

          {provider?.city ? (

            <View
              className="mt-2"
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
                size={17}
                color="#64748B"
              />


              <Text
                className="text-[#64748B]"
                style={{
                  marginStart:
                    4,
                }}
              >
                {
                  provider.city
                }
              </Text>

            </View>

          ) : null}


          {/* ==================================
              STATS
          ================================== */}

          <View
            className="mt-5"
            style={{
              flexDirection:
                isArabic
                  ? "row-reverse"
                  : "row",
            }}
          >

            {/* EXPERIENCE */}

            <View className="items-center px-5">

              <Text className="text-xl font-bold text-[#2563EB]">
                {
                  provider
                    ?.experienceYears ??
                  0
                }
              </Text>


              <Text
                className="mt-1 text-xs text-[#64748B]"
                style={{
                  textAlign:
                    "center",
                }}
              >
                {t(
                  "providerProfile.yearsExperience"
                )}
              </Text>

            </View>


            <View className="h-12 w-[1px] bg-[#E2E8F0]" />


            {/* SERVICES */}

            <View className="items-center px-5">

              <Text className="text-xl font-bold text-[#2563EB]">
                {
                  services.length
                }
              </Text>


              <Text className="mt-1 text-xs text-[#64748B]">
                {t(
                  "providerProfile.services"
                )}
              </Text>

            </View>

          </View>

        </View>


        {/* ==================================
            ABOUT
        ================================== */}

        <View className="mt-7">

          <Text
            className="text-lg font-bold text-[#0F172A]"
            style={
              textDirection
            }
          >
            {t(
              "providerProfile.about"
            )}
          </Text>


          <View className="mt-3 rounded-2xl bg-white p-5">

            <Text
              className="leading-6 text-[#64748B]"
              style={
                textDirection
              }
            >
              {provider?.bio ||
                t(
                  "providerProfile.defaultBio"
                )}
            </Text>

          </View>

        </View>


        {/* ==================================
            SERVICES
        ================================== */}

        <View className="mt-7">

          <Text
            className="text-lg font-bold text-[#0F172A]"
            style={
              textDirection
            }
          >
            {t(
              "providerProfile.services"
            )}
          </Text>


          {services.length ===
          0 ? (

            <View className="mt-3 items-center rounded-2xl bg-white p-5">

              <Ionicons
                name="construct-outline"
                size={28}
                color="#94A3B8"
              />


              <Text
                className="mt-2 text-sm text-[#64748B]"
                style={{
                  textAlign:
                    "center",
                }}
              >
                {t(
                  "providerProfile.noServices"
                )}
              </Text>

            </View>

          ) : null}


          {services.map(
            (item) => {
              const price =
                item.priceAgorot /
                100;


              return (
                <View
                  key={
                    item.providerServiceId
                  }
                  className="mt-3 rounded-2xl border border-[#E2E8F0] bg-white p-4"
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

                    {/* ICON */}

                    <View className="h-12 w-12 items-center justify-center rounded-xl bg-[#EFF6FF]">

                      <Ionicons
                        name={
                          (item
                            .service
                            .icon ||
                            "construct-outline") as keyof typeof Ionicons.glyphMap
                        }
                        size={23}
                        color="#2563EB"
                      />

                    </View>


                    {/* SERVICE */}

                    <View
                      className="flex-1"
                      style={{
                        marginStart:
                          12,
                      }}
                    >

                      <Text
                        className="font-bold text-[#0F172A]"
                        style={
                          textDirection
                        }
                      >
                        {
                          getServiceName(
                            item
                          )
                        }
                      </Text>


                      <Text
                        className="mt-1 text-sm text-[#64748B]"
                        style={
                          textDirection
                        }
                      >
                        {t(
                          "providerProfile.startingPrice"
                        )}
                      </Text>

                    </View>


                    {/* PRICE */}

                    <Text
                      className="text-lg font-bold text-[#2563EB]"
                      style={{
                        marginStart:
                          8,
                      }}
                    >
                      {price} ₪
                    </Text>

                  </View>

                </View>
              );
            }
          )}

        </View>


        {/* ==================================
            WORKING HOURS
        ================================== */}

        <View className="mt-7">

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

            <View className="h-11 w-11 items-center justify-center rounded-xl bg-[#EFF6FF]">

              <Ionicons
                name="time-outline"
                size={22}
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
                className="text-lg font-bold text-[#0F172A]"
                style={
                  textDirection
                }
              >
                {t(
                  "providerProfile.workingHours"
                )}
              </Text>


              <Text
                className="mt-1 text-sm text-[#64748B]"
                style={
                  textDirection
                }
              >
                {t(
                  "providerProfile.weeklyAvailability"
                )}
              </Text>

            </View>

          </View>


          {/* ==================================
              NO AVAILABILITY
          ================================== */}

          {availability.length ===
          0 ? (

            <View className="mt-4 items-center rounded-2xl border border-[#E2E8F0] bg-white p-5">

              <Ionicons
                name="calendar-outline"
                size={28}
                color="#94A3B8"
              />


              <Text className="mt-2 text-sm text-[#64748B]">
                {t(
                  "providerProfile.noWorkingHours"
                )}
              </Text>

            </View>

          ) : (

            <View className="mt-4 overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white">

              {availability.map(
                (
                  day,
                  index
                ) => {
                  const isLast =
                    index ===
                    availability.length -
                      1;


                  return (
                    <View
                      key={
                        day.id
                      }
                      className={`px-4 py-4 ${
                        !isLast
                          ? "border-b border-[#E2E8F0]"
                          : ""
                      }`}
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

                      {/* DAY */}

                      <View
                        className="flex-1"
                        style={{
                          flexDirection:
                            isArabic
                              ? "row-reverse"
                              : "row",

                          alignItems:
                            "center",
                        }}
                      >

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


                        <Text
                          className="font-semibold text-[#0F172A]"
                          style={{
                            marginStart:
                              12,

                            ...textDirection,
                          }}
                        >
                          {
                            getDayName(
                              day.dayOfWeek
                            )
                          }
                        </Text>

                      </View>


                      {/* TIME */}

                      {day.isAvailable ? (

                        <View
                          className="rounded-lg bg-green-50 px-3 py-2"
                          style={{
                            marginStart:
                              8,
                          }}
                        >

                          <Text
                            className="text-sm font-semibold text-green-700"
                            style={{
                              writingDirection:
                                "ltr",
                            }}
                          >
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

                        <View
                          className="rounded-lg bg-[#F1F5F9] px-3 py-2"
                          style={{
                            marginStart:
                              8,
                          }}
                        >

                          <Text className="text-sm font-semibold text-[#94A3B8]">
                            {t(
                              "providerProfile.closed"
                            )}
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


        {/* ==================================
            BOOK BUTTON
        ================================== */}

        <Pressable
          onPress={() => {
            if (
              !provider?.id
            ) {
              return;
            }

            router.push({
              pathname:
                "/booking/[providerId]",

              params: {
                providerId:
                  provider.id,
              },
            });
          }}
          className="mt-8 items-center rounded-2xl bg-[#2563EB] py-4 active:opacity-80"
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

            <Text className="text-base font-bold text-white">
              {t(
                "providerProfile.bookProvider"
              )}
            </Text>


            <Ionicons
              name={
                isArabic
                  ? "arrow-back"
                  : "arrow-forward"
              }
              size={18}
              color="white"
            />

          </View>

        </Pressable>

      </ScrollView>

    </SafeAreaView>
  );
}
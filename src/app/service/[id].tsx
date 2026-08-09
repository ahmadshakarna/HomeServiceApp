import {
  useServiceDetailsStore,
} from "@/store/service-details-store";

import {
  useProviderStore,
} from "@/store/provider-store";

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


export default function ServiceDetailsScreen() {
  const {
    t,
    i18n,
  } = useTranslation();


  // ========================================
  // LANGUAGE
  // ========================================

  const isArabic =
    i18n.language === "ar";


  // ========================================
  // ROUTE
  // ========================================

  const params =
    useLocalSearchParams<{
      id:
        | string
        | string[];
    }>();


  const serviceId =
    Array.isArray(
      params.id
    )
      ? params.id[0]
      : params.id;


  // ========================================
  // SERVICE STORE
  // ========================================

  const service =
    useServiceDetailsStore(
      (state) =>
        state.service
    );

  const category =
    useServiceDetailsStore(
      (state) =>
        state.category
    );

  const isLoading =
    useServiceDetailsStore(
      (state) =>
        state.isLoading
    );

  const error =
    useServiceDetailsStore(
      (state) =>
        state.error
    );

  const loadService =
    useServiceDetailsStore(
      (state) =>
        state.loadService
    );

  const clearService =
    useServiceDetailsStore(
      (state) =>
        state.clearService
    );


  // ========================================
  // PROVIDER STORE
  // ========================================

  const providers =
    useProviderStore(
      (state) =>
        state.providers
    );

  const providersLoading =
    useProviderStore(
      (state) =>
        state.isLoading
    );

  const providersError =
    useProviderStore(
      (state) =>
        state.error
    );

  const loadProviders =
    useProviderStore(
      (state) =>
        state.loadProviders
    );

  const clearProviders =
    useProviderStore(
      (state) =>
        state.clearProviders
    );


  // ========================================
  // LOAD
  // ========================================

  useEffect(() => {
    if (!serviceId) {
      return;
    }

    loadService(
      serviceId
    );

    loadProviders(
      serviceId
    );


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


  // ========================================
  // RTL
  // ========================================

  const textDirection = {
    textAlign:
      isArabic
        ? ("right" as const)
        : ("left" as const),
  };


  // ========================================
  // DATABASE TRANSLATION
  // ========================================

  const getServiceName =
    () => {
      if (!service) {
        return "";
      }

      return t(
        `db.services.${service.slug}.name`,
        {
          defaultValue:
            service.name,
        }
      );
    };


  const getServiceDescription =
    () => {
      if (
        !service?.description
      ) {
        return t(
          "serviceDetails.defaultDescription"
        );
      }

      return t(
        `db.services.${service.slug}.description`,
        {
          defaultValue:
            service.description,
        }
      );
    };


  const getCategoryName =
    () => {
      if (!category) {
        return "";
      }

      return t(
        `db.categories.${category.slug}.name`,
        {
          defaultValue:
            category.name,
        }
      );
    };


  // ========================================
  // LOADING
  // ========================================

  if (
    isLoading &&
    !service
  ) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#F8FAFC]">

        <ActivityIndicator
          size="large"
          color="#2563EB"
        />

        <Text className="mt-3 text-sm text-[#64748B]">
          {t(
            "serviceDetails.loading"
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
    !service
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
              "serviceDetails.loadError"
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
              "serviceDetails.loadErrorDescription"
            )}
          </Text>


          <Pressable
            onPress={() => {
              if (
                serviceId
              ) {
                loadService(
                  serviceId
                );

                loadProviders(
                  serviceId
                );
              }
            }}
            className="mt-5 rounded-xl bg-[#2563EB] px-6 py-3"
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
            40,
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
              "serviceDetails.title"
            )}
          </Text>

        </View>


        {/* ==================================
            MAIN SERVICE CARD
        ================================== */}

        <View className="mt-6 rounded-[28px] bg-[#2563EB] p-6">

          <View
            style={{
              alignItems:
                isArabic
                  ? "flex-end"
                  : "flex-start",
            }}
          >

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

          </View>


          {/* CATEGORY */}

          <View
            className="mt-5 rounded-full bg-white/15 px-3 py-1.5"
            style={{
              alignSelf:
                isArabic
                  ? "flex-end"
                  : "flex-start",
            }}
          >

            <Text className="text-xs font-semibold text-white">
              {
                getCategoryName()
              }
            </Text>

          </View>


          {/* SERVICE NAME */}

          <Text
            className="mt-4 text-2xl font-bold text-white"
            style={
              textDirection
            }
          >
            {
              getServiceName()
            }
          </Text>


          {/* SERVICE DESCRIPTION */}

          <Text
            className="mt-3 text-[15px] leading-6 text-white/80"
            style={
              textDirection
            }
          >
            {
              getServiceDescription()
            }
          </Text>

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
              "serviceDetails.about"
            )}
          </Text>


          <View className="mt-3 rounded-2xl border border-[#E2E8F0] bg-white p-5">

            <Text
              className="text-[15px] leading-6 text-[#64748B]"
              style={
                textDirection
              }
            >
              {
                getServiceDescription()
              }
            </Text>

          </View>

        </View>


        {/* ==================================
            SERVICE INFORMATION
        ================================== */}

        <View className="mt-6">

          <Text
            className="text-lg font-bold text-[#0F172A]"
            style={
              textDirection
            }
          >
            {t(
              "serviceDetails.information"
            )}
          </Text>


          <View className="mt-3 rounded-2xl border border-[#E2E8F0] bg-white">

            {/* CATEGORY ROW */}

            <View
              className="p-4"
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
                  name="grid-outline"
                  size={21}
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
                  style={
                    textDirection
                  }
                >
                  {t(
                    "serviceDetails.category"
                  )}
                </Text>


                <Text
                  className="mt-1 font-semibold text-[#0F172A]"
                  style={
                    textDirection
                  }
                >
                  {
                    getCategoryName()
                  }
                </Text>

              </View>

            </View>


            <View className="mx-4 h-[1px] bg-[#E2E8F0]" />


            {/* STATUS ROW */}

            <View
              className="p-4"
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
                  name="checkmark-circle-outline"
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
                  className="text-xs text-[#94A3B8]"
                  style={
                    textDirection
                  }
                >
                  {t(
                    "serviceDetails.status"
                  )}
                </Text>


                <Text
                  className="mt-1 font-semibold text-[#0F172A]"
                  style={
                    textDirection
                  }
                >
                  {t(
                    "serviceDetails.available"
                  )}
                </Text>

              </View>

            </View>

          </View>

        </View>


        {/* ==================================
            PROVIDERS
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

            <View className="flex-1">

              <Text
                className="text-lg font-bold text-[#0F172A]"
                style={
                  textDirection
                }
              >
                {t(
                  "serviceDetails.availableProviders"
                )}
              </Text>


              <Text
                className="mt-1 text-sm text-[#64748B]"
                style={
                  textDirection
                }
              >
                {t(
                  "serviceDetails.chooseProvider"
                )}
              </Text>

            </View>


            {providers.length >
            0 ? (

              <View
                className="rounded-full bg-[#DBEAFE] px-3 py-1.5"
                style={{
                  marginStart:
                    10,
                }}
              >

                <Text className="text-xs font-bold text-[#2563EB]">
                  {
                    providers.length
                  }
                </Text>

              </View>

            ) : null}

          </View>


          {/* ==================================
              PROVIDERS LOADING
          ================================== */}

          {providersLoading ? (

            <View className="mt-4 items-center rounded-2xl bg-white p-6">

              <ActivityIndicator
                size="small"
                color="#2563EB"
              />


              <Text className="mt-3 text-sm text-[#64748B]">
                {t(
                  "serviceDetails.loadingProviders"
                )}
              </Text>

            </View>

          ) : null}


          {/* ==================================
              PROVIDERS ERROR
          ================================== */}

          {!providersLoading &&
          providersError ? (

            <View className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-5">

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
                  name="alert-circle-outline"
                  size={22}
                  color="#EF4444"
                />


                <Text
                  className="flex-1 text-sm text-[#EF4444]"
                  style={{
                    marginStart:
                      8,

                    ...textDirection,
                  }}
                >
                  {t(
                    "serviceDetails.providersLoadError"
                  )}
                </Text>

              </View>


              <Pressable
                onPress={() => {
                  if (
                    serviceId
                  ) {
                    loadProviders(
                      serviceId
                    );
                  }
                }}
                className="mt-4 rounded-xl bg-[#EF4444] px-4 py-2.5"
                style={{
                  alignSelf:
                    isArabic
                      ? "flex-end"
                      : "flex-start",
                }}
              >

                <Text className="font-semibold text-white">
                  {t(
                    "common.retry"
                  )}
                </Text>

              </Pressable>

            </View>

          ) : null}


          {/* ==================================
              NO PROVIDERS
          ================================== */}

          {!providersLoading &&
          !providersError &&
          providers.length ===
            0 ? (

            <View className="mt-4 items-center rounded-2xl border border-[#E2E8F0] bg-white p-6">

              <View className="h-14 w-14 items-center justify-center rounded-full bg-[#F1F5F9]">

                <Ionicons
                  name="people-outline"
                  size={27}
                  color="#64748B"
                />

              </View>


              <Text
                className="mt-3 font-bold text-[#0F172A]"
                style={{
                  textAlign:
                    "center",
                }}
              >
                {t(
                  "serviceDetails.noProviders"
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
                  "serviceDetails.noProvidersDescription"
                )}
              </Text>

            </View>

          ) : null}


          {/* ==================================
              PROVIDERS LIST
          ================================== */}

          {!providersLoading &&
            providers.map(
              (item) => {
                const price =
                  item.priceAgorot /
                  100;


                return (
                  <View
                    key={
                      item.providerServiceId
                    }
                    className="mt-4 rounded-2xl border border-[#E2E8F0] bg-white p-5"
                  >

                    {/* =========================
                        PROVIDER TOP
                    ========================= */}

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

                      {/* AVATAR */}

                      <View className="h-14 w-14 items-center justify-center rounded-full bg-[#EFF6FF]">

                        <Ionicons
                          name="person-outline"
                          size={26}
                          color="#2563EB"
                        />

                      </View>


                      {/* PROVIDER INFO */}

                      <View
                        className="flex-1"
                        style={{
                          marginStart:
                            14,
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

                            justifyContent:
                              isArabic
                                ? "flex-start"
                                : "flex-start",
                          }}
                        >

                          <Text
                            className="text-base font-bold text-[#0F172A]"
                            style={
                              textDirection
                            }
                          >
                            {
                              item
                                .provider
                                .fullName
                            }
                          </Text>


                          {item
                            .provider
                            .isVerified ? (

                            <Ionicons
                              name="checkmark-circle"
                              size={18}
                              color="#2563EB"
                              style={{
                                marginStart:
                                  6,
                              }}
                            />

                          ) : null}

                        </View>


                        {item
                          .provider
                          .city ? (

                          <View
                            className="mt-1"
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
                              size={14}
                              color="#64748B"
                            />


                            <Text
                              className="text-sm text-[#64748B]"
                              style={{
                                marginStart:
                                  4,

                                ...textDirection,
                              }}
                            >
                              {
                                item
                                  .provider
                                  .city
                              }
                            </Text>

                          </View>

                        ) : null}

                      </View>


                      {/* PRICE */}

                      <View
                        style={{
                          marginStart:
                            10,

                          alignItems:
                            isArabic
                              ? "flex-start"
                              : "flex-end",
                        }}
                      >

                        <Text className="text-xs text-[#94A3B8]">
                          {t(
                            "serviceDetails.price"
                          )}
                        </Text>


                        <Text className="mt-1 text-lg font-bold text-[#2563EB]">
                          {price} ₪
                        </Text>

                      </View>

                    </View>


                    {/* =========================
                        BIO
                    ========================= */}

                    {item.provider
                      .bio ? (

                      <Text
                        numberOfLines={
                          2
                        }
                        className="mt-4 text-sm leading-5 text-[#64748B]"
                        style={
                          textDirection
                        }
                      >
                        {
                          item
                            .provider
                            .bio
                        }
                      </Text>

                    ) : null}


                    {/* =========================
                        EXPERIENCE + VERIFIED
                    ========================= */}

                    <View
                      className="mt-4"
                      style={{
                        flexDirection:
                          isArabic
                            ? "row-reverse"
                            : "row",

                        flexWrap:
                          "wrap",

                        gap:
                          8,
                      }}
                    >

                      <View
                        className="rounded-xl bg-[#F8FAFC] px-3 py-2"
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
                          name="briefcase-outline"
                          size={16}
                          color="#64748B"
                        />


                        <Text
                          className="text-xs font-semibold text-[#475569]"
                          style={{
                            marginStart:
                              7,
                          }}
                        >
                          {t(
                            "serviceDetails.experienceYears",
                            {
                              count:
                                item
                                  .provider
                                  .experienceYears,
                            }
                          )}
                        </Text>

                      </View>


                      {item
                        .provider
                        .isVerified ? (

                        <View
                          className="rounded-xl bg-green-50 px-3 py-2"
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
                            name="shield-checkmark-outline"
                            size={16}
                            color="#16A34A"
                          />


                          <Text
                            className="text-xs font-semibold text-green-700"
                            style={{
                              marginStart:
                                7,
                            }}
                          >
                            {t(
                              "serviceDetails.verified"
                            )}
                          </Text>

                        </View>

                      ) : null}

                    </View>


                    {/* =========================
                        VIEW PROVIDER
                    ========================= */}

                    <Pressable
                      onPress={() =>
                        router.push({
                          pathname:
                            "/provider/[id]",

                          params: {
                            id:
                              item
                                .provider
                                .id,
                          },
                        })
                      }
                      className="mt-5 items-center rounded-xl bg-[#2563EB] py-3.5 active:opacity-80"
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
                            7,
                        }}
                      >

                        <Text className="font-bold text-white">
                          {t(
                            "serviceDetails.viewProvider"
                          )}
                        </Text>


                        <Ionicons
                          name={
                            isArabic
                              ? "arrow-back"
                              : "arrow-forward"
                          }
                          size={17}
                          color="white"
                        />

                      </View>

                    </Pressable>

                  </View>
                );
              }
            )}

        </View>

      </ScrollView>

    </SafeAreaView>
  );
}
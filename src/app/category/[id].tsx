import { useServiceStore } from "@/store/service-store";

import { Ionicons } from "@expo/vector-icons";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import React, {
  useEffect,
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


export default function CategoryDetailsScreen() {
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


  const categoryId =
    Array.isArray(
      params.id
    )
      ? params.id[0]
      : params.id;


  // ========================================
  // STORE
  // ========================================

  const category =
    useServiceStore(
      (state) =>
        state.category
    );

  const services =
    useServiceStore(
      (state) =>
        state.services
    );

  const isLoading =
    useServiceStore(
      (state) =>
        state.isLoading
    );

  const error =
    useServiceStore(
      (state) =>
        state.error
    );

  const loadCategoryServices =
    useServiceStore(
      (state) =>
        state.loadCategoryServices
    );

  const clearCategoryServices =
    useServiceStore(
      (state) =>
        state.clearCategoryServices
    );


  // ========================================
  // LOAD
  // ========================================

  useEffect(() => {
    if (!categoryId) {
      return;
    }

    loadCategoryServices(
      categoryId
    );


    return () => {
      clearCategoryServices();
    };

  }, [
    categoryId,
    loadCategoryServices,
    clearCategoryServices,
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
  // DATABASE CATEGORY TRANSLATION
  // ========================================

  const getCategoryName =
    () => {
      if (!category) {
        return t(
          "services.title"
        );
      }

      return t(
        `db.categories.${category.slug}.name`,
        {
          defaultValue:
            category.name,
        }
      );
    };


  const getCategoryDescription =
    () => {
      if (
        !category?.description
      ) {
        return null;
      }

      return t(
        `db.categories.${category.slug}.description`,
        {
          defaultValue:
            category.description,
        }
      );
    };


  // ========================================
  // DATABASE SERVICE TRANSLATION
  // ========================================

  const getServiceName = (
    service: {
      slug: string;
      name: string;
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


  const getServiceDescription = (
    service: {
      slug: string;
      description:
        | string
        | null;
    }
  ) => {
    if (
      !service.description
    ) {
      return null;
    }

    return t(
      `db.services.${service.slug}.description`,
      {
        defaultValue:
          service.description,
      }
    );
  };


  // ========================================
  // LOADING
  // ========================================

  if (
    isLoading &&
    !category
  ) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#F8FAFC]">

        <ActivityIndicator
          size="large"
          color="#2563EB"
        />


        <Text className="mt-3 text-sm text-[#64748B]">
          {t(
            "services.loading"
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
    !category
  ) {
    return (
      <SafeAreaView className="flex-1 bg-[#F8FAFC] px-5">

        {/* BACK */}

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
              "services.loadError"
            )}
          </Text>


          <Pressable
            onPress={() => {
              if (
                categoryId
              ) {
                loadCategoryServices(
                  categoryId
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

      <FlatList
        data={
          services
        }

        keyExtractor={(
          item
        ) =>
          item.id
        }

        showsVerticalScrollIndicator={
          false
        }

        refreshing={
          isLoading
        }

        onRefresh={() => {
          if (
            categoryId
          ) {
            loadCategoryServices(
              categoryId
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
          <View>

            {/* =============================
                TOP HEADER
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
                numberOfLines={
                  1
                }
                className="flex-1 text-xl font-bold text-[#0F172A]"
                style={{
                  marginStart:
                    16,

                  ...textDirection,
                }}
              >
                {
                  getCategoryName()
                }
              </Text>

            </View>


            {/* =============================
                CATEGORY HERO
            ============================= */}

            <View className="mb-6 mt-6 rounded-3xl bg-[#2563EB] p-5">

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


                <View
                  className="flex-1"
                  style={{
                    marginStart:
                      14,
                  }}
                >

                  <Text
                    className="text-2xl font-bold text-white"
                    style={
                      textDirection
                    }
                  >
                    {
                      getCategoryName()
                    }
                  </Text>


                  {category?.description ? (

                    <Text
                      className="mt-2 leading-5 text-white/80"
                      style={
                        textDirection
                      }
                    >
                      {
                        getCategoryDescription()
                      }
                    </Text>

                  ) : null}

                </View>

              </View>


              {/* SERVICES COUNT */}

              <Text
                className="mt-4 text-sm font-semibold text-white"
                style={
                  textDirection
                }
              >
                {t(
                  "services.availableCount",
                  {
                    count:
                      services.length,
                  }
                )}
              </Text>

            </View>


            {/* =============================
                AVAILABLE SERVICES TITLE
            ============================= */}

            <Text
              className="mb-4 text-lg font-bold text-[#0F172A]"
              style={
                textDirection
              }
            >
              {t(
                "services.availableServices"
              )}
            </Text>

          </View>
        }


        // ==================================
        // EMPTY
        // ==================================

        ListEmptyComponent={
          <View className="flex-1 items-center justify-center pb-20">

            <View className="h-16 w-16 items-center justify-center rounded-full bg-[#EFF6FF]">

              <Ionicons
                name="construct-outline"
                size={30}
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
                "services.noServices"
              )}
            </Text>


            <Text
              className="mt-1 text-sm text-[#64748B]"
              style={{
                textAlign:
                  "center",
              }}
            >
              {t(
                "services.emptyDescription"
              )}
            </Text>

          </View>
        }


        // ==================================
        // SERVICE CARD
        // ==================================

        renderItem={({
          item,
        }) => (

          <Pressable
            onPress={() =>
              router.push({
                pathname:
                  "/service/[id]",

                params: {
                  id:
                    item.id,
                },
              })
            }
            className="mb-4 rounded-2xl border border-[#E2E8F0] bg-white p-4 active:opacity-70"
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

              {/* =============================
                  SERVICE ICON
              ============================= */}

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


              {/* =============================
                  SERVICE INFO
              ============================= */}

              <View
                className="flex-1"
                style={{
                  marginStart:
                    16,
                }}
              >

                <Text
                  className="text-[16px] font-bold text-[#0F172A]"
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


                {item.description ? (

                  <Text
                    numberOfLines={
                      2
                    }
                    className="mt-1 text-sm leading-5 text-[#64748B]"
                    style={
                      textDirection
                    }
                  >
                    {
                      getServiceDescription(
                        item
                      )
                    }
                  </Text>

                ) : null}

              </View>


              {/* =============================
                  ARROW
              ============================= */}

              <Ionicons
                name={
                  isArabic
                    ? "chevron-back"
                    : "chevron-forward"
                }
                size={20}
                color="#94A3B8"
                style={{
                  marginStart:
                    10,
                }}
              />

            </View>

          </Pressable>

        )}
      />

    </SafeAreaView>
  );
}
import { useCategoryStore } from "@/store/category-store";

import { Ionicons } from "@expo/vector-icons";

import { router } from "expo-router";

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


export default function CategoriesScreen() {
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
  // STORE
  // ========================================

  const categories =
    useCategoryStore(
      (state) =>
        state.categories
    );

  const isLoading =
    useCategoryStore(
      (state) =>
        state.isLoading
    );

  const error =
    useCategoryStore(
      (state) =>
        state.error
    );

  const loadCategories =
    useCategoryStore(
      (state) =>
        state.loadCategories
    );


  // ========================================
  // LOAD
  // ========================================

  useEffect(() => {
    loadCategories();
  }, [
    loadCategories,
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

  const getCategoryName = (
    item: {
      slug: string;
      name: string;
    }
  ) => {
    return t(
      `db.categories.${item.slug}.name`,
      {
        defaultValue:
          item.name,
      }
    );
  };


  const getCategoryDescription = (
    item: {
      slug: string;
      description:
        | string
        | null;
    }
  ) => {
    if (
      !item.description
    ) {
      return null;
    }

    return t(
      `db.categories.${item.slug}.description`,
      {
        defaultValue:
          item.description,
      }
    );
  };


  // ========================================
  // FIRST LOADING
  // ========================================

  if (
    isLoading &&
    categories.length === 0
  ) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#F8FAFC]">

        <ActivityIndicator
          size="large"
          color="#2563EB"
        />

        <Text className="mt-3 text-sm text-[#64748B]">
          {t(
            "categories.loading"
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
    categories.length === 0
  ) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#F8FAFC] px-6">

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
            "common.error"
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
            "categories.loadError"
          )}
        </Text>


        <Pressable
          onPress={
            loadCategories
          }
          className="mt-5 rounded-xl bg-[#2563EB] px-6 py-3 active:opacity-80"
        >

          <Text className="font-semibold text-white">
            {t(
              "common.retry"
            )}
          </Text>

        </Pressable>

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
          categories
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

        onRefresh={
          loadCategories
        }

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
          <View className="mb-5 mt-3">

            <Text
              className="text-2xl font-bold text-[#0F172A]"
              style={
                textDirection
              }
            >
              {t(
                "categories.allCategories"
              )}
            </Text>


            <Text
              className="mt-1 text-sm text-[#64748B]"
              style={
                textDirection
              }
            >
              {t(
                "categories.subtitle"
              )}
            </Text>

          </View>
        }


        // ==================================
        // EMPTY
        // ==================================

        ListEmptyComponent={
          <View className="flex-1 items-center justify-center pb-24">

            <View className="h-16 w-16 items-center justify-center rounded-full bg-[#EFF6FF]">

              <Ionicons
                name="grid-outline"
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
                "categories.noCategories"
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
                "categories.emptyDescription"
              )}
            </Text>

          </View>
        }


        // ==================================
        // CATEGORY CARD
        // ==================================

        renderItem={({
          item,
        }) => (

          <Pressable
            onPress={() =>
              router.push({
                pathname:
                  "/category/[id]",

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
                  ICON
              ============================= */}

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


              {/* =============================
                  INFORMATION
              ============================= */}

              <View
                className="flex-1"
                style={{
                  marginStart:
                    16,
                }}
              >

                {/* CATEGORY NAME */}

                <Text
                  className="text-[17px] font-bold text-[#0F172A]"
                  style={
                    textDirection
                  }
                >
                  {
                    getCategoryName(
                      item
                    )
                  }
                </Text>


                {/* SERVICES COUNT */}

                <Text
                  className="mt-1 text-sm font-medium text-[#2563EB]"
                  style={
                    textDirection
                  }
                >
                  {
                    item.servicesCount
                  }{" "}
                  {
                    item.servicesCount ===
                    1
                      ? t(
                          "categories.service"
                        )
                      : t(
                          "categories.services"
                        )
                  }
                </Text>


                {/* DESCRIPTION */}

                {item.description ? (

                  <Text
                    numberOfLines={
                      2
                    }
                    className="mt-1 text-xs leading-5 text-[#94A3B8]"
                    style={
                      textDirection
                    }
                  >
                    {
                      getCategoryDescription(
                        item
                      )
                    }
                  </Text>

                ) : null}

              </View>


              {/* =============================
                  ARROW
              ============================= */}

              <View
                className="h-9 w-9 items-center justify-center rounded-full bg-[#F8FAFC]"
                style={{
                  marginStart:
                    10,
                }}
              >

                <Ionicons
                  name={
                    isArabic
                      ? "chevron-back"
                      : "chevron-forward"
                  }
                  size={18}
                  color="#94A3B8"
                />

              </View>

            </View>

          </Pressable>

        )}
      />

    </SafeAreaView>
  );
}
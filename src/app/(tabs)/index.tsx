import {
  useUser,
} from "@clerk/expo";

import {
  Ionicons,
} from "@expo/vector-icons";

import {
  router,
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

import {
  useCategoryStore,
} from "@/store/category-store";


// ========================================
// HOME SCREEN
// ========================================

export default function HomeScreen() {
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
    i18n.language === "ar";


  // ========================================
  // CATEGORIES STORE
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
    category: {
      slug: string;
      name: string;
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


  const getCategoryDescription = (
    category: {
      slug: string;
      description:
        | string
        | null;
    }
  ) => {
    if (
      !category.description
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
  // USER FIRST NAME
  // ========================================

  const firstName =
    user?.firstName ||
    user?.fullName
      ?.split(" ")[0] ||
    "";


  // ========================================
  // UI
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

        <View className="mt-4">

          <Text
            className="text-sm font-medium text-[#64748B]"
            style={
              textDirection
            }
          >
            {t(
              "home.welcome"
            )}
            {firstName
              ? ` ${firstName}`
              : ""}
            👋
          </Text>


          <Text
            className="mt-1 text-3xl font-bold text-[#0F172A]"
            style={
              textDirection
            }
          >
            {t(
              "home.title"
            )}
          </Text>

        </View>


        {/* ==================================
            HERO
        ================================== */}

        <View className="mt-6 overflow-hidden rounded-3xl bg-[#2563EB] p-6">

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
                className="text-2xl font-bold leading-8 text-white"
                style={
                  textDirection
                }
              >
                {t(
                  "home.heroTitle"
                )}
              </Text>


              <Text
                className="mt-3 text-sm leading-6 text-blue-100"
                style={
                  textDirection
                }
              >
                {t(
                  "home.heroDescription"
                )}
              </Text>


              <Pressable
                onPress={() => {
                  router.push(
                    "/categories"
                  );
                }}
                className="mt-5 self-start rounded-xl bg-white px-5 py-3 active:opacity-80"
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

                  <Text className="font-bold text-[#2563EB]">
                    {t(
                      "home.browseServices"
                    )}
                  </Text>


                  <Ionicons
                    name={
                      isArabic
                        ? "arrow-back"
                        : "arrow-forward"
                    }
                    size={17}
                    color="#2563EB"
                  />

                </View>

              </Pressable>

            </View>


            <View
              className="h-24 w-24 items-center justify-center rounded-full bg-white/15"
              style={{
                marginStart:
                  14,
              }}
            >

              <Ionicons
                name="home-outline"
                size={48}
                color="white"
              />

            </View>

          </View>

        </View>


        {/* ==================================
            CATEGORIES HEADER
        ================================== */}

        <View
          className="mt-9"
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
              className="text-xl font-bold text-[#0F172A]"
              style={
                textDirection
              }
            >
              {t(
                "home.categories"
              )}
            </Text>


            <Text
              className="mt-1 text-sm text-[#64748B]"
              style={
                textDirection
              }
            >
              {t(
                "home.categoriesDescription"
              )}
            </Text>

          </View>


          <Pressable
            onPress={() => {
              router.push(
                "/categories"
              );
            }}
            className="px-2 py-2"
          >

            <Text className="font-bold text-[#2563EB]">
              {t(
                "home.viewAll"
              )}
            </Text>

          </Pressable>

        </View>


        {/* ==================================
            LOADING
        ================================== */}

        {isLoading &&
        categories.length ===
          0 ? (

          <View className="items-center py-16">

            <ActivityIndicator
              size="large"
              color="#2563EB"
            />

            <Text className="mt-3 text-sm text-[#64748B]">
              {t(
                "common.loading"
              )}
            </Text>

          </View>

        ) : null}


        {/* ==================================
            ERROR
        ================================== */}

        {error &&
        categories.length ===
          0 ? (

          <View className="mt-6 items-center rounded-2xl bg-white p-6">

            <View className="h-14 w-14 items-center justify-center rounded-full bg-red-50">

              <Ionicons
                name="alert-circle-outline"
                size={28}
                color="#EF4444"
              />

            </View>


            <Text
              className="mt-4 text-lg font-bold text-[#0F172A]"
              style={
                textDirection
              }
            >
              {t(
                "common.error"
              )}
            </Text>


            <Pressable
              onPress={
                loadCategories
              }
              className="mt-5 rounded-xl bg-[#2563EB] px-6 py-3"
            >

              <Text className="font-bold text-white">
                {t(
                  "common.retry"
                )}
              </Text>

            </Pressable>

          </View>

        ) : null}


        {/* ==================================
            CATEGORY GRID
        ================================== */}

        {!isLoading ||
        categories.length >
          0 ? (

          <View
            className="mt-5"
            style={{
              flexDirection:
                isArabic
                  ? "row-reverse"
                  : "row",

              flexWrap:
                "wrap",

              justifyContent:
                "space-between",
            }}
          >

            {categories
              .slice(
                0,
                6
              )
              .map(
                (
                  category
                ) => (

                  <Pressable
                    key={
                      category.id
                    }
                    onPress={() => {
                      router.push({
                        pathname:
                          "/category/[id]",

                        params: {
                          id:
                            category.id,
                        },
                      });
                    }}
                    className="mb-4 rounded-2xl border border-[#E2E8F0] bg-white p-4 active:opacity-70"
                    style={{
                      width:
                        "48%",
                    }}
                  >

                    {/* ICON */}

                    <View className="h-12 w-12 items-center justify-center rounded-2xl bg-[#EFF6FF]">

                      <Ionicons
                        name={
                          (category.icon ||
                            "grid-outline") as keyof typeof Ionicons.glyphMap
                        }
                        size={24}
                        color="#2563EB"
                      />

                    </View>


                    {/* NAME */}

                    <Text
                      numberOfLines={
                        2
                      }
                      className="mt-4 text-base font-bold text-[#0F172A]"
                      style={
                        textDirection
                      }
                    >
                      {
                        getCategoryName(
                          category
                        )
                      }
                    </Text>


                    {/* SERVICE COUNT */}

                    <Text
                      className="mt-2 text-xs font-medium text-[#2563EB]"
                      style={
                        textDirection
                      }
                    >
                      {t(
                        "home.servicesCount",
                        {
                          count:
                            category.servicesCount,
                        }
                      )}
                    </Text>


                    {/* DESCRIPTION */}

                    {category.description ? (

                      <Text
                        numberOfLines={
                          2
                        }
                        className="mt-2 text-xs leading-5 text-[#94A3B8]"
                        style={
                          textDirection
                        }
                      >
                        {
                          getCategoryDescription(
                            category
                          )
                        }
                      </Text>

                    ) : null}

                  </Pressable>

                )
              )}

          </View>

        ) : null}


        {/* ==================================
            EMPTY
        ================================== */}

        {!isLoading &&
        categories.length ===
          0 &&
        !error ? (

          <View className="items-center py-16">

            <Ionicons
              name="grid-outline"
              size={36}
              color="#94A3B8"
            />

            <Text
              className="mt-4 text-[#64748B]"
              style={
                textDirection
              }
            >
              {t(
                "categories.noCategories"
              )}
            </Text>

          </View>

        ) : null}


        {/* ==================================
            HOW IT WORKS
        ================================== */}

        <Text
          className="mt-7 text-xl font-bold text-[#0F172A]"
          style={
            textDirection
          }
        >
          {t(
            "home.howItWorks"
          )}
        </Text>


        <View className="mt-4 rounded-2xl bg-white p-5">

          <HowItWorksItem
            number="1"
            title={t(
              "home.step1Title"
            )}
            description={t(
              "home.step1Description"
            )}
            isArabic={
              isArabic
            }
          />

          <Divider />

          <HowItWorksItem
            number="2"
            title={t(
              "home.step2Title"
            )}
            description={t(
              "home.step2Description"
            )}
            isArabic={
              isArabic
            }
          />

          <Divider />

          <HowItWorksItem
            number="3"
            title={t(
              "home.step3Title"
            )}
            description={t(
              "home.step3Description"
            )}
            isArabic={
              isArabic
            }
          />

        </View>

      </ScrollView>

    </SafeAreaView>
  );
}


// ========================================
// HOW IT WORKS ITEM
// ========================================

function HowItWorksItem({
  number,
  title,
  description,
  isArabic,
}: {
  number: string;
  title: string;
  description: string;
  isArabic: boolean;
}) {
  return (
    <View
      style={{
        flexDirection:
          isArabic
            ? "row-reverse"
            : "row",

        alignItems:
          "center",

        gap:
          14,
      }}
    >

      <View className="h-11 w-11 items-center justify-center rounded-full bg-[#EFF6FF]">

        <Text className="font-bold text-[#2563EB]">
          {number}
        </Text>

      </View>


      <View className="flex-1">

        <Text
          className="font-bold text-[#0F172A]"
          style={{
            textAlign:
              isArabic
                ? "right"
                : "left",
          }}
        >
          {title}
        </Text>


        <Text
          className="mt-1 text-sm leading-5 text-[#64748B]"
          style={{
            textAlign:
              isArabic
                ? "right"
                : "left",
          }}
        >
          {description}
        </Text>

      </View>

    </View>
  );
}


// ========================================
// DIVIDER
// ========================================

function Divider() {
  return (
    <View className="my-4 h-[1px] bg-[#F1F5F9]" />
  );
}
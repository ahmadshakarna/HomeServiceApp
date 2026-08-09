import {
  useAuth,
  useClerk,
  useUser,
} from "@clerk/expo";

import { Ionicons } from "@expo/vector-icons";

import {
  router,
} from "expo-router";

import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
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

import {
  changeAppLanguage,
} from "@/lib/i18n";


// ========================================
// TYPES
// ========================================

type ProviderStatus =
  | "draft"
  | "pending"
  | "approved"
  | "rejected"
  | null;


// ========================================
// SCREEN
// ========================================

export default function ProfileScreen() {
  const {
    t,
    i18n,
  } = useTranslation();

  const { user } =
    useUser();

  const {
    signOut,
  } = useClerk();

  const {
    getToken,
    isLoaded,
    userId,
  } = useAuth();


  // ========================================
  // LANGUAGE / RTL
  // ========================================

  const isArabic =
    i18n.language === "ar";


  // ========================================
  // ACCESS
  // ========================================

  const [
    isAdmin,
    setIsAdmin,
  ] = useState(false);

  const [
    providerStatus,
    setProviderStatus,
  ] =
    useState<ProviderStatus>(
      null
    );


  const accessCheckedForUser =
    useRef<string | null>(
      null
    );


  // ========================================
  // LOAD ADMIN + PROVIDER STATUS
  // ========================================

  useEffect(() => {
    if (
      !isLoaded ||
      !userId
    ) {
      return;
    }

    if (
      accessCheckedForUser.current ===
      userId
    ) {
      return;
    }

    accessCheckedForUser.current =
      userId;


    const loadAccess =
      async () => {
        try {
          const token =
            await getToken();

          if (!token) {
            return;
          }


          // =================================
          // ADMIN
          // =================================

          const adminResponse =
            await fetch(
              "/api/admin/me",
              {
                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
              }
            );


          const adminData =
            await adminResponse.json();


          setIsAdmin(
            adminData.isAdmin ===
              true
          );


          // =================================
          // PROVIDER APPLICATION
          // =================================

          const providerResponse =
            await fetch(
              "/api/provider-application",
              {
                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
              }
            );


          const providerData =
            await providerResponse.json();


          if (
            providerResponse.ok &&
            providerData.application
          ) {
            const status =
              providerData
                .application
                .approvalStatus;


            if (
              status === "draft" ||
              status === "pending" ||
              status === "approved" ||
              status === "rejected"
            ) {
              setProviderStatus(
                status
              );
            } else {
              setProviderStatus(
                null
              );
            }

          } else {
            setProviderStatus(
              null
            );
          }

        } catch (error) {
          console.error(
            "LOAD PROFILE ACCESS ERROR:",
            error
          );

          setIsAdmin(
            false
          );

          setProviderStatus(
            null
          );

          accessCheckedForUser.current =
            null;
        }
      };


    loadAccess();

  }, [
    isLoaded,
    userId,
    getToken,
  ]);


  // ========================================
  // LOGOUT
  // ========================================

  const handleLogout =
    async () => {
      try {
        await signOut();

      } catch (error) {
        console.error(
          "LOGOUT ERROR:",
          error
        );
      }
    };


  // ========================================
  // PROVIDER CARD TRANSLATION
  // ========================================

  const getProviderTitle =
    () => {
      switch (
        providerStatus
      ) {
        case "pending":
          return t(
            "profile.applicationPending"
          );

        case "rejected":
          return t(
            "profile.applicationRejected"
          );

        case "draft":
          return t(
            "profile.continueApplication"
          );

        default:
          return t(
            "profile.becomeProvider"
          );
      }
    };


  const getProviderDescription =
    () => {
      switch (
        providerStatus
      ) {
        case "pending":
          return t(
            "profile.applicationPendingDescription"
          );

        case "rejected":
          return t(
            "profile.applicationRejectedDescription"
          );

        case "draft":
          return t(
            "profile.continueApplicationDescription"
          );

        default:
          return t(
            "profile.becomeProviderDescription"
          );
      }
    };


  // ========================================
  // SHARED RTL STYLES
  // ========================================

  const textDirection = {
    textAlign:
      isArabic
        ? ("right" as const)
        : ("left" as const),
  };


  const cardRow = {
    flexDirection:
      isArabic
        ? ("row-reverse" as const)
        : ("row" as const),

    alignItems:
      "center" as const,

    gap: 12,
  };


  // ========================================
  // UI
  // ========================================

  return (
    <SafeAreaView className="flex-1 bg-background">

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={{
          paddingHorizontal:
            20,

          paddingTop:
            24,

          paddingBottom:
            50,
        }}
      >

        {/* ==================================
            TITLE
        ================================== */}

        <Text
          className="text-3xl font-bold text-foreground"
          style={
            textDirection
          }
        >
          {t(
            "profile.title"
          )}
        </Text>


        {/* ==================================
            USER CARD
        ================================== */}

        <View className="mt-8 items-center rounded-3xl bg-card p-6">

          <Image
            source={{
              uri:
                user?.imageUrl,
            }}
            className="h-24 w-24 rounded-full"
          />


          {/* اسم المستخدم:
              لا نترجمه لأنه بيانات أدخلها المستخدم */}

          <Text
            className="mt-4 text-xl font-bold text-card-foreground"
            style={{
              textAlign:
                "center",
            }}
          >
            {user?.fullName ||
              t(
                "profile.userFallback"
              )}
          </Text>


          {/* Email يبقى LTR دائمًا */}

          <Text
            className="mt-1 text-sm text-muted-foreground"
            style={{
              direction:
                "ltr",

              textAlign:
                "center",
            }}
          >
            {
              user
                ?.primaryEmailAddress
                ?.emailAddress
            }
          </Text>

        </View>


        {/* ==================================
            ACCOUNT INFO
        ================================== */}

        <View className="mt-6 rounded-2xl bg-card p-5">

          <Text
            className="text-sm text-muted-foreground"
            style={
              textDirection
            }
          >
            {t(
              "profile.account"
            )}
          </Text>


          {/* NAME */}

          <View className="mt-4">

            <Text
              className="text-xs text-muted-foreground"
              style={
                textDirection
              }
            >
              {t(
                "profile.name"
              )}
            </Text>


            <Text
              className="mt-1 text-base font-medium text-foreground"
              style={
                textDirection
              }
            >
              {user?.fullName ||
                t(
                  "profile.notProvided"
                )}
            </Text>

          </View>


          {/* EMAIL */}

          <View className="mt-4">

            <Text
              className="text-xs text-muted-foreground"
              style={
                textDirection
              }
            >
              {t(
                "profile.email"
              )}
            </Text>


            <Text
              className="mt-1 text-base font-medium text-foreground"
              style={{
                direction:
                  "ltr",

                textAlign:
                  isArabic
                    ? "right"
                    : "left",
              }}
            >
              {user
                ?.primaryEmailAddress
                ?.emailAddress ||
                t(
                  "profile.notProvided"
                )}
            </Text>

          </View>

        </View>


        {/* ==================================
            BECOME PROVIDER
        ================================== */}

        {providerStatus !==
        "approved" ? (

          <Pressable
            onPress={() => {
              router.push(
                "/become-provider"
              );
            }}
            className="mt-6 rounded-2xl bg-[#EFF6FF] p-5 active:opacity-80"
          >

            <View
              style={
                cardRow
              }
            >

              {/* Icon */}

              <View className="h-12 w-12 items-center justify-center rounded-xl bg-white">

                <Ionicons
                  name={
                    providerStatus ===
                    "pending"
                      ? "time-outline"

                      : providerStatus ===
                        "rejected"
                      ? "alert-circle-outline"

                      : "briefcase-outline"
                  }
                  size={24}
                  color={
                    providerStatus ===
                    "rejected"
                      ? "#DC2626"
                      : "#2563EB"
                  }
                />

              </View>


              {/* Text */}

              <View className="flex-1">

                <Text
                  className="text-base font-bold text-[#0F172A]"
                  style={
                    textDirection
                  }
                >
                  {
                    getProviderTitle()
                  }
                </Text>


                <Text
                  className="mt-1 text-sm leading-5 text-[#64748B]"
                  style={
                    textDirection
                  }
                >
                  {
                    getProviderDescription()
                  }
                </Text>

              </View>


              {/* Arrow */}

              <Ionicons
                name={
                  isArabic
                    ? "chevron-back"
                    : "chevron-forward"
                }
                size={21}
                color="#2563EB"
              />

            </View>

          </Pressable>

        ) : null}


        {/* ==================================
            ADMIN PANEL
        ================================== */}

        {isAdmin ? (

          <Pressable
            onPress={() => {
              router.push(
                "/admin-providers"
              );
            }}
            className="mt-6 rounded-2xl bg-[#0F172A] p-5 active:opacity-80"
          >

            <View
              style={
                cardRow
              }
            >

              <View className="h-12 w-12 items-center justify-center rounded-xl bg-white/10">

                <Ionicons
                  name="shield-checkmark-outline"
                  size={24}
                  color="white"
                />

              </View>


              <View className="flex-1">

                <Text
                  className="text-base font-bold text-white"
                  style={
                    textDirection
                  }
                >
                  {t(
                    "profile.adminPanel"
                  )}
                </Text>


                <Text
                  className="mt-1 text-sm leading-5 text-[#CBD5E1]"
                  style={
                    textDirection
                  }
                >
                  {t(
                    "profile.adminDescription"
                  )}
                </Text>

              </View>


              <Ionicons
                name={
                  isArabic
                    ? "chevron-back"
                    : "chevron-forward"
                }
                size={21}
                color="white"
              />

            </View>

          </Pressable>

        ) : null}


        {/* ==================================
            PROVIDER DASHBOARD
        ================================== */}

        {providerStatus ===
        "approved" ? (

          <Pressable
            onPress={() => {
              router.push(
                "/provider-dashboard"
              );
            }}
            className="mt-6 rounded-2xl bg-[#2563EB] p-5 active:opacity-80"
          >

            <View
              style={
                cardRow
              }
            >

              <View className="h-12 w-12 items-center justify-center rounded-xl bg-white/20">

                <Ionicons
                  name="briefcase-outline"
                  size={24}
                  color="white"
                />

              </View>


              <View className="flex-1">

                <View
                  style={{
                    flexDirection:
                      isArabic
                        ? "row-reverse"
                        : "row",

                    alignItems:
                      "center",

                    gap: 6,
                  }}
                >

                  <Text
                    className="text-base font-bold text-white"
                    style={
                      textDirection
                    }
                  >
                    {t(
                      "profile.providerDashboard"
                    )}
                  </Text>


                  <Ionicons
                    name="checkmark-circle"
                    size={17}
                    color="white"
                  />

                </View>


                <Text
                  className="mt-1 text-sm text-blue-100"
                  style={
                    textDirection
                  }
                >
                  {t(
                    "profile.providerDescription"
                  )}
                </Text>

              </View>


              <Ionicons
                name={
                  isArabic
                    ? "chevron-back"
                    : "chevron-forward"
                }
                size={21}
                color="white"
              />

            </View>

          </Pressable>

        ) : null}


        {/* ==================================
            LANGUAGE
        ================================== */}

        <View className="mt-6 rounded-2xl bg-white p-5">

          <View
            style={
              cardRow
            }
          >

            <View className="h-11 w-11 items-center justify-center rounded-xl bg-[#F1F5F9]">

              <Ionicons
                name="language-outline"
                size={22}
                color="#2563EB"
              />

            </View>


            <View className="flex-1">

              <Text
                className="font-bold text-[#0F172A]"
                style={
                  textDirection
                }
              >
                {t(
                  "profile.language"
                )}
              </Text>


              <Text
                className="mt-1 text-xs text-[#64748B]"
                style={
                  textDirection
                }
              >
                {isArabic
                  ? "العربية"
                  : "English"}
              </Text>

            </View>

          </View>


          {/* LANGUAGE BUTTONS */}

          <View
            className="mt-5"
            style={{
              flexDirection:
                isArabic
                  ? "row-reverse"
                  : "row",

              gap: 12,
            }}
          >

            {/* ENGLISH */}

            <Pressable
              onPress={() =>
                changeAppLanguage(
                  "en"
                )
              }
              className={`flex-1 items-center rounded-xl border py-3.5 ${
                i18n.language ===
                "en"
                  ? "border-[#2563EB] bg-[#EFF6FF]"
                  : "border-[#E2E8F0] bg-white"
              }`}
            >

              <Text
                className={`font-bold ${
                  i18n.language ===
                  "en"
                    ? "text-[#2563EB]"
                    : "text-[#64748B]"
                }`}
              >
                English
              </Text>

            </Pressable>


            {/* ARABIC */}

            <Pressable
              onPress={() =>
                changeAppLanguage(
                  "ar"
                )
              }
              className={`flex-1 items-center rounded-xl border py-3.5 ${
                i18n.language ===
                "ar"
                  ? "border-[#2563EB] bg-[#EFF6FF]"
                  : "border-[#E2E8F0] bg-white"
              }`}
            >

              <Text
                className={`font-bold ${
                  i18n.language ===
                  "ar"
                    ? "text-[#2563EB]"
                    : "text-[#64748B]"
                }`}
              >
                العربية
              </Text>

            </Pressable>

          </View>

        </View>


        {/* ==================================
            LOGOUT
        ================================== */}

        <Pressable
          onPress={
            handleLogout
          }
          className="mt-6 h-14 items-center justify-center rounded-2xl border border-red-200 bg-red-50 active:opacity-70"
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
              name="log-out-outline"
              size={20}
              color="#DC2626"
            />


            <Text className="text-base font-semibold text-red-600">
              {t(
                "profile.logout"
              )}
            </Text>

          </View>

        </Pressable>

      </ScrollView>

    </SafeAreaView>
  );
}
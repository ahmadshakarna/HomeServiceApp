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

import {
  useTranslation,
} from "react-i18next";


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
    t,
    i18n,
  } = useTranslation();


  const isArabic =
    (
      i18n.resolvedLanguage ||
      i18n.language
    ).startsWith("ar");


  const textDirection = {
    textAlign:
      isArabic
        ? ("right" as const)
        : ("left" as const),
  };


  const rowDirection = {
    flexDirection:
      isArabic
        ? ("row-reverse" as const)
        : ("row" as const),
  };


  const {
    getToken,
    isLoaded,
    userId,
  } = useAuth();


  const loadedForUser =
    useRef<
      string | null
    >(null);


  const [
    applications,
    setApplications,
  ] = useState<
    ProviderApplication[]
  >([]);


  const [
    loading,
    setLoading,
  ] = useState(
    true
  );


  const [
    refreshing,
    setRefreshing,
  ] = useState(
    false
  );


  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);


  // ========================================
  // ERROR TRANSLATION
  // ========================================

  const localizeError =
    useCallback(
      (
        message:
          | string
          | null
          | undefined
      ) => {
        const normalized =
          message
            ?.trim()
            .toLowerCase();


        if (
          normalized ===
          "unauthorized" ||
          normalized ===
          "authentication required"
        ) {
          return t(
            "admin.errors.authenticationRequired"
          );
        }


        if (
          normalized ===
          "forbidden"
        ) {
          return t(
            "admin.errors.forbidden"
          );
        }


        return t(
          "admin.errors.loadApplications"
        );
      },
      [t]
    );


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

        } catch (err) {
          console.error(
            "LOAD ADMIN APPLICATIONS ERROR:",
            err
          );


          setError(
            localizeError(
              err instanceof Error
                ? err.message
                : null
            )
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
      [
        getToken,
        localizeError,
      ]
    );


  // ========================================
  // INITIAL LOAD
  // ========================================

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
          {t(
            "admin.loadingApplications"
          )}
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
      edges={[
        "top",
      ]}
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

        {/* ==================================
            HEADER
        ================================== */}

        <View
          className="mt-3"
          style={{
            ...rowDirection,
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


          <View
            className="flex-1"
            style={{
              marginStart:
                14,
            }}
          >

            <Text
              className="text-xl font-bold text-[#0F172A]"
              style={
                textDirection
              }
            >
              {t(
                "admin.providerApplications"
              )}
            </Text>


            <Text
              className="mt-1 text-xs text-[#64748B]"
              style={
                textDirection
              }
            >
              {t(
                "admin.reviewProviderRequests"
              )}
            </Text>

          </View>


          <View
            className="min-w-[38px] items-center justify-center rounded-full bg-[#EFF6FF] px-3 py-2"
            style={{
              marginStart:
                8,
            }}
          >

            <Text className="font-bold text-[#2563EB]">
              {
                applications.length
              }
            </Text>

          </View>

        </View>


        {/* ==================================
            INFO
        ================================== */}

        <View className="mt-6 rounded-2xl bg-[#EFF6FF] p-5">

          <View
            style={{
              ...rowDirection,
              alignItems:
                "center",
            }}
          >

            <Ionicons
              name="shield-checkmark-outline"
              size={25}
              color="#2563EB"
            />


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
                {t(
                  "admin.pendingApplications"
                )}
              </Text>


              <Text
                className="mt-1 text-sm leading-5 text-[#64748B]"
                style={
                  textDirection
                }
              >
                {t(
                  "admin.pendingApplicationsDescription"
                )}
              </Text>

            </View>

          </View>

        </View>


        {/* ==================================
            ERROR
        ================================== */}

        {error ? (

          <View className="mt-6 rounded-2xl bg-red-50 p-4">

            <View
              style={{
                ...rowDirection,
                alignItems:
                  "center",
              }}
            >

              <Ionicons
                name="alert-circle-outline"
                size={21}
                color="#DC2626"
              />


              <Text
                className="flex-1 font-semibold text-red-600"
                style={{
                  marginStart:
                    8,

                  ...textDirection,
                }}
              >
                {error}
              </Text>

            </View>


            <Pressable
              onPress={() =>
                loadApplications()
              }
              className="mt-4 items-center rounded-xl bg-[#2563EB] py-3"
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
            EMPTY
        ================================== */}

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


            <Text
              className="mt-5 text-lg font-bold text-[#0F172A]"
              style={{
                textAlign:
                  "center",
              }}
            >
              {t(
                "admin.noApplications"
              )}
            </Text>


            <Text
              className="mt-2 max-w-[280px] leading-5 text-[#64748B]"
              style={{
                textAlign:
                  "center",
              }}
            >
              {t(
                "admin.noApplicationsDescription"
              )}
            </Text>

          </View>

        ) : null}


        {/* ==================================
            APPLICATION CARDS
        ================================== */}

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

              <View
                style={{
                  ...rowDirection,
                  alignItems:
                    "center",
                }}
              >

                <View className="h-14 w-14 items-center justify-center rounded-full bg-[#EFF6FF]">

                  <Text className="text-xl font-bold text-[#2563EB]">
                    {application.fullName
                      .trim()
                      .charAt(0)
                      .toUpperCase()}
                  </Text>

                </View>


                <View
                  className="flex-1"
                  style={{
                    marginStart:
                      14,
                  }}
                >

                  <Text
                    className="text-base font-bold text-[#0F172A]"
                    style={
                      textDirection
                    }
                  >
                    {
                      application.fullName
                    }
                  </Text>


                  <View
                    className="mt-2"
                    style={{
                      ...rowDirection,
                      alignItems:
                        "center",
                    }}
                  >

                    <Ionicons
                      name="location-outline"
                      size={15}
                      color="#64748B"
                    />


                    <Text
                      className="text-sm text-[#64748B]"
                      style={{
                        marginStart:
                          5,

                        ...textDirection,
                      }}
                    >
                      {
                        application.city ||
                        t(
                          "admin.noCity"
                        )
                      }
                    </Text>

                  </View>

                </View>


                <View
                  className="rounded-full bg-amber-50 px-3 py-1.5"
                  style={{
                    marginStart:
                      8,
                  }}
                >

                  <Text className="text-xs font-bold text-amber-700">
                    {t(
                      "admin.statusPending"
                    )}
                  </Text>

                </View>

              </View>


              {/* DETAILS */}

              <View
                className="mt-5"
                style={{
                  ...rowDirection,
                }}
              >

                <View
                  className="flex-1 rounded-xl bg-[#F8FAFC] p-3"
                  style={{
                    marginEnd:
                      8,
                  }}
                >

                  <Text
                    className="text-xs text-[#64748B]"
                    style={
                      textDirection
                    }
                  >
                    {t(
                      "admin.experience"
                    )}
                  </Text>


                  <Text
                    className="mt-1 font-bold text-[#0F172A]"
                    style={
                      textDirection
                    }
                  >
                    {t(
                      "admin.experienceYears",
                      {
                        count:
                          application.experienceYears,
                      }
                    )}
                  </Text>

                </View>


                <View
                  className="flex-1 rounded-xl bg-[#F8FAFC] p-3"
                  style={{
                    marginStart:
                      8,
                  }}
                >

                  <Text
                    className="text-xs text-[#64748B]"
                    style={
                      textDirection
                    }
                  >
                    {t(
                      "admin.status"
                    )}
                  </Text>


                  <Text
                    className="mt-1 font-bold text-amber-600"
                    style={
                      textDirection
                    }
                  >
                    {t(
                      "admin.statusPending"
                    )}
                  </Text>

                </View>

              </View>


              {/* CONTACT */}

              {application.phone ? (

                <View
                  className="mt-4"
                  style={{
                    ...rowDirection,
                    alignItems:
                      "center",
                  }}
                >

                  <Ionicons
                    name="call-outline"
                    size={17}
                    color="#64748B"
                  />


                  <Text
                    className="text-sm text-[#64748B]"
                    style={{
                      marginStart:
                        8,

                      writingDirection:
                        "ltr",
                    }}
                  >
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
                className="mt-5 items-center justify-center rounded-xl bg-[#2563EB] py-3.5"
              >

                <View
                  style={{
                    ...rowDirection,
                    alignItems:
                      "center",
                  }}
                >

                  <Ionicons
                    name="eye-outline"
                    size={19}
                    color="white"
                  />


                  <Text
                    className="font-bold text-white"
                    style={{
                      marginStart:
                        8,
                    }}
                  >
                    {t(
                      "admin.viewApplication"
                    )}
                  </Text>

                </View>

              </Pressable>

            </View>
          )
        )}

      </ScrollView>

    </SafeAreaView>
  );
}

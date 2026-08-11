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


// ========================================
// TYPES
// ========================================

type Provider = {
  id: string;

  fullName: string;

  city:
    string | null;

  experienceYears:
    number;

  approvalStatus:
    string;

  isVerified:
    boolean;

  isActive:
    boolean;
};


type Stats = {
  total: number;

  pending:
    number;

  confirmed:
    number;

  inProgress:
    number;

  completed:
    number;

  cancelled:
    number;
};


type ProviderBooking = {
  booking: {
    id: string;

    customerId:
      string;

    providerId:
      string;

    serviceId:
      string;

    priceAgorot:
      number;

    bookingDate:
      string;

    startTime:
      string;

    address:
      string;

    notes:
      string | null;

    status:
      string;

    createdAt:
      string;

    updatedAt:
      string;
  };

  service: {
    id: string;

    name:
      string;

    slug:
      string;

    icon:
      string | null;
  };

  category: {
    id: string;

    name:
      string;

    slug:
      string;
  };
};


type DashboardResponse = {
  provider:
    Provider;

  stats:
    Stats;

  bookings:
    ProviderBooking[];
};


type BookingAction =
  | "accept"
  | "reject"
  | "on_the_way"
  | "start"
  | "complete";


// ========================================
// SCREEN
// ========================================

export default function ProviderDashboardScreen() {
  const {
    t,
    i18n,
  } = useTranslation();


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


  const rowDirection = {
    flexDirection:
      isArabic
        ? ("row-reverse" as const)
        : ("row" as const),
  };


  const [
    bookingAction,
    setBookingAction,
  ] = useState<{
    bookingId: string;
    action: BookingAction;
  } | null>(null);


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
    dashboard,
    setDashboard,
  ] =
    useState<
      DashboardResponse | null
    >(null);


  const [
    loading,
    setLoading,
  ] =
    useState(
      true
    );


  const [
    refreshing,
    setRefreshing,
  ] =
    useState(
      false
    );


  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null);


  // ========================================
  // HELPERS
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
            "provider.errors.authenticationRequired"
          );
        }


        if (
          normalized ===
          "provider account not found"
        ) {
          return t(
            "provider.errors.accountNotFound"
          );
        }


        if (
          normalized ===
          "provider account is not approved"
        ) {
          return t(
            "provider.errors.notApproved"
          );
        }


        if (
          normalized ===
          "provider account is inactive"
        ) {
          return t(
            "provider.errors.inactive"
          );
        }


        if (
          normalized ===
          "booking not found"
        ) {
          return t(
            "provider.errors.bookingNotFound"
          );
        }


        return t(
          "provider.errors.generic"
        );
      },
      [t]
    );





  // ========================================
  // LOAD DASHBOARD
  // ========================================

  const loadDashboard =
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
              "/api/provider/dashboard",
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
                "Failed to load dashboard"
            );
          }


          setDashboard(
            data
          );

        } catch (err) {
          console.error(
            "LOAD PROVIDER DASHBOARD ERROR:",
            err
          );


          const message =
            err instanceof Error
              ? err.message
              : null;


          setError(
            localizeError(
              message
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


    loadDashboard();

  }, [
    isLoaded,
    userId,
    loadDashboard,
  ]);


  // ========================================
  // BOOKING ACTION
  // ========================================

  const handleBookingAction =
    async (
      bookingId: string,
      action: BookingAction
    ) => {
      try {
        setError(
          null
        );


        setBookingAction({
          bookingId,
          action,
        });


        const token =
          await getToken();


        if (!token) {
          throw new Error(
            "Authentication required"
          );
        }


        const response =
          await fetch(
            "/api/provider/dashboard",
            {
              method:
                "PATCH",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body:
                JSON.stringify({
                  bookingId,
                  action,
                }),
            }
          );


        const data =
          await response.json();


        if (!response.ok) {
          throw new Error(
            data.error ||
              "Failed to update booking"
          );
        }


        await loadDashboard(
          true
        );

      } catch (err) {
        console.error(
          "PROVIDER BOOKING ACTION ERROR:",
          err
        );


        const message =
          err instanceof Error
            ? err.message
            : null;


        setError(
          localizeError(
            message
          )
        );

      } finally {
        setBookingAction(
          null
        );
      }
    };


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
            "provider.loadingDashboard"
          )}
        </Text>

      </SafeAreaView>
    );
  }


  // ========================================
  // ERROR
  // ========================================

  if (
    error ||
    !dashboard
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
            size={45}
            color="#DC2626"
          />


          <Text
            className="mt-4 font-semibold text-red-600"
            style={{
              textAlign:
                "center",
            }}
          >
            {error ||
              t(
                "provider.errors.generic"
              )}
          </Text>


          <Pressable
            onPress={() =>
              loadDashboard()
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

      </SafeAreaView>
    );
  }


  const {
    provider,
    stats,
    bookings,
  } = dashboard;


  const pendingBookings =
    bookings.filter(
      (item) =>
        item.booking.status ===
        "pending"
    );


  const activeBookings =
    bookings.filter(
      (item) =>
        [
          "confirmed",
          "on_the_way",
          "in_progress",
        ].includes(
          item.booking.status
        )
    );


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

        refreshControl={
          <RefreshControl
            refreshing={
              refreshing
            }
            onRefresh={() =>
              loadDashboard(
                true
              )
            }
          />
        }

        contentContainerStyle={{
          paddingHorizontal:
            20,

          paddingBottom:
            70,
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
                "provider.dashboard"
              )}
            </Text>


            <Text
              className="mt-1 text-xs text-[#64748B]"
              style={
                textDirection
              }
            >
              {t(
                "provider.manageBookings"
              )}
            </Text>

          </View>

        </View>


        {/* ==================================
            PROVIDER CARD
        ================================== */}

        <View className="mt-6 rounded-2xl bg-[#2563EB] p-5">

          <View
            style={{
              ...rowDirection,
              alignItems:
                "center",
            }}
          >

            <View className="h-14 w-14 items-center justify-center rounded-full bg-white/20">

              <Text className="text-xl font-bold text-white">
                {provider.fullName
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

              <View
                style={{
                  ...rowDirection,
                  alignItems:
                    "center",
                }}
              >

                <Text
                  className="text-lg font-bold text-white"
                  style={
                    textDirection
                  }
                >
                  {
                    provider.fullName
                  }
                </Text>


                {provider.isVerified ? (

                  <Ionicons
                    name="checkmark-circle"
                    size={18}
                    color="white"
                    style={{
                      marginStart:
                        6,
                    }}
                  />

                ) : null}

              </View>


              <Text
                className="mt-1 text-sm text-blue-100"
                style={
                  textDirection
                }
              >
                {provider.city ||
                  t(
                    "provider.providerFallback"
                  )}
              </Text>

            </View>


            <View
              className="rounded-full bg-white/20 px-3 py-2"
              style={{
                marginStart:
                  8,
              }}
            >

              <Text className="text-xs font-bold text-white">
                {t(
                  "provider.activeStatus"
                )}
              </Text>

            </View>

          </View>

        </View>


        {/* ==================================
            STATS
        ================================== */}

        <Text
          className="mt-8 text-lg font-bold text-[#0F172A]"
          style={
            textDirection
          }
        >
          {t(
            "provider.overview"
          )}
        </Text>


        <View
          className="mt-4"
          style={{
            ...rowDirection,
          }}
        >

          <StatCard
            label={t(
              "provider.new"
            )}
            value={
              stats.pending
            }
            icon="notifications-outline"
            isArabic={
              isArabic
            }
          />


          <View className="w-3" />


          <StatCard
            label={t(
              "provider.active"
            )}
            value={
              stats.confirmed +
              stats.inProgress
            }
            icon="briefcase-outline"
            isArabic={
              isArabic
            }
          />

        </View>


        <View
          className="mt-3"
          style={{
            ...rowDirection,
          }}
        >

          <StatCard
            label={t(
              "provider.completed"
            )}
            value={
              stats.completed
            }
            icon="checkmark-circle-outline"
            isArabic={
              isArabic
            }
          />


          <View className="w-3" />


          <StatCard
            label={t(
              "provider.total"
            )}
            value={
              stats.total
            }
            icon="stats-chart-outline"
            isArabic={
              isArabic
            }
          />

        </View>


        {/* ==================================
            NEW REQUESTS
        ================================== */}

        <View
          className="mt-9"
          style={{
            ...rowDirection,
            alignItems:
              "center",
          }}
        >

          <Text
            className="flex-1 text-lg font-bold text-[#0F172A]"
            style={
              textDirection
            }
          >
            {t(
              "provider.newRequests"
            )}
          </Text>


          <View className="rounded-full bg-amber-50 px-3 py-1.5">

            <Text className="text-xs font-bold text-amber-700">
              {
                pendingBookings.length
              }
            </Text>

          </View>

        </View>


        {pendingBookings.length ===
        0 ? (

          <View className="mt-4 items-center rounded-2xl bg-white p-7">

            <Ionicons
              name="notifications-off-outline"
              size={34}
              color="#94A3B8"
            />


            <Text
              className="mt-3 font-bold text-[#0F172A]"
              style={{
                textAlign:
                  "center",
              }}
            >
              {t(
                "provider.noNewRequests"
              )}
            </Text>


            <Text
              className="mt-2 text-sm text-[#64748B]"
              style={{
                textAlign:
                  "center",
              }}
            >
              {t(
                "provider.noNewRequestsDescription"
              )}
            </Text>

          </View>

        ) : (

          pendingBookings.map(
            (item) => (

              <BookingCard
                key={
                  item.booking.id
                }
                item={
                  item
                }
                bookingAction={
                  bookingAction
                }
                onAction={
                  handleBookingAction
                }
                isArabic={
                  isArabic
                }
                locale={
                  locale
                }
              />

            )
          )

        )}


        {/* ==================================
            ACTIVE JOBS
        ================================== */}

        <View
          className="mt-9"
          style={{
            ...rowDirection,
            alignItems:
              "center",
          }}
        >

          <Text
            className="flex-1 text-lg font-bold text-[#0F172A]"
            style={
              textDirection
            }
          >
            {t(
              "provider.activeJobs"
            )}
          </Text>


          <Text className="font-bold text-[#2563EB]">
            {
              activeBookings.length
            }
          </Text>

        </View>


        {activeBookings.length ===
        0 ? (

          <View className="mt-4 rounded-2xl bg-white p-5">

            <Text
              className="text-sm text-[#64748B]"
              style={{
                textAlign:
                  "center",
              }}
            >
              {t(
                "provider.noActiveJobs"
              )}
            </Text>

          </View>

        ) : (

          activeBookings.map(
            (item) => (

              <BookingCard
                key={
                  item.booking.id
                }
                item={
                  item
                }
                bookingAction={
                  bookingAction
                }
                onAction={
                  handleBookingAction
                }
                isArabic={
                  isArabic
                }
                locale={
                  locale
                }
              />

            )
          )

        )}


        {/* ==================================
            GLOBAL ACTION ERROR
        ================================== */}

        {error ? (

          <View className="mt-6 rounded-xl bg-red-50 p-4">

            <Text
              className="font-semibold text-red-600"
              style={{
                textAlign:
                  "center",
              }}
            >
              {error}
            </Text>

          </View>

        ) : null}

      </ScrollView>

    </SafeAreaView>
  );
}


// ========================================
// STAT CARD
// ========================================

function StatCard({
  label,
  value,
  icon,
  isArabic,
}: {
  label: string;

  value: number;

  icon:
    keyof typeof Ionicons.glyphMap;

  isArabic:
    boolean;
}) {
  return (
    <View className="flex-1 rounded-2xl bg-white p-4">

      <View
        style={{
          alignItems:
            isArabic
              ? "flex-end"
              : "flex-start",
        }}
      >
        <Ionicons
          name={icon}
          size={22}
          color="#2563EB"
        />
      </View>


      <Text
        className="mt-3 text-2xl font-bold text-[#0F172A]"
        style={{
          textAlign:
            isArabic
              ? "right"
              : "left",

          writingDirection:
            "ltr",
        }}
      >
        {value}
      </Text>


      <Text
        className="mt-1 text-xs text-[#64748B]"
        style={{
          textAlign:
            isArabic
              ? "right"
              : "left",
        }}
      >
        {label}
      </Text>

    </View>
  );
}


// ========================================
// BOOKING CARD
// ========================================

function BookingCard({
  item,
  bookingAction,
  onAction,
  isArabic,
  locale,
}: {
  item:
    ProviderBooking;

  bookingAction: {
    bookingId: string;
    action: BookingAction;
  } | null;

  onAction: (
    bookingId: string,
    action: BookingAction
  ) => void;

  isArabic:
    boolean;

  locale:
    string;
}) {
  const {
    t,
  } = useTranslation();


  const booking =
    item.booking;


  const isLoading =
    bookingAction
      ?.bookingId ===
    booking.id;


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


  const serviceName =
    t(
      `db.services.${item.service.slug}.name`,
      {
        defaultValue:
          item.service.name,
      }
    );


  const categoryName =
    t(
      `db.categories.${item.category.slug}.name`,
      {
        defaultValue:
          item.category.name,
      }
    );


  const statusLabel =
    t(
      `status.${booking.status}`,
      {
        defaultValue:
          booking.status.replace(
            /_/g,
            " "
          ),
      }
    );


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


    return new Date(
      year,
      month - 1,
      day,
      12
    ).toLocaleDateString(
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
  // BUTTON DEPENDING ON STATUS
  // ========================================

  const renderAction =
    () => {

      // PENDING

      if (
        booking.status ===
        "pending"
      ) {
        return (
          <View
            className="mt-5"
            style={{
              ...rowDirection,
            }}
          >

            <Pressable
              disabled={
                isLoading
              }
              onPress={() =>
                onAction(
                  booking.id,
                  "reject"
                )
              }
              className="flex-1 items-center rounded-xl border border-red-200 bg-red-50 py-3.5"
              style={{
                marginEnd:
                  8,
              }}
            >

              {isLoading &&
              bookingAction
                ?.action ===
                "reject" ? (

                <ActivityIndicator
                  color="#DC2626"
                />

              ) : (

                <Text className="font-bold text-red-600">
                  {t(
                    "provider.reject"
                  )}
                </Text>

              )}

            </Pressable>


            <Pressable
              disabled={
                isLoading
              }
              onPress={() =>
                onAction(
                  booking.id,
                  "accept"
                )
              }
              className="flex-1 items-center rounded-xl bg-[#16A34A] py-3.5"
              style={{
                marginStart:
                  8,
              }}
            >

              {isLoading &&
              bookingAction
                ?.action ===
                "accept" ? (

                <ActivityIndicator
                  color="white"
                />

              ) : (

                <Text className="font-bold text-white">
                  {t(
                    "provider.accept"
                  )}
                </Text>

              )}

            </Pressable>

          </View>
        );
      }


      // CONFIRMED

      if (
        booking.status ===
        "confirmed"
      ) {
        return (
          <Pressable
            disabled={
              isLoading
            }
            onPress={() =>
              onAction(
                booking.id,
                "on_the_way"
              )
            }
            className="mt-5 items-center justify-center rounded-xl bg-[#2563EB] py-3.5"
          >

            {isLoading ? (

              <ActivityIndicator
                color="white"
              />

            ) : (

              <View
                style={{
                  ...rowDirection,
                  alignItems:
                    "center",
                }}
              >
                <Ionicons
                  name="car-outline"
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
                    "provider.onMyWay"
                  )}
                </Text>
              </View>

            )}

          </Pressable>
        );
      }


      // ON THE WAY

      if (
        booking.status ===
        "on_the_way"
      ) {
        return (
          <Pressable
            disabled={
              isLoading
            }
            onPress={() =>
              onAction(
                booking.id,
                "start"
              )
            }
            className="mt-5 items-center justify-center rounded-xl bg-[#7C3AED] py-3.5"
          >

            {isLoading ? (

              <ActivityIndicator
                color="white"
              />

            ) : (

              <View
                style={{
                  ...rowDirection,
                  alignItems:
                    "center",
                }}
              >
                <Ionicons
                  name="play-outline"
                  size={20}
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
                    "provider.startJob"
                  )}
                </Text>
              </View>

            )}

          </Pressable>
        );
      }


      // IN PROGRESS

      if (
        booking.status ===
        "in_progress"
      ) {
        return (
          <Pressable
            disabled={
              isLoading
            }
            onPress={() =>
              onAction(
                booking.id,
                "complete"
              )
            }
            className="mt-5 items-center justify-center rounded-xl bg-[#16A34A] py-3.5"
          >

            {isLoading ? (

              <ActivityIndicator
                color="white"
              />

            ) : (

              <View
                style={{
                  ...rowDirection,
                  alignItems:
                    "center",
                }}
              >
                <Ionicons
                  name="checkmark-circle-outline"
                  size={20}
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
                    "provider.completeJob"
                  )}
                </Text>
              </View>

            )}

          </Pressable>
        );
      }


      return null;
    };


  return (
    <View className="mt-4 rounded-2xl border border-[#E2E8F0] bg-white p-5">

      {/* ==================================
          SERVICE
      ================================== */}

      <View
        style={{
          ...rowDirection,
          alignItems:
            "center",
        }}
      >

        <View className="h-11 w-11 items-center justify-center rounded-xl bg-[#EFF6FF]">

          <Ionicons
            name={
              (item.service.icon ||
                "construct-outline") as keyof typeof Ionicons.glyphMap
            }
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
            className="font-bold text-[#0F172A]"
            style={
              textDirection
            }
          >
            {
              serviceName
            }
          </Text>


          <Text
            className="mt-1 text-xs text-[#64748B]"
            style={
              textDirection
            }
          >
            {
              categoryName
            }
          </Text>

        </View>


        <Text
          className="font-bold text-[#2563EB]"
          style={{
            marginStart:
              8,

            writingDirection:
              "ltr",
          }}
        >
          {(
            booking.priceAgorot /
            100
          ).toFixed(
            0
          )}{" "}
          ₪
        </Text>

      </View>


      {/* ==================================
          DATE + TIME
      ================================== */}

      <View
        className="mt-4"
        style={{
          ...rowDirection,
          alignItems:
            "center",
        }}
      >

        <Ionicons
          name="calendar-outline"
          size={17}
          color="#64748B"
        />


        <Text
          className="text-sm text-[#64748B]"
          style={{
            marginStart:
              8,

            ...textDirection,
          }}
        >
          {
            formatDate(
              booking.bookingDate
            )
          }
        </Text>


        <Ionicons
          name="time-outline"
          size={17}
          color="#64748B"
          style={{
            marginStart:
              18,
          }}
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
          {String(
            booking.startTime
          ).slice(
            0,
            5
          )}
        </Text>

      </View>


      {/* ==================================
          ADDRESS
      ================================== */}

      <View
        className="mt-3"
        style={{
          ...rowDirection,
          alignItems:
            "flex-start",
        }}
      >

        <Ionicons
          name="location-outline"
          size={17}
          color="#64748B"
          style={{
            marginTop:
              2,
          }}
        />


        <Text
          className="flex-1 text-sm leading-5 text-[#64748B]"
          style={{
            marginStart:
              8,

            ...textDirection,
          }}
        >
          {
            booking.address
          }
        </Text>

      </View>


      {/* ==================================
          NOTES
      ================================== */}

      {booking.notes ? (

        <View className="mt-4 rounded-xl bg-[#F8FAFC] p-3">

          <Text
            className="text-xs font-bold text-[#64748B]"
            style={
              textDirection
            }
          >
            {t(
              "provider.customerNotes"
            )}
          </Text>


          <Text
            className="mt-2 text-sm leading-5 text-[#0F172A]"
            style={
              textDirection
            }
          >
            {
              booking.notes
            }
          </Text>

        </View>

      ) : null}


      {/* ==================================
          STATUS
      ================================== */}

      <View
        className="mt-4 rounded-full bg-[#F1F5F9] px-3 py-2"
        style={{
          alignSelf:
            isArabic
              ? "flex-end"
              : "flex-start",
        }}
      >

        <Text className="text-xs font-bold text-[#64748B]">
          {
            statusLabel
          }
        </Text>

      </View>


      {/* ==================================
          ACTION
      ================================== */}

      {renderAction()}

    </View>
  );
}

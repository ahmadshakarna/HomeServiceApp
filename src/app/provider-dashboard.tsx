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

    icon:
      string | null;
  };

  category: {
    id: string;

    name:
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


// ========================================
// SCREEN
// ========================================

export default function ProviderDashboardScreen() {
  const [
  bookingAction,
  setBookingAction,
] = useState<{
  bookingId: string;
  action: string;
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

        } catch (error) {
          console.error(
            "LOAD PROVIDER DASHBOARD ERROR:",
            error
          );

          setError(
            error instanceof Error
              ? error.message
              : "Failed to load dashboard"
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
      [getToken]
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
    action:
      | "accept"
      | "reject"
      | "on_the_way"
      | "start"
      | "complete"
  ) => {
    try {
      setError(null);

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

      console.log(
        "PROVIDER BOOKING UPDATED:",
        data.booking
      );

      // إعادة تحميل Dashboard
      await loadDashboard(
        true
      );

    } catch (error) {
      console.error(
        "PROVIDER BOOKING ACTION ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to update booking"
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
          Loading dashboard...
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
        >

          <Ionicons
            name="arrow-back"
            size={22}
            color="#0F172A"
          />

        </Pressable>


        <View className="flex-1 items-center justify-center">

          <Ionicons
            name="alert-circle-outline"
            size={45}
            color="#DC2626"
          />

          <Text className="mt-4 text-center font-semibold text-red-600">
            {error ||
              "Failed to load dashboard"}
          </Text>

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
      edges={["top"]}
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

        {/* HEADER */}

        <View className="mt-3 flex-row items-center">

          <Pressable
            onPress={() =>
              router.back()
            }
            className="h-11 w-11 items-center justify-center rounded-full bg-white"
          >

            <Ionicons
              name="arrow-back"
              size={22}
              color="#0F172A"
            />

          </Pressable>


          <View className="ml-4 flex-1">

            <Text className="text-xl font-bold text-[#0F172A]">
              Provider Dashboard
            </Text>

            <Text className="mt-1 text-xs text-[#64748B]">
              Manage your bookings
            </Text>

          </View>

        </View>


        {/* PROVIDER CARD */}

        <View className="mt-6 rounded-2xl bg-[#2563EB] p-5">

          <View className="flex-row items-center">

            <View className="h-14 w-14 items-center justify-center rounded-full bg-white/20">

              <Text className="text-xl font-bold text-white">
                {provider.fullName
                  .trim()
                  .charAt(0)
                  .toUpperCase()}
              </Text>

            </View>


            <View className="ml-4 flex-1">

              <View className="flex-row items-center">

                <Text className="text-lg font-bold text-white">
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
                      marginLeft:
                        6,
                    }}
                  />
                ) : null}

              </View>


              <Text className="mt-1 text-sm text-blue-100">
                {provider.city ||
                  "Provider"}
              </Text>

            </View>


            <View className="rounded-full bg-white/20 px-3 py-2">

              <Text className="text-xs font-bold text-white">
                Active
              </Text>

            </View>

          </View>

        </View>


        {/* STATS */}

        <Text className="mt-8 text-lg font-bold text-[#0F172A]">
          Overview
        </Text>


        <View className="mt-4 flex-row">

          <StatCard
            label="New"
            value={
              stats.pending
            }
            icon="notifications-outline"
          />

          <View className="w-3" />

          <StatCard
            label="Active"
            value={
              stats.confirmed +
              stats.inProgress
            }
            icon="briefcase-outline"
          />

        </View>


        <View className="mt-3 flex-row">

          <StatCard
            label="Completed"
            value={
              stats.completed
            }
            icon="checkmark-circle-outline"
          />

          <View className="w-3" />

          <StatCard
            label="Total"
            value={
              stats.total
            }
            icon="stats-chart-outline"
          />

        </View>


        {/* NEW REQUESTS */}

        <View className="mt-9 flex-row items-center">

          <Text className="flex-1 text-lg font-bold text-[#0F172A]">
            New Requests
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

            <Text className="mt-3 font-bold text-[#0F172A]">
              No new requests
            </Text>

            <Text className="mt-2 text-center text-sm text-[#64748B]">
              New customer bookings will appear here.
            </Text>

          </View>
        ) : (
          pendingBookings.map(
                      (item) => (
                        <BookingCard
            key={
              item.booking.id
            }
            item={item}
            bookingAction={
              bookingAction
            }
            onAction={
              handleBookingAction
            }
          />
            )
          )
        )}


        {/* ACTIVE JOBS */}

        <View className="mt-9 flex-row items-center">

          <Text className="flex-1 text-lg font-bold text-[#0F172A]">
            Active Jobs
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

            <Text className="text-center text-sm text-[#64748B]">
              No active jobs right now.
            </Text>

          </View>
        ) : (
          activeBookings.map(
                      (item) => (
                        <BookingCard
            key={
              item.booking.id
            }
            item={item}
            bookingAction={
              bookingAction
            }
            onAction={
              handleBookingAction
            }
          />
            )
          )
        )}

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
}: {
  label: string;

  value: number;

  icon:
    keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View className="flex-1 rounded-2xl bg-white p-4">

      <Ionicons
        name={icon}
        size={22}
        color="#2563EB"
      />

      <Text className="mt-3 text-2xl font-bold text-[#0F172A]">
        {value}
      </Text>

      <Text className="mt-1 text-xs text-[#64748B]">
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
}: {
  item:
    ProviderBooking;

  bookingAction: {
    bookingId: string;
    action: string;
  } | null;

  onAction: (
    bookingId: string,
    action:
      | "accept"
      | "reject"
      | "on_the_way"
      | "start"
      | "complete"
  ) => void;
}) {
  const booking =
    item.booking;

  const isLoading =
    bookingAction
      ?.bookingId ===
    booking.id;


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
          <View className="mt-5 flex-row">

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
              className="mr-2 flex-1 items-center rounded-xl border border-red-200 bg-red-50 py-3.5"
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
                  Reject
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
              className="ml-2 flex-1 items-center rounded-xl bg-[#16A34A] py-3.5"
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
                  Accept
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
            className="mt-5 flex-row items-center justify-center rounded-xl bg-[#2563EB] py-3.5"
          >

            {isLoading ? (
              <ActivityIndicator
                color="white"
              />
            ) : (
              <>
                <Ionicons
                  name="car-outline"
                  size={19}
                  color="white"
                />

                <Text className="ml-2 font-bold text-white">
                  On My Way
                </Text>
              </>
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
            className="mt-5 flex-row items-center justify-center rounded-xl bg-[#7C3AED] py-3.5"
          >

            {isLoading ? (
              <ActivityIndicator
                color="white"
              />
            ) : (
              <>
                <Ionicons
                  name="play-outline"
                  size={20}
                  color="white"
                />

                <Text className="ml-2 font-bold text-white">
                  Start Job
                </Text>
              </>
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
            className="mt-5 flex-row items-center justify-center rounded-xl bg-[#16A34A] py-3.5"
          >

            {isLoading ? (
              <ActivityIndicator
                color="white"
              />
            ) : (
              <>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={20}
                  color="white"
                />

                <Text className="ml-2 font-bold text-white">
                  Complete Job
                </Text>
              </>
            )}

          </Pressable>
        );
      }


      return null;
    };


  return (
    <View className="mt-4 rounded-2xl border border-[#E2E8F0] bg-white p-5">

      {/* SERVICE */}

      <View className="flex-row items-center">

        <View className="h-11 w-11 items-center justify-center rounded-xl bg-[#EFF6FF]">

          <Ionicons
            name="construct-outline"
            size={21}
            color="#2563EB"
          />

        </View>


        <View className="ml-3 flex-1">

          <Text className="font-bold text-[#0F172A]">
            {
              item.service.name
            }
          </Text>

          <Text className="mt-1 text-xs text-[#64748B]">
            {
              item.category.name
            }
          </Text>

        </View>


        <Text className="font-bold text-[#2563EB]">
          {(
            booking.priceAgorot /
            100
          ).toFixed(
            0
          )}{" "}
          ₪
        </Text>

      </View>


      {/* DATE + TIME */}

      <View className="mt-4 flex-row items-center">

        <Ionicons
          name="calendar-outline"
          size={17}
          color="#64748B"
        />

        <Text className="ml-2 text-sm text-[#64748B]">
          {
            booking.bookingDate
          }
        </Text>


        <Ionicons
          name="time-outline"
          size={17}
          color="#64748B"
          style={{
            marginLeft:
              18,
          }}
        />

        <Text className="ml-2 text-sm text-[#64748B]">
          {String(
            booking.startTime
          ).slice(
            0,
            5
          )}
        </Text>

      </View>


      {/* ADDRESS */}

      <View className="mt-3 flex-row items-start">

        <Ionicons
          name="location-outline"
          size={17}
          color="#64748B"
          style={{
            marginTop: 2,
          }}
        />

        <Text className="ml-2 flex-1 text-sm leading-5 text-[#64748B]">
          {
            booking.address
          }
        </Text>

      </View>


      {/* NOTES */}

      {booking.notes ? (
        <View className="mt-4 rounded-xl bg-[#F8FAFC] p-3">

          <Text className="text-xs font-bold text-[#64748B]">
            Customer Notes
          </Text>

          <Text className="mt-2 text-sm leading-5 text-[#0F172A]">
            {
              booking.notes
            }
          </Text>

        </View>
      ) : null}


      {/* STATUS */}

      <View className="mt-4 self-start rounded-full bg-[#F1F5F9] px-3 py-2">

        <Text className="text-xs font-bold uppercase text-[#64748B]">
          {
            booking.status.replace(
              /_/g,
              " "
            )
          }
        </Text>

      </View>


      {/* ACTION */}

      {renderAction()}

    </View>
  );
}
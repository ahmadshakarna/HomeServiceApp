import {
  useAuth,
} from "@clerk/expo";

import {
  Ionicons,
} from "@expo/vector-icons";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";


// ========================================
// TYPES
// ========================================

type Application = {
  id: string;

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

  approvalStatus:
    string;

  isVerified:
    boolean;

  createdAt:
    string;

  updatedAt:
    string;
};


type ProviderService = {
  id: string;
  serviceId: string;
  serviceName: string;

  categoryId:
    string;

  categoryName:
    string;

  priceAgorot:
    number;

  isAvailable:
    boolean;
};


type Availability = {
  id: string;

  dayOfWeek:
    number;

  startTime:
    string | null;

  endTime:
    string | null;

  isAvailable:
    boolean;
};


type DetailsResponse = {
  application:
    Application;

  services:
    ProviderService[];

  availability:
    Availability[];
};


const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];


// ========================================
// SCREEN
// ========================================

export default function AdminProviderDetailsScreen() {

  const [
  decisionLoading,
  setDecisionLoading,
] = useState<
  "approve" |
  "reject" |
  null
>(null);

const [
  showRejectBox,
  setShowRejectBox,
] = useState(false);

const [
  rejectionReason,
  setRejectionReason,
] = useState("");

  const {
    id,
  } =
    useLocalSearchParams<{
      id: string;
    }>();

  const {
    getToken,
    isLoaded,
  } = useAuth();

  const loadedId =
    useRef<
      string | null
    >(null);

  const [
    details,
    setDetails,
  ] =
    useState<
      DetailsResponse | null
    >(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null);


  // ========================================
  // LOAD DETAILS
  // ========================================

  const loadDetails =
    useCallback(
      async () => {
        if (!id) {
          return;
        }

        try {
          setLoading(
            true
          );

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
              `/api/admin/provider-applications/${id}`,
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
                "Failed to load application"
            );
          }

          setDetails(
            data
          );

        } catch (error) {
          console.error(
            "ADMIN PROVIDER DETAILS ERROR:",
            error
          );

          setError(
            error instanceof Error
              ? error.message
              : "Failed to load application"
          );

        } finally {
          setLoading(
            false
          );
        }
      },
      [
        id,
        getToken,
      ]
    );


  // ========================================
  // INITIAL LOAD ONLY
  // ========================================

  useEffect(() => {
    if (
      !isLoaded ||
      !id
    ) {
      return;
    }

    if (
      loadedId.current ===
      id
    ) {
      return;
    }

    loadedId.current =
      id;

    loadDetails();

  }, [
    isLoaded,
    id,
    loadDetails,
  ]);

// ========================================
// PERFORM ADMIN DECISION
// ========================================

const performDecision =
  async (
    action:
      | "approve"
      | "reject"
  ) => {
    try {
      if (!id) {
        return;
      }

      if (
        action === "reject" &&
        rejectionReason.trim().length <
          3
      ) {
        setError(
          "Please enter a rejection reason."
        );

        return;
      }

      setDecisionLoading(
        action
      );

      setError(null);

      const token =
        await getToken();

      if (!token) {
        throw new Error(
          "Authentication required"
        );
      }

      const response =
        await fetch(
          `/api/admin/provider-applications/${id}`,
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body:
              JSON.stringify({
                action,

                reason:
                  action ===
                  "reject"
                    ? rejectionReason
                    : undefined,
              }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to update application"
        );
      }

      console.log(
        "ADMIN PROVIDER DECISION:",
        data.application
      );

      router.replace(
        "/admin-providers"
      );

    } catch (error) {
      console.error(
        "ADMIN DECISION ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to update application"
      );

    } finally {
      setDecisionLoading(
        null
      );
    }
  };


// ========================================
// APPROVE CONFIRMATION
// ========================================

const handleApprove =
  () => {
    Alert.alert(
      "Approve Provider",
      "Are you sure you want to approve this provider?",
      [
        {
          text:
            "Cancel",

          style:
            "cancel",
        },

        {
          text:
            "Approve",

          onPress:
            () =>
              performDecision(
                "approve"
              ),
        },
      ]
    );
  };


// ========================================
// REJECT CONFIRMATION
// ========================================

const handleReject =
  () => {
    if (
      rejectionReason.trim().length <
      3
    ) {
      setError(
        "Please enter a rejection reason."
      );

      return;
    }

    Alert.alert(
      "Reject Application",
      "Are you sure you want to reject this application?",
      [
        {
          text:
            "Cancel",

          style:
            "cancel",
        },

        {
          text:
            "Reject",

          style:
            "destructive",

          onPress:
            () =>
              performDecision(
                "reject"
              ),
        },
      ]
    );
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
          Loading application...
        </Text>

      </SafeAreaView>
    );
  }


  // ========================================
  // ERROR
  // ========================================

  if (
    error ||
    !details
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
            size={46}
            color="#DC2626"
          />

          <Text className="mt-4 text-center font-semibold text-red-600">
            {error ||
              "Application not found"}
          </Text>

        </View>

      </SafeAreaView>
    );
  }


  const {
    application,
    services,
    availability,
  } = details;


  // ========================================
  // SCREEN
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
              Provider Application
            </Text>

            <Text className="mt-1 text-xs text-[#64748B]">
              Review full application
            </Text>

          </View>

        </View>


        {/* PROVIDER HEADER */}

        <View className="mt-6 rounded-2xl bg-white p-5">

          <View className="flex-row items-center">

            <View className="h-16 w-16 items-center justify-center rounded-full bg-[#EFF6FF]">

              <Text className="text-2xl font-bold text-[#2563EB]">
                {application.fullName
                  .trim()
                  .charAt(0)
                  .toUpperCase()}
              </Text>

            </View>


            <View className="ml-4 flex-1">

              <Text className="text-xl font-bold text-[#0F172A]">
                {
                  application.fullName
                }
              </Text>


              <View className="mt-2 flex-row items-center">

                <Ionicons
                  name="location-outline"
                  size={16}
                  color="#64748B"
                />

                <Text className="ml-1 text-sm text-[#64748B]">
                  {
                    application.city ||
                    "No city"
                  }
                </Text>

              </View>

            </View>


            <View className="rounded-full bg-amber-50 px-3 py-2">

              <Text className="text-xs font-bold capitalize text-amber-700">
                {
                  application.approvalStatus
                }
              </Text>

            </View>

          </View>

        </View>


        {/* PERSONAL INFO */}

        <Text className="mt-8 text-lg font-bold text-[#0F172A]">
          Personal Information
        </Text>


        <View className="mt-3 rounded-2xl bg-white p-5">

          <InfoRow
            icon="call-outline"
            label="Phone"
            value={
              application.phone ||
              "Not provided"
            }
          />

          <Divider />

          <InfoRow
            icon="mail-outline"
            label="Email"
            value={
              application.email ||
              "Not provided"
            }
          />

          <Divider />

          <InfoRow
            icon="location-outline"
            label="City"
            value={
              application.city ||
              "Not provided"
            }
          />

          <Divider />

          <InfoRow
            icon="briefcase-outline"
            label="Experience"
            value={`${application.experienceYears} years`}
          />

        </View>


        {/* BIO */}

        <Text className="mt-8 text-lg font-bold text-[#0F172A]">
          About Provider
        </Text>

        <View className="mt-3 rounded-2xl bg-white p-5">

          <Text className="leading-6 text-[#64748B]">
            {application.bio ||
              "No description provided."}
          </Text>

        </View>


        {/* SERVICES */}

        <View className="mt-8 flex-row items-center">

          <Text className="flex-1 text-lg font-bold text-[#0F172A]">
            Services & Prices
          </Text>

          <Text className="font-bold text-[#2563EB]">
            {services.length}
          </Text>

        </View>


        {services.length ===
        0 ? (
          <View className="mt-3 rounded-2xl bg-white p-5">

            <Text className="text-center text-[#64748B]">
              No services selected.
            </Text>

          </View>
        ) : (
          services.map(
            (service) => (
              <View
                key={
                  service.id
                }
                className="mt-3 rounded-2xl bg-white p-5"
              >

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
                        service.serviceName
                      }
                    </Text>

                    <Text className="mt-1 text-xs text-[#64748B]">
                      {
                        service.categoryName
                      }
                    </Text>

                  </View>


                  <Text className="text-base font-bold text-[#2563EB]">
                    {(
                      service.priceAgorot /
                      100
                    ).toFixed(
                      2
                    )}{" "}
                    ₪
                  </Text>

                </View>

              </View>
            )
          )
        )}


        {/* WORKING HOURS */}

        <Text className="mt-8 text-lg font-bold text-[#0F172A]">
          Working Hours
        </Text>


        <View className="mt-3 rounded-2xl bg-white p-5">

          {availability
            .sort(
              (a, b) =>
                a.dayOfWeek -
                b.dayOfWeek
            )
            .map(
              (
                day,
                index
              ) => (
                <React.Fragment
                  key={
                    day.id
                  }
                >

                  <View className="flex-row items-center">

                    <Text className="flex-1 font-semibold text-[#0F172A]">
                      {
                        DAYS[
                          day.dayOfWeek
                        ]
                      }
                    </Text>


                    {day.isAvailable ? (
                      <Text className="font-semibold text-[#16A34A]">
                        {String(
                          day.startTime
                        ).slice(
                          0,
                          5
                        )}{" "}
                        -{" "}
                        {String(
                          day.endTime
                        ).slice(
                          0,
                          5
                        )}
                      </Text>
                    ) : (
                      <Text className="text-[#94A3B8]">
                        Closed
                      </Text>
                    )}

                  </View>


                  {index <
                  availability.length -
                    1 ? (
                    <Divider />
                  ) : null}

                </React.Fragment>
              )
            )}

        </View>


        {/* REVIEW PREVIEW */}

        <View className="mt-8 rounded-2xl bg-[#EFF6FF] p-5">

          <View className="flex-row items-center">

            <Ionicons
              name="shield-checkmark-outline"
              size={24}
              color="#2563EB"
            />

            {/* ==================================
    ADMIN DECISION
================================== */}

{application.approvalStatus ===
"pending" ? (
  <View className="mt-8">

    <Text className="text-lg font-bold text-[#0F172A]">
      Admin Decision
    </Text>


    <View className="mt-3 rounded-2xl bg-[#EFF6FF] p-5">

      <View className="flex-row items-center">

        <Ionicons
          name="shield-checkmark-outline"
          size={24}
          color="#2563EB"
        />

        <Text className="ml-3 flex-1 text-sm leading-5 text-[#64748B]">
          Review all provider information before making a final decision.
        </Text>

      </View>

    </View>


    {/* APPROVE */}

    <Pressable
      disabled={
        decisionLoading !==
        null
      }
      onPress={
        handleApprove
      }
      className="mt-5 flex-row items-center justify-center rounded-2xl bg-[#16A34A] py-4"
    >

      {decisionLoading ===
      "approve" ? (
        <ActivityIndicator
          color="white"
        />
      ) : (
        <>
          <Ionicons
            name="checkmark-circle-outline"
            size={21}
            color="white"
          />

          <Text className="ml-2 font-bold text-white">
            Approve Provider
          </Text>
        </>
      )}

    </Pressable>


    {/* REJECT OPEN BUTTON */}

    {!showRejectBox ? (
      <Pressable
        disabled={
          decisionLoading !==
          null
        }
        onPress={() => {
          setShowRejectBox(
            true
          );

          setError(null);
        }}
        className="mt-3 flex-row items-center justify-center rounded-2xl border border-red-200 bg-red-50 py-4"
      >

        <Ionicons
          name="close-circle-outline"
          size={21}
          color="#DC2626"
        />

        <Text className="ml-2 font-bold text-red-600">
          Reject Application
        </Text>

      </Pressable>
    ) : null}


    {/* REJECTION REASON */}

    {showRejectBox ? (
      <View className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-4">

        <Text className="font-bold text-[#0F172A]">
          Rejection Reason
        </Text>

        <Text className="mt-1 text-xs leading-5 text-[#64748B]">
          This reason will be shown to the provider so they can correct their application.
        </Text>


        <TextInput
          value={
            rejectionReason
          }
          onChangeText={
            setRejectionReason
          }
          multiline
          textAlignVertical="top"
          placeholder="Explain why the application was rejected..."
          placeholderTextColor="#94A3B8"
          className="mt-4 min-h-[110px] rounded-xl border border-red-100 bg-white p-4 text-[#0F172A]"
        />


        <View className="mt-4 flex-row">

          <Pressable
            disabled={
              decisionLoading !==
              null
            }
            onPress={() => {
              setShowRejectBox(
                false
              );

              setRejectionReason(
                ""
              );
            }}
            className="mr-2 flex-1 items-center rounded-xl bg-white py-3.5"
          >

            <Text className="font-bold text-[#64748B]">
              Cancel
            </Text>

          </Pressable>


          <Pressable
            disabled={
              decisionLoading !==
              null
            }
            onPress={
              handleReject
            }
            className="ml-2 flex-1 items-center rounded-xl bg-[#DC2626] py-3.5"
          >

            {decisionLoading ===
            "reject" ? (
              <ActivityIndicator
                color="white"
              />
            ) : (
              <Text className="font-bold text-white">
                Confirm Reject
              </Text>
            )}

          </Pressable>

        </View>

      </View>
    ) : null}

  </View>
) : null}

          </View>

        </View>

      </ScrollView>

    </SafeAreaView>
  );
}


// ========================================
// INFO ROW
// ========================================

function InfoRow({
  icon,
  label,
  value,
}: {
  icon:
    keyof typeof Ionicons.glyphMap;

  label: string;
  value: string;
}) {
  return (
    <View className="flex-row items-center">

      <Ionicons
        name={icon}
        size={19}
        color="#64748B"
      />

      <Text className="ml-3 text-sm text-[#64748B]">
        {label}
      </Text>

      <Text className="ml-auto max-w-[190px] text-right font-semibold text-[#0F172A]">
        {value}
      </Text>

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
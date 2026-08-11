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

import {
  useTranslation,
} from "react-i18next";


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

  serviceId:
    string;

  serviceName:
    string;

  serviceSlug:
    string;

  categoryId:
    string;

  categoryName:
    string;

  categorySlug:
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


// ========================================
// SCREEN
// ========================================

export default function AdminProviderDetailsScreen() {
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


  const [
    decisionLoading,
    setDecisionLoading,
  ] = useState<
    | "approve"
    | "reject"
    | null
  >(null);


  const [
    showRejectBox,
    setShowRejectBox,
  ] = useState(
    false
  );


  const [
    rejectionReason,
    setRejectionReason,
  ] = useState(
    ""
  );


  const params =
    useLocalSearchParams<{
      id:
        | string
        | string[];
    }>();


  const id =
    Array.isArray(
      params.id
    )
      ? params.id[0]
      : params.id;


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
  ] = useState(
    true
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

  const getDayKey = (
    dayOfWeek: number
  ) => {
    const keys = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];

    return keys[
      dayOfWeek
    ];
  };


  const getApplicationStatus =
    (
      status: string
    ) => {
      switch (status) {
        case "pending":
          return t(
            "admin.statusPending"
          );

        case "approved":
          return t(
            "admin.statusApproved"
          );

        case "rejected":
          return t(
            "admin.statusRejected"
          );

        case "draft":
          return t(
            "admin.statusDraft"
          );

        default:
          return status;
      }
    };


  const localizeError =
    useCallback(
      (
        message:
          | string
          | null
          | undefined,
        fallbackKey:
          string
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


        if (
          normalized ===
          "provider application not found"
        ) {
          return t(
            "admin.errors.applicationNotFound"
          );
        }


        if (
          normalized ===
          "rejection reason is required" ||
          normalized ===
          "please enter a rejection reason."
        ) {
          return t(
            "admin.errors.rejectionReasonRequired"
          );
        }


        if (
          normalized ===
          "application not found or no longer pending"
        ) {
          return t(
            "admin.errors.noLongerPending"
          );
        }


        return t(
          fallbackKey
        );
      },
      [t]
    );


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

        } catch (err) {
          console.error(
            "ADMIN PROVIDER DETAILS ERROR:",
            err
          );


          setError(
            localizeError(
              err instanceof Error
                ? err.message
                : null,
              "admin.errors.loadApplication"
            )
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
        localizeError,
      ]
    );


  // ========================================
  // INITIAL LOAD
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
          rejectionReason
            .trim()
            .length < 3
        ) {
          setError(
            t(
              "admin.errors.rejectionReasonRequired"
            )
          );

          return;
        }


        setDecisionLoading(
          action
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


        router.replace(
          "/admin-providers"
        );

      } catch (err) {
        console.error(
          "ADMIN DECISION ERROR:",
          err
        );


        setError(
          localizeError(
            err instanceof Error
              ? err.message
              : null,
            "admin.errors.updateApplication"
          )
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
        t(
          "admin.approve"
        ),

        t(
          "admin.approveConfirm"
        ),

        [
          {
            text:
              t(
                "common.cancel"
              ),

            style:
              "cancel",
          },

          {
            text:
              t(
                "admin.approveAction"
              ),

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
        rejectionReason
          .trim()
          .length < 3
      ) {
        setError(
          t(
            "admin.errors.rejectionReasonRequired"
          )
        );

        return;
      }


      Alert.alert(
        t(
          "admin.reject"
        ),

        t(
          "admin.rejectConfirm"
        ),

        [
          {
            text:
              t(
                "common.cancel"
              ),

            style:
              "cancel",
          },

          {
            text:
              t(
                "admin.rejectAction"
              ),

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
          {t(
            "admin.loadingApplication"
          )}
        </Text>

      </SafeAreaView>
    );
  }


  // ========================================
  // FATAL ERROR
  // ========================================

  if (!details) {
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
            size={46}
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
                "admin.errors.applicationNotFound"
              )}
          </Text>


          <Pressable
            onPress={
              loadDetails
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
      edges={[
        "top",
      ]}
    >

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        keyboardShouldPersistTaps="handled"
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
                "admin.providerApplication"
              )}
            </Text>


            <Text
              className="mt-1 text-xs text-[#64748B]"
              style={
                textDirection
              }
            >
              {t(
                "admin.reviewFullApplication"
              )}
            </Text>

          </View>

        </View>


        {/* ==================================
            PROVIDER HEADER
        ================================== */}

        <View className="mt-6 rounded-2xl bg-white p-5">

          <View
            style={{
              ...rowDirection,
              alignItems:
                "center",
            }}
          >

            <View className="h-16 w-16 items-center justify-center rounded-full bg-[#EFF6FF]">

              <Text className="text-2xl font-bold text-[#2563EB]">
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
                className="text-xl font-bold text-[#0F172A]"
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
                  size={16}
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
              className="rounded-full bg-amber-50 px-3 py-2"
              style={{
                marginStart:
                  8,
              }}
            >

              <Text className="text-xs font-bold text-amber-700">
                {
                  getApplicationStatus(
                    application.approvalStatus
                  )
                }
              </Text>

            </View>

          </View>

        </View>


        {/* ==================================
            PERSONAL INFO
        ================================== */}

        <Text
          className="mt-8 text-lg font-bold text-[#0F172A]"
          style={
            textDirection
          }
        >
          {t(
            "admin.personalInformation"
          )}
        </Text>


        <View className="mt-3 rounded-2xl bg-white p-5">

          <InfoRow
            icon="call-outline"
            label={t(
              "admin.phone"
            )}
            value={
              application.phone ||
              t(
                "profile.notProvided"
              )
            }
            isArabic={
              isArabic
            }
            ltrValue
          />


          <Divider />


          <InfoRow
            icon="mail-outline"
            label={t(
              "admin.email"
            )}
            value={
              application.email ||
              t(
                "profile.notProvided"
              )
            }
            isArabic={
              isArabic
            }
            ltrValue
          />


          <Divider />


          <InfoRow
            icon="location-outline"
            label={t(
              "admin.city"
            )}
            value={
              application.city ||
              t(
                "profile.notProvided"
              )
            }
            isArabic={
              isArabic
            }
          />


          <Divider />


          <InfoRow
            icon="briefcase-outline"
            label={t(
              "admin.experience"
            )}
            value={t(
              "admin.experienceYears",
              {
                count:
                  application.experienceYears,
              }
            )}
            isArabic={
              isArabic
            }
          />

        </View>


        {/* ==================================
            BIO
        ================================== */}

        <Text
          className="mt-8 text-lg font-bold text-[#0F172A]"
          style={
            textDirection
          }
        >
          {t(
            "admin.aboutProvider"
          )}
        </Text>


        <View className="mt-3 rounded-2xl bg-white p-5">

          <Text
            className="leading-6 text-[#64748B]"
            style={
              textDirection
            }
          >
            {application.bio ||
              t(
                "admin.noDescription"
              )}
          </Text>

        </View>


        {/* ==================================
            SERVICES
        ================================== */}

        <View
          className="mt-8"
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
              "admin.servicesPrices"
            )}
          </Text>


          <Text className="font-bold text-[#2563EB]">
            {
              services.length
            }
          </Text>

        </View>


        {services.length ===
        0 ? (

          <View className="mt-3 rounded-2xl bg-white p-5">

            <Text
              className="text-[#64748B]"
              style={{
                textAlign:
                  "center",
              }}
            >
              {t(
                "admin.noServicesSelected"
              )}
            </Text>

          </View>

        ) : (

          services.map(
            (service) => {

              const serviceName =
                t(
                  `db.services.${service.serviceSlug}.name`,
                  {
                    defaultValue:
                      service.serviceName,
                  }
                );


              const categoryName =
                t(
                  `db.categories.${service.categorySlug}.name`,
                  {
                    defaultValue:
                      service.categoryName,
                  }
                );


              return (
                <View
                  key={
                    service.id
                  }
                  className="mt-3 rounded-2xl bg-white p-5"
                >

                  <View
                    style={{
                      ...rowDirection,
                      alignItems:
                        "center",
                    }}
                  >

                    <View className="h-11 w-11 items-center justify-center rounded-xl bg-[#EFF6FF]">

                      <Ionicons
                        name="construct-outline"
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
                      className="text-base font-bold text-[#2563EB]"
                      style={{
                        marginStart:
                          8,

                        writingDirection:
                          "ltr",
                      }}
                    >
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
              );
            }
          )

        )}


        {/* ==================================
            WORKING HOURS
        ================================== */}

        <Text
          className="mt-8 text-lg font-bold text-[#0F172A]"
          style={
            textDirection
          }
        >
          {t(
            "admin.workingHours"
          )}
        </Text>


        <View className="mt-3 rounded-2xl bg-white p-5">

          {[...availability]
            .sort(
              (
                a,
                b
              ) =>
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

                  <View
                    style={{
                      ...rowDirection,
                      alignItems:
                        "center",
                    }}
                  >

                    <Text
                      className="flex-1 font-semibold text-[#0F172A]"
                      style={
                        textDirection
                      }
                    >
                      {t(
                        `weekdays.${getDayKey(
                          day.dayOfWeek
                        )}`
                      )}
                    </Text>


                    {day.isAvailable ? (

                      <Text
                        className="font-semibold text-[#16A34A]"
                        style={{
                          writingDirection:
                            "ltr",
                        }}
                      >
                        {String(
                          day.startTime
                        ).slice(
                          0,
                          5
                        )}
                        {" - "}
                        {String(
                          day.endTime
                        ).slice(
                          0,
                          5
                        )}
                      </Text>

                    ) : (

                      <Text className="text-[#94A3B8]">
                        {t(
                          "admin.closed"
                        )}
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


        {/* ==================================
            ACTION ERROR
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

          </View>

        ) : null}


        {/* ==================================
            ADMIN DECISION
        ================================== */}

        {application
          .approvalStatus ===
        "pending" ? (

          <View className="mt-8">

            <Text
              className="text-lg font-bold text-[#0F172A]"
              style={
                textDirection
              }
            >
              {t(
                "admin.adminDecision"
              )}
            </Text>


            <View className="mt-3 rounded-2xl bg-[#EFF6FF] p-5">

              <View
                style={{
                  ...rowDirection,
                  alignItems:
                    "center",
                }}
              >

                <Ionicons
                  name="shield-checkmark-outline"
                  size={24}
                  color="#2563EB"
                />


                <Text
                  className="flex-1 text-sm leading-5 text-[#64748B]"
                  style={{
                    marginStart:
                      12,

                    ...textDirection,
                  }}
                >
                  {t(
                    "admin.decisionDescription"
                  )}
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
              className="mt-5 items-center justify-center rounded-2xl bg-[#16A34A] py-4"
            >

              {decisionLoading ===
              "approve" ? (

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
                    size={21}
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
                      "admin.approve"
                    )}
                  </Text>

                </View>

              )}

            </Pressable>


            {/* OPEN REJECT */}

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

                  setError(
                    null
                  );
                }}
                className="mt-3 items-center justify-center rounded-2xl border border-red-200 bg-red-50 py-4"
              >

                <View
                  style={{
                    ...rowDirection,
                    alignItems:
                      "center",
                  }}
                >

                  <Ionicons
                    name="close-circle-outline"
                    size={21}
                    color="#DC2626"
                  />


                  <Text
                    className="font-bold text-red-600"
                    style={{
                      marginStart:
                        8,
                    }}
                  >
                    {t(
                      "admin.reject"
                    )}
                  </Text>

                </View>

              </Pressable>

            ) : null}


            {/* REJECTION BOX */}

            {showRejectBox ? (

              <View className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-4">

                <Text
                  className="font-bold text-[#0F172A]"
                  style={
                    textDirection
                  }
                >
                  {t(
                    "admin.rejectionReason"
                  )}
                </Text>


                <Text
                  className="mt-1 text-xs leading-5 text-[#64748B]"
                  style={
                    textDirection
                  }
                >
                  {t(
                    "admin.rejectionReasonDescription"
                  )}
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
                  placeholder={t(
                    "admin.rejectionReasonPlaceholder"
                  )}
                  placeholderTextColor="#94A3B8"
                  className="mt-4 min-h-[110px] rounded-xl border border-red-100 bg-white p-4 text-[#0F172A]"
                  style={{
                    textAlign:
                      isArabic
                        ? "right"
                        : "left",

                    writingDirection:
                      isArabic
                        ? "rtl"
                        : "ltr",
                  }}
                />


                <View
                  className="mt-4"
                  style={{
                    ...rowDirection,
                  }}
                >

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

                      setError(
                        null
                      );
                    }}
                    className="flex-1 items-center rounded-xl bg-white py-3.5"
                    style={{
                      marginEnd:
                        8,
                    }}
                  >

                    <Text className="font-bold text-[#64748B]">
                      {t(
                        "common.cancel"
                      )}
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
                    className="flex-1 items-center rounded-xl bg-[#DC2626] py-3.5"
                    style={{
                      marginStart:
                        8,
                    }}
                  >

                    {decisionLoading ===
                    "reject" ? (

                      <ActivityIndicator
                        color="white"
                      />

                    ) : (

                      <Text className="font-bold text-white">
                        {t(
                          "admin.confirmReject"
                        )}
                      </Text>

                    )}

                  </Pressable>

                </View>

              </View>

            ) : null}

          </View>

        ) : null}

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
  isArabic,
  ltrValue = false,
}: {
  icon:
    keyof typeof Ionicons.glyphMap;

  label: string;

  value: string;

  isArabic:
    boolean;

  ltrValue?:
    boolean;
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
      }}
    >

      <Ionicons
        name={icon}
        size={19}
        color="#64748B"
      />


      <Text
        className="text-sm text-[#64748B]"
        style={{
          marginStart:
            12,

          textAlign:
            isArabic
              ? "right"
              : "left",
        }}
      >
        {label}
      </Text>


      <Text
        className="flex-1 font-semibold text-[#0F172A]"
        style={{
          marginStart:
            12,

          textAlign:
            isArabic
              ? "left"
              : "right",

          writingDirection:
            ltrValue
              ? "ltr"
              : isArabic
                ? "rtl"
                : "ltr",
        }}
      >
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

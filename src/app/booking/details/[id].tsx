import {
  useBookingDetailsStore,
} from "@/store/booking-details-store";

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


type BookingReview = {
  id: string;
  bookingId: string;
  providerId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
};


export default function BookingDetailsScreen() {
  const {
    getToken,
    isLoaded,
    userId,
  } = useAuth();


  const getTokenRef =
    useRef(
      getToken
    );


  useEffect(() => {
    getTokenRef.current =
      getToken;
  }, [
    getToken,
  ]);


  const {
    t,
    i18n,
  } = useTranslation();


  const [
    review,
    setReview,
  ] = useState<
    BookingReview | null
  >(null);


  const [
    rating,
    setRating,
  ] = useState(
    0
  );


  const [
    reviewComment,
    setReviewComment,
  ] = useState(
    ""
  );


  const [
    isLoadingReview,
    setIsLoadingReview,
  ] = useState(
    false
  );


  const [
    isSubmittingReview,
    setIsSubmittingReview,
  ] = useState(
    false
  );


  const [
    reviewError,
    setReviewError,
  ] = useState<
    string | null
  >(null);


  // ========================================
  // LANGUAGE
  // ========================================

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


  // ========================================
  // ROUTE
  // ========================================

  const params =
    useLocalSearchParams<{
      id:
        | string
        | string[];
    }>();


  const bookingId =
    Array.isArray(
      params.id
    )
      ? params.id[0]
      : params.id;


  // ========================================
  // STORE
  // ========================================

  const booking =
    useBookingDetailsStore(
      (state) =>
        state.booking
    );

  const isLoading =
    useBookingDetailsStore(
      (state) =>
        state.isLoading
    );

  const isCancelling =
    useBookingDetailsStore(
      (state) =>
        state.isCancelling
    );

  const error =
    useBookingDetailsStore(
      (state) =>
        state.error
    );

  const loadBooking =
    useBookingDetailsStore(
      (state) =>
        state.loadBooking
    );

  const cancelBooking =
    useBookingDetailsStore(
      (state) =>
        state.cancelBooking
    );

  const clearBooking =
    useBookingDetailsStore(
      (state) =>
        state.clearBooking
    );


  // ========================================
  // LOAD
  // ========================================

  useEffect(() => {
    if (
      !isLoaded ||
      !userId ||
      !bookingId
    ) {
      return;
    }


    let cancelled =
      false;


    const run =
      async () => {
        const token =
          await getTokenRef.current();


        if (
          cancelled ||
          !token
        ) {
          return;
        }


        await loadBooking(
          bookingId,
          token
        );
      };


    run();


    return () => {
      cancelled =
        true;
    };

  }, [
    isLoaded,
    userId,
    bookingId,
    loadBooking,
  ]);


  useEffect(() => {
    return () => {
      clearBooking();
    };
  }, [
    clearBooking,
  ]);


  // ========================================
  // LOAD REVIEW
  // ========================================

  useEffect(() => {
    if (
      !isLoaded ||
      !userId ||
      !bookingId ||
      booking?.booking.status !==
        "completed"
    ) {
      setReview(
        null
      );

      return;
    }


    let cancelled =
      false;


    const run =
      async () => {
        try {
          setIsLoadingReview(
            true
          );

          setReviewError(
            null
          );


          const token =
            await getTokenRef.current();


          if (
            cancelled ||
            !token
          ) {
            return;
          }


          const response =
            await fetch(
              `/api/reviews?bookingId=${encodeURIComponent(
                bookingId
              )}`,
              {
                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
              }
            );


          const data =
            await response.json();


          if (
            !response.ok
          ) {
            throw new Error(
              data.error ||
                "Failed to load review"
            );
          }


          if (
            cancelled
          ) {
            return;
          }


          setReview(
            data.review ??
              null
          );

        } catch (error) {
          console.error(
            "LOAD REVIEW ERROR:",
            error
          );


          if (
            !cancelled
          ) {
            setReviewError(
              isArabic
                ? "تعذر تحميل التقييم."
                : "Failed to load review."
            );
          }

        } finally {
          if (
            !cancelled
          ) {
            setIsLoadingReview(
              false
            );
          }
        }
      };


    run();


    return () => {
      cancelled =
        true;
    };

  }, [
    isLoaded,
    userId,
    bookingId,
    booking?.booking.status,
    isArabic,
  ]);


  // ========================================
  // SUBMIT REVIEW
  // ========================================

  const handleSubmitReview =
    async () => {
      if (
        !bookingId ||
        rating < 1 ||
        rating > 5
      ) {
        setReviewError(
          isArabic
            ? "اختر عدد النجوم أولًا."
            : "Please select a star rating."
        );

        return;
      }


      try {
        setIsSubmittingReview(
          true
        );

        setReviewError(
          null
        );


        const token =
          await getTokenRef.current();


        if (!token) {
          throw new Error(
            "Authentication required"
          );
        }


        const response =
          await fetch(
            "/api/reviews",
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body:
                JSON.stringify({
                  bookingId,
                  rating,

                  comment:
                    reviewComment.trim() ||
                    null,
                }),
            }
          );


        const data =
          await response.json();


        if (
          !response.ok
        ) {
          throw new Error(
            data.error ||
              "Failed to submit review"
          );
        }


        setReview(
          data.review
        );

      } catch (error) {
        console.error(
          "SUBMIT REVIEW ERROR:",
          error
        );


        const message =
          error instanceof Error
            ? error.message
            : "";


        if (
          message ===
          "This booking has already been reviewed"
        ) {
          setReviewError(
            isArabic
              ? "تم تقييم هذا الحجز مسبقًا."
              : "This booking has already been reviewed."
          );

        } else if (
          message ===
          "Only completed bookings can be reviewed"
        ) {
          setReviewError(
            isArabic
              ? "يمكن التقييم بعد اكتمال الخدمة فقط."
              : "You can review only after the service is completed."
          );

        } else {
          setReviewError(
            isArabic
              ? "تعذر إرسال التقييم. حاول مرة أخرى."
              : "Failed to submit review. Please try again."
          );
        }

      } finally {
        setIsSubmittingReview(
          false
        );
      }
    };


  // ========================================
  // DATABASE TRANSLATION
  // ========================================

  const getServiceName =
    () => {
      if (!booking) {
        return "";
      }


      return t(
        `db.services.${booking.service.slug}.name`,
        {
          defaultValue:
            booking.service.name,
        }
      );
    };


  const getCategoryName =
    () => {
      if (!booking) {
        return "";
      }


      return t(
        `db.categories.${booking.category.slug}.name`,
        {
          defaultValue:
            booking.category.name,
        }
      );
    };


  // ========================================
  // TIME
  // ========================================

  const formatTime = (
    time: string
  ) => {
    return time.slice(
      0,
      5
    );
  };


  // ========================================
  // DATE
  // ========================================

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


    const date =
      new Date(
        year,
        month - 1,
        day,
        12
      );


    return date.toLocaleDateString(
      locale,
      {
        weekday:
          "long",

        day:
          "numeric",

        month:
          "long",

        year:
          "numeric",
      }
    );
  };


  // ========================================
  // STATUS
  // ========================================

  const getStatusInfo = (
    status: string
  ) => {
    switch (status) {
      case "pending":
        return {
          label:
            t(
              "status.pending"
            ),

          icon:
            "time-outline" as const,

          iconColor:
            "#D97706",

          background:
            "bg-amber-50",

          text:
            "text-amber-700",
        };


      case "confirmed":
        return {
          label:
            t(
              "status.confirmed"
            ),

          icon:
            "checkmark-circle-outline" as const,

          iconColor:
            "#2563EB",

          background:
            "bg-blue-50",

          text:
            "text-blue-700",
        };


      case "on_the_way":
        return {
          label:
            t(
              "status.on_the_way"
            ),

          icon:
            "car-outline" as const,

          iconColor:
            "#7C3AED",

          background:
            "bg-purple-50",

          text:
            "text-purple-700",
        };


      case "in_progress":
        return {
          label:
            t(
              "status.in_progress"
            ),

          icon:
            "construct-outline" as const,

          iconColor:
            "#0891B2",

          background:
            "bg-cyan-50",

          text:
            "text-cyan-700",
        };


      case "completed":
        return {
          label:
            t(
              "status.completed"
            ),

          icon:
            "checkmark-done-outline" as const,

          iconColor:
            "#16A34A",

          background:
            "bg-green-50",

          text:
            "text-green-700",
        };


      case "cancelled":
        return {
          label:
            t(
              "status.cancelled"
            ),

          icon:
            "close-circle-outline" as const,

          iconColor:
            "#EF4444",

          background:
            "bg-red-50",

          text:
            "text-red-600",
        };


      default:
        return {
          label:
            status,

          icon:
            "help-circle-outline" as const,

          iconColor:
            "#64748B",

          background:
            "bg-[#F1F5F9]",

          text:
            "text-[#64748B]",
        };
    }
  };


  // ========================================
  // CANCEL
  // ========================================

  const canCancel =
    booking?.booking.status ===
      "pending" ||
    booking?.booking.status ===
      "confirmed";


  const handleCancel =
    () => {
      if (!bookingId) {
        return;
      }


      Alert.alert(
        t(
          "bookingDetails.cancelTitle"
        ),

        t(
          "bookingDetails.cancelDescription"
        ),

        [
          {
            text:
              t(
                "bookingDetails.keepBooking"
              ),

            style:
              "cancel",
          },

          {
            text:
              t(
                "bookingDetails.cancelBooking"
              ),

            style:
              "destructive",

            onPress:
              async () => {
                const token =
                  await getTokenRef.current();


                if (!token) {
                  return;
                }


                const success =
                  await cancelBooking(
                    bookingId,
                    token
                  );


                if (success) {
                  Alert.alert(
                    t(
                      "bookingDetails.cancelledTitle"
                    ),

                    t(
                      "bookingDetails.cancelledDescription"
                    )
                  );
                }
              },
          },
        ]
      );
    };


  // ========================================
  // LOADING
  // ========================================

  if (
    isLoading &&
    !booking
  ) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#F8FAFC]">

        <ActivityIndicator
          size="large"
          color="#2563EB"
        />


        <Text className="mt-3 text-[#64748B]">
          {t(
            "bookingDetails.loading"
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
    !booking
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
            size={50}
            color="#EF4444"
          />


          <Text
            className="mt-4 text-lg font-bold text-[#0F172A]"
            style={{
              textAlign:
                "center",
            }}
          >
            {t(
              "bookingDetails.loadError"
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
              "bookingDetails.loadErrorDescription"
            )}
          </Text>


          <Pressable
            onPress={async () => {
              if (!bookingId) {
                return;
              }


              const token =
                await getTokenRef.current();


              if (!token) {
                return;
              }


              await loadBooking(
                bookingId,
                token
              );
            }}
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


  if (!booking) {
    return null;
  }


  // ========================================
  // VALUES
  // ========================================

  const price =
    booking.booking
      .priceAgorot /
    100;


  const status =
    getStatusInfo(
      booking.booking.status
    );


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
            50,
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
              "bookingDetails.title"
            )}
          </Text>

        </View>


        {/* ==================================
            STATUS
        ================================== */}

        <View className="mt-6 rounded-2xl bg-white p-5">

          <Text
            className="text-xs font-semibold text-[#94A3B8]"
            style={
              textDirection
            }
          >
            {t(
              "bookingDetails.status"
            )}
          </Text>


          <View
            className={`mt-3 rounded-xl px-4 py-3 ${status.background}`}
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
              name={
                status.icon
              }
              size={22}
              color={
                status.iconColor
              }
            />


            <Text
              className={`text-base font-bold ${status.text}`}
              style={{
                marginStart:
                  8,
              }}
            >
              {
                status.label
              }
            </Text>

          </View>

        </View>


        {/* ==================================
            SERVICE
        ================================== */}

        <View className="mt-5 rounded-2xl bg-white p-5">

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

            <View className="h-14 w-14 items-center justify-center rounded-xl bg-[#EFF6FF]">

              <Ionicons
                name={
                  (booking.service.icon ||
                    "construct-outline") as keyof typeof Ionicons.glyphMap
                }
                size={27}
                color="#2563EB"
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
                className="text-lg font-bold text-[#0F172A]"
                style={
                  textDirection
                }
              >
                {
                  getServiceName()
                }
              </Text>


              <Text
                className="mt-1 text-sm text-[#64748B]"
                style={
                  textDirection
                }
              >
                {
                  getCategoryName()
                }
              </Text>

            </View>


            <Text
              className="text-xl font-bold text-[#2563EB]"
              style={{
                marginStart:
                  8,

                writingDirection:
                  "ltr",
              }}
            >
              {price} ₪
            </Text>

          </View>

        </View>


        {/* ==================================
            PROVIDER
        ================================== */}

        <View className="mt-5 rounded-2xl bg-white p-5">

          <Text
            className="text-sm font-bold text-[#0F172A]"
            style={
              textDirection
            }
          >
            {t(
              "bookingDetails.provider"
            )}
          </Text>


          <View
            className="mt-4"
            style={{
              flexDirection:
                isArabic
                  ? "row-reverse"
                  : "row",

              alignItems:
                "center",
            }}
          >

            <View className="h-12 w-12 items-center justify-center rounded-full bg-[#EFF6FF]">

              <Ionicons
                name="person"
                size={23}
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

                <Text
                  className="font-bold text-[#0F172A]"
                  style={
                    textDirection
                  }
                >
                  {
                    booking.provider
                      .fullName
                  }
                </Text>


                {booking.provider
                  .isVerified ? (

                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color="#2563EB"
                    style={{
                      marginStart:
                        5,
                    }}
                  />

                ) : null}

              </View>


              {booking.provider
                .city ? (

                <Text
                  className="mt-1 text-sm text-[#64748B]"
                  style={
                    textDirection
                  }
                >
                  {
                    booking.provider
                      .city
                  }
                </Text>

              ) : null}

            </View>

          </View>

        </View>


        {/* ==================================
            APPOINTMENT
        ================================== */}

        <View className="mt-5 rounded-2xl bg-white p-5">

          <Text
            className="font-bold text-[#0F172A]"
            style={
              textDirection
            }
          >
            {t(
              "bookingDetails.appointment"
            )}
          </Text>


          {/* DATE */}

          <View
            className="mt-4"
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
              name="calendar-outline"
              size={20}
              color="#2563EB"
            />


            <Text
              className="flex-1 text-[#475569]"
              style={{
                marginStart:
                  12,

                ...textDirection,
              }}
            >
              {formatDate(
                booking.booking
                  .bookingDate
              )}
            </Text>

          </View>


          {/* TIME */}

          <View
            className="mt-4"
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
              name="time-outline"
              size={20}
              color="#2563EB"
            />


            <Text
              className="text-[#475569]"
              style={{
                marginStart:
                  12,

                writingDirection:
                  "ltr",
              }}
            >
              {formatTime(
                booking.booking
                  .startTime
              )}
            </Text>

          </View>


          {/* ADDRESS */}

          <View
            className="mt-4"
            style={{
              flexDirection:
                isArabic
                  ? "row-reverse"
                  : "row",

              alignItems:
                "flex-start",
            }}
          >

            <Ionicons
              name="location-outline"
              size={20}
              color="#2563EB"
            />


            <Text
              className="flex-1 leading-5 text-[#475569]"
              style={{
                marginStart:
                  12,

                ...textDirection,
              }}
            >
              {
                booking.booking
                  .address
              }
            </Text>

          </View>

        </View>


        {/* ==================================
            NOTES
        ================================== */}

        {booking.booking.notes ? (

          <View className="mt-5 rounded-2xl bg-white p-5">

            <Text
              className="font-bold text-[#0F172A]"
              style={
                textDirection
              }
            >
              {t(
                "bookingDetails.notes"
              )}
            </Text>


            <Text
              className="mt-3 leading-6 text-[#64748B]"
              style={
                textDirection
              }
            >
              {
                booking.booking
                  .notes
              }
            </Text>

          </View>

        ) : null}


        {/* ==================================
            REVIEW
        ================================== */}

        {booking.booking.status ===
        "completed" ? (

          <View className="mt-5 rounded-2xl bg-white p-5">

            <Text
              className="text-lg font-bold text-[#0F172A]"
              style={
                textDirection
              }
            >
              {
                isArabic
                  ? "تقييم الخدمة"
                  : "Rate the service"
              }
            </Text>


            {isLoadingReview ? (

              <View className="items-center py-5">

                <ActivityIndicator
                  size="small"
                  color="#2563EB"
                />

              </View>

            ) : review ? (

              <View className="mt-4">

                <Text
                  className="text-sm font-semibold text-green-600"
                  style={
                    textDirection
                  }
                >
                  {
                    isArabic
                      ? "تم إرسال تقييمك"
                      : "Your review has been submitted"
                  }
                </Text>


                <View
                  className="mt-3"
                  style={{
                    flexDirection:
                      isArabic
                        ? "row-reverse"
                        : "row",

                    gap:
                      6,
                  }}
                >

                  {[
                    1,
                    2,
                    3,
                    4,
                    5,
                  ].map(
                    (star) => (
                      <Ionicons
                        key={
                          star
                        }
                        name={
                          star <=
                          review.rating
                            ? "star"
                            : "star-outline"
                        }
                        size={26}
                        color="#F59E0B"
                      />
                    )
                  )}

                </View>


                {review.comment ? (

                  <Text
                    className="mt-4 leading-6 text-[#64748B]"
                    style={
                      textDirection
                    }
                  >
                    {
                      review.comment
                    }
                  </Text>

                ) : null}

              </View>

            ) : (

              <View className="mt-4">

                <Text
                  className="text-sm text-[#64748B]"
                  style={
                    textDirection
                  }
                >
                  {
                    isArabic
                      ? "كيف كانت تجربتك مع مقدم الخدمة؟"
                      : "How was your experience with the provider?"
                  }
                </Text>


                <View
                  className="mt-4"
                  style={{
                    flexDirection:
                      isArabic
                        ? "row-reverse"
                        : "row",

                    gap:
                      10,
                  }}
                >

                  {[
                    1,
                    2,
                    3,
                    4,
                    5,
                  ].map(
                    (star) => (
                      <Pressable
                        key={
                          star
                        }
                        onPress={() => {
                          setRating(
                            star
                          );

                          setReviewError(
                            null
                          );
                        }}
                      >

                        <Ionicons
                          name={
                            star <=
                            rating
                              ? "star"
                              : "star-outline"
                          }
                          size={34}
                          color="#F59E0B"
                        />

                      </Pressable>
                    )
                  )}

                </View>


                <TextInput
                  value={
                    reviewComment
                  }
                  onChangeText={
                    setReviewComment
                  }
                  placeholder={
                    isArabic
                      ? "اكتب تعليقًا اختياريًا..."
                      : "Write an optional comment..."
                  }
                  placeholderTextColor="#94A3B8"
                  multiline
                  maxLength={
                    1000
                  }
                  textAlignVertical="top"
                  className="mt-4 min-h-[100px] rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 text-[#0F172A]"
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


                {reviewError ? (

                  <Text
                    className="mt-3 text-sm font-semibold text-red-600"
                    style={{
                      textAlign:
                        "center",
                    }}
                  >
                    {
                      reviewError
                    }
                  </Text>

                ) : null}


                <Pressable
                  disabled={
                    rating === 0 ||
                    isSubmittingReview
                  }
                  onPress={
                    handleSubmitReview
                  }
                  className={`mt-4 items-center rounded-xl py-3.5 ${
                    rating > 0 &&
                    !isSubmittingReview
                      ? "bg-[#2563EB]"
                      : "bg-[#CBD5E1]"
                  }`}
                >

                  {isSubmittingReview ? (

                    <ActivityIndicator
                      size="small"
                      color="white"
                    />

                  ) : (

                    <Text className="font-bold text-white">
                      {
                        isArabic
                          ? "إرسال التقييم"
                          : "Submit Review"
                      }
                    </Text>

                  )}

                </Pressable>

              </View>
            )}

          </View>

        ) : null}


        {/* ==================================
            BOOKING ID
        ================================== */}

        <View className="mt-5 rounded-2xl bg-white p-5">

          <Text
            className="text-xs text-[#94A3B8]"
            style={
              textDirection
            }
          >
            {t(
              "bookingDetails.bookingId"
            )}
          </Text>


          <Text
            selectable
            className="mt-2 text-sm font-semibold text-[#475569]"
            style={{
              writingDirection:
                "ltr",

              textAlign:
                isArabic
                  ? "right"
                  : "left",
            }}
          >
            {
              booking.booking.id
            }
          </Text>

        </View>


        {/* ==================================
            ACTION ERROR
        ================================== */}

        {error ? (

          <View className="mt-5 rounded-xl bg-red-50 p-4">

            <Text
              className="font-semibold text-red-600"
              style={{
                textAlign:
                  "center",
              }}
            >
              {t(
                "bookingDetails.actionError"
              )}
            </Text>

          </View>

        ) : null}


        {/* ==================================
            CANCEL
        ================================== */}

        {canCancel ? (

          <Pressable
            disabled={
              isCancelling
            }
            onPress={
              handleCancel
            }
            className={`mt-7 items-center rounded-2xl border border-red-200 bg-red-50 py-4 ${
              isCancelling
                ? "opacity-60"
                : ""
            }`}
          >

            {isCancelling ? (

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

                <ActivityIndicator
                  size="small"
                  color="#EF4444"
                />


                <Text className="font-bold text-red-600">
                  {t(
                    "bookingDetails.cancelling"
                  )}
                </Text>

              </View>

            ) : (

              <Text className="font-bold text-red-600">
                {t(
                  "bookingDetails.cancelBooking"
                )}
              </Text>

            )}

          </Pressable>

        ) : null}

      </ScrollView>

    </SafeAreaView>
  );
}
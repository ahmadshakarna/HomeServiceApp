import {
  useProviderDetailsStore,
} from "@/store/provider-details-store";

import {
  Ionicons,
} from "@expo/vector-icons";

import {
  useAuth,
} from "@clerk/expo";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
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


export default function BookingScreen() {
  const {
    t,
    i18n,
  } = useTranslation();

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
      providerId:
        | string
        | string[];
    }>();


  const providerId =
    Array.isArray(
      params.providerId
    )
      ? params.providerId[0]
      : params.providerId;


  // ========================================
  // PROVIDER STORE
  // ========================================

  const provider =
    useProviderDetailsStore(
      (state) =>
        state.provider
    );

  const services =
    useProviderDetailsStore(
      (state) =>
        state.services
    );

  const availability =
    useProviderDetailsStore(
      (state) =>
        state.availability
    );

  const isLoading =
    useProviderDetailsStore(
      (state) =>
        state.isLoading
    );

  const error =
    useProviderDetailsStore(
      (state) =>
        state.error
    );

  const loadProvider =
    useProviderDetailsStore(
      (state) =>
        state.loadProvider
    );

  const clearProvider =
    useProviderDetailsStore(
      (state) =>
        state.clearProvider
    );


  // ========================================
  // STATE
  // ========================================

  const [
    selectedServiceId,
    setSelectedServiceId,
  ] = useState<
    string | null
  >(null);


  const [
    selectedDate,
    setSelectedDate,
  ] = useState<
    string | null
  >(null);


  const [
    selectedTime,
    setSelectedTime,
  ] = useState<
    string | null
  >(null);


  const [
    address,
    setAddress,
  ] = useState("");


  const [
    notes,
    setNotes,
  ] = useState("");


  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);


  const [
    submitError,
    setSubmitError,
  ] = useState<
    string | null
  >(null);


  const [
    bookedTimes,
    setBookedTimes,
  ] = useState<
    string[]
  >([]);


  const [
    isLoadingBookedTimes,
    setIsLoadingBookedTimes,
  ] = useState(
    false
  );


  // ========================================
  // LOAD PROVIDER
  // ========================================

  useEffect(() => {
    if (!providerId) {
      return;
    }

    loadProvider(
      providerId
    );


    return () => {
      clearProvider();
    };

  }, [
    providerId,
    loadProvider,
    clearProvider,
  ]);


  // ========================================
  // LOAD BOOKED TIME SLOTS
  // ========================================

  useEffect(() => {
    if (
      !isLoaded ||
      !userId ||
      !providerId ||
      !selectedDate
    ) {
      setBookedTimes(
        []
      );

      return;
    }


    let cancelled =
      false;


    const run =
      async () => {
        try {
          setIsLoadingBookedTimes(
            true
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
              `/api/bookings?providerId=${encodeURIComponent(
                providerId
              )}&bookingDate=${encodeURIComponent(
                selectedDate
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
                "Failed to load booked times"
            );
          }


          const times =
            Array.isArray(
              data.bookedTimes
            )
              ? data.bookedTimes
              : [];


          if (cancelled) {
            return;
          }


          setBookedTimes(
            times
          );


          setSelectedTime(
            (current) =>
              current &&
              times.includes(
                current
              )
                ? null
                : current
          );

        } catch (error) {
          console.error(
            "LOAD BOOKED TIMES ERROR:",
            error
          );


          if (
            !cancelled
          ) {
            setBookedTimes(
              []
            );
          }

        } finally {
          if (
            !cancelled
          ) {
            setIsLoadingBookedTimes(
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
    providerId,
    selectedDate,
  ]);


  // ========================================
  // DATABASE SERVICE TRANSLATION
  // ========================================

  const getServiceName = (
    item: {
      service: {
        slug: string;
        name: string;
      };
    }
  ) => {
    return t(
      `db.services.${item.service.slug}.name`,
      {
        defaultValue:
          item.service.name,
      }
    );
  };


  // ========================================
  // AVAILABLE DATES
  // ========================================

  const dates =
    useMemo(() => {
      const result: {
        value: string;
        dayOfWeek: number;
        dayName: string;
        dayNumber: number;
        monthName: string;
      }[] = [];


      // Next 14 days
      for (
        let i = 0;
        i < 14;
        i++
      ) {
        const date =
          new Date();

        date.setHours(
          12,
          0,
          0,
          0
        );

        date.setDate(
          date.getDate() +
            i
        );


        const dayOfWeek =
          date.getDay();


        const dayAvailability =
          availability.find(
            (item) =>
              item.dayOfWeek ===
                dayOfWeek &&
              item.isAvailable
          );


        if (
          !dayAvailability
        ) {
          continue;
        }


        const year =
          date.getFullYear();


        const month =
          String(
            date.getMonth() +
              1
          ).padStart(
            2,
            "0"
          );


        const day =
          String(
            date.getDate()
          ).padStart(
            2,
            "0"
          );


        result.push({
          value:
            `${year}-${month}-${day}`,

          dayOfWeek,

          dayName:
            date.toLocaleDateString(
              locale,
              {
                weekday:
                  "short",
              }
            ),

          dayNumber:
            date.getDate(),

          monthName:
            date.toLocaleDateString(
              locale,
              {
                month:
                  "short",
              }
            ),
        });
      }


      return result;

    }, [
      availability,
      locale,
    ]);


  // ========================================
  // SELECTED DATE AVAILABILITY
  // ========================================

  const selectedAvailability =
    useMemo(() => {
      if (
        !selectedDate
      ) {
        return null;
      }


      const [
        year,
        month,
        day,
      ] =
        selectedDate
          .split("-")
          .map(Number);


      const date =
        new Date(
          year,
          month - 1,
          day,
          12
        );


      return (
        availability.find(
          (item) =>
            item.dayOfWeek ===
              date.getDay() &&
            item.isAvailable
        ) ?? null
      );

    }, [
      selectedDate,
      availability,
    ]);


  // ========================================
  // TIME SLOTS
  // ========================================

  const timeSlots =
    useMemo(() => {
      if (
        !selectedAvailability
          ?.startTime ||
        !selectedAvailability
          ?.endTime
      ) {
        return [];
      }


      const parseTime = (
        time: string
      ) => {
        const [
          hours,
          minutes,
        ] =
          time
            .split(":")
            .map(Number);

        return (
          hours *
            60 +
          minutes
        );
      };


      const formatTime = (
        totalMinutes: number
      ) => {
        const hours =
          Math.floor(
            totalMinutes /
              60
          );

        const minutes =
          totalMinutes %
          60;


        return `${String(
          hours
        ).padStart(
          2,
          "0"
        )}:${String(
          minutes
        ).padStart(
          2,
          "0"
        )}`;
      };


      const start =
        parseTime(
          selectedAvailability
            .startTime
        );


      const end =
        parseTime(
          selectedAvailability
            .endTime
        );


      const slots:
        string[] = [];


      // One-hour appointments
      for (
        let current =
          start;
        current < end;
        current += 60
      ) {
        slots.push(
          formatTime(
            current
          )
        );
      }


      return slots;

    }, [
      selectedAvailability,
    ]);


  // ========================================
  // SELECTED SERVICE
  // ========================================

  const selectedService =
    services.find(
      (item) =>
        item.service.id ===
        selectedServiceId
    ) ?? null;


  const price =
    selectedService
      ? selectedService
          .priceAgorot /
        100
      : 0;


  // ========================================
  // FORM VALIDATION
  // ========================================

  const canContinue =
    Boolean(
      selectedServiceId &&
      selectedDate &&
      selectedTime &&
      address.trim()
        .length > 3
    );


  // ========================================
  // FORMAT SUMMARY DATE
  // ========================================

  const formattedSelectedDate =
    useMemo(() => {
      if (
        !selectedDate
      ) {
        return "";
      }


      const [
        year,
        month,
        day,
      ] =
        selectedDate
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

    }, [
      selectedDate,
      locale,
    ]);


  // ========================================
  // CONFIRM BOOKING
  // ========================================

  const handleConfirmBooking =
    async () => {
      if (
        !isLoaded ||
        !userId ||
        !providerId ||
        !selectedServiceId ||
        !selectedDate ||
        !selectedTime ||
        !selectedService
      ) {
        return;
      }


      try {
        setIsSubmitting(
          true
        );

        setSubmitError(
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
            "/api/bookings",
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
                  providerId,

                  serviceId:
                    selectedServiceId,

                  bookingDate:
                    selectedDate,

                  startTime:
                    selectedTime,

                  address:
                    address.trim(),

                  notes:
                    notes.trim() ||
                    null,
                }),
            }
          );


        const data =
          await response.json();


        if (
          !response.ok
        ) {
          console.error(
            "BOOKING API ERROR:",
            data
          );


          throw new Error(
            data.error ||
              "Failed to create booking"
          );
        }


        router.replace({
          pathname:
            "/booking/success",

          params: {
            bookingId:
              data.booking.id,
          },
        });

      } catch (error) {
        console.error(
          "BOOKING ERROR:",
          error
        );


        const message =
          error instanceof Error
            ? error.message
            : "";


        if (
          message ===
          "This time slot is already booked"
        ) {
          setSubmitError(
            isArabic
              ? "هذا الموعد محجوز بالفعل، اختر وقتًا آخر."
              : "This time slot is already booked. Please choose another time."
          );

          return;
        }


        setSubmitError(
          t(
            "booking.submitError"
          )
        );

      } finally {
        setIsSubmitting(
          false
        );
      }
    };


  // ========================================
  // LOADING
  // ========================================

  if (
    isLoading &&
    !provider
  ) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#F8FAFC]">

        <ActivityIndicator
          size="large"
          color="#2563EB"
        />


        <Text className="mt-3 text-[#64748B]">
          {t(
            "booking.loading"
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
    !provider
  ) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#F8FAFC] px-5">

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
            "booking.loadError"
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
            "booking.loadErrorDescription"
          )}
        </Text>


        <Pressable
          onPress={() =>
            router.back()
          }
          className="mt-5 rounded-xl bg-[#2563EB] px-6 py-3"
        >

          <Text className="font-bold text-white">
            {t(
              "booking.goBack"
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

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        keyboardShouldPersistTaps="handled"
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
              "booking.title"
            )}
          </Text>

        </View>


        {/* ==================================
            PROVIDER
        ================================== */}

        <View
          className="mt-6 rounded-2xl bg-white p-4"
          style={{
            flexDirection:
              isArabic
                ? "row-reverse"
                : "row",

            alignItems:
              "center",
          }}
        >

          <View className="h-14 w-14 items-center justify-center rounded-full bg-[#EFF6FF]">

            <Ionicons
              name="person"
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
                className="text-base font-bold text-[#0F172A]"
                style={
                  textDirection
                }
              >
                {
                  provider
                    ?.fullName
                }
              </Text>


              {provider
                ?.isVerified ? (

                <Ionicons
                  name="checkmark-circle"
                  size={17}
                  color="#2563EB"
                  style={{
                    marginStart:
                      5,
                  }}
                />

              ) : null}

            </View>


            {provider?.city ? (
              <Text
                className="mt-1 text-sm text-[#64748B]"
                style={
                  textDirection
                }
              >
                {
                  provider.city
                }
              </Text>
            ) : null}

          </View>

        </View>


        {/* ==================================
            CHOOSE SERVICE
        ================================== */}

        <View className="mt-7">

          <Text
            className="text-lg font-bold text-[#0F172A]"
            style={
              textDirection
            }
          >
            {t(
              "booking.chooseService"
            )}
          </Text>


          {services.map(
            (item) => {
              const selected =
                selectedServiceId ===
                item.service.id;


              return (
                <Pressable
                  key={
                    item.providerServiceId
                  }
                  onPress={() => {
                    setSelectedServiceId(
                      item.service.id
                    );

                    setSubmitError(
                      null
                    );
                  }}
                  className={`mt-3 rounded-2xl border p-4 ${
                    selected
                      ? "border-[#2563EB] bg-[#EFF6FF]"
                      : "border-[#E2E8F0] bg-white"
                  }`}
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

                    <View className="h-11 w-11 items-center justify-center rounded-xl bg-white">

                      <Ionicons
                        name={
                          (item
                            .service
                            .icon ||
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
                          getServiceName(
                            item
                          )
                        }
                      </Text>


                      <Text
                        className="mt-1 text-sm text-[#64748B]"
                        style={{
                          ...textDirection,
                          writingDirection:
                            "ltr",
                        }}
                      >
                        {item
                          .priceAgorot /
                          100}{" "}
                        ₪
                      </Text>

                    </View>


                    <Ionicons
                      name={
                        selected
                          ? "radio-button-on"
                          : "radio-button-off"
                      }
                      size={22}
                      color={
                        selected
                          ? "#2563EB"
                          : "#CBD5E1"
                      }
                      style={{
                        marginStart:
                          8,
                      }}
                    />

                  </View>

                </Pressable>
              );
            }
          )}

        </View>


        {/* ==================================
            DATE
        ================================== */}

        <View className="mt-7">

          <Text
            className="text-lg font-bold text-[#0F172A]"
            style={
              textDirection
            }
          >
            {t(
              "booking.selectDate"
            )}
          </Text>


          {dates.length ===
          0 ? (

            <View className="mt-3 items-center rounded-2xl border border-[#E2E8F0] bg-white p-5">

              <Ionicons
                name="calendar-outline"
                size={28}
                color="#94A3B8"
              />


              <Text className="mt-2 text-sm text-[#64748B]">
                {t(
                  "booking.noAvailableDates"
                )}
              </Text>

            </View>

          ) : (

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={
                false
              }
              className="mt-3"
              contentContainerStyle={{
                paddingEnd:
                  4,
              }}
            >

              {dates.map(
                (date) => {
                  const selected =
                    selectedDate ===
                    date.value;


                  return (
                    <Pressable
                      key={
                        date.value
                      }
                      onPress={() => {
                        setSelectedDate(
                          date.value
                        );

                        setSelectedTime(
                          null
                        );

                        setSubmitError(
                          null
                        );
                      }}
                      className={`min-w-[76px] items-center rounded-2xl border px-4 py-3 ${
                        selected
                          ? "border-[#2563EB] bg-[#2563EB]"
                          : "border-[#E2E8F0] bg-white"
                      }`}
                      style={{
                        marginEnd:
                          12,
                      }}
                    >

                      <Text
                        className={`text-xs font-semibold ${
                          selected
                            ? "text-white/80"
                            : "text-[#64748B]"
                        }`}
                      >
                        {
                          date.dayName
                        }
                      </Text>


                      <Text
                        className={`mt-1 text-xl font-bold ${
                          selected
                            ? "text-white"
                            : "text-[#0F172A]"
                        }`}
                      >
                        {
                          date.dayNumber
                        }
                      </Text>


                      <Text
                        className={`mt-1 text-xs ${
                          selected
                            ? "text-white/80"
                            : "text-[#94A3B8]"
                        }`}
                      >
                        {
                          date.monthName
                        }
                      </Text>

                    </Pressable>
                  );
                }
              )}

            </ScrollView>

          )}

        </View>


        {/* ==================================
            TIME
        ================================== */}

        {selectedDate ? (

          <View className="mt-7">

            <Text
              className="text-lg font-bold text-[#0F172A]"
              style={
                textDirection
              }
            >
              {t(
                "booking.selectTime"
              )}
            </Text>


            {timeSlots.length ===
            0 ? (

              <View className="mt-3 items-center rounded-2xl border border-[#E2E8F0] bg-white p-5">

                <Ionicons
                  name="time-outline"
                  size={28}
                  color="#94A3B8"
                />


                <Text className="mt-2 text-sm text-[#64748B]">
                  {t(
                    "booking.noAvailableTimes"
                  )}
                </Text>

              </View>

            ) : (

              <View
                className="mt-3"
                style={{
                  flexDirection:
                    isArabic
                      ? "row-reverse"
                      : "row",

                  flexWrap:
                    "wrap",
                }}
              >

                {timeSlots.map(
                  (time) => {
                    const booked =
                      bookedTimes.includes(
                        time
                      );


                    const selected =
                      !booked &&
                      selectedTime ===
                        time;


                    return (
                      <Pressable
                        key={
                          time
                        }
                        disabled={
                          booked ||
                          isLoadingBookedTimes
                        }
                        onPress={() => {
                          setSelectedTime(
                            time
                          );

                          setSubmitError(
                            null
                          );
                        }}
                        className={`mb-3 min-w-[72px] items-center rounded-xl border px-4 py-3 ${
                          booked
                            ? "border-[#E2E8F0] bg-[#F1F5F9]"
                            : selected
                              ? "border-[#2563EB] bg-[#2563EB]"
                              : "border-[#E2E8F0] bg-white"
                        } ${
                          isLoadingBookedTimes
                            ? "opacity-60"
                            : ""
                        }`}
                        style={{
                          marginEnd:
                            12,
                        }}
                      >

                        <Text
                          className={`font-semibold ${
                            booked
                              ? "text-[#94A3B8]"
                              : selected
                                ? "text-white"
                                : "text-[#475569]"
                          }`}
                          style={{
                            writingDirection:
                              "ltr",
                          }}
                        >
                          {time}
                        </Text>


                        {booked ? (
                          <Text className="mt-1 text-[10px] font-semibold text-[#EF4444]">
                            {
                              isArabic
                                ? "محجوز"
                                : "Booked"
                            }
                          </Text>
                        ) : null}

                      </Pressable>
                    );
                  }
                )}

              </View>

            )}

          </View>

        ) : null}


        {/* ==================================
            ADDRESS
        ================================== */}

        <View className="mt-7">

          <Text
            className="text-lg font-bold text-[#0F172A]"
            style={
              textDirection
            }
          >
            {t(
              "booking.serviceAddress"
            )}
          </Text>


          <View
            className="mt-3 rounded-2xl border border-[#E2E8F0] bg-white px-4"
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
              name="location-outline"
              size={21}
              color="#64748B"
            />


            <TextInput
              value={
                address
              }
              onChangeText={
                setAddress
              }
              placeholder={t(
                "booking.addressPlaceholder"
              )}
              placeholderTextColor="#94A3B8"
              className="flex-1 py-4 text-[#0F172A]"
              style={{
                marginStart:
                  12,

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

          </View>

        </View>


        {/* ==================================
            NOTES
        ================================== */}

        <View className="mt-7">

          <Text
            className="text-lg font-bold text-[#0F172A]"
            style={
              textDirection
            }
          >
            {t(
              "booking.notes"
            )}
          </Text>


          <TextInput
            value={
              notes
            }
            onChangeText={
              setNotes
            }
            placeholder={t(
              "booking.notesPlaceholder"
            )}
            placeholderTextColor="#94A3B8"
            multiline
            textAlignVertical="top"
            className="mt-3 min-h-[120px] rounded-2xl border border-[#E2E8F0] bg-white p-4 text-[#0F172A]"
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

        </View>


        {/* ==================================
            SUMMARY
        ================================== */}

        {selectedService ? (

          <View className="mt-7 rounded-2xl bg-white p-5">

            <Text
              className="text-lg font-bold text-[#0F172A]"
              style={
                textDirection
              }
            >
              {t(
                "booking.summary"
              )}
            </Text>


            {/* SERVICE */}

            <View
              className="mt-4"
              style={{
                flexDirection:
                  isArabic
                    ? "row-reverse"
                    : "row",

                justifyContent:
                  "space-between",

                alignItems:
                  "center",
              }}
            >

              <Text className="text-[#64748B]">
                {t(
                  "booking.service"
                )}
              </Text>


              <Text
                className="max-w-[65%] font-semibold text-[#0F172A]"
                style={{
                  textAlign:
                    isArabic
                      ? "left"
                      : "right",
                }}
              >
                {
                  getServiceName(
                    selectedService
                  )
                }
              </Text>

            </View>


            {/* DATE */}

            {selectedDate ? (

              <View
                className="mt-3"
                style={{
                  flexDirection:
                    isArabic
                      ? "row-reverse"
                      : "row",

                  justifyContent:
                    "space-between",

                  alignItems:
                    "center",
                }}
              >

                <Text className="text-[#64748B]">
                  {t(
                    "booking.date"
                  )}
                </Text>


                <Text className="max-w-[65%] font-semibold text-[#0F172A]">
                  {
                    formattedSelectedDate
                  }
                </Text>

              </View>

            ) : null}


            {/* TIME */}

            {selectedTime ? (

              <View
                className="mt-3"
                style={{
                  flexDirection:
                    isArabic
                      ? "row-reverse"
                      : "row",

                  justifyContent:
                    "space-between",
                }}
              >

                <Text className="text-[#64748B]">
                  {t(
                    "booking.time"
                  )}
                </Text>


                <Text
                  className="font-semibold text-[#0F172A]"
                  style={{
                    writingDirection:
                      "ltr",
                  }}
                >
                  {
                    selectedTime
                  }
                </Text>

              </View>

            ) : null}


            <View className="my-4 h-[1px] bg-[#E2E8F0]" />


            {/* TOTAL */}

            <View
              style={{
                flexDirection:
                  isArabic
                    ? "row-reverse"
                    : "row",

                justifyContent:
                  "space-between",

                alignItems:
                  "center",
              }}
            >

              <Text className="font-bold text-[#0F172A]">
                {t(
                  "booking.total"
                )}
              </Text>


              <Text
                className="text-xl font-bold text-[#2563EB]"
                style={{
                  writingDirection:
                    "ltr",
                }}
              >
                {price} ₪
              </Text>

            </View>

          </View>

        ) : null}


        {/* ==================================
            SUBMIT ERROR
        ================================== */}

        {submitError ? (

          <View className="mt-5 rounded-xl bg-red-50 p-4">

            <Text
              className="text-sm font-semibold text-red-600"
              style={{
                textAlign:
                  "center",
              }}
            >
              {
                submitError
              }
            </Text>

          </View>

        ) : null}


        {/* ==================================
            CONFIRM
        ================================== */}

        <Pressable
          disabled={
            !canContinue ||
            isSubmitting
          }
          onPress={
            handleConfirmBooking
          }
          className={`mt-8 items-center rounded-2xl py-4 ${
            canContinue &&
            !isSubmitting
              ? "bg-[#2563EB]"
              : "bg-[#CBD5E1]"
          }`}
        >

          {isSubmitting ? (

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
                color="white"
              />


              <Text className="font-bold text-white">
                {t(
                  "booking.submitting"
                )}
              </Text>

            </View>

          ) : (

            <Text className="text-base font-bold text-white">
              {t(
                "booking.confirmBooking"
              )}
            </Text>

          )}

        </Pressable>

      </ScrollView>

    </SafeAreaView>
  );
}
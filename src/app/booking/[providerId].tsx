import { useProviderDetailsStore } from "@/store/provider-details-store";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "@clerk/expo";
import {
  router,
  useLocalSearchParams,
} from "expo-router";
import React, {
  useEffect,
  useMemo,
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
import { SafeAreaView } from "react-native-safe-area-context";

export default function BookingScreen() {
  const { user } = useUser();
  const params = useLocalSearchParams<{
    providerId: string | string[];
  }>();

  const providerId = Array.isArray(
    params.providerId
  )
    ? params.providerId[0]
    : params.providerId;

  const provider = useProviderDetailsStore(
    (state) => state.provider
  );

  const services = useProviderDetailsStore(
    (state) => state.services
  );

  const availability = useProviderDetailsStore(
    (state) => state.availability
  );

  const isLoading = useProviderDetailsStore(
    (state) => state.isLoading
  );

  const error = useProviderDetailsStore(
    (state) => state.error
  );

  const loadProvider = useProviderDetailsStore(
    (state) => state.loadProvider
  );

  const clearProvider = useProviderDetailsStore(
    (state) => state.clearProvider
  );

  const [selectedServiceId, setSelectedServiceId] =
    useState<string | null>(null);

  const [selectedDate, setSelectedDate] =
    useState<string | null>(null);

  const [selectedTime, setSelectedTime] =
    useState<string | null>(null);

  const [address, setAddress] =
    useState("");

  const [notes, setNotes] =
    useState("");

    const [
  isSubmitting,
  setIsSubmitting,
] = useState(false);

const [
  submitError,
  setSubmitError,
] = useState<string | null>(
  null
);

  useEffect(() => {
    if (!providerId) {
      return;
    }

    loadProvider(providerId);

    return () => {
      clearProvider();
    };
  }, [
    providerId,
    loadProvider,
    clearProvider,
  ]);

  // ===============================
  // Dates
  // ===============================

  const dates = useMemo(() => {
    const result = [];

    // نعرض 14 يوم قادم
    for (let i = 0; i < 14; i++) {
      const date = new Date();

      date.setHours(12, 0, 0, 0);
      date.setDate(date.getDate() + i);

      const dayOfWeek = date.getDay();

      const dayAvailability =
        availability.find(
          (item) =>
            item.dayOfWeek === dayOfWeek &&
            item.isAvailable
        );

      // لا نعرض الأيام المغلقة
      if (!dayAvailability) {
        continue;
      }

      const year = date.getFullYear();

      const month = String(
        date.getMonth() + 1
      ).padStart(2, "0");

      const day = String(
        date.getDate()
      ).padStart(2, "0");

      result.push({
        value: `${year}-${month}-${day}`,
        dayOfWeek,
        dayName: date.toLocaleDateString(
          "en-US",
          {
            weekday: "short",
          }
        ),
        dayNumber: date.getDate(),
        monthName: date.toLocaleDateString(
          "en-US",
          {
            month: "short",
          }
        ),
      });
    }

    return result;
  }, [availability]);

  // ===============================
  // Selected Date Availability
  // ===============================

  const selectedAvailability =
    useMemo(() => {
      if (!selectedDate) {
        return null;
      }

      const [year, month, day] =
        selectedDate
          .split("-")
          .map(Number);

      const date = new Date(
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

  // ===============================
  // Time Slots
  // ===============================

  const timeSlots = useMemo(() => {
    if (
      !selectedAvailability?.startTime ||
      !selectedAvailability?.endTime
    ) {
      return [];
    }

    const parseTime = (time: string) => {
      const [hours, minutes] = time
        .split(":")
        .map(Number);

      return hours * 60 + minutes;
    };

    const formatTime = (
      totalMinutes: number
    ) => {
      const hours = Math.floor(
        totalMinutes / 60
      );

      const minutes =
        totalMinutes % 60;

      return `${String(hours).padStart(
        2,
        "0"
      )}:${String(minutes).padStart(
        2,
        "0"
      )}`;
    };

    const start = parseTime(
      selectedAvailability.startTime
    );

    const end = parseTime(
      selectedAvailability.endTime
    );

    const slots: string[] = [];

    // حاليًا كل موعد ساعة واحدة
    for (
      let current = start;
      current < end;
      current += 60
    ) {
      slots.push(
        formatTime(current)
      );
    }

    return slots;
  }, [selectedAvailability]);

  // ===============================
  // Selected Service
  // ===============================

  const selectedService =
    services.find(
      (item) =>
        item.service.id ===
        selectedServiceId
    ) ?? null;

  const price =
    selectedService
      ? selectedService.priceAgorot /
        100
      : 0;

  const canContinue =
    selectedServiceId &&
    selectedDate &&
    selectedTime &&
    address.trim().length > 3;

   //booking submission handler
   const handleConfirmBooking =
  async () => {
    if (
      !user?.id ||
      !providerId ||
      !selectedServiceId ||
      !selectedDate ||
      !selectedTime ||
      !selectedService
    ) {
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const response =
        await fetch(
          "/api/bookings",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              customerId:
                user.id,

              providerId,

              serviceId:
                selectedServiceId,

              bookingDate:
                selectedDate,

              startTime:
                selectedTime,

              address,

              notes,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to create booking"
        );
      }

      console.log(
        "BOOKING CREATED:",
        data.booking
      );

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

      setSubmitError(
        error instanceof Error
          ? error.message
          : "Failed to create booking"
      );
    } finally {
      setIsSubmitting(false);
    }
  }; 

  // ===============================
  // Loading
  // ===============================

  if (isLoading && !provider) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#F8FAFC]">
        <ActivityIndicator
          size="large"
          color="#2563EB"
        />

        <Text className="mt-3 text-[#64748B]">
          Loading booking...
        </Text>
      </SafeAreaView>
    );
  }

  // ===============================
  // Error
  // ===============================

  if (error && !provider) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#F8FAFC] px-5">
        <Ionicons
          name="alert-circle-outline"
          size={50}
          color="#EF4444"
        />

        <Text className="mt-4 text-lg font-bold text-[#0F172A]">
          Couldn't load booking
        </Text>

        <Pressable
          onPress={() =>
            router.back()
          }
          className="mt-5 rounded-xl bg-[#2563EB] px-6 py-3"
        >
          <Text className="font-bold text-white">
            Go Back
          </Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1 bg-[#F8FAFC]"
      edges={["top"]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 50,
        }}
      >
        {/* Header */}
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

          <Text className="ml-4 text-xl font-bold text-[#0F172A]">
            Book Service
          </Text>
        </View>

        {/* Provider */}
        <View className="mt-6 flex-row items-center rounded-2xl bg-white p-4">
          <View className="h-14 w-14 items-center justify-center rounded-full bg-[#EFF6FF]">
            <Ionicons
              name="person"
              size={27}
              color="#2563EB"
            />
          </View>

          <View className="ml-4 flex-1">
            <View className="flex-row items-center">
              <Text className="text-base font-bold text-[#0F172A]">
                {provider?.fullName}
              </Text>

              {provider?.isVerified ? (
                <Ionicons
                  name="checkmark-circle"
                  size={17}
                  color="#2563EB"
                  style={{
                    marginLeft: 5,
                  }}
                />
              ) : null}
            </View>

            <Text className="mt-1 text-sm text-[#64748B]">
              {provider?.city}
            </Text>
          </View>
        </View>

        {/* Service */}
        <View className="mt-7">
          <Text className="text-lg font-bold text-[#0F172A]">
            Choose Service
          </Text>

          {services.map((item) => {
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
                }}
                className={`mt-3 flex-row items-center rounded-2xl border p-4 ${
                  selected
                    ? "border-[#2563EB] bg-[#EFF6FF]"
                    : "border-[#E2E8F0] bg-white"
                }`}
              >
                <View className="h-11 w-11 items-center justify-center rounded-xl bg-white">
                  <Ionicons
                    name={
                      (item.service.icon ||
                        "construct-outline") as keyof typeof Ionicons.glyphMap
                    }
                    size={21}
                    color="#2563EB"
                  />
                </View>

                <View className="ml-3 flex-1">
                  <Text className="font-bold text-[#0F172A]">
                    {
                      item.service
                        .name
                    }
                  </Text>

                  <Text className="mt-1 text-sm text-[#64748B]">
                    {item.priceAgorot /
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
                />
              </Pressable>
            );
          })}
        </View>

        {/* Date */}
        <View className="mt-7">
          <Text className="text-lg font-bold text-[#0F172A]">
            Choose Date
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={
              false
            }
            className="mt-3"
          >
            {dates.map((date) => {
              const selected =
                selectedDate ===
                date.value;

              return (
                <Pressable
                  key={date.value}
                  onPress={() => {
                    setSelectedDate(
                      date.value
                    );

                    // إذا غير اليوم نمسح الوقت
                    setSelectedTime(
                      null
                    );
                  }}
                  className={`mr-3 min-w-[76px] items-center rounded-2xl border px-4 py-3 ${
                    selected
                      ? "border-[#2563EB] bg-[#2563EB]"
                      : "border-[#E2E8F0] bg-white"
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      selected
                        ? "text-white/80"
                        : "text-[#64748B]"
                    }`}
                  >
                    {date.dayName}
                  </Text>

                  <Text
                    className={`mt-1 text-xl font-bold ${
                      selected
                        ? "text-white"
                        : "text-[#0F172A]"
                    }`}
                  >
                    {date.dayNumber}
                  </Text>

                  <Text
                    className={`mt-1 text-xs ${
                      selected
                        ? "text-white/80"
                        : "text-[#94A3B8]"
                    }`}
                  >
                    {date.monthName}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Time */}
        {selectedDate ? (
          <View className="mt-7">
            <Text className="text-lg font-bold text-[#0F172A]">
              Choose Time
            </Text>

            <View className="mt-3 flex-row flex-wrap">
              {timeSlots.map(
                (time) => {
                  const selected =
                    selectedTime ===
                    time;

                  return (
                    <Pressable
                      key={time}
                      onPress={() =>
                        setSelectedTime(
                          time
                        )
                      }
                      className={`mb-3 mr-3 rounded-xl border px-4 py-3 ${
                        selected
                          ? "border-[#2563EB] bg-[#2563EB]"
                          : "border-[#E2E8F0] bg-white"
                      }`}
                    >
                      <Text
                        className={`font-semibold ${
                          selected
                            ? "text-white"
                            : "text-[#475569]"
                        }`}
                      >
                        {time}
                      </Text>
                    </Pressable>
                  );
                }
              )}
            </View>
          </View>
        ) : null}

        {/* Address */}
        <View className="mt-7">
          <Text className="text-lg font-bold text-[#0F172A]">
            Service Address
          </Text>

          <View className="mt-3 flex-row items-center rounded-2xl border border-[#E2E8F0] bg-white px-4">
            <Ionicons
              name="location-outline"
              size={21}
              color="#64748B"
            />

            <TextInput
              value={address}
              onChangeText={
                setAddress
              }
              placeholder="Enter your address"
              placeholderTextColor="#94A3B8"
              className="ml-3 flex-1 py-4 text-[#0F172A]"
            />
          </View>
        </View>

        {/* Notes */}
        <View className="mt-7">
          <Text className="text-lg font-bold text-[#0F172A]">
            Notes
          </Text>

          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Describe the problem or add any notes..."
            placeholderTextColor="#94A3B8"
            multiline
            textAlignVertical="top"
            className="mt-3 min-h-[120px] rounded-2xl border border-[#E2E8F0] bg-white p-4 text-[#0F172A]"
          />
        </View>

        {/* Summary */}
        {selectedService ? (
          <View className="mt-7 rounded-2xl bg-white p-5">
            <Text className="text-lg font-bold text-[#0F172A]">
              Booking Summary
            </Text>

            <View className="mt-4 flex-row justify-between">
              <Text className="text-[#64748B]">
                Service
              </Text>

              <Text className="font-semibold text-[#0F172A]">
                {
                  selectedService
                    .service.name
                }
              </Text>
            </View>

            {selectedDate ? (
              <View className="mt-3 flex-row justify-between">
                <Text className="text-[#64748B]">
                  Date
                </Text>

                <Text className="font-semibold text-[#0F172A]">
                  {selectedDate}
                </Text>
              </View>
            ) : null}

            {selectedTime ? (
              <View className="mt-3 flex-row justify-between">
                <Text className="text-[#64748B]">
                  Time
                </Text>

                <Text className="font-semibold text-[#0F172A]">
                  {selectedTime}
                </Text>
              </View>
            ) : null}

            <View className="mx-0 my-4 h-[1px] bg-[#E2E8F0]" />

            <View className="flex-row justify-between">
              <Text className="font-bold text-[#0F172A]">
                Total
              </Text>

              <Text className="text-xl font-bold text-[#2563EB]">
                {price} ₪
              </Text>
            </View>
          </View>
        ) : null}

        {/* Confirm */}
        {submitError ? (
          <View className="mt-5 rounded-xl bg-red-50 p-4">
            <Text className="text-center text-sm font-semibold text-red-600">
              {submitError}
            </Text>
          </View>
        ) : null}
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
                <ActivityIndicator
                  size="small"
                  color="white"
                />
              ) : (
                <Text className="text-base font-bold text-white">
                  Confirm Booking
                </Text>
              )}
            </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
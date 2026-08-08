import {
  useAuth,
  useUser,
} from "@clerk/expo";

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import React, {
  useCallback,
  useEffect,
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

import { SafeAreaView } from "react-native-safe-area-context";


// ========================================
// TYPES
// ========================================

type ProviderApplication = {
  id: string;
  clerkUserId: string | null;

  fullName: string;
  phone: string | null;
  email: string | null;
  city: string | null;
  bio: string | null;

  experienceYears: number;

  approvalStatus:
    | "draft"
    | "pending"
    | "approved"
    | "rejected";

  rejectionReason:
    | string
    | null;
};


type AvailableService = {
  serviceId: string;
  serviceName: string;

  serviceIcon:
    string | null;

  serviceDescription:
    string | null;

  categoryId: string;
  categoryName: string;
};


type SelectedServiceMap = {
  [serviceId: string]: {
    selected: boolean;
    price: string;
  };
};


type WorkingDay = {
  dayOfWeek: number;
  name: string;

  isAvailable: boolean;

  startTime: string;
  endTime: string;
};


// ========================================
// WEEK DAYS
// 0 = Sunday
// 6 = Saturday
// ========================================

const WEEK_DAYS = [
  {
    dayOfWeek: 0,
    name: "Sunday",
  },
  {
    dayOfWeek: 1,
    name: "Monday",
  },
  {
    dayOfWeek: 2,
    name: "Tuesday",
  },
  {
    dayOfWeek: 3,
    name: "Wednesday",
  },
  {
    dayOfWeek: 4,
    name: "Thursday",
  },
  {
    dayOfWeek: 5,
    name: "Friday",
  },
  {
    dayOfWeek: 6,
    name: "Saturday",
  },
];


const createDefaultSchedule =
  (): WorkingDay[] => {
    return WEEK_DAYS.map(
      (day) => ({
        ...day,

        isAvailable:
          false,

        startTime:
          "09:00",

        endTime:
          "17:00",
      })
    );
  };


// ========================================
// SCREEN
// ========================================

export default function BecomeProviderScreen() {
  const { user } =
    useUser();

  const {
    getToken,
    isLoaded,
  } = useAuth();

  const loadedForUser =
    useRef<string | null>(
      null
    );

    // ====================================
    // states
    // ====================================
    const [
  isSubmitting,
  setIsSubmitting,
] = useState(false);


  // ========================================
  // PERSONAL INFORMATION
  // ========================================

  const [
    fullName,
    setFullName,
  ] = useState("");

  const [
    phone,
    setPhone,
  ] = useState("");

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    city,
    setCity,
  ] = useState("");

  const [
    experienceYears,
    setExperienceYears,
  ] = useState("");

  const [
    bio,
    setBio,
  ] = useState("");


  // ========================================
  // APPLICATION
  // ========================================

  const [
    application,
    setApplication,
  ] =
    useState<ProviderApplication | null>(
      null
    );

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    isSaving,
    setIsSaving,
  ] = useState(false);

  const [
    personalSaved,
    setPersonalSaved,
  ] = useState(false);


  // ========================================
  // SERVICES
  // ========================================

  const [
    availableServices,
    setAvailableServices,
  ] = useState<
    AvailableService[]
  >([]);

  const [
    selectedServices,
    setSelectedServices,
  ] =
    useState<SelectedServiceMap>(
      {}
    );

  const [
    servicesLoaded,
    setServicesLoaded,
  ] = useState(false);

  const [
    servicesSaving,
    setServicesSaving,
  ] = useState(false);

  const [
    servicesSaved,
    setServicesSaved,
  ] = useState(false);


  // ========================================
  // WORKING HOURS
  // ========================================

  const [
    workingHours,
    setWorkingHours,
  ] = useState<
    WorkingDay[]
  >(
    () =>
      createDefaultSchedule()
  );

  const [
    availabilityLoaded,
    setAvailabilityLoaded,
  ] = useState(false);

  const [
    availabilitySaving,
    setAvailabilitySaving,
  ] = useState(false);

  const [
    availabilitySaved,
    setAvailabilitySaved,
  ] = useState(false);


  // ========================================
  // ERROR
  // ========================================

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);


  // ========================================
  // LOAD SERVICES
  // ========================================

  const loadServices =
    useCallback(
      async () => {
        try {
          const token =
            await getToken();

          if (!token) {
            throw new Error(
              "Authentication required"
            );
          }

          const response =
            await fetch(
              "/api/provider-application/services",
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
                "Failed to load services"
            );
          }

          const servicesData =
            Array.isArray(
              data.availableServices
            )
              ? data.availableServices
              : [];

          const selectedData =
            Array.isArray(
              data.selectedServices
            )
              ? data.selectedServices
              : [];

          setAvailableServices(
            servicesData
          );

          const initial:
            SelectedServiceMap = {};

          for (
            const service of
            servicesData
          ) {
            initial[
              service.serviceId
            ] = {
              selected:
                false,

              price:
                "",
            };
          }

          for (
            const service of
            selectedData
          ) {
            initial[
              service.serviceId
            ] = {
              selected:
                true,

              price:
                String(
                  service.priceAgorot /
                    100
                ),
            };
          }

          setSelectedServices(
            initial
          );

          setServicesLoaded(
            true
          );

          // إذا عنده خدمات محفوظة من قبل
          setServicesSaved(
            selectedData.length >
              0
          );

        } catch (error) {
          console.error(
            "LOAD SERVICES ERROR:",
            error
          );

          setError(
            error instanceof Error
              ? error.message
              : "Failed to load services"
          );
        }
      },
      [getToken]
    );


  // ========================================
  // LOAD WORKING HOURS
  // ========================================

  const loadAvailability =
    useCallback(
      async () => {
        try {
          const token =
            await getToken();

          if (!token) {
            throw new Error(
              "Authentication required"
            );
          }

          const response =
            await fetch(
              "/api/provider-application/availability",
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
                "Failed to load working hours"
            );
          }

          const rows =
            Array.isArray(
              data.availability
            )
              ? data.availability
              : [];

          const schedule =
            WEEK_DAYS.map(
              (day) => {
                const existing =
                  rows.find(
                    (
                      row: any
                    ) =>
                      Number(
                        row.dayOfWeek
                      ) ===
                      day.dayOfWeek
                  );

                return {
                  ...day,

                  isAvailable:
                    existing
                      ? Boolean(
                          existing.isAvailable
                        )
                      : false,

                  startTime:
                    existing
                      ?.startTime
                      ? String(
                          existing.startTime
                        ).slice(
                          0,
                          5
                        )
                      : "09:00",

                  endTime:
                    existing
                      ?.endTime
                      ? String(
                          existing.endTime
                        ).slice(
                          0,
                          5
                        )
                      : "17:00",
                };
              }
            );

          setWorkingHours(
            schedule
          );

          setAvailabilityLoaded(
            true
          );

          setAvailabilitySaved(
            rows.length > 0
          );

        } catch (error) {
          console.error(
            "LOAD AVAILABILITY ERROR:",
            error
          );

          setError(
            error instanceof Error
              ? error.message
              : "Failed to load working hours"
          );
        }
      },
      [getToken]
    );


  // ========================================
  // LOAD APPLICATION
  // ========================================

  useEffect(() => {
    if (
      !isLoaded ||
      !user?.id
    ) {
      return;
    }

    // Prevent reload while typing
    if (
      loadedForUser.current ===
      user.id
    ) {
      return;
    }

    loadedForUser.current =
      user.id;

    const loadApplication =
      async () => {
        try {
          setIsLoading(
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
              "/api/provider-application",
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

          const existing =
            data.application as
              | ProviderApplication
              | null;

          setApplication(
            existing
          );


          // ==================================
          // EXISTING APPLICATION
          // ==================================

          if (existing) {
            setFullName(
              existing.fullName ||
                ""
            );

            setPhone(
              existing.phone ||
                ""
            );

            setEmail(
              existing.email ||
                ""
            );

            setCity(
              existing.city ||
                ""
            );

            setBio(
              existing.bio ||
                ""
            );

            setExperienceYears(
              String(
                existing.experienceYears ??
                  0
              )
            );


            if (
              existing.approvalStatus ===
                "draft" ||
              existing.approvalStatus ===
                "rejected"
            ) {
              await loadServices();

              await loadAvailability();
            }

            return;
          }


          // ==================================
          // NEW APPLICATION
          // ==================================

          setFullName(
            user.fullName ||
              ""
          );

          setEmail(
            user
              .primaryEmailAddress
              ?.emailAddress ||
              ""
          );

        } catch (error) {
          console.error(
            "LOAD PROVIDER APPLICATION ERROR:",
            error
          );

          setError(
            error instanceof Error
              ? error.message
              : "Failed to load application"
          );

          loadedForUser.current =
            null;

        } finally {
          setIsLoading(
            false
          );
        }
      };

    loadApplication();

  }, [
    isLoaded,
    user?.id,
    getToken,
    loadServices,
    loadAvailability,
  ]);


  // ========================================
  // SAVE PERSONAL INFO
  // ========================================

  const handleSavePersonalInfo =
    async () => {
      if (!fullName.trim()) {
        setError(
          "Full name is required."
        );

        return;
      }

      if (!phone.trim()) {
        setError(
          "Phone number is required."
        );

        return;
      }

      if (!city.trim()) {
        setError(
          "City is required."
        );

        return;
      }

      const years =
        Number(
          experienceYears ||
            0
        );

      if (
        !Number.isInteger(
          years
        ) ||
        years < 0 ||
        years > 60
      ) {
        setError(
          "Please enter valid years of experience."
        );

        return;
      }

      try {
        setIsSaving(
          true
        );

        setPersonalSaved(
          false
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
            "/api/provider-application",
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
                  fullName,
                  phone,
                  email,
                  city,
                  bio,

                  experienceYears:
                    years,
                }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Failed to save application"
          );
        }

        setApplication(
          data.application
        );

        setPersonalSaved(
          true
        );

        console.log(
          "PROVIDER DRAFT SAVED:",
          data.application
        );

        // Provider now exists
        await loadServices();

      } catch (error) {
        console.error(
          "SAVE PROVIDER APPLICATION ERROR:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Failed to save application"
        );

      } finally {
        setIsSaving(
          false
        );
      }
    };


  // ========================================
  // TOGGLE SERVICE
  // ========================================

  const toggleService = (
    serviceId: string
  ) => {
    setServicesSaved(
      false
    );

    setSelectedServices(
      (current) => ({
        ...current,

        [serviceId]: {
          selected:
            !current[
              serviceId
            ]?.selected,

          price:
            current[
              serviceId
            ]?.price ||
            "",
        },
      })
    );
  };


  // ========================================
  // CHANGE PRICE
  // ========================================

  const changeServicePrice = (
    serviceId: string,
    value: string
  ) => {
    const cleaned =
      value
        .replace(
          /[^0-9.]/g,
          ""
        )
        .replace(
          /(\..*)\./g,
          "$1"
        );

    setServicesSaved(
      false
    );

    setSelectedServices(
      (current) => ({
        ...current,

        [serviceId]: {
          selected:
            true,

          price:
            cleaned,
        },
      })
    );
  };


  // ========================================
  // SAVE SERVICES
  // ========================================

  const handleSaveServices =
    async () => {
      try {
        setError(
          null
        );

        setServicesSaved(
          false
        );

        const selections =
          availableServices
            .filter(
              (service) =>
                selectedServices[
                  service.serviceId
                ]?.selected
            )
            .map(
              (service) => {
                const price =
                  Number(
                    selectedServices[
                      service.serviceId
                    ]?.price
                  );

                return {
                  serviceId:
                    service.serviceId,

                  priceAgorot:
                    Math.round(
                      price *
                        100
                    ),
                };
              }
            );


        if (
          selections.length ===
          0
        ) {
          throw new Error(
            "Select at least one service."
          );
        }


        const invalid =
          selections.some(
            (item) =>
              !Number.isInteger(
                item.priceAgorot
              ) ||
              item.priceAgorot <=
                0
          );


        if (invalid) {
          throw new Error(
            "Enter a valid price for every selected service."
          );
        }


        setServicesSaving(
          true
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
            "/api/provider-application/services",
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
                  services:
                    selections,
                }),
            }
          );


        const data =
          await response.json();


        if (!response.ok) {
          throw new Error(
            data.error ||
              "Failed to save services"
          );
        }


        setServicesSaved(
          true
        );


        console.log(
          "PROVIDER SERVICES SAVED:",
          data
        );


        // Load Step 3
        await loadAvailability();

      } catch (error) {
        console.error(
          "SAVE PROVIDER SERVICES ERROR:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Failed to save services"
        );

      } finally {
        setServicesSaving(
          false
        );
      }
    };


  // ========================================
  // TOGGLE WORKING DAY
  // ========================================

  const toggleWorkingDay = (
    dayOfWeek: number
  ) => {
    setAvailabilitySaved(
      false
    );

    setWorkingHours(
      (current) =>
        current.map(
          (day) =>
            day.dayOfWeek ===
            dayOfWeek
              ? {
                  ...day,

                  isAvailable:
                    !day.isAvailable,
                }
              : day
        )
    );
  };


  // ========================================
  // CHANGE WORKING TIME
  // ========================================

  const changeWorkingTime = (
    dayOfWeek: number,

    field:
      | "startTime"
      | "endTime",

    value: string
  ) => {
    const cleaned =
      value
        .replace(
          /[^0-9:]/g,
          ""
        )
        .slice(
          0,
          5
        );

    setAvailabilitySaved(
      false
    );

    setWorkingHours(
      (current) =>
        current.map(
          (day) =>
            day.dayOfWeek ===
            dayOfWeek
              ? {
                  ...day,

                  [field]:
                    cleaned,
                }
              : day
        )
    );
  };


  // ========================================
  // SAVE WORKING HOURS
  // ========================================

  const handleSaveAvailability =
    async () => {
      try {
        setError(
          null
        );

        setAvailabilitySaved(
          false
        );


        const availableDays =
          workingHours.filter(
            (day) =>
              day.isAvailable
          );


        if (
          availableDays.length ===
          0
        ) {
          throw new Error(
            "Select at least one working day."
          );
        }


        const timeRegex =
          /^([01]\d|2[0-3]):([0-5]\d)$/;


        for (
          const day of
          availableDays
        ) {
          if (
            !timeRegex.test(
              day.startTime
            ) ||
            !timeRegex.test(
              day.endTime
            )
          ) {
            throw new Error(
              `Enter a valid time for ${day.name}. Example: 09:00`
            );
          }


          if (
            day.startTime >=
            day.endTime
          ) {
            throw new Error(
              `End time must be after start time for ${day.name}.`
            );
          }
        }


        setAvailabilitySaving(
          true
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
            "/api/provider-application/availability",
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
                  schedule:
                    workingHours.map(
                      (day) => ({
                        dayOfWeek:
                          day.dayOfWeek,

                        isAvailable:
                          day.isAvailable,

                        startTime:
                          day.isAvailable
                            ? day.startTime
                            : null,

                        endTime:
                          day.isAvailable
                            ? day.endTime
                            : null,
                      })
                    ),
                }),
            }
          );


        const data =
          await response.json();


        if (!response.ok) {
          throw new Error(
            data.error ||
              "Failed to save working hours"
          );
        }


        setAvailabilitySaved(
          true
        );


        console.log(
          "PROVIDER AVAILABILITY SAVED:",
          data
        );

      } catch (error) {
        console.error(
          "SAVE PROVIDER AVAILABILITY ERROR:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Failed to save working hours"
        );

      } finally {
        setAvailabilitySaving(
          false
        );
      }
    };
   // ========================================
// SUBMIT APPLICATION
// ========================================

const handleSubmitApplication =
  async () => {
    try {
      setError(null);

      if (!servicesSaved) {
        throw new Error(
          "Save your services first."
        );
      }

      if (
        !availabilitySaved
      ) {
        throw new Error(
          "Save your working hours first."
        );
      }

      setIsSubmitting(
        true
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
          "/api/provider-application/submit",
          {
            method:
              "POST",

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
            "Failed to submit application"
        );
      }

      console.log(
        "PROVIDER APPLICATION SUBMITTED:",
        data.application
      );

      // مهم جدًا
      // هذا سيجعل الصفحة تعرض
      // Application Pending تلقائيًا
      setApplication(
        data.application
      );

    } catch (error) {
      console.error(
        "SUBMIT APPLICATION ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to submit application"
      );

    } finally {
      setIsSubmitting(
        false
      );
    }
  };

  // ========================================
  // CATEGORY NAMES
  // ========================================

  const categoryNames =
    Array.from(
      new Set(
        availableServices.map(
          (item) =>
            item.categoryName
        )
      )
    );


  // ========================================
  // LOADING
  // ========================================

  if (isLoading) {
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
  // PENDING
  // ========================================

  if (
    application
      ?.approvalStatus ===
    "pending"
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

        <View className="flex-1 items-center justify-center pb-20">
          <View className="h-24 w-24 items-center justify-center rounded-full bg-amber-50">
            <Ionicons
              name="time-outline"
              size={48}
              color="#D97706"
            />
          </View>

          <Text className="mt-6 text-2xl font-bold text-[#0F172A]">
            Application Pending
          </Text>

          <Text className="mt-3 max-w-[310px] text-center leading-6 text-[#64748B]">
            Your provider application is currently under review.
          </Text>
        </View>
      </SafeAreaView>
    );
  }


  // ========================================
  // APPROVED
  // ========================================

  if (
    application
      ?.approvalStatus ===
    "approved"
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

        <View className="flex-1 items-center justify-center pb-20">
          <View className="h-24 w-24 items-center justify-center rounded-full bg-green-50">
            <Ionicons
              name="checkmark-circle"
              size={55}
              color="#16A34A"
            />
          </View>

          <Text className="mt-6 text-2xl font-bold text-[#0F172A]">
            You're a Provider
          </Text>

          <Text className="mt-3 text-center leading-6 text-[#64748B]">
            Your provider account has been approved.
          </Text>
        </View>
      </SafeAreaView>
    );
  }


  // ========================================
  // FORM
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

          <View className="ml-4">
            <Text className="text-xl font-bold text-[#0F172A]">
              Become a Provider
            </Text>

            <Text className="mt-1 text-xs text-[#64748B]">
              Complete your provider profile
            </Text>
          </View>
        </View>


        {/* ==================================
            INTRO
        ================================== */}

        <View className="mt-6 rounded-2xl bg-[#EFF6FF] p-5">
          <Ionicons
            name="briefcase-outline"
            size={28}
            color="#2563EB"
          />

          <Text className="mt-3 text-lg font-bold text-[#0F172A]">
            Start offering services
          </Text>

          <Text className="mt-2 leading-6 text-[#64748B]">
            Complete your information, choose your services, set your prices and working hours.
          </Text>
        </View>


        {/* ==================================
            REJECTED
        ================================== */}

        {application
          ?.approvalStatus ===
        "rejected" ? (
          <View className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-4">
            <View className="flex-row items-center">
              <Ionicons
                name="alert-circle-outline"
                size={21}
                color="#DC2626"
              />

              <Text className="ml-2 font-bold text-red-700">
                Previous application rejected
              </Text>
            </View>

            {application.rejectionReason ? (
              <Text className="mt-2 leading-5 text-red-600">
                {
                  application.rejectionReason
                }
              </Text>
            ) : null}

            <Text className="mt-2 text-sm text-red-600">
              Update your information and apply again.
            </Text>
          </View>
        ) : null}


        {/* ==================================
            STEP 1
        ================================== */}

        <View className="mt-8 flex-row items-center">
          <View className="h-10 w-10 items-center justify-center rounded-xl bg-[#EFF6FF]">
            <Text className="font-bold text-[#2563EB]">
              1
            </Text>
          </View>

          <View className="ml-3">
            <Text className="text-lg font-bold text-[#0F172A]">
              Personal Information
            </Text>

            <Text className="mt-1 text-xs text-[#64748B]">
              Tell us about yourself
            </Text>
          </View>
        </View>


        <Text className="mt-6 font-bold text-[#0F172A]">
          Full Name *
        </Text>

        <TextInput
          value={fullName}
          onChangeText={
            setFullName
          }
          placeholder="Full name"
          placeholderTextColor="#94A3B8"
          className="mt-3 rounded-2xl border border-[#E2E8F0] bg-white px-4 py-4 text-[#0F172A]"
        />


        <Text className="mt-5 font-bold text-[#0F172A]">
          Phone Number *
        </Text>

        <TextInput
          value={phone}
          onChangeText={
            setPhone
          }
          keyboardType="phone-pad"
          placeholder="059..."
          placeholderTextColor="#94A3B8"
          className="mt-3 rounded-2xl border border-[#E2E8F0] bg-white px-4 py-4 text-[#0F172A]"
        />


        <Text className="mt-5 font-bold text-[#0F172A]">
          Email
        </Text>

        <TextInput
          value={email}
          onChangeText={
            setEmail
          }
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="Email"
          placeholderTextColor="#94A3B8"
          className="mt-3 rounded-2xl border border-[#E2E8F0] bg-white px-4 py-4 text-[#0F172A]"
        />


        <Text className="mt-5 font-bold text-[#0F172A]">
          City *
        </Text>

        <TextInput
          value={city}
          onChangeText={
            setCity
          }
          placeholder="Bethlehem"
          placeholderTextColor="#94A3B8"
          className="mt-3 rounded-2xl border border-[#E2E8F0] bg-white px-4 py-4 text-[#0F172A]"
        />


        <Text className="mt-5 font-bold text-[#0F172A]">
          Years of Experience
        </Text>

        <TextInput
          value={
            experienceYears
          }
          onChangeText={
            setExperienceYears
          }
          keyboardType="number-pad"
          placeholder="0"
          placeholderTextColor="#94A3B8"
          className="mt-3 rounded-2xl border border-[#E2E8F0] bg-white px-4 py-4 text-[#0F172A]"
        />


        <Text className="mt-5 font-bold text-[#0F172A]">
          About You
        </Text>

        <TextInput
          value={bio}
          onChangeText={
            setBio
          }
          multiline
          textAlignVertical="top"
          placeholder="Tell customers about your experience..."
          placeholderTextColor="#94A3B8"
          className="mt-3 min-h-[130px] rounded-2xl border border-[#E2E8F0] bg-white p-4 text-[#0F172A]"
        />


        {personalSaved ? (
          <View className="mt-5 flex-row items-center rounded-xl bg-green-50 p-4">
            <Ionicons
              name="checkmark-circle"
              size={20}
              color="#16A34A"
            />

            <Text className="ml-2 flex-1 font-semibold text-green-700">
              Personal information saved.
            </Text>
          </View>
        ) : null}


        <Pressable
          disabled={
            isSaving
          }
          onPress={
            handleSavePersonalInfo
          }
          className={`mt-6 items-center rounded-2xl py-4 ${
            isSaving
              ? "bg-[#94A3B8]"
              : "bg-[#2563EB]"
          }`}
        >
          {isSaving ? (
            <ActivityIndicator
              color="white"
            />
          ) : (
            <Text className="font-bold text-white">
              Save Information
            </Text>
          )}
        </Pressable>


        {/* ==================================
            STEP 2 SERVICES
        ================================== */}

        {servicesLoaded ? (
          <View className="mt-10">

            <View className="h-[1px] bg-[#E2E8F0]" />


            <View className="mt-8 flex-row items-center">
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-[#EFF6FF]">
                <Text className="font-bold text-[#2563EB]">
                  2
                </Text>
              </View>

              <View className="ml-3">
                <Text className="text-lg font-bold text-[#0F172A]">
                  Services & Prices
                </Text>

                <Text className="mt-1 text-xs text-[#64748B]">
                  Select the services you offer
                </Text>
              </View>
            </View>


            {availableServices.length ===
            0 ? (
              <View className="mt-5 items-center rounded-2xl bg-white p-6">
                <Ionicons
                  name="construct-outline"
                  size={32}
                  color="#94A3B8"
                />

                <Text className="mt-3 text-[#64748B]">
                  No services available.
                </Text>
              </View>
            ) : null}


            {categoryNames.map(
              (
                categoryName
              ) => (
                <View
                  key={
                    categoryName
                  }
                  className="mt-7"
                >
                  <Text className="text-base font-bold text-[#0F172A]">
                    {
                      categoryName
                    }
                  </Text>


                  {availableServices
                    .filter(
                      (item) =>
                        item.categoryName ===
                        categoryName
                    )
                    .map(
                      (item) => {
                        const serviceState =
                          selectedServices[
                            item.serviceId
                          ];

                        const isSelected =
                          Boolean(
                            serviceState
                              ?.selected
                          );

                        return (
                          <View
                            key={
                              item.serviceId
                            }
                            className={`mt-3 rounded-2xl border p-4 ${
                              isSelected
                                ? "border-[#2563EB] bg-[#EFF6FF]"
                                : "border-[#E2E8F0] bg-white"
                            }`}
                          >

                            <Pressable
                              onPress={() =>
                                toggleService(
                                  item.serviceId
                                )
                              }
                              className="flex-row items-center"
                            >

                              <View className="h-11 w-11 items-center justify-center rounded-xl bg-white">
                                <Ionicons
                                  name="construct-outline"
                                  size={21}
                                  color="#2563EB"
                                />
                              </View>


                              <View className="ml-3 flex-1">
                                <Text className="font-bold text-[#0F172A]">
                                  {
                                    item.serviceName
                                  }
                                </Text>

                                {item.serviceDescription ? (
                                  <Text
                                    numberOfLines={
                                      2
                                    }
                                    className="mt-1 text-xs leading-5 text-[#64748B]"
                                  >
                                    {
                                      item.serviceDescription
                                    }
                                  </Text>
                                ) : null}
                              </View>


                              <Ionicons
                                name={
                                  isSelected
                                    ? "checkbox"
                                    : "square-outline"
                                }
                                size={24}
                                color={
                                  isSelected
                                    ? "#2563EB"
                                    : "#94A3B8"
                                }
                              />

                            </Pressable>


                            {isSelected ? (
                              <View className="mt-4">

                                <Text className="mb-2 text-xs font-semibold text-[#64748B]">
                                  Starting Price
                                </Text>


                                <View className="flex-row items-center rounded-xl border border-[#BFDBFE] bg-white px-4">

                                  <TextInput
                                    value={
                                      serviceState
                                        ?.price ||
                                      ""
                                    }
                                    onChangeText={(
                                      value
                                    ) =>
                                      changeServicePrice(
                                        item.serviceId,
                                        value
                                      )
                                    }
                                    keyboardType="decimal-pad"
                                    placeholder="100"
                                    placeholderTextColor="#94A3B8"
                                    className="flex-1 py-3.5 text-[#0F172A]"
                                  />

                                  <Text className="font-bold text-[#2563EB]">
                                    ₪
                                  </Text>

                                </View>
                              </View>
                            ) : null}

                          </View>
                        );
                      }
                    )}
                </View>
              )
            )}


            {servicesSaved ? (
              <View className="mt-6 flex-row items-center rounded-xl bg-green-50 p-4">
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color="#16A34A"
                />

                <Text className="ml-2 flex-1 font-semibold text-green-700">
                  Services and prices saved.
                </Text>
              </View>
            ) : null}


            {availableServices.length >
            0 ? (
              <Pressable
                disabled={
                  servicesSaving
                }
                onPress={
                  handleSaveServices
                }
                className={`mt-7 items-center rounded-2xl py-4 ${
                  servicesSaving
                    ? "bg-[#94A3B8]"
                    : "bg-[#2563EB]"
                }`}
              >
                {servicesSaving ? (
                  <ActivityIndicator
                    color="white"
                  />
                ) : (
                  <Text className="font-bold text-white">
                    Save Services
                  </Text>
                )}
              </Pressable>
            ) : null}

          </View>
        ) : null}


        {/* ==================================
            STEP 3 WORKING HOURS
        ================================== */}

        {servicesSaved &&
        availabilityLoaded ? (
          <View className="mt-10">

            <View className="h-[1px] bg-[#E2E8F0]" />


            <View className="mt-8 flex-row items-center">

              <View className="h-10 w-10 items-center justify-center rounded-xl bg-[#EFF6FF]">
                <Text className="font-bold text-[#2563EB]">
                  3
                </Text>
              </View>


              <View className="ml-3 flex-1">
                <Text className="text-lg font-bold text-[#0F172A]">
                  Working Hours
                </Text>

                <Text className="mt-1 text-xs text-[#64748B]">
                  Choose the days and hours you're available
                </Text>
              </View>

            </View>


            <View className="mt-5 rounded-2xl bg-[#EFF6FF] p-4">

              <View className="flex-row items-center">
                <Ionicons
                  name="time-outline"
                  size={21}
                  color="#2563EB"
                />

                <Text className="ml-2 flex-1 text-sm leading-5 text-[#64748B]">
                  Use 24-hour format, for example 09:00 to 17:00.
                </Text>
              </View>

            </View>


            {workingHours.map(
              (day) => (
                <View
                  key={
                    day.dayOfWeek
                  }
                  className={`mt-3 rounded-2xl border p-4 ${
                    day.isAvailable
                      ? "border-[#2563EB] bg-[#EFF6FF]"
                      : "border-[#E2E8F0] bg-white"
                  }`}
                >

                  {/* DAY HEADER */}

                  <Pressable
                    onPress={() =>
                      toggleWorkingDay(
                        day.dayOfWeek
                      )
                    }
                    className="flex-row items-center"
                  >

                    <View
                      className={`h-11 w-11 items-center justify-center rounded-xl ${
                        day.isAvailable
                          ? "bg-white"
                          : "bg-[#F8FAFC]"
                      }`}
                    >
                      <Ionicons
                        name="calendar-outline"
                        size={21}
                        color={
                          day.isAvailable
                            ? "#2563EB"
                            : "#94A3B8"
                        }
                      />
                    </View>


                    <View className="ml-3 flex-1">

                      <Text className="font-bold text-[#0F172A]">
                        {day.name}
                      </Text>

                      <Text className="mt-1 text-xs text-[#64748B]">
                        {day.isAvailable
                          ? `${day.startTime} - ${day.endTime}`
                          : "Not available"}
                      </Text>

                    </View>


                    <Ionicons
                      name={
                        day.isAvailable
                          ? "checkbox"
                          : "square-outline"
                      }
                      size={25}
                      color={
                        day.isAvailable
                          ? "#2563EB"
                          : "#94A3B8"
                      }
                    />

                  </Pressable>


                  {/* TIMES */}

                  {day.isAvailable ? (
                    <View className="mt-4 flex-row">

                      {/* START */}

                      <View className="mr-2 flex-1">

                        <Text className="mb-2 text-xs font-semibold text-[#64748B]">
                          Start Time
                        </Text>

                        <View className="flex-row items-center rounded-xl border border-[#BFDBFE] bg-white px-3">

                          <Ionicons
                            name="time-outline"
                            size={17}
                            color="#64748B"
                          />

                          <TextInput
                            value={
                              day.startTime
                            }
                            onChangeText={(
                              value
                            ) =>
                              changeWorkingTime(
                                day.dayOfWeek,
                                "startTime",
                                value
                              )
                            }
                            placeholder="09:00"
                            placeholderTextColor="#94A3B8"
                            maxLength={5}
                            className="ml-2 flex-1 py-3.5 text-center font-semibold text-[#0F172A]"
                          />

                        </View>
                      </View>


                      {/* END */}

                      <View className="ml-2 flex-1">

                        <Text className="mb-2 text-xs font-semibold text-[#64748B]">
                          End Time
                        </Text>

                        <View className="flex-row items-center rounded-xl border border-[#BFDBFE] bg-white px-3">

                          <Ionicons
                            name="time-outline"
                            size={17}
                            color="#64748B"
                          />

                          <TextInput
                            value={
                              day.endTime
                            }
                            onChangeText={(
                              value
                            ) =>
                              changeWorkingTime(
                                day.dayOfWeek,
                                "endTime",
                                value
                              )
                            }
                            placeholder="17:00"
                            placeholderTextColor="#94A3B8"
                            maxLength={5}
                            className="ml-2 flex-1 py-3.5 text-center font-semibold text-[#0F172A]"
                          />

                        </View>
                      </View>

                    </View>
                  ) : null}

                </View>
              )
            )}


            {availabilitySaved ? (
              <View className="mt-6 flex-row items-center rounded-xl bg-green-50 p-4">

                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color="#16A34A"
                />

                <Text className="ml-2 flex-1 font-semibold text-green-700">
                  Working hours saved successfully.
                </Text>

              </View>
            ) : null}


            <Pressable
              disabled={
                availabilitySaving
              }
              onPress={
                handleSaveAvailability
              }
              className={`mt-7 items-center rounded-2xl py-4 ${
                availabilitySaving
                  ? "bg-[#94A3B8]"
                  : "bg-[#2563EB]"
              }`}
            >

              {availabilitySaving ? (
                <ActivityIndicator
                  color="white"
                />
              ) : (
                <Text className="font-bold text-white">
                  Save Working Hours
                </Text>
              )}

            </Pressable>

          </View>
        ) : null}


        {/* ==================================
            GLOBAL ERROR
        ================================== */}

        {error ? (
          <View className="mt-6 rounded-xl bg-red-50 p-4">

            <View className="flex-row items-center">

              <Ionicons
                name="alert-circle-outline"
                size={20}
                color="#DC2626"
              />

              <Text className="ml-2 flex-1 font-semibold text-red-600">
                {error}
              </Text>

            </View>

          </View>
        ) : null}


        {/* ==================================
            STEP 4 PREVIEW
        ================================== */}

         {availabilitySaved ? (
  <View className="mt-9">

    <View className="h-[1px] bg-[#E2E8F0]" />


    {/* STEP 4 HEADER */}

    <View className="mt-8 flex-row items-center">

      <View className="h-10 w-10 items-center justify-center rounded-xl bg-[#EFF6FF]">
        <Text className="font-bold text-[#2563EB]">
          4
        </Text>
      </View>


      <View className="ml-3 flex-1">

        <Text className="text-lg font-bold text-[#0F172A]">
          Review & Submit
        </Text>

        <Text className="mt-1 text-xs text-[#64748B]">
          Review your application before sending it
        </Text>

      </View>

    </View>


    {/* SUMMARY */}

    <View className="mt-5 rounded-2xl border border-[#E2E8F0] bg-white p-5">

      {/* Personal */}

      <View className="flex-row items-center">

        <Ionicons
          name="person-outline"
          size={21}
          color="#2563EB"
        />

        <Text className="ml-3 flex-1 font-semibold text-[#0F172A]">
          Personal Information
        </Text>

        <Ionicons
          name="checkmark-circle"
          size={22}
          color="#16A34A"
        />

      </View>


      <View className="my-4 h-[1px] bg-[#F1F5F9]" />


      {/* Services */}

      <View className="flex-row items-center">

        <Ionicons
          name="construct-outline"
          size={21}
          color="#2563EB"
        />

        <View className="ml-3 flex-1">

          <Text className="font-semibold text-[#0F172A]">
            Services & Prices
          </Text>

          <Text className="mt-1 text-xs text-[#64748B]">
            {
              Object.values(
                selectedServices
              ).filter(
                (item) =>
                  item.selected
              ).length
            } selected
          </Text>

        </View>

        <Ionicons
          name="checkmark-circle"
          size={22}
          color="#16A34A"
        />

      </View>


      <View className="my-4 h-[1px] bg-[#F1F5F9]" />


      {/* Working Hours */}

      <View className="flex-row items-center">

        <Ionicons
          name="time-outline"
          size={21}
          color="#2563EB"
        />

        <View className="ml-3 flex-1">

          <Text className="font-semibold text-[#0F172A]">
            Working Hours
          </Text>

          <Text className="mt-1 text-xs text-[#64748B]">
            {
              workingHours.filter(
                (day) =>
                  day.isAvailable
              ).length
            } working days
          </Text>

        </View>

        <Ionicons
          name="checkmark-circle"
          size={22}
          color="#16A34A"
        />

      </View>

    </View>


    {/* WARNING */}

    <View className="mt-5 rounded-2xl bg-amber-50 p-4">

      <View className="flex-row">

        <Ionicons
          name="information-circle-outline"
          size={22}
          color="#D97706"
        />

        <Text className="ml-2 flex-1 text-sm leading-5 text-amber-700">
          After submitting, your application will be sent for review and you won't be able to edit it while it is pending.
        </Text>

      </View>

    </View>


    {/* SUBMIT BUTTON */}

    <Pressable
      disabled={
        isSubmitting
      }
      onPress={
        handleSubmitApplication
      }
      className={`mt-6 flex-row items-center justify-center rounded-2xl py-4 ${
        isSubmitting
          ? "bg-[#94A3B8]"
          : "bg-[#16A34A]"
      }`}
    >

      {isSubmitting ? (
        <ActivityIndicator
          color="white"
        />
      ) : (
        <>
          <Ionicons
            name="send-outline"
            size={20}
            color="white"
          />

          <Text className="ml-2 font-bold text-white">
            Submit Application
          </Text>
        </>
      )}

    </Pressable>

  </View>
) : null}

      </ScrollView>
    </SafeAreaView>
  );
}
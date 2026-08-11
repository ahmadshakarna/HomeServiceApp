import {
  useAuth,
  useUser,
} from "@clerk/expo";

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import React, {
  useCallback,
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

import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";


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
  serviceSlug: string;

  serviceIcon:
    string | null;

  serviceDescription:
    string | null;

  categoryId: string;
  categoryName: string;
  categorySlug: string;
};


type SelectedServiceMap = {
  [serviceId: string]: {
    selected: boolean;
    price: string;
  };
};


type WorkingDay = {
  dayOfWeek: number;
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
  { dayOfWeek: 0 },
  { dayOfWeek: 1 },
  { dayOfWeek: 2 },
  { dayOfWeek: 3 },
  { dayOfWeek: 4 },
  { dayOfWeek: 5 },
  { dayOfWeek: 6 },
];


const createDefaultSchedule =
  (): WorkingDay[] =>
    WEEK_DAYS.map(
      (day) => ({
        ...day,
        isAvailable: false,
        startTime: "09:00",
        endTime: "17:00",
      })
    );


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

  const {
    t,
    i18n,
  } = useTranslation();


  // ========================================
  // LANGUAGE
  // ========================================

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


  // ========================================
  // LOAD GUARD
  // ========================================

  const loadedForUser =
    useRef<string | null>(
      null
    );


  // ========================================
  // STATES
  // ========================================

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);


  // PERSONAL INFORMATION

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


  // APPLICATION

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


  // SERVICES

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


  // WORKING HOURS

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


  // ERROR

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);


  // ========================================
  // TRANSLATION HELPERS
  // ========================================

  const getServiceName = (
    item: AvailableService
  ) =>
    t(
      `db.services.${item.serviceSlug}.name`,
      {
        defaultValue:
          item.serviceName,
      }
    );


  const getServiceDescription = (
    item: AvailableService
  ) => {
    if (
      !item.serviceDescription
    ) {
      return null;
    }

    return t(
      `db.services.${item.serviceSlug}.description`,
      {
        defaultValue:
          item.serviceDescription,
      }
    );
  };


  const getCategoryName = (
    slug: string,
    name: string
  ) =>
    t(
      `db.categories.${slug}.name`,
      {
        defaultValue:
          name,
      }
    );


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


  const getDayName = (
    dayOfWeek: number
  ) =>
    t(
      `weekdays.${getDayKey(
        dayOfWeek
      )}`
    );


  const localizeServerError =
    useCallback(
      (
        message:
          | string
          | null
          | undefined,
        fallbackKey:
          string
      ) => {
        if (!message) {
          return t(
            fallbackKey
          );
        }

        const normalized =
          message
            .trim()
            .toLowerCase();

        const map:
          Record<
            string,
            string
          > = {
          "authentication required":
            "becomeProvider.errors.authenticationRequired",

          "unauthorized":
            "becomeProvider.errors.authenticationRequired",

          "full name is required":
            "becomeProvider.errors.fullNameRequired",

          "full name is required.":
            "becomeProvider.errors.fullNameRequired",

          "phone number is required":
            "becomeProvider.errors.phoneRequired",

          "phone number is required.":
            "becomeProvider.errors.phoneRequired",

          "city is required":
            "becomeProvider.errors.cityRequired",

          "city is required.":
            "becomeProvider.errors.cityRequired",

          "invalid experience years":
            "becomeProvider.errors.invalidExperience",

          "please enter valid years of experience.":
            "becomeProvider.errors.invalidExperience",

          "select at least one service":
            "becomeProvider.errors.selectService",

          "select at least one service.":
            "becomeProvider.errors.selectService",

          "enter a valid price for every service":
            "becomeProvider.errors.invalidPrice",

          "enter a valid price for every selected service.":
            "becomeProvider.errors.invalidPrice",

          "select at least one working day":
            "becomeProvider.errors.selectWorkingDay",

          "select at least one working day.":
            "becomeProvider.errors.selectWorkingDay",

          "save your services first.":
            "becomeProvider.errors.saveServicesFirst",

          "save your working hours first.":
            "becomeProvider.errors.saveHoursFirst",

          "save your personal information first":
            "becomeProvider.errors.savePersonalFirst",

          "application is already under review":
            "becomeProvider.errors.alreadyPending",

          "provider is already approved":
            "becomeProvider.errors.alreadyApproved",

          "provider account is already approved":
            "becomeProvider.errors.alreadyApproved",

          "provider application not found":
            "becomeProvider.errors.applicationNotFound",

          "complete your working hours":
            "becomeProvider.errors.completeHours",

          "all services must have a valid price":
            "becomeProvider.errors.invalidPrice",

          "one or more services are invalid":
            "becomeProvider.errors.invalidService",
        };


        const key =
          map[
            normalized
          ];

        if (key) {
          return t(
            key
          );
        }


        if (
          normalized.includes(
            "end time must be after start time"
          )
        ) {
          return t(
            "becomeProvider.errors.endAfterStart"
          );
        }


        if (
          normalized.includes(
            "valid time"
          ) ||
          normalized.includes(
            "invalid working time"
          )
        ) {
          return t(
            "becomeProvider.errors.invalidTime"
          );
        }


        return t(
          fallbackKey
        );
      },
      [t]
    );


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

          setServicesSaved(
            selectedData.length >
              0
          );

        } catch (err) {
          console.error(
            "LOAD SERVICES ERROR:",
            err
          );

          const message =
            err instanceof Error
              ? err.message
              : null;

          setError(
            localizeServerError(
              message,
              "becomeProvider.errors.loadServices"
            )
          );
        }
      },
      [
        getToken,
        localizeServerError,
      ]
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
                  dayOfWeek:
                    day.dayOfWeek,

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

        } catch (err) {
          console.error(
            "LOAD AVAILABILITY ERROR:",
            err
          );

          const message =
            err instanceof Error
              ? err.message
              : null;

          setError(
            localizeServerError(
              message,
              "becomeProvider.errors.loadHours"
            )
          );
        }
      },
      [
        getToken,
        localizeServerError,
      ]
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

        } catch (err) {
          console.error(
            "LOAD PROVIDER APPLICATION ERROR:",
            err
          );

          const message =
            err instanceof Error
              ? err.message
              : null;

          setError(
            localizeServerError(
              message,
              "becomeProvider.errors.loadApplication"
            )
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
    user?.fullName,
    user
      ?.primaryEmailAddress
      ?.emailAddress,
    getToken,
    loadServices,
    loadAvailability,
    localizeServerError,
  ]);


  // ========================================
  // SAVE PERSONAL INFO
  // ========================================

  const handleSavePersonalInfo =
    async () => {
      if (!fullName.trim()) {
        setError(
          t(
            "becomeProvider.errors.fullNameRequired"
          )
        );

        return;
      }


      if (!phone.trim()) {
        setError(
          t(
            "becomeProvider.errors.phoneRequired"
          )
        );

        return;
      }


      if (!city.trim()) {
        setError(
          t(
            "becomeProvider.errors.cityRequired"
          )
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
          t(
            "becomeProvider.errors.invalidExperience"
          )
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


        await loadServices();

      } catch (err) {
        console.error(
          "SAVE PROVIDER APPLICATION ERROR:",
          err
        );

        const message =
          err instanceof Error
            ? err.message
            : null;

        setError(
          localizeServerError(
            message,
            "becomeProvider.errors.saveApplication"
          )
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


        await loadAvailability();

      } catch (err) {
        console.error(
          "SAVE PROVIDER SERVICES ERROR:",
          err
        );

        const message =
          err instanceof Error
            ? err.message
            : null;

        setError(
          localizeServerError(
            message,
            "becomeProvider.errors.saveServices"
          )
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
            setError(
              t(
                "becomeProvider.errors.invalidTimeForDay",
                {
                  day:
                    getDayName(
                      day.dayOfWeek
                    ),
                }
              )
            );

            return;
          }


          if (
            day.startTime >=
            day.endTime
          ) {
            setError(
              t(
                "becomeProvider.errors.endAfterStartForDay",
                {
                  day:
                    getDayName(
                      day.dayOfWeek
                    ),
                }
              )
            );

            return;
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

      } catch (err) {
        console.error(
          "SAVE PROVIDER AVAILABILITY ERROR:",
          err
        );

        const message =
          err instanceof Error
            ? err.message
            : null;

        setError(
          localizeServerError(
            message,
            "becomeProvider.errors.saveHours"
          )
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
        setError(
          null
        );


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


        setApplication(
          data.application
        );

      } catch (err) {
        console.error(
          "SUBMIT APPLICATION ERROR:",
          err
        );

        const message =
          err instanceof Error
            ? err.message
            : null;

        setError(
          localizeServerError(
            message,
            "becomeProvider.errors.submitApplication"
          )
        );

      } finally {
        setIsSubmitting(
          false
        );
      }
    };


  // ========================================
  // CATEGORY GROUPS
  // ========================================

  const categoryGroups =
    useMemo(() => {
      const map =
        new Map<
          string,
          {
            slug: string;
            name: string;
          }
        >();


      for (
        const item of
        availableServices
      ) {
        map.set(
          item.categorySlug,
          {
            slug:
              item.categorySlug,

            name:
              item.categoryName,
          }
        );
      }


      return Array.from(
        map.values()
      );

    }, [
      availableServices,
    ]);


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
          {t(
            "becomeProvider.loading"
          )}
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

          <View className="h-24 w-24 items-center justify-center rounded-full bg-amber-50">
            <Ionicons
              name="time-outline"
              size={48}
              color="#D97706"
            />
          </View>


          <Text
            className="mt-6 text-2xl font-bold text-[#0F172A]"
            style={{
              textAlign:
                "center",
            }}
          >
            {t(
              "becomeProvider.pendingTitle"
            )}
          </Text>


          <Text
            className="mt-3 max-w-[310px] leading-6 text-[#64748B]"
            style={{
              textAlign:
                "center",
            }}
          >
            {t(
              "becomeProvider.pendingDescription"
            )}
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

          <View className="h-24 w-24 items-center justify-center rounded-full bg-green-50">
            <Ionicons
              name="checkmark-circle"
              size={55}
              color="#16A34A"
            />
          </View>


          <Text
            className="mt-6 text-2xl font-bold text-[#0F172A]"
            style={{
              textAlign:
                "center",
            }}
          >
            {t(
              "becomeProvider.approvedTitle"
            )}
          </Text>


          <Text
            className="mt-3 leading-6 text-[#64748B]"
            style={{
              textAlign:
                "center",
            }}
          >
            {t(
              "becomeProvider.approvedDescription"
            )}
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
                "becomeProvider.title"
              )}
            </Text>


            <Text
              className="mt-1 text-xs text-[#64748B]"
              style={
                textDirection
              }
            >
              {t(
                "becomeProvider.subtitle"
              )}
            </Text>
          </View>

        </View>


        {/* ==================================
            INTRO
        ================================== */}

        <View className="mt-6 rounded-2xl bg-[#EFF6FF] p-5">

          <View
            style={{
              alignItems:
                isArabic
                  ? "flex-end"
                  : "flex-start",
            }}
          >
            <Ionicons
              name="briefcase-outline"
              size={28}
              color="#2563EB"
            />
          </View>


          <Text
            className="mt-3 text-lg font-bold text-[#0F172A]"
            style={
              textDirection
            }
          >
            {t(
              "becomeProvider.introTitle"
            )}
          </Text>


          <Text
            className="mt-2 leading-6 text-[#64748B]"
            style={
              textDirection
            }
          >
            {t(
              "becomeProvider.introDescription"
            )}
          </Text>

        </View>


        {/* ==================================
            REJECTED
        ================================== */}

        {application
          ?.approvalStatus ===
        "rejected" ? (

          <View className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-4">

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
                className="flex-1 font-bold text-red-700"
                style={{
                  marginStart:
                    8,

                  ...textDirection,
                }}
              >
                {t(
                  "becomeProvider.rejectedTitle"
                )}
              </Text>
            </View>


            {application
              .rejectionReason ? (

              <Text
                className="mt-2 leading-5 text-red-600"
                style={
                  textDirection
                }
              >
                {
                  application
                    .rejectionReason
                }
              </Text>

            ) : null}


            <Text
              className="mt-2 text-sm text-red-600"
              style={
                textDirection
              }
            >
              {t(
                "becomeProvider.rejectedDescription"
              )}
            </Text>

          </View>

        ) : null}


        {/* ==================================
            STEP 1
        ================================== */}

        <View
          className="mt-8"
          style={{
            ...rowDirection,
            alignItems:
              "center",
          }}
        >
          <View className="h-10 w-10 items-center justify-center rounded-xl bg-[#EFF6FF]">
            <Text className="font-bold text-[#2563EB]">
              1
            </Text>
          </View>


          <View
            className="flex-1"
            style={{
              marginStart:
                12,
            }}
          >
            <Text
              className="text-lg font-bold text-[#0F172A]"
              style={
                textDirection
              }
            >
              {t(
                "becomeProvider.personalTitle"
              )}
            </Text>


            <Text
              className="mt-1 text-xs text-[#64748B]"
              style={
                textDirection
              }
            >
              {t(
                "becomeProvider.personalSubtitle"
              )}
            </Text>
          </View>
        </View>


        {/* FULL NAME */}

        <Text
          className="mt-6 font-bold text-[#0F172A]"
          style={
            textDirection
          }
        >
          {t(
            "becomeProvider.fullName"
          )}
        </Text>

        <TextInput
          value={fullName}
          onChangeText={
            setFullName
          }
          placeholder={t(
            "becomeProvider.fullNamePlaceholder"
          )}
          placeholderTextColor="#94A3B8"
          className="mt-3 rounded-2xl border border-[#E2E8F0] bg-white px-4 py-4 text-[#0F172A]"
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


        {/* PHONE */}

        <Text
          className="mt-5 font-bold text-[#0F172A]"
          style={
            textDirection
          }
        >
          {t(
            "becomeProvider.phone"
          )}
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
          style={{
            textAlign:
              "left",

            writingDirection:
              "ltr",
          }}
        />


        {/* EMAIL */}

        <Text
          className="mt-5 font-bold text-[#0F172A]"
          style={
            textDirection
          }
        >
          {t(
            "becomeProvider.email"
          )}
        </Text>

        <TextInput
          value={email}
          onChangeText={
            setEmail
          }
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder={t(
            "becomeProvider.emailPlaceholder"
          )}
          placeholderTextColor="#94A3B8"
          className="mt-3 rounded-2xl border border-[#E2E8F0] bg-white px-4 py-4 text-[#0F172A]"
          style={{
            textAlign:
              "left",

            writingDirection:
              "ltr",
          }}
        />


        {/* CITY */}

        <Text
          className="mt-5 font-bold text-[#0F172A]"
          style={
            textDirection
          }
        >
          {t(
            "becomeProvider.city"
          )}
        </Text>

        <TextInput
          value={city}
          onChangeText={
            setCity
          }
          placeholder={t(
            "becomeProvider.cityPlaceholder"
          )}
          placeholderTextColor="#94A3B8"
          className="mt-3 rounded-2xl border border-[#E2E8F0] bg-white px-4 py-4 text-[#0F172A]"
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


        {/* EXPERIENCE */}

        <Text
          className="mt-5 font-bold text-[#0F172A]"
          style={
            textDirection
          }
        >
          {t(
            "becomeProvider.experience"
          )}
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
          style={{
            textAlign:
              "left",

            writingDirection:
              "ltr",
          }}
        />


        {/* BIO */}

        <Text
          className="mt-5 font-bold text-[#0F172A]"
          style={
            textDirection
          }
        >
          {t(
            "becomeProvider.aboutYou"
          )}
        </Text>

        <TextInput
          value={bio}
          onChangeText={
            setBio
          }
          multiline
          textAlignVertical="top"
          placeholder={t(
            "becomeProvider.bioPlaceholder"
          )}
          placeholderTextColor="#94A3B8"
          className="mt-3 min-h-[130px] rounded-2xl border border-[#E2E8F0] bg-white p-4 text-[#0F172A]"
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


        {personalSaved ? (

          <View
            className="mt-5 rounded-xl bg-green-50 p-4"
            style={{
              ...rowDirection,
              alignItems:
                "center",
            }}
          >
            <Ionicons
              name="checkmark-circle"
              size={20}
              color="#16A34A"
            />


            <Text
              className="flex-1 font-semibold text-green-700"
              style={{
                marginStart:
                  8,

                ...textDirection,
              }}
            >
              {t(
                "becomeProvider.personalSaved"
              )}
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
              {t(
                "becomeProvider.saveInformation"
              )}
            </Text>
          )}
        </Pressable>


        {/* ==================================
            STEP 2 SERVICES
        ================================== */}

        {servicesLoaded ? (

          <View className="mt-10">

            <View className="h-[1px] bg-[#E2E8F0]" />


            <View
              className="mt-8"
              style={{
                ...rowDirection,
                alignItems:
                  "center",
              }}
            >
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-[#EFF6FF]">
                <Text className="font-bold text-[#2563EB]">
                  2
                </Text>
              </View>


              <View
                className="flex-1"
                style={{
                  marginStart:
                    12,
                }}
              >
                <Text
                  className="text-lg font-bold text-[#0F172A]"
                  style={
                    textDirection
                  }
                >
                  {t(
                    "becomeProvider.servicesTitle"
                  )}
                </Text>


                <Text
                  className="mt-1 text-xs text-[#64748B]"
                  style={
                    textDirection
                  }
                >
                  {t(
                    "becomeProvider.servicesSubtitle"
                  )}
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
                  {t(
                    "becomeProvider.noServices"
                  )}
                </Text>

              </View>

            ) : null}


            {categoryGroups.map(
              (category) => (

                <View
                  key={
                    category.slug
                  }
                  className="mt-7"
                >
                  <Text
                    className="text-base font-bold text-[#0F172A]"
                    style={
                      textDirection
                    }
                  >
                    {getCategoryName(
                      category.slug,
                      category.name
                    )}
                  </Text>


                  {availableServices
                    .filter(
                      (item) =>
                        item.categorySlug ===
                        category.slug
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
                              style={{
                                ...rowDirection,
                                alignItems:
                                  "center",
                              }}
                            >

                              <View className="h-11 w-11 items-center justify-center rounded-xl bg-white">
                                <Ionicons
                                  name={
                                    (item.serviceIcon ||
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
                                  {getServiceName(
                                    item
                                  )}
                                </Text>


                                {item
                                  .serviceDescription ? (

                                  <Text
                                    numberOfLines={
                                      2
                                    }
                                    className="mt-1 text-xs leading-5 text-[#64748B]"
                                    style={
                                      textDirection
                                    }
                                  >
                                    {getServiceDescription(
                                      item
                                    )}
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
                                style={{
                                  marginStart:
                                    8,
                                }}
                              />

                            </Pressable>


                            {isSelected ? (

                              <View className="mt-4">

                                <Text
                                  className="mb-2 text-xs font-semibold text-[#64748B]"
                                  style={
                                    textDirection
                                  }
                                >
                                  {t(
                                    "becomeProvider.startingPrice"
                                  )}
                                </Text>


                                <View
                                  className="rounded-xl border border-[#BFDBFE] bg-white px-4"
                                  style={{
                                    flexDirection:
                                      "row",

                                    alignItems:
                                      "center",
                                  }}
                                >

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
                                    style={{
                                      textAlign:
                                        "left",

                                      writingDirection:
                                        "ltr",
                                    }}
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

              <View
                className="mt-6 rounded-xl bg-green-50 p-4"
                style={{
                  ...rowDirection,
                  alignItems:
                    "center",
                }}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color="#16A34A"
                />


                <Text
                  className="flex-1 font-semibold text-green-700"
                  style={{
                    marginStart:
                      8,

                    ...textDirection,
                  }}
                >
                  {t(
                    "becomeProvider.servicesSaved"
                  )}
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
                    {t(
                      "becomeProvider.saveServices"
                    )}
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


            <View
              className="mt-8"
              style={{
                ...rowDirection,
                alignItems:
                  "center",
              }}
            >

              <View className="h-10 w-10 items-center justify-center rounded-xl bg-[#EFF6FF]">
                <Text className="font-bold text-[#2563EB]">
                  3
                </Text>
              </View>


              <View
                className="flex-1"
                style={{
                  marginStart:
                    12,
                }}
              >

                <Text
                  className="text-lg font-bold text-[#0F172A]"
                  style={
                    textDirection
                  }
                >
                  {t(
                    "becomeProvider.workingHoursTitle"
                  )}
                </Text>


                <Text
                  className="mt-1 text-xs text-[#64748B]"
                  style={
                    textDirection
                  }
                >
                  {t(
                    "becomeProvider.workingHoursSubtitle"
                  )}
                </Text>

              </View>

            </View>


            <View className="mt-5 rounded-2xl bg-[#EFF6FF] p-4">

              <View
                style={{
                  ...rowDirection,
                  alignItems:
                    "center",
                }}
              >
                <Ionicons
                  name="time-outline"
                  size={21}
                  color="#2563EB"
                />


                <Text
                  className="flex-1 text-sm leading-5 text-[#64748B]"
                  style={{
                    marginStart:
                      8,

                    ...textDirection,
                  }}
                >
                  {t(
                    "becomeProvider.timeHint"
                  )}
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
                    style={{
                      ...rowDirection,
                      alignItems:
                        "center",
                    }}
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
                        {getDayName(
                          day.dayOfWeek
                        )}
                      </Text>


                      <Text
                        className="mt-1 text-xs text-[#64748B]"
                        style={
                          textDirection
                        }
                      >
                        {day.isAvailable
                          ? `${day.startTime} - ${day.endTime}`
                          : t(
                              "becomeProvider.notAvailable"
                            )}
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
                      style={{
                        marginStart:
                          8,
                      }}
                    />

                  </Pressable>


                  {/* TIMES */}

                  {day.isAvailable ? (

                    <View
                      className="mt-4"
                      style={{
                        ...rowDirection,
                      }}
                    >

                      {/* START */}

                      <View
                        className="flex-1"
                        style={{
                          marginEnd:
                            8,
                        }}
                      >

                        <Text
                          className="mb-2 text-xs font-semibold text-[#64748B]"
                          style={
                            textDirection
                          }
                        >
                          {t(
                            "becomeProvider.startTime"
                          )}
                        </Text>


                        <View
                          className="rounded-xl border border-[#BFDBFE] bg-white px-3"
                          style={{
                            flexDirection:
                              "row",

                            alignItems:
                              "center",
                          }}
                        >
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
                            className="flex-1 py-3.5 text-center font-semibold text-[#0F172A]"
                            style={{
                              writingDirection:
                                "ltr",
                            }}
                          />
                        </View>

                      </View>


                      {/* END */}

                      <View
                        className="flex-1"
                        style={{
                          marginStart:
                            8,
                        }}
                      >

                        <Text
                          className="mb-2 text-xs font-semibold text-[#64748B]"
                          style={
                            textDirection
                          }
                        >
                          {t(
                            "becomeProvider.endTime"
                          )}
                        </Text>


                        <View
                          className="rounded-xl border border-[#BFDBFE] bg-white px-3"
                          style={{
                            flexDirection:
                              "row",

                            alignItems:
                              "center",
                          }}
                        >
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
                            className="flex-1 py-3.5 text-center font-semibold text-[#0F172A]"
                            style={{
                              writingDirection:
                                "ltr",
                            }}
                          />
                        </View>

                      </View>

                    </View>

                  ) : null}

                </View>
              )
            )}


            {availabilitySaved ? (

              <View
                className="mt-6 rounded-xl bg-green-50 p-4"
                style={{
                  ...rowDirection,
                  alignItems:
                    "center",
                }}
              >

                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color="#16A34A"
                />


                <Text
                  className="flex-1 font-semibold text-green-700"
                  style={{
                    marginStart:
                      8,

                    ...textDirection,
                  }}
                >
                  {t(
                    "becomeProvider.hoursSaved"
                  )}
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
                  {t(
                    "becomeProvider.saveWorkingHours"
                  )}
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

            <View
              style={{
                ...rowDirection,
                alignItems:
                  "center",
              }}
            >
              <Ionicons
                name="alert-circle-outline"
                size={20}
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
            STEP 4 REVIEW
        ================================== */}

        {availabilitySaved ? (

          <View className="mt-9">

            <View className="h-[1px] bg-[#E2E8F0]" />


            <View
              className="mt-8"
              style={{
                ...rowDirection,
                alignItems:
                  "center",
              }}
            >

              <View className="h-10 w-10 items-center justify-center rounded-xl bg-[#EFF6FF]">
                <Text className="font-bold text-[#2563EB]">
                  4
                </Text>
              </View>


              <View
                className="flex-1"
                style={{
                  marginStart:
                    12,
                }}
              >
                <Text
                  className="text-lg font-bold text-[#0F172A]"
                  style={
                    textDirection
                  }
                >
                  {t(
                    "becomeProvider.reviewTitle"
                  )}
                </Text>


                <Text
                  className="mt-1 text-xs text-[#64748B]"
                  style={
                    textDirection
                  }
                >
                  {t(
                    "becomeProvider.reviewSubtitle"
                  )}
                </Text>
              </View>

            </View>


            {/* SUMMARY */}

            <View className="mt-5 rounded-2xl border border-[#E2E8F0] bg-white p-5">

              {/* PERSONAL */}

              <View
                style={{
                  ...rowDirection,
                  alignItems:
                    "center",
                }}
              >
                <Ionicons
                  name="person-outline"
                  size={21}
                  color="#2563EB"
                />


                <Text
                  className="flex-1 font-semibold text-[#0F172A]"
                  style={{
                    marginStart:
                      12,

                    ...textDirection,
                  }}
                >
                  {t(
                    "becomeProvider.personalTitle"
                  )}
                </Text>


                <Ionicons
                  name="checkmark-circle"
                  size={22}
                  color="#16A34A"
                />
              </View>


              <View className="my-4 h-[1px] bg-[#F1F5F9]" />


              {/* SERVICES */}

              <View
                style={{
                  ...rowDirection,
                  alignItems:
                    "center",
                }}
              >
                <Ionicons
                  name="construct-outline"
                  size={21}
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
                    className="font-semibold text-[#0F172A]"
                    style={
                      textDirection
                    }
                  >
                    {t(
                      "becomeProvider.servicesTitle"
                    )}
                  </Text>


                  <Text
                    className="mt-1 text-xs text-[#64748B]"
                    style={
                      textDirection
                    }
                  >
                    {t(
                      "becomeProvider.selectedServicesCount",
                      {
                        count:
                          Object.values(
                            selectedServices
                          ).filter(
                            (item) =>
                              item.selected
                          ).length,
                      }
                    )}
                  </Text>
                </View>


                <Ionicons
                  name="checkmark-circle"
                  size={22}
                  color="#16A34A"
                />
              </View>


              <View className="my-4 h-[1px] bg-[#F1F5F9]" />


              {/* WORKING HOURS */}

              <View
                style={{
                  ...rowDirection,
                  alignItems:
                    "center",
                }}
              >
                <Ionicons
                  name="time-outline"
                  size={21}
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
                    className="font-semibold text-[#0F172A]"
                    style={
                      textDirection
                    }
                  >
                    {t(
                      "becomeProvider.workingHoursTitle"
                    )}
                  </Text>


                  <Text
                    className="mt-1 text-xs text-[#64748B]"
                    style={
                      textDirection
                    }
                  >
                    {t(
                      "becomeProvider.workingDaysCount",
                      {
                        count:
                          workingHours.filter(
                            (day) =>
                              day.isAvailable
                          ).length,
                      }
                    )}
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

              <View
                style={{
                  ...rowDirection,
                  alignItems:
                    "flex-start",
                }}
              >
                <Ionicons
                  name="information-circle-outline"
                  size={22}
                  color="#D97706"
                />


                <Text
                  className="flex-1 text-sm leading-5 text-amber-700"
                  style={{
                    marginStart:
                      8,

                    ...textDirection,
                  }}
                >
                  {t(
                    "becomeProvider.submitWarning"
                  )}
                </Text>
              </View>

            </View>


            {/* SUBMIT */}

            <Pressable
              disabled={
                isSubmitting
              }
              onPress={
                handleSubmitApplication
              }
              className={`mt-6 items-center justify-center rounded-2xl py-4 ${
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

                <View
                  style={{
                    ...rowDirection,
                    alignItems:
                      "center",
                  }}
                >
                  <Ionicons
                    name="send-outline"
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
                      "becomeProvider.submitApplication"
                    )}
                  </Text>
                </View>

              )}

            </Pressable>

          </View>

        ) : null}

      </ScrollView>

    </SafeAreaView>
  );
}

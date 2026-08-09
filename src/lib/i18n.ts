import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";

export type AppLanguage =
  | "en"
  | "ar";

const LANGUAGE_KEY =
  "app_language";


// ========================================
// TRANSLATIONS
// ========================================

const resources = {
  en: {
    translation: {
      // ================================
      // COMMON
      // ================================

      common: {
        save: "Save",
        cancel: "Cancel",
        confirm: "Confirm",
        loading: "Loading...",
        error: "Something went wrong",
        retry: "Try Again",
        yes: "Yes",
        no: "No",
        close: "Close",
        back: "Back",
      },


      // ================================
      // TABS
      // ================================

      tabs: {
        home: "Home",
        categories: "Categories",
        bookings: "Bookings",
        profile: "Profile",
      },


      // ================================
      // PROFILE
      // ================================

      profile: {
  title: "Profile",
  account: "Account",
  name: "Name",
  email: "Email",

  userFallback: "User",
  notProvided: "Not provided",

  language: "Language",
  english: "English",
  arabic: "العربية",

  logout: "Log out",

  adminPanel:
    "Admin Panel",

  adminDescription:
    "Review provider applications",

  providerDashboard:
    "Provider Dashboard",

  providerDescription:
    "Manage bookings and jobs",

  becomeProvider:
    "Become a Provider",

  becomeProviderDescription:
    "Offer services and receive bookings",

  continueApplication:
    "Continue Provider Application",

  continueApplicationDescription:
    "Complete your provider application",

  applicationPending:
    "Provider Application Pending",

  applicationPendingDescription:
    "Your application is under review",

  applicationRejected:
    "Provider Application Rejected",

  applicationRejectedDescription:
    "Review the reason and apply again",
},


      // ================================
      // HOME
      // ================================

    home: {
  title:
    "Home Services",

  welcome:
    "Welcome",

  heroTitle:
    "Trusted help for your home",

  heroDescription:
    "Find skilled service providers, compare services and book the right professional for your needs.",

  browseServices:
    "Browse Services",

  categories:
    "Popular Categories",

  categoriesDescription:
    "What do you need help with?",

  viewAll:
    "View All",

  servicesCount:
    "{{count}} service",

  servicesCount_other:
    "{{count}} services",

  howItWorks:
    "How It Works",

  step1Title:
    "Choose a service",

  step1Description:
    "Browse categories and select the service you need.",

  step2Title:
    "Choose a provider",

  step2Description:
    "Compare providers, prices and availability.",

  step3Title:
    "Book your appointment",

  step3Description:
    "Select a convenient date and time and confirm your booking.",
},


      // ================================
      // CATEGORIES
      // ================================

      categories: {
  title:
    "Categories",

  allCategories:
    "All Categories",

  subtitle:
    "Find the service you need",

  loading:
    "Loading categories...",

  loadError:
    "We couldn't load the categories.",

  noCategories:
    "No categories found",

  emptyDescription:
    "Categories will appear here.",

  service:
    "Service",

  services:
    "Services",
},


      // ================================
      // SERVICES
      // ================================

      services: {
  title:
    "Services",

  providers:
    "Providers",

  startingFrom:
    "Starting from",

  loading:
    "Loading services...",

  loadError:
    "Couldn't load services",

  availableServices:
    "Available Services",

  availableCount:
    "{{count}} service available",

  availableCount_other:
    "{{count}} services available",

  noServices:
    "No services yet",

  emptyDescription:
    "No services are available in this category.",
},


      // ================================
      // BOOKING
      // ================================
booking: {
  title:
    "Book Service",

  loading:
    "Loading booking...",

  loadError:
    "Couldn't load booking",

  loadErrorDescription:
    "Something went wrong while loading the booking information.",

  goBack:
    "Go Back",

  bookNow:
    "Book Now",

  chooseService:
    "Choose Service",

  selectDate:
    "Choose Date",

  selectTime:
    "Choose Time",

  noAvailableDates:
    "No available dates in the next 14 days.",

  noAvailableTimes:
    "No available times for this date.",

  serviceAddress:
    "Service Address",

  address:
    "Address",

  addressPlaceholder:
    "Enter your address",

  notes:
    "Notes",

  notesPlaceholder:
    "Describe the problem or add any notes...",

  price:
    "Price",

  summary:
    "Booking Summary",

  service:
    "Service",

  date:
    "Date",

  time:
    "Time",

  total:
    "Total",

  confirmBooking:
    "Confirm Booking",

  submitting:
    "Confirming booking...",

  submitError:
    "Couldn't create the booking. Please try again.",

  myBookings:
    "My Bookings",

  bookingDetails:
    "Booking Details",

  cancelBooking:
    "Cancel Booking",

  bookingCreated:
    "Booking created successfully",
},

bookingSuccess: {
  title:
    "Booking Requested",

  description:
    "Your booking request has been sent successfully to the service provider.",

  bookingId:
    "Booking ID",

  nextStep:
    "The provider can now review your request. You can follow the booking status from My Bookings.",

  viewBookings:
    "View My Bookings",

  backHome:
    "Back to Home",
},
      // ================================
      // PROVIDER
      // ================================

      provider: {
        dashboard:
          "Provider Dashboard",

        manageBookings:
          "Manage your bookings",

        overview:
          "Overview",

        new:
          "New",

        active:
          "Active",

        completed:
          "Completed",

        total:
          "Total",

        newRequests:
          "New Requests",

        activeJobs:
          "Active Jobs",

        noNewRequests:
          "No new requests",

        noNewRequestsDescription:
          "New customer bookings will appear here.",

        noActiveJobs:
          "No active jobs right now.",

        accept:
          "Accept",

        reject:
          "Reject",

        onMyWay:
          "On My Way",

        startJob:
          "Start Job",

        completeJob:
          "Complete Job",

        customerNotes:
          "Customer Notes",

        workingHours:
          "Working Hours",

        servicesPrices:
          "Services & Prices",
      },


      providerProfile: {
  title:
    "Provider Profile",

  loading:
    "Loading provider...",

  loadError:
    "Couldn't load provider",

  loadErrorDescription:
    "Something went wrong while loading this provider.",

  yearsExperience:
    "Years Experience",

  services:
    "Services",

  about:
    "About",

  defaultBio:
    "Professional home service provider.",

  noServices:
    "No services available",

  startingPrice:
    "Starting price",

  workingHours:
    "Working Hours",

  weeklyAvailability:
    "Provider weekly availability",

  noWorkingHours:
    "No working hours available",

  closed:
    "Closed",

  bookProvider:
    "Book Provider",
},


      // ================================
      // ADMIN
      // ================================

      admin: {
        panel:
          "Admin Panel",

        providerApplications:
          "Provider Applications",

        pendingApplications:
          "Pending Applications",

        reviewProviderRequests:
          "Review provider requests",

        viewApplication:
          "View Application",

        approve:
          "Approve Provider",

        reject:
          "Reject Application",

        rejectionReason:
          "Rejection Reason",

        noApplications:
          "No pending applications",
      },


      // ================================
      // STATUS
      // ================================

      status: {
        pending:
          "Pending",

        confirmed:
          "Confirmed",

        onTheWay:
          "On The Way",

        inProgress:
          "In Progress",

        completed:
          "Completed",

        cancelled:
          "Cancelled",
      },
      db: {
        categories: {
            plumbing: {
            name: "Plumbing",
            description:
                "Plumbing repair and installation services",
            },

            cleaning: {
            name: "Cleaning",
            description:
                "Professional home cleaning services",
            },

            carpentry: {
            name: "Carpentry",
            description:
                "Carpentry and furniture repair services",
            },

            electrical: {
            name: "Electrical",
            description:
                "Electrical repair and installation services",
            },

            "ac-repair": {
        name: "AC Repair",
        description:
            "Air conditioning repair and maintenance",
        },

        painting: {
        name: "Painting",
        description:
            "Home painting and decoration services",
        },

        "home-salon": {
        name: "Home Salon",
        description:
            "Personal care services at home",
        },
        },
        services: {
            // =====================================
            // CLEANING
            // =====================================

            "standard-home-cleaning": {
            name: "Standard Home Cleaning",
            description:
                "General cleaning for bedrooms, living rooms, kitchens and bathrooms.",
            },

            "deep-cleaning": {
            name: "Deep Cleaning",
            description:
                "Detailed deep cleaning for your entire home.",
            },

            "sofa-cleaning": {
            name: "Sofa Cleaning",
            description:
                "Professional sofa and upholstery cleaning.",
            },


            // =====================================
            // PLUMBING
            // =====================================

            "water-leak-repair": {
            name: "Water Leak Repair",
            description:
                "Detect and repair water leaks around your home.",
            },

            "faucet-repair": {
            name: "Faucet Repair",
            description:
                "Repair or replace damaged faucets.",
            },

            "drain-cleaning": {
            name: "Drain Cleaning",
            description:
                "Clear blocked sinks and drainage systems.",
            },


            // =====================================
            // ELECTRICAL
            // =====================================

            "light-installation": {
            name: "Light Installation",
            description:
                "Install ceiling lights, lamps and lighting fixtures.",
            },

            "socket-repair": {
            name: "Socket Repair",
            description:
                "Repair or replace electrical sockets.",
            },

            "electrical-inspection": {
            name: "Electrical Inspection",
            description:
                "Inspect home electrical systems and identify problems.",
            },


            // =====================================
            // CARPENTRY
            // =====================================

            "door-repair": {
            name: "Door Repair",
            description:
                "Repair wooden doors, hinges and frames.",
            },

            "furniture-repair": {
            name: "Furniture Repair",
            description:
                "Repair damaged home furniture.",
            },

            "furniture-assembly": {
            name: "Furniture Assembly",
            description:
                "Professional furniture assembly service.",
            },


            // =====================================
            // AC
            // =====================================

            "ac-maintenance": {
            name: "AC Maintenance",
            description:
                "General air conditioning maintenance.",
            },

            "ac-cleaning": {
            name: "AC Cleaning",
            description:
                "Clean air conditioning units and filters.",
            },

            "air-conditioner-repair": {
            name: "AC Repair",
            description:
                "Diagnose and repair air conditioning problems.",
            },


            // =====================================
            // PAINTING
            // =====================================

            "interior-painting": {
            name: "Interior Painting",
            description:
                "Professional painting for rooms and interior walls.",
            },

            "exterior-painting": {
            name: "Exterior Painting",
            description:
                "Exterior home and wall painting service.",
            },

            "wall-touch-up": {
            name: "Wall Touch Up",
            description:
                "Small paint repairs and wall touch-ups.",
            },


            // =====================================
            // HOME SALON
            // =====================================

            "home-haircut": {
            name: "Haircut",
            description:
                "Professional haircut service at home.",
            },

            "hair-styling": {
            name: "Hair Styling",
            description:
                "Professional hair styling at home.",
            },

            "home-beauty-service": {
            name: "Beauty Service",
            description:
                "Personal beauty and care service at home.",
            },
        },
    },

    serviceDetails: {
  title:
    "Service Details",

  loading:
    "Loading service...",

  loadError:
    "Couldn't load service",

  loadErrorDescription:
    "Something went wrong while loading this service.",

  defaultDescription:
    "Professional home service provided by trusted service providers.",

  about:
    "About this service",

  information:
    "Service Information",

  category:
    "Category",

  status:
    "Status",

  available:
    "Available",

  availableProviders:
    "Available Providers",

  chooseProvider:
    "Choose a provider for this service",

  loadingProviders:
    "Loading providers...",

  providersLoadError:
    "Couldn't load providers.",

  noProviders:
    "No providers available",

  noProvidersDescription:
    "There are currently no providers available for this service.",

  price:
    "Price",

  experienceYears:
    "{{count}} year experience",

  experienceYears_other:
    "{{count}} years experience",

  verified:
    "Verified",

  viewProvider:
    "View Provider",
},

weekdays: {
  sunday: "Sunday",
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
},
    },
  },


  // ========================================
  // ARABIC
  // ========================================

  ar: {
    translation: {

weekdays: {
  sunday: "الأحد",
  monday: "الإثنين",
  tuesday: "الثلاثاء",
  wednesday: "الأربعاء",
  thursday: "الخميس",
  friday: "الجمعة",
  saturday: "السبت",
},        
      common: {
        save: "حفظ",
        cancel: "إلغاء",
        confirm: "تأكيد",
        loading: "جاري التحميل...",
        error: "حدث خطأ",
        retry: "إعادة المحاولة",
        yes: "نعم",
        no: "لا",
        close: "إغلاق",
        back: "رجوع",
      },


      tabs: {
        home: "الرئيسية",
        categories: "الفئات",
        bookings: "الحجوزات",
        profile: "الملف الشخصي",
      },


     profile: {
  title: "الملف الشخصي",

  account: "الحساب",

  name: "الاسم",

  email:
    "البريد الإلكتروني",

  userFallback:
    "المستخدم",

  notProvided:
    "غير متوفر",

  language:
    "اللغة",

  english:
    "English",

  arabic:
    "العربية",

  logout:
    "تسجيل الخروج",

  adminPanel:
    "لوحة الإدارة",

  adminDescription:
    "مراجعة طلبات مقدمي الخدمات",

  providerDashboard:
    "لوحة مقدم الخدمة",

  providerDescription:
    "إدارة الحجوزات والأعمال",

  becomeProvider:
    "أصبح مقدم خدمة",

  becomeProviderDescription:
    "قدّم خدماتك واستقبل الحجوزات",

  continueApplication:
    "متابعة طلب مقدم الخدمة",

  continueApplicationDescription:
    "أكمل بيانات طلب مقدم الخدمة",

  applicationPending:
    "طلب مقدم الخدمة قيد المراجعة",

  applicationPendingDescription:
    "طلبك قيد المراجعة حاليًا",

  applicationRejected:
    "تم رفض طلب مقدم الخدمة",

  applicationRejectedDescription:
    "راجع سبب الرفض وعدّل الطلب ثم أرسله مجددًا",
},


      home: {
  title:
    "خدمات المنزل",

  welcome:
    "مرحباً",

  heroTitle:
    "خدمات موثوقة لمنزلك",

  heroDescription:
    "اعثر على مقدمي خدمات محترفين، قارن الخدمات واحجز الشخص المناسب لاحتياجاتك.",

  browseServices:
    "تصفح الخدمات",

  categories:
    "الفئات الشائعة",

  categoriesDescription:
    "ما الخدمة التي تحتاجها؟",

  viewAll:
    "عرض الكل",

  servicesCount:
    "{{count}} خدمة",

  servicesCount_other:
    "{{count}} خدمات",

  howItWorks:
    "كيف يعمل التطبيق؟",

  step1Title:
    "اختر الخدمة",

  step1Description:
    "تصفح الفئات واختر الخدمة التي تحتاجها.",

  step2Title:
    "اختر مقدم الخدمة",

  step2Description:
    "قارن مقدمي الخدمات والأسعار ومواعيد العمل.",

  step3Title:
    "احجز موعدك",

  step3Description:
    "اختر التاريخ والوقت المناسبين ثم أكد الحجز.",
},


      categories: {
  title:
    "الفئات",

  allCategories:
    "جميع الفئات",

  subtitle:
    "اعثر على الخدمة التي تحتاجها",

  loading:
    "جاري تحميل الفئات...",

  loadError:
    "تعذر تحميل الفئات، حاول مرة أخرى.",

  noCategories:
    "لا توجد فئات",

  emptyDescription:
    "ستظهر الفئات المتاحة هنا.",

  service:
    "خدمة",

  services:
    "خدمات",
},


      services: {
  title:
    "الخدمات",

  providers:
    "مقدمو الخدمات",

  startingFrom:
    "ابتداءً من",

  loading:
    "جاري تحميل الخدمات...",

  loadError:
    "تعذر تحميل الخدمات",

  availableServices:
    "الخدمات المتاحة",

  availableCount:
    "{{count}} خدمة متاحة",

  availableCount_other:
    "{{count}} خدمات متاحة",

  noServices:
    "لا توجد خدمات بعد",

  emptyDescription:
    "لا توجد خدمات متاحة ضمن هذه الفئة.",
},

serviceDetails: {
  title:
    "تفاصيل الخدمة",

  loading:
    "جاري تحميل الخدمة...",

  loadError:
    "تعذر تحميل الخدمة",

  loadErrorDescription:
    "حدث خطأ أثناء تحميل بيانات هذه الخدمة.",

  defaultDescription:
    "خدمة منزلية احترافية يقدمها مقدمو خدمات موثوقون.",

  about:
    "عن هذه الخدمة",

  information:
    "معلومات الخدمة",

  category:
    "الفئة",

  status:
    "الحالة",

  available:
    "متاحة",

  availableProviders:
    "مقدمو الخدمة المتاحون",

  chooseProvider:
    "اختر مقدم الخدمة المناسب",

  loadingProviders:
    "جاري تحميل مقدمي الخدمات...",

  providersLoadError:
    "تعذر تحميل مقدمي الخدمات.",

  noProviders:
    "لا يوجد مقدمو خدمة متاحون",

  noProvidersDescription:
    "لا يوجد حاليًا مقدمو خدمة متاحون لهذه الخدمة.",

  price:
    "السعر",

  experienceYears:
    "سنة خبرة واحدة",

  experienceYears_other:
    "{{count}} سنوات خبرة",

  verified:
    "موثّق",

  viewProvider:
    "عرض مقدم الخدمة",
},


    booking: {
  title:
    "حجز الخدمة",

  loading:
    "جاري تحميل بيانات الحجز...",

  loadError:
    "تعذر تحميل الحجز",

  loadErrorDescription:
    "حدث خطأ أثناء تحميل معلومات الحجز.",

  goBack:
    "رجوع",

  bookNow:
    "احجز الآن",

  chooseService:
    "اختر الخدمة",

  selectDate:
    "اختر التاريخ",

  selectTime:
    "اختر الوقت",

  noAvailableDates:
    "لا توجد مواعيد متاحة خلال الأيام الـ14 القادمة.",

  noAvailableTimes:
    "لا توجد أوقات متاحة في هذا اليوم.",

  serviceAddress:
    "عنوان تقديم الخدمة",

  address:
    "العنوان",

  addressPlaceholder:
    "أدخل عنوانك",

  notes:
    "ملاحظات",

  notesPlaceholder:
    "صف المشكلة أو أضف أي ملاحظات...",

  price:
    "السعر",

  summary:
    "ملخص الحجز",

  service:
    "الخدمة",

  date:
    "التاريخ",

  time:
    "الوقت",

  total:
    "الإجمالي",

  confirmBooking:
    "تأكيد الحجز",

  submitting:
    "جاري تأكيد الحجز...",

  submitError:
    "تعذر إنشاء الحجز، حاول مرة أخرى.",

  myBookings:
    "حجوزاتي",

  bookingDetails:
    "تفاصيل الحجز",

  cancelBooking:
    "إلغاء الحجز",

  bookingCreated:
    "تم إنشاء الحجز بنجاح",
},

bookingSuccess: {
  title:
    "تم إرسال طلب الحجز",

  description:
    "تم إرسال طلب الحجز بنجاح إلى مقدم الخدمة.",

  bookingId:
    "رقم الحجز",

  nextStep:
    "يمكن لمقدم الخدمة الآن مراجعة طلبك، ويمكنك متابعة حالة الحجز من صفحة حجوزاتي.",

  viewBookings:
    "عرض حجوزاتي",

  backHome:
    "العودة للرئيسية",
},


      provider: {
        dashboard:
          "لوحة مقدم الخدمة",

        manageBookings:
          "إدارة الحجوزات الخاصة بك",

        overview:
          "نظرة عامة",

        new:
          "جديد",

        active:
          "نشط",

        completed:
          "مكتمل",

        total:
          "الإجمالي",

        newRequests:
          "الطلبات الجديدة",

        activeJobs:
          "الأعمال الحالية",

        noNewRequests:
          "لا توجد طلبات جديدة",

        noNewRequestsDescription:
          "ستظهر حجوزات العملاء الجديدة هنا.",

        noActiveJobs:
          "لا توجد أعمال حالية.",

        accept:
          "قبول",

        reject:
          "رفض",

        onMyWay:
          "في الطريق",

        startJob:
          "بدء العمل",

        completeJob:
          "إنهاء العمل",

        customerNotes:
          "ملاحظات العميل",

        workingHours:
          "ساعات العمل",

        servicesPrices:
          "الخدمات والأسعار",
      },

      providerProfile: {
  title:
    "الملف الشخصي لمقدم الخدمة",

  loading:
    "جاري تحميل مقدم الخدمة...",

  loadError:
    "تعذر تحميل مقدم الخدمة",

  loadErrorDescription:
    "حدث خطأ أثناء تحميل بيانات مقدم الخدمة.",

  yearsExperience:
    "سنوات الخبرة",

  services:
    "الخدمات",

  about:
    "نبذة عن مقدم الخدمة",

  defaultBio:
    "مقدم خدمات منزلية محترف.",

  noServices:
    "لا توجد خدمات متاحة",

  startingPrice:
    "السعر يبدأ من",

  workingHours:
    "ساعات العمل",

  weeklyAvailability:
    "مواعيد العمل الأسبوعية",

  noWorkingHours:
    "لا توجد ساعات عمل متاحة",

  closed:
    "مغلق",

  bookProvider:
    "احجز مقدم الخدمة",
},


      admin: {
        panel:
          "لوحة الإدارة",

        providerApplications:
          "طلبات مقدمي الخدمات",

        pendingApplications:
          "الطلبات قيد المراجعة",

        reviewProviderRequests:
          "مراجعة طلبات مقدمي الخدمات",

        viewApplication:
          "عرض الطلب",

        approve:
          "الموافقة على مقدم الخدمة",

        reject:
          "رفض الطلب",

        rejectionReason:
          "سبب الرفض",

        noApplications:
          "لا توجد طلبات معلقة",
      },


      status: {
        pending:
          "قيد الانتظار",

        confirmed:
          "مؤكد",

        onTheWay:
          "في الطريق",

        inProgress:
          "قيد التنفيذ",

        completed:
          "مكتمل",

        cancelled:
          "ملغي",
      },

      db: {
  categories: {
    plumbing: {
      name: "السباكة",
      description:
        "خدمات إصلاح وتركيب أعمال السباكة",
    },

    cleaning: {
      name: "التنظيف",
      description:
        "خدمات تنظيف منزلية احترافية",
    },

    carpentry: {
      name: "النجارة",
      description:
        "خدمات النجارة وإصلاح الأثاث",
    },

    electrical: {
      name: "الكهرباء",
      description:
        "خدمات إصلاح وتركيب الأعمال الكهربائية",
    },

    "ac-repair": {
  name: "صيانة المكيفات",
  description:
    "خدمات صيانة وإصلاح أجهزة التكييف",
},

painting: {
  name: "الدهان",
  description:
    "خدمات دهان وديكور المنازل",
},

"home-salon": {
  name: "صالون منزلي",
  description:
    "خدمات العناية الشخصية في المنزل",
},
  },


  services: {
    // =====================================
    // التنظيف
    // =====================================

    "standard-home-cleaning": {
      name: "تنظيف منزلي عادي",
      description:
        "تنظيف عام لغرف النوم وغرف المعيشة والمطابخ والحمامات.",
    },

    "deep-cleaning": {
      name: "تنظيف عميق",
      description:
        "تنظيف عميق ومفصل لجميع أجزاء المنزل.",
    },

    "sofa-cleaning": {
      name: "تنظيف الكنب",
      description:
        "تنظيف احترافي للكنب والمفروشات.",
    },


    // =====================================
    // السباكة
    // =====================================

    "water-leak-repair": {
      name: "إصلاح تسرب المياه",
      description:
        "كشف وإصلاح تسربات المياه في المنزل.",
    },

    "faucet-repair": {
      name: "إصلاح الحنفيات",
      description:
        "إصلاح أو استبدال الحنفيات التالفة.",
    },

    "drain-cleaning": {
      name: "تسليك المصارف",
      description:
        "تسليك الأحواض والمصارف المسدودة.",
    },


    // =====================================
    // الكهرباء
    // =====================================

    "light-installation": {
      name: "تركيب الإنارة",
      description:
        "تركيب إنارة السقف والمصابيح ووحدات الإضاءة.",
    },

    "socket-repair": {
      name: "إصلاح المقابس الكهربائية",
      description:
        "إصلاح أو استبدال المقابس الكهربائية.",
    },

    "electrical-inspection": {
      name: "فحص التمديدات الكهربائية",
      description:
        "فحص أنظمة الكهرباء المنزلية وتحديد الأعطال.",
    },


    // =====================================
    // النجارة
    // =====================================

    "door-repair": {
      name: "إصلاح الأبواب",
      description:
        "إصلاح الأبواب الخشبية والمفصلات والإطارات.",
    },

    "furniture-repair": {
      name: "إصلاح الأثاث",
      description:
        "إصلاح الأثاث المنزلي التالف.",
    },

    "furniture-assembly": {
      name: "تركيب الأثاث",
      description:
        "خدمة احترافية لتركيب وتجميع الأثاث.",
    },


    // =====================================
    // المكيفات
    // =====================================

    "ac-maintenance": {
      name: "صيانة المكيفات",
      description:
        "صيانة عامة لأجهزة التكييف.",
    },

    "ac-cleaning": {
      name: "تنظيف المكيفات",
      description:
        "تنظيف وحدات التكييف والفلاتر.",
    },

    "air-conditioner-repair": {
      name: "إصلاح المكيفات",
      description:
        "تشخيص وإصلاح أعطال أجهزة التكييف.",
    },


    // =====================================
    // الدهان
    // =====================================

    "interior-painting": {
      name: "دهان داخلي",
      description:
        "دهان احترافي للغرف والجدران الداخلية.",
    },

    "exterior-painting": {
      name: "دهان خارجي",
      description:
        "خدمات دهان واجهات وجدران المنزل الخارجية.",
    },

    "wall-touch-up": {
      name: "ترميم دهان الجدران",
      description:
        "إصلاحات بسيطة للدهان ومعالجة آثار الجدران.",
    },


    // =====================================
    // الصالون المنزلي
    // =====================================

    "home-haircut": {
      name: "قص الشعر",
      description:
        "خدمة قص شعر احترافية في المنزل.",
    },

    "hair-styling": {
      name: "تصفيف الشعر",
      description:
        "خدمة تصفيف شعر احترافية في المنزل.",
    },

    "home-beauty-service": {
      name: "خدمات التجميل والعناية",
      description:
        "خدمات التجميل والعناية الشخصية في المنزل.",
    },
  },


        },
    },
  },
};


// ========================================
// DEFAULT LANGUAGE
// ========================================

const deviceLanguage =
  Localization
    .getLocales()[0]
    ?.languageCode;

const defaultLanguage:
  AppLanguage =
  deviceLanguage === "ar"
    ? "ar"
    : "en";


// ========================================
// INIT
// ========================================

i18n
  .use(initReactI18next)
  .init({
    resources,

    lng:
      defaultLanguage,

    fallbackLng:
      "en",

    interpolation: {
      escapeValue:
        false,
    },

    react: {
      useSuspense:
        false,
    },
  });


// ========================================
// LOAD SAVED LANGUAGE
// ========================================

export const loadSavedLanguage =
  async () => {
    try {
      const saved =
        await AsyncStorage.getItem(
          LANGUAGE_KEY
        );

      if (
        saved === "ar" ||
        saved === "en"
      ) {
        await i18n.changeLanguage(
          saved
        );

        return saved;
      }

      return defaultLanguage;

    } catch (error) {
      console.error(
        "LOAD LANGUAGE ERROR:",
        error
      );

      return defaultLanguage;
    }
  };


// ========================================
// CHANGE LANGUAGE
// ========================================

export const changeAppLanguage =
  async (
    language:
      AppLanguage
  ) => {
    await AsyncStorage.setItem(
      LANGUAGE_KEY,
      language
    );

    await i18n.changeLanguage(
      language
    );
  };


export const isArabic =
  () =>
    i18n.language === "ar";


export default i18n;
import {
  useAuth,
} from "@clerk/expo";

import {
  Redirect,
} from "expo-router";

import {
  NativeTabs,
} from "expo-router/unstable-native-tabs";

import {
  useColorScheme,
} from "nativewind";

import {
  useTranslation,
} from "react-i18next";


// ========================================
// TABS LAYOUT
// ========================================

export default function TabsLayout() {
  const {
    isSignedIn,
    isLoaded,
  } = useAuth();

  const {
    colorScheme,
  } = useColorScheme();

  const {
    t,
  } = useTranslation();


  // ========================================
  // COLORS
  // ========================================

  const isDark =
    colorScheme === "dark";

  const tabTintColor =
    isDark
      ? "hsl(142 70% 54%)"
      : "hsl(147 75% 33%)";


  // ========================================
  // AUTH LOADING
  // ========================================

  if (!isLoaded) {
    return null;
  }


  // ========================================
  // NOT SIGNED IN
  // ========================================

  if (!isSignedIn) {
    return (
      <Redirect
        href="/(auth)/sign-in"
      />
    );
  }


  // ========================================
  // TABS
  // ========================================

  return (
    <NativeTabs
      tintColor={
        tabTintColor
      }
    >

      {/* HOME */}

      <NativeTabs.Trigger
        name="index"
      >
        <NativeTabs.Trigger.Icon
          sf={{
            default:
              "house",

            selected:
              "house.fill",
          }}
          md="home"
        />

        <NativeTabs.Trigger.Label>
          {t(
            "tabs.home"
          )}
        </NativeTabs.Trigger.Label>

      </NativeTabs.Trigger>


      {/* CATEGORIES */}

      <NativeTabs.Trigger
        name="categories"
      >
        <NativeTabs.Trigger.Icon
          sf={{
            default:
              "square.grid.2x2",

            selected:
              "square.grid.2x2.fill",
          }}
          md="category"
        />

        <NativeTabs.Trigger.Label>
          {t(
            "tabs.categories"
          )}
        </NativeTabs.Trigger.Label>

      </NativeTabs.Trigger>


      {/* BOOKINGS */}

      <NativeTabs.Trigger
        name="bookings"
      >
        <NativeTabs.Trigger.Icon
          sf={{
            default:
              "calendar",

            selected:
              "calendar.circle.fill",
          }}
          md="event"
        />

        <NativeTabs.Trigger.Label>
          {t(
            "tabs.bookings"
          )}
        </NativeTabs.Trigger.Label>

      </NativeTabs.Trigger>


      {/* PROFILE */}

      <NativeTabs.Trigger
        name="profile"
      >
        <NativeTabs.Trigger.Icon
          sf={{
            default:
              "person",

            selected:
              "person.fill",
          }}
          md="person"
        />

        <NativeTabs.Trigger.Label>
          {t(
            "tabs.profile"
          )}
        </NativeTabs.Trigger.Label>

      </NativeTabs.Trigger>

    </NativeTabs>
  );
}
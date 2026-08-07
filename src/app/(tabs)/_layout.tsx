// عشان البار الي تحت 
import { useAuth } from "@clerk/expo";
import { Redirect } from "expo-router";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { useColorScheme } from "nativewind";
import { useEffect } from "react";

export default function TabsLayout() {
  const { isSignedIn, isLoaded } = useAuth();



  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const tabTintColor = isDark ? "hsl(142 70% 54%)" : "hsl(147 75% 33%)";

  useEffect(() => {
  
  }, []);

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
     <NativeTabs tintColor={tabTintColor}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon
          sf={{
            default: "house",
            selected: "house.fill",
          }}
          md="home"
        />
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="categories">
        <NativeTabs.Trigger.Icon
          sf={{
            default: "square.grid.2x2",
            selected: "square.grid.2x2.fill",
          }}
          md="category"
        />
        <NativeTabs.Trigger.Label>Categories</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="bookings">
        <NativeTabs.Trigger.Icon
          sf={{
            default: "calendar",
            selected: "calendar.circle.fill",
          }}
          md="event"
        />
        <NativeTabs.Trigger.Label>Bookings</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Icon
          sf={{
            default: "person",
            selected: "person.fill",
          }}
          md="person"
        />
        <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
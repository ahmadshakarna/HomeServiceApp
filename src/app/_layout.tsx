import "@/lib/i18n";

import { ClerkProvider } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import { Stack } from "expo-router";
import "../../global.css"
import {
  useEffect,
} from "react";

import {
  loadSavedLanguage,
} from "@/lib/i18n";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!

if (!publishableKey) {
  throw new Error('Add your Clerk Publishable Key to the .env file')
}
export default function RootLayout() {
  useEffect(() => {
  loadSavedLanguage();
}, []);
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <Stack screenOptions={{ headerShown: false }} />
    </ClerkProvider>
  );
}

// todo : explain the code
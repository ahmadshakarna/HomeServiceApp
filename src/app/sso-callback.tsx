import {
  useAuth,
} from "@clerk/expo";

import {
  router,
} from "expo-router";

import React, {
  useEffect,
} from "react";

import {
  ActivityIndicator,
  Text,
  View,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";


export default function SSOCallbackScreen() {
  const {
    isLoaded,
    isSignedIn,
  } = useAuth();


  useEffect(() => {
    if (!isLoaded) {
      return;
    }


    if (isSignedIn) {
      router.replace(
        "/"
      );
    }

  }, [
    isLoaded,
    isSignedIn,
  ]);


  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
      <View className="flex-1 items-center justify-center">

        <ActivityIndicator
          size="large"
          color="#2563EB"
        />


        <Text className="mt-4 text-sm text-[#64748B]">
          جاري تسجيل الدخول...
        </Text>

      </View>
    </SafeAreaView>
  );
}
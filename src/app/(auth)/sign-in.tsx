import useSocialAuth from "@/hooks/useSocialAuth";
import { useSignIn } from "@clerk/expo";
import { Image } from "expo-image";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignInScreen() {
  const { handleSocialAuth, loadingStrategy } = useSocialAuth();
  const { signIn, fetchStatus } = useSignIn();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [code, setCode] = useState("");
  const [verificationStep, setVerificationStep] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const isGoogleClicked = loadingStrategy === "oauth_google";
  const isAppleClicked = loadingStrategy === "oauth_apple";

  const isSocialLoading =
    isGoogleClicked || isAppleClicked;

  const isPhoneLoading = fetchStatus === "fetching";

  // إرسال SMS
  const handlePhoneLogin = async () => {
    if (!phoneNumber.trim()) {
      setErrorMessage("Please enter your phone number.");
      return;
    }

    try {
      setErrorMessage("");

      const { error } = await signIn.create({
        identifier: phoneNumber.trim(),
      });

      if (error) {
        console.log(JSON.stringify(error, null, 2));
        setErrorMessage("Could not continue with this phone number.");
        return;
      }

      const { error: codeError } =
        await signIn.phoneCode.sendCode({
          phoneNumber: phoneNumber.trim(),
        });

      if (codeError) {
        console.log(JSON.stringify(codeError, null, 2));
        setErrorMessage("Could not send verification code.");
        return;
      }

      setVerificationStep(true);
    } catch (error) {
      console.error("PHONE LOGIN ERROR:", error);
      setErrorMessage("Something went wrong.");
    }
  };

  // التحقق من OTP
  const handleVerifyCode = async () => {
    if (!code.trim()) {
      setErrorMessage("Enter the verification code.");
      return;
    }

    try {
      setErrorMessage("");

      const { error } =
        await signIn.phoneCode.verifyCode({
          code: code.trim(),
        });

      if (error) {
        console.log(JSON.stringify(error, null, 2));
        setErrorMessage("Invalid verification code.");
        return;
      }

      if (signIn.status === "complete") {
        await signIn.finalize();
      }
    } catch (error) {
      console.error("VERIFY ERROR:", error);
      setErrorMessage("Could not verify the code.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
      <View className="flex-1 px-6">

        {/* Logo */}
        <View className="items-center pt-12">
          <View className="h-20 w-20 items-center justify-center rounded-[24px] bg-[#2563EB]">
            <Text className="text-4xl font-black text-white">
              C
            </Text>
          </View>

          <Text className="mt-3 text-xl font-extrabold tracking-[3px] text-[#2563EB]">
            CRAFT
          </Text>
        </View>

        {/* Heading */}
        <View className="mt-9">
          <Text className="text-center text-3xl font-bold text-[#0F172A]">
            {verificationStep
              ? "Verify your number"
              : "Welcome Back"}
          </Text>

          <Text className="mx-6 mt-2 text-center text-[15px] leading-6 text-[#64748B]">
            {verificationStep
              ? `We sent a verification code to ${phoneNumber}`
              : "Book trusted home services in just a few taps."}
          </Text>
        </View>

        {!verificationStep ? (
          <>
            {/* Phone */}
            <View className="mt-9">
              <Text className="mb-2 text-sm font-semibold text-[#334155]">
                Phone number
              </Text>

              <View className="h-14 flex-row items-center rounded-2xl border border-[#E2E8F0] bg-white px-4">
                <Text className="mr-3 border-r border-[#E2E8F0] pr-3 text-base font-semibold text-[#0F172A]">
                  +962
                </Text>

                <TextInput
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                  placeholder="790000000"
                  placeholderTextColor="#94A3B8"
                  className="flex-1 text-base text-[#0F172A]"
                />
              </View>

              {errorMessage ? (
                <Text className="mt-2 text-sm text-red-500">
                  {errorMessage}
                </Text>
              ) : null}
            </View>

            {/* Continue */}
            <Pressable
              onPress={handlePhoneLogin}
              disabled={isPhoneLoading}
              className={`mt-4 h-14 items-center justify-center rounded-2xl bg-[#2563EB] ${
                isPhoneLoading ? "opacity-60" : ""
              }`}
            >
              {isPhoneLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-base font-bold text-white">
                  Continue
                </Text>
              )}
            </Pressable>

            {/* Divider */}
            <View className="my-7 flex-row items-center">
              <View className="h-[1px] flex-1 bg-[#E2E8F0]" />

              <Text className="mx-4 text-sm text-[#94A3B8]">
                Or continue with
              </Text>

              <View className="h-[1px] flex-1 bg-[#E2E8F0]" />
            </View>

            {/* Google */}
            <Pressable
              disabled={isSocialLoading}
              onPress={() =>
                handleSocialAuth("oauth_google")
              }
              className="h-14 flex-row items-center rounded-2xl border border-[#E2E8F0] bg-white px-5 active:opacity-70"
            >
              <Image
                source={require("../../../assets/images/google.png")}
                style={{
                  width: 22,
                  height: 22,
                }}
              />

              <Text className="flex-1 text-center text-base font-semibold text-[#0F172A]">
                {isGoogleClicked
                  ? "Connecting..."
                  : "Continue with Google"}
              </Text>

              <View className="w-[22px]" />
            </Pressable>

            {/* Apple */}
            <Pressable
              disabled={isSocialLoading}
              onPress={() =>
                handleSocialAuth("oauth_apple")
              }
              className="mt-3 h-14 flex-row items-center rounded-2xl border border-[#E2E8F0] bg-white px-5 active:opacity-70"
            >
              <Text className="w-[22px] text-2xl text-black">
                
              </Text>

              <Text className="flex-1 text-center text-base font-semibold text-[#0F172A]">
                {isAppleClicked
                  ? "Connecting..."
                  : "Continue with Apple"}
              </Text>

              <View className="w-[22px]" />
            </Pressable>
          </>
        ) : (
          <>
            {/* OTP */}
            <View className="mt-10">
              <Text className="mb-2 text-sm font-semibold text-[#334155]">
                Verification code
              </Text>

              <TextInput
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                maxLength={6}
                placeholder="Enter code"
                placeholderTextColor="#94A3B8"
                className="h-14 rounded-2xl border border-[#E2E8F0] bg-white px-5 text-center text-xl font-bold tracking-[8px] text-[#0F172A]"
              />

              {errorMessage ? (
                <Text className="mt-2 text-sm text-red-500">
                  {errorMessage}
                </Text>
              ) : null}
            </View>

            <Pressable
              onPress={handleVerifyCode}
              disabled={isPhoneLoading}
              className="mt-4 h-14 items-center justify-center rounded-2xl bg-[#2563EB]"
            >
              {isPhoneLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-base font-bold text-white">
                  Verify & Continue
                </Text>
              )}
            </Pressable>

            <Pressable
              onPress={() => {
                signIn.reset();
                setVerificationStep(false);
                setCode("");
                setErrorMessage("");
              }}
              className="mt-5 items-center"
            >
              <Text className="font-semibold text-[#2563EB]">
                Change phone number
              </Text>
            </Pressable>
          </>
        )}

        <Text className="mt-auto pb-5 text-center text-xs leading-5 text-[#94A3B8]">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </Text>
      </View>
    </SafeAreaView>
  );
}
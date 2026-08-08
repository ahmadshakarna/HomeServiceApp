import { useClerk,useAuth, useUser } from "@clerk/expo";
import { Image, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  useEffect,
  useRef,
  useState,
} from "react";
export default function ProfileScreen() {
  const { user } = useUser();
  const { signOut } = useClerk();
const {
  getToken,
  isLoaded,
  userId,
} = useAuth();

const accessCheckedForUser =
  useRef<string | null>(
    null
  );

useEffect(() => {
  if (
    !isLoaded ||
    !userId
  ) {
    return;
  }

  if (
    accessCheckedForUser.current ===
    userId
  ) {
    return;
  }

  accessCheckedForUser.current =
    userId;

  const loadAccess =
    async () => {
      try {
        const token =
          await getToken();

        if (!token) {
          return;
        }

        // =================================
        // ADMIN
        // =================================

        const adminResponse =
          await fetch(
            "/api/admin/me",
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const adminData =
          await adminResponse.json();

        setIsAdmin(
          adminData.isAdmin ===
            true
        );


        // =================================
        // PROVIDER STATUS
        // =================================

        const providerResponse =
          await fetch(
            "/api/provider-application",
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const providerData =
          await providerResponse.json();

        if (
          providerResponse.ok &&
          providerData.application
        ) {
          setProviderStatus(
            providerData
              .application
              .approvalStatus
          );
        } else {
          setProviderStatus(
            null
          );
        }

      } catch (error) {
        console.error(
          "LOAD PROFILE ACCESS ERROR:",
          error
        );

        setIsAdmin(false);
        setProviderStatus(null);

        accessCheckedForUser.current =
          null;
      }
    };

  loadAccess();

}, [
  isLoaded,
  userId,
  getToken,
]);

const [
  isAdmin,
  setIsAdmin,
] = useState(false);

const [
  providerStatus,
  setProviderStatus,
] = useState<
  | "draft"
  | "pending"
  | "approved"
  | "rejected"
  | null
>(null);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-5 pt-6">

        {/* Title */}
        <Text className="text-3xl font-bold text-foreground">
          Profile
        </Text>

        {/* User Card */}
        <View className="mt-8 items-center rounded-3xl bg-card p-6">
          
          <Image
            source={{ uri: user?.imageUrl }}
            className="h-24 w-24 rounded-full"
          />

          <Text className="mt-4 text-xl font-bold text-card-foreground">
            {user?.fullName || "User"}
          </Text>

          <Text className="mt-1 text-sm text-muted-foreground">
            {user?.primaryEmailAddress?.emailAddress}
          </Text>
        </View>

        {/* Account info */}
        <View className="mt-6 rounded-2xl bg-card p-5">
          <Text className="text-sm text-muted-foreground">
            Account
          </Text>

          <View className="mt-4">
            <Text className="text-xs text-muted-foreground">
              Name
            </Text>

            <Text className="mt-1 text-base font-medium text-foreground">
              {user?.fullName || "Not provided"}
            </Text>
          </View>

          <View className="mt-4">
            <Text className="text-xs text-muted-foreground">
              Email
            </Text>

            <Text className="mt-1 text-base font-medium text-foreground">
              {user?.primaryEmailAddress?.emailAddress || "Not provided"}
            </Text>
          </View>
        </View>
       {/* Provider */}

        {providerStatus !==
"approved" ? (
  <Pressable
    onPress={() => {
      router.push(
        "/become-provider"
      );
    }}
    className="mt-6 flex-row items-center rounded-2xl bg-[#EFF6FF] p-5 active:opacity-80"
  >

    <View className="h-12 w-12 items-center justify-center rounded-xl bg-white">

      <Ionicons
        name={
          providerStatus ===
          "pending"
            ? "time-outline"
            : providerStatus ===
              "rejected"
            ? "alert-circle-outline"
            : "briefcase-outline"
        }
        size={24}
        color={
          providerStatus ===
          "rejected"
            ? "#DC2626"
            : "#2563EB"
        }
      />

    </View>


    <View className="ml-4 flex-1">

      <Text className="text-base font-bold text-[#0F172A]">

        {providerStatus ===
        "pending"
          ? "Provider Application Pending"

          : providerStatus ===
            "rejected"
          ? "Provider Application Rejected"

          : providerStatus ===
            "draft"
          ? "Continue Provider Application"

          : "Become a Provider"}

      </Text>


      <Text className="mt-1 text-sm text-[#64748B]">

        {providerStatus ===
        "pending"
          ? "Your application is under review"

          : providerStatus ===
            "rejected"
          ? "Review the reason and apply again"

          : providerStatus ===
            "draft"
          ? "Complete your provider application"

          : "Offer services and receive bookings"}

      </Text>

    </View>


    <Ionicons
      name="chevron-forward"
      size={21}
      color="#2563EB"
    />

  </Pressable>
) : null}
        {isAdmin ? (
  <Pressable
    onPress={() => {66
      router.push(
        "/admin-providers"
      );
    }}
    className="mt-6 flex-row items-center rounded-2xl bg-[#0F172A] p-5 active:opacity-80"
  >

    <View className="h-12 w-12 items-center justify-center rounded-xl bg-white/10">

      <Ionicons
        name="shield-checkmark-outline"
        size={24}
        color="white"
      />

    </View>


    <View className="ml-4 flex-1">

      <Text className="text-base font-bold text-white">
        Admin Panel
      </Text>

      <Text className="mt-1 text-sm text-[#CBD5E1]">
        Review provider applications
      </Text>

    </View>


    <Ionicons
      name="chevron-forward"
      size={21}
      color="white"
    />

  </Pressable>
) : null}

{providerStatus ===
"approved" ? (
  <Pressable
    onPress={() => {
      router.push(
        "/provider-dashboard"
      );
    }}
    className="mt-6 flex-row items-center rounded-2xl bg-[#2563EB] p-5 active:opacity-80"
  >

    <View className="h-12 w-12 items-center justify-center rounded-xl bg-white/20">

      <Ionicons
        name="briefcase-outline"
        size={24}
        color="white"
      />

    </View>


    <View className="ml-4 flex-1">

      <View className="flex-row items-center">

        <Text className="text-base font-bold text-white">
          Provider Dashboard
        </Text>

        <Ionicons
          name="checkmark-circle"
          size={17}
          color="white"
          style={{
            marginLeft: 6,
          }}
        />

      </View>

      <Text className="mt-1 text-sm text-blue-100">
        Manage bookings and jobs
      </Text>

    </View>


    <Ionicons
      name="chevron-forward"
      size={21}
      color="white"
    />

  </Pressable>
) : null}

        {/* Logout */}
        <View className="mt-auto pb-6">
          <Pressable
            onPress={handleLogout}
            className="h-14 items-center justify-center rounded-2xl border border-red-200 bg-red-50 active:opacity-70"
          >
            <Text className="text-base font-semibold text-red-600">
              Log out
            </Text>
          </Pressable>
        </View>

      </View>
    </SafeAreaView>
  );
}
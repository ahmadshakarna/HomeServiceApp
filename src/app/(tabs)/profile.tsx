import { useClerk, useUser } from "@clerk/expo";
import { Image, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
export default function ProfileScreen() {
  const { user } = useUser();
  const { signOut } = useClerk();

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

        <Pressable
          onPress={() => {
            router.push("/become-provider");
          }}
           className="mt-6 flex-row items-center rounded-2xl bg-[#EFF6FF] p-5 active:opacity-80"
        >
          <View className="h-12 w-12 items-center justify-center rounded-xl bg-white">
            <Ionicons
              name="briefcase-outline"
              size={24}
              color="#2563EB"
            />
          </View>

          <View className="ml-4 flex-1">
            <Text className="text-base font-bold text-[#0F172A]">
              Become a Provider
            </Text>

            <Text className="mt-1 text-sm text-[#64748B]">
              Offer services and receive bookings
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={21}
            color="#2563EB"
          />
        </Pressable>

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
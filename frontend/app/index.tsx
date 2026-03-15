import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect } from "react";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const userLoggedIn = await checkUser();
      if (userLoggedIn === 1) {
        router.replace("/verifyUser");
      }
      else if (userLoggedIn === 2) {
          router.replace("/(tabs)/(home)");
      }
      else {
        router.replace("/(auth)/signin");
      }
    };

    checkAuth();
  }, []);
  return null;
}

async function checkUser(): Promise<number> {
  try {
    const token = await SecureStore.getItemAsync("accessToken");

    if (token !== null && token !== ""){
        const verified = await SecureStore.getItemAsync("isVerified");
        if (verified === "true") {
            return 2;
        }
        return 1;
    }
    else {
        return 0;
    }
  } catch (error) {
    console.log("Error checking auth:", error);
    return 0;
  }
}

import {router, useRouter} from "expo-router";
import * as SecureStore from "expo-secure-store";
import {useEffect, useState} from "react";
import api from "@/config/api";
import {ActivityIndicator, Text, View} from "react-native";

export default function VerifyUser() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkDoc = async () => {
            try {
                const res = await api.get("users/me")
                if (!res.data.document) {
                    router.replace("/(auth)/uploadDocument");
                    return;
                }
            } catch (error: any) {
                if (error.status === 503) {
                    alert("Server error, please try again later.");
                } else {
                    console.log(error)
                }
            } finally {
                setLoading(false);
            }
            await SecureStore.setItemAsync("isVerified", "true");
            const role = await SecureStore.getItemAsync("role");
            if (role !== "OWNER" && role !== "SITTER")
            {
                router.replace("/(auth)/homeAuth");
            }
            else
            {
                router.replace("/(tabs)/(home)");
            }
        };

        checkDoc();
    }, []);

    return <View className={"flex-1 flex items-center justify-center"}>
        <View>
            <ActivityIndicator color={"0a0a0a"} size={"large"} />
            <Text className={"text-xl font-bold text-center text-[#0a0a0a] mt-8"}>Launching App</Text>
        </View>
    </View>;
}


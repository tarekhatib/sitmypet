import SitterNearYouCard from "@/components/SitterNearYouCard";
import React, {useEffect, useState} from "react";
import {FlatList, ScrollView, Text, View} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";
import api from "@/config/api";
import SitterNearYouCardLoading from "@/components/SitterNearYouCardLoading";
import {router} from "expo-router";

type Service = {
    id: string;
    createdAt: string;
    name: string;
    updatedAt: string;
}

type NearbyRequest = {
    id: string;
    title: string;
    location: string;
    duration: string;
    imageUrl: string;
    isSaved: boolean;
    service: Service;
    rating: number;
    reviewCount: number;
};

const SitterNearYou = () => {
    const [nearYouFound, setNearYouFound] = useState<NearbyRequest[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const getNearYou = async () => {
            setLoading(true);
            try {
                const res = await api.get("/sitter/home");
                setNearYouFound(res.data.nearbyPosts);
            } catch (error: any) {
                if (error.status === 503) {
                    alert("Server error, please try again later.");
                    router.replace("/homeAuth")
                } else {
                    console.log(error)
                }
            } finally {
                setLoading(false);
            }
        };
        getNearYou();
    }, []);

    return (
        <SafeAreaView className={"flex-1"} edges={["right", "left"]}>
            {loading ? (
                    <View className="flex mt-5">
                        <View className={"w-full h-60 px-8 mb-6"}>
                            <SitterNearYouCardLoading/>
                        </View>
                        <View className={"w-full h-60 px-8 mb-6"}>
                            <SitterNearYouCardLoading/>
                        </View>
                        <View className={"w-full h-60 px-8 mb-6"}>
                            <SitterNearYouCardLoading/>
                        </View>
                    </View>
                ) : (
                <FlatList
                    data={nearYouFound}
                    className={"w-full mb-16 mt-5"}
                    keyExtractor={(item) => item.id}
                    renderItem={({item}) => (
                        <View className={"w-full h-60 px-8 mb-6"}>
                            <SitterNearYouCard {...item} />
                        </View>
                    )}
                />
                )}
        </SafeAreaView>
    );
};
export default SitterNearYou;

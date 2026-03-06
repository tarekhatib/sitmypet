import SitterNearYouCard from "@/components/SitterNearYouCard";
import React, {useCallback, useState} from "react";
import {ActivityIndicator, FlatList, ScrollView, Text, View} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import OwnerNearYouCard from "@/components/OwnerNearYouCard";
import * as SecureStore from "expo-secure-store";
import api from "@/config/api";
import TodaysBookingCardLoading from "@/components/TodaysBookingCardLoading";
import SitterNearYouCardLoading from "@/components/SitterNearYouCardLoading";
import {useFocusEffect} from "expo-router";

type NearbySitter = {
    id: string;
    sitterName: string;
    sitterImageUrl: string;
    location: string;
    rating: number;
    reviewCount: number;
    isSaved: boolean;
};

const OwnerNearYou = () => {
    const [loading, setLoading] = useState(true);
    const [nearbySitters, setNearbySitters] = useState<NearbySitter[]>([]);


    const fetchHomeData = async () => {
        setLoading(true);
        try {
            const res = await api.get("/owner/home");
            setNearbySitters(res.data.nearbySitters ?? []);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(useCallback(() => {
        fetchHomeData();
    }, []))

    return (
        <SafeAreaView className={"flex-1"} edges={["right", "bottom", "left"]}>
            {loading ? <View className="flex mt-2">
                <View className={"w-[90%] ml-[5%] h-56 px-6 mb-7 mt-10"}>
                    <SitterNearYouCardLoading/>
                </View>
                <View className={"w-[90%] ml-[5%] h-56 px-6 mb-7"}>
                    <SitterNearYouCardLoading/>
                </View>
                <View className={"w-[90%] ml-[5%] h-56 px-6 mb-7"}>
                    <SitterNearYouCardLoading/>
                </View>
            </View> : <FlatList
                data={nearbySitters}
                horizontal={false}
                className={"w-full pt-10"}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                renderItem={({item}) => (
                    <View className="w-[80%] ml-[10%] mb-6 h-40">
                        <OwnerNearYouCard {...item} />
                    </View>
                )}
            />}
        </SafeAreaView>
    );
};
export default OwnerNearYou;

import SitterNearYouCard from "@/components/SitterNearYouCard";
import React, {useEffect, useState} from "react";
import {FlatList, Image, ScrollView, Text, View} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import api from "@/config/api";
import {router} from "expo-router";

type ClientHistory = {
    id: string;
    ownerName: string;
    location: string;
    lastBookingDate: string;
    ownerImageUrl: string;
};

const formatLastBookingDate = (date?: string) => {
    if (!date) return "No date";

    const bookingDate = new Date(date);
    const now = new Date();

    const diffMs = now.getTime() - bookingDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 1) return "Today";
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;

    const diffWeeks = Math.floor(diffDays / 7);
    if (diffWeeks === 1) return "1 week ago";
    if (diffWeeks < 5) return `${diffWeeks} weeks ago`;

    const diffMonths =
        now.getFullYear() * 12 +
        now.getMonth() -
        (bookingDate.getFullYear() * 12 + bookingDate.getMonth());

    if (diffMonths === 1) return "1 month ago";
    if (diffMonths < 12) return `${diffMonths} months ago`;

    const diffYears = now.getFullYear() - bookingDate.getFullYear();
    if (diffYears === 1) return "1 year ago";
    return `${diffYears} years ago`;
};

const TodaysBookings = () => {
    const [clients, setClients] = useState<ClientHistory[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const getBookings = async () => {
            setLoading(true);
            try {
                const res = await api.get("/sitter/home");
                setClients(
                  [...res.data.recentClients].sort((a: any, b: any) => {
                    const dateA = a.lastBookingDate ? new Date(a.lastBookingDate).getTime() : 0;
                    const dateB = b.lastBookingDate ? new Date(b.lastBookingDate).getTime() : 0;
                    return dateB - dateA;
                  })
                );
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
        getBookings();
    }, []);

    return (
        <SafeAreaView className={"flex-1"} edges={["right", "left"]}>
            {loading ? (
              <View className="flex mt-10">
                {[1,2,3,4,5,6].map((_, i) => (
                  <View key={i} className="w-full px-10 mb-6 flex flex-row h-20 opacity-40">
                    <View className="w-20 h-20 mr-8 bg-gray-300 rounded-full" />
                    <View className="flex flex-col justify-around items-start flex-1">
                      <View className="h-5 w-32 bg-gray-400 rounded-full mb-2" />
                      <View className="h-4 w-24 bg-gray-300 rounded-full" />
                    </View>
                  </View>
                ))}
              </View>
            ) : (
                <FlatList
                    data={clients}
                    className={"w-full mb-20 mt-10"}
                    keyExtractor={(item) => item.id}
                    renderItem={({item}) => (
                        <View className={"w-full px-10 mb-6 flex flex-row h-20"}>
                            <View>
                                <Image
                                    source={{
                                        uri: item.ownerImageUrl
                                    }}
                                    className="w-20 h-20 rounded-full mr-8"
                                />
                            </View>
                            <View className={"flex flex-col justify-around items-start flex-1"}>
                                <Text className={"font-bold text-lg mt-2"}>{item.ownerName}</Text>
                                <Text className="mb-4 text-gray-500">
                                  {(item.location ?? "Unknown") + "  -  " +
                                    formatLastBookingDate(item.lastBookingDate)}
                                </Text>
                            </View>
                        </View>
                    )}
                />
            )}
        </SafeAreaView>
    );
};
export default TodaysBookings;

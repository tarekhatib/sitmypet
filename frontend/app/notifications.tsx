import {View, Text, Image, TouchableOpacity, FlatList} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import React, {useCallback, useState} from "react";
import {useFocusEffect, useNavigation} from "expo-router";
import api from "@/config/api";

export const unstable_settings = {
    tabBarStyle: {display: 'none'},
};

type NotificationType = "NEW_REVIEW" | "APPLICATION_ACCEPTED" | "NEW_APPLICATION";

type Notification = {
    id: string;
    title: string;
    message: string;
    type: NotificationType;

    applicationId: string | null;
    bookingId: string | null;
    postId: string | null;

    userId: string;
    sender: any;

    isRead: boolean;
    readAt: string | null;

    createdAt: string;
    updatedAt: string;
};

type NotificationsResponse = {
    notifications: Notification[];
    unreadCount: number;
};

const Notifications = () => {
    const [appNotifications, setAppNotifications] = useState<Notification[]>([]);
    const [reviewNotifications, setReviewNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);

    useFocusEffect(useCallback(() => {
        const fetchNotifications = async () => {
            setLoading(true);
            try {
                const res = await api.get("/notifications");
                setAppNotifications(res.data.notifications.filter((noti: Notification) => noti.type !== "NEW_REVIEW"));
                setReviewNotifications(res.data.notifications.filter((noti: Notification) => noti.type === "NEW_REVIEW"));
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        fetchNotifications();
    }, []))

    return (
        <SafeAreaView edges={["bottom", "left", "right"]} className={"pt-14 px-10"}>
            <View className={"flex"}>
                {/* Inbox Header */}
                <View className={"flex flex-row items-center"}>
                    <Image
                        source={require("../assets/icons/tray-filled.png")}
                        className={"w-8 h-8 mr-3"}
                    />
                    <Text className={"text-2xl text-[#0a0a0a]"}>Inbox</Text>
                </View>

                <View className={"flex w-full"}>
                    <FlatList
                        data={appNotifications}
                        keyExtractor={(item) => item.id}
                        renderItem={({item}) => (
                            <View className={"flex flex-row items-center mt-6"}>
                                <Image
                                    source={{uri: item.sender.profileImageUrl}}
                                    className={"w-16 h-16 mr-3 rounded-full"}
                                />
                                <View className={"flex justify-between flex-1"}>
                                    <Text className={"text-2xl text-[#0a0a0a]"}>{item.type === "APPLICATION_ACCEPTED" ? item.title : item.sender.firstname + " " + item.sender.lastname }</Text>
                                    <Text className={"text-md text-[#666666]"} numberOfLines={1}>
                                        {item.message}
                                    </Text>
                                </View>
                                {!item.isRead && (
                                    <View
                                        className={
                                            "w-6 h-6 rounded-full bg-red-500 flex justify-center items-center ml-3"
                                        }
                                    >
                                        <Text className={"text-white"}>1</Text>
                                    </View>
                                )}
                            </View>
                        )}
                        horizontal={false}
                        showsHorizontalScrollIndicator={false}
                        showsVerticalScrollIndicator={false}
                    />
                </View>
                <TouchableOpacity
                    className="w-[36%] ml-[32%] bg-[#3944D5] h-10 rounded-full flex flex-row items-center justify-center mt-6 mb-4">
                    <Text className="text-white text-md font-bold">View All</Text>
                </TouchableOpacity>
                <View className={"flex flex-row items-center"}>
                    <Image
                        source={require("../assets/icons/half-review.png")}
                        className={"w-8 h-8 mr-3"}
                    />
                    <Text className={"text-2xl text-[#0a0a0a]"}>Reviews</Text>
                </View>

                <View className={"flex w-full"}>
                    <FlatList
                        data={reviewNotifications}
                        keyExtractor={(item) => item.id}
                        renderItem={({item}) => (
                            <View className={"flex flex-row items-center mt-6"}>
                                <Image
                                    source={{uri: item.sender.profileImageUrl}}
                                    className={"w-16 h-16 mr-6 rounded-full"}
                                />
                                <View className={"flex justify-between flex-1"}>
                                    <Text className={"text-xl text-[#0a0a0a]"}>
                                        {item.sender.firstname + " " + item.sender.lastname}
                                    </Text>
                                    <Text className={"text-md text-[#666666]"} numberOfLines={1}>
                                        {item.message}
                                    </Text>
                                </View>
                                {!item.isRead && (
                                    <View
                                        className={
                                            "w-6 h-6 rounded-full bg-red-500 flex justify-center items-center ml-3"
                                        }
                                    >
                                        <Text className={"text-white"}>1</Text>
                                    </View>
                                )}
                            </View>
                        )}
                        horizontal={false}
                        showsHorizontalScrollIndicator={false}
                        showsVerticalScrollIndicator={false}
                    />
                </View>
                <TouchableOpacity
                    className="w-[36%] ml-[32%] bg-[#3944D5] h-10 rounded-full flex flex-row items-center justify-center mt-6">
                    <Text className="text-white text-md font-bold">View All</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default Notifications;

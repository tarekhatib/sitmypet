import {View, Text, Image, TouchableOpacity, FlatList, ActivityIndicator} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import React, {useCallback, useState} from "react";
import {router, useFocusEffect, useNavigation} from "expo-router";
import api from "@/config/api";
import * as SecureStore from "expo-secure-store";

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
        }
        fetchNotifications();
    }, []))

    const markAllNotifications = async () => {
        setAppNotifications(
            appNotifications.map(item => ({
                ...item,
                isRead: true
            }))
        );
        setReviewNotifications(
            reviewNotifications.map(item => ({
                ...item,
                isRead: true
            }))
        );
        try {
            const res = await api.patch("/notifications/read-all");
            await SecureStore.setItemAsync("readAll", "TRUE");
        } catch (error: any) {
            if (error.status === 503) {
                alert("Server error, please try again later.");
                router.replace("/homeAuth")
            } else {
                console.log(error)
            }
        }
    }

    const readNotification = async (notificationId: string) => {
        try {
            await api.patch(`/notifications/${notificationId}/read`);
            setAppNotifications(
                appNotifications.map(item => ({
                    ...item,
                    isRead: item.id === notificationId ? true : item.isRead
                }))
            );
            setReviewNotifications(
                reviewNotifications.map(item => ({
                    ...item,
                    isRead: item.id === notificationId ? true : item.isRead
                }))
            );
        } catch (error: any) {
            if (error.status === 503) {
                alert("Server error, please try again later.");
                router.replace("/homeAuth")
            } else {
                console.log(error)
            }
        }
    }

    return (
        <SafeAreaView edges={["bottom", "left", "right"]} className={"pt-14 px-10 flex-1"}>
            {loading ? <View className={"flex flex-col flex-1 justify-center items-center h-full w-full"}>
                    <ActivityIndicator size="large"/>
                    <Text className={"text-2xl mt-6 text-[#0a0a0a] text-center"}>Fetching notifications...</Text>
                </View> :
            <View className={"flex"}>
                <View className={"flex flex-row items-center justify-between"}>
                    <Image
                        source={require("../assets/icons/tray-filled.png")}
                        className={"w-8 h-8 mr-3"}
                    />
                    <Text className={"text-2xl text-[#0a0a0a] flex-1"}>Inbox</Text>
                    <TouchableOpacity onPress={markAllNotifications}><Text className={"text-blue-600 mt-2 font-bold"}>Mark
                        all as read</Text></TouchableOpacity>
                </View>

                <View className={"flex w-full h-[285px]"}>
                    {appNotifications.length > 0 ?
                        <FlatList
                            data={appNotifications}
                            keyExtractor={(item) => item.id}
                            renderItem={({item}) => (
                                <TouchableOpacity className={"flex flex-row items-center mt-6"} onPress={() => {
                                    if (item.type === "APPLICATION_ACCEPTED") {
                                        router.push("/todaysBookings")
                                    }
                                    else
                                    {
                                        router.push(`/users/${item.sender.id}`)
                                    }
                                    readNotification(item.id);
                                }}>
                                    <Image
                                        source={{uri: item.sender.profileImageUrl}}
                                        className={"w-16 h-16 mr-3 rounded-full"}
                                    />
                                    <View className={"flex justify-between flex-1"}>
                                        <Text
                                            className={"text-2xl text-[#0a0a0a]"}>{item.type === "APPLICATION_ACCEPTED" ? item.title : item.sender.firstname + " " + item.sender.lastname}</Text>
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
                                </TouchableOpacity>
                            )}
                            horizontal={false}
                            showsHorizontalScrollIndicator={false}
                            showsVerticalScrollIndicator={false}
                        /> : <View className={"flex-1 flex justify-center items-center"}><Text
                            className={"text-center text-[#0a0a0a]"}>{"You haven't received any new applications"}</Text></View>}
                </View>
                <View className={"flex flex-row items-center mt-5"}>
                    <Image
                        source={require("../assets/icons/half-review.png")}
                        className={"w-8 h-8 mr-3"}
                    />
                    <Text className={"text-2xl text-[#0a0a0a]"}>Reviews</Text>
                </View>

                <View className={"flex w-full h-[285px]"}>
                    {reviewNotifications.length > 0 ? (<FlatList
                        data={reviewNotifications}
                        keyExtractor={(item) => item.id}
                        renderItem={({item}) => (
                            <TouchableOpacity className={"flex flex-row items-center mt-6"} onPress={() => {
                                router.push(`/users/${item.sender.id}`)
                                readNotification(item.id)
                            }}>
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
                            </TouchableOpacity>
                        )}
                        horizontal={false}
                        showsHorizontalScrollIndicator={false}
                        showsVerticalScrollIndicator={false}
                    />) : <View className={"flex-1 flex justify-center items-center"}><Text
                        className={"text-center text-[#0a0a0a]"}>{"You haven't received any new reviews"}</Text></View>}
                </View>
            </View>}
        </SafeAreaView>
    );
};

export default Notifications;

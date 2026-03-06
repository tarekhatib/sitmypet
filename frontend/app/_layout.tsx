import {router, Stack} from "expo-router";
import {Image, Text, TouchableOpacity, View, Appearance} from "react-native";
import React, {useEffect} from "react";
import * as SystemUI from 'expo-system-ui';
import { useTheme } from '@react-navigation/native';

export default function RootLayout() {
    const theme = useTheme();
    useEffect(() => {
        Appearance.setColorScheme("light");
        SystemUI.setBackgroundColorAsync(theme.colors.background);
    }, [theme]);

    return (
        <Stack screenOptions={{headerShown: false}}>
            <Stack.Screen
                name="(tabs)"
                options={{headerShown: false}}
            />
            <Stack.Screen
                name="verifyUser"
                options={{headerShown: false}}
            />
            <Stack.Screen
                name="sitterNearYou"
                options={{
                    headerShown: true,
                    header: () => (
                        <View
                            style={{
                                height: 120,
                                justifyContent: "flex-end",
                                paddingLeft: 15,
                            }}
                        >
                            <TouchableOpacity
                                onPress={() => {
                                    router.back();
                                }}
                            >
                                <View className="flex flex-row items-center">
                                    <Image
                                        source={require("../assets/icons/back-arrow.png")}
                                        className="w-7 h-7 mr-3"
                                    />
                                    <Text className="text-[#0A0A0A] text-2xl font-bold">
                                        Jobs Near You
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    ),
                }}
            />
            <Stack.Screen
                name="ownerNearYou"
                options={{
                    headerShown: true,
                    header: () => (
                        <View
                            style={{
                                height: 120,
                                justifyContent: "flex-end",
                                paddingLeft: 15,
                            }}
                        >
                            <TouchableOpacity
                                onPress={() => {
                                    router.back();
                                }}
                            >
                                <View className="flex flex-row items-center">
                                    <Image
                                        source={require("../assets/icons/back-arrow.png")}
                                        className="w-7 h-7 mr-3"
                                    />
                                    <Text className="text-[#0A0A0A] text-2xl font-bold">
                                        Sitters Near You
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    ),
                }}
            />
            <Stack.Screen
                name="todaysBookings"
                options={{
                    headerShown: true,
                    header: () => (
                        <View
                            style={{
                                height: 120,
                                justifyContent: "flex-end",
                                paddingLeft: 15,
                            }}
                        >
                            <TouchableOpacity
                                onPress={() => {
                                    router.back();
                                }}
                            >
                                <View className="flex flex-row items-center">
                                    <Image
                                        source={require("../assets/icons/back-arrow.png")}
                                        className="w-7 h-7 mr-3"
                                    />
                                    <Text className="text-[#0A0A0A] text-2xl font-bold">
                                        {"Today's Bookings"}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    ),
                }}
            />
            <Stack.Screen
                name="recentClients"
                options={{
                    headerShown: true,
                    header: () => (
                        <View
                            style={{
                                height: 120,
                                justifyContent: "flex-end",
                                paddingLeft: 15,
                            }}
                        >
                            <TouchableOpacity
                                onPress={() => {
                                    router.back();
                                }}
                            >
                                <View className="flex flex-row items-center">
                                    <Image
                                        source={require("../assets/icons/back-arrow.png")}
                                        className="w-7 h-7 mr-3"
                                    />
                                    <Text className="text-[#0A0A0A] text-2xl font-bold">
                                        Recent Clients
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    ),
                }}
            />
            <Stack.Screen
                name="privacyPolicy"
                options={{
                    headerShown: true,

                    header: () => (
                        <View
                            style={{
                                height: 120,
                                justifyContent: "flex-end",
                                paddingLeft: 15,
                            }}
                        >
                            <TouchableOpacity
                                onPress={() => {
                                    router.back();
                                }}
                            >
                                <View className="flex flex-row items-center">
                                    <Image
                                        source={require("../assets/icons/back-arrow.png")}
                                        className="w-7 h-7 mr-3"
                                    />
                                    <Text className="text-[#0A0A0A] text-2xl font-bold">
                                        Privacy Policy
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    ),
                }}
            />
            <Stack.Screen
                name="termsAndConditions"
                options={{
                    headerShown: true,
                    header: () => (
                        <View
                            style={{
                                height: 120,
                                justifyContent: "flex-end",
                                paddingLeft: 15,
                            }}
                        >
                            <TouchableOpacity
                                onPress={() => {
                                    router.back();
                                }}
                            >
                                <View className="flex flex-row items-center">
                                    <Image
                                        source={require("../assets/icons/back-arrow.png")}
                                        className="w-7 h-7 mr-3"
                                    />
                                    <Text className="text-[#0A0A0A] text-2xl font-bold">
                                        Terms and Conditions
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    ),
                }}
            />
            <Stack.Screen
                name="notifications"
                options={{
                    headerShown: true,
                    header: () => (
                        <View
                            style={{
                                height: 120,
                                justifyContent: "flex-end",
                                paddingLeft: 15,
                            }}
                        >
                            <TouchableOpacity
                                onPress={() => {
                                    router.back();
                                }}
                            >
                                <View className="flex flex-row items-center">
                                    <Image
                                        source={require("../assets/icons/back-arrow.png")}
                                        className="w-7 h-7 mr-3"
                                    />
                                    <Text className="text-[#0A0A0A] text-2xl font-bold">
                                        Notifications
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    ),
                }}
            />
            <Stack.Screen
                name="contactPage"
                options={{
                    headerShown: true,
                    header: () => (
                        <View style={{height: 120, justifyContent: 'flex-end', paddingLeft: 15}}>
                            <TouchableOpacity onPress={() => {
                                router.back();
                            }}>
                                <View className="flex flex-row items-center">
                                    <Image
                                        source={require('../assets/icons/back-arrow.png')}
                                        className="w-7 h-7 mr-3"
                                    />
                                    <Text className="text-[#0A0A0A] text-2xl font-bold">Contact Us</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    ),
                }}
            />
        </Stack>
    );
}
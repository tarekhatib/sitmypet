import api from "@/config/api";
import {router} from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, {useEffect, useState} from "react";
import {
    ActivityIndicator,
    Image,
    Keyboard,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import {SafeAreaView} from "react-native-safe-area-context";

export default function ChangePassword({
                                     onChange,
                                 }: {
    onChange?: (otp: string) => void;
}) {
    const [error, setError] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [oldPassword, setOldPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [updated, setUpdated] = useState(false);

    const handleSubmit = async () => {
        if (updated) {
            router.back();
            return;
        }
        if (!loading) {
            setError("");
            if (newPassword.length < 8) {
                setError("Password must be at least 8 characters.");
                return;
            }
            if (confirmPassword !== newPassword) {
                setError("Passwords do not match.");
                return;
            }
            setLoading(true);
            try {
                await api.patch(`/users/me/password`, {
                    oldPassword: oldPassword,
                    newPassword: newPassword,
                });
                setUpdated(true);
            } catch (error: any) {

                if (error.status === 401 || error.status === 403 || error.status === 409) {
                    setError("Old password is incorrect.");
                } else if (error.status === 503) {
                    alert("Server error, please try again later.");
                } else {
                    setError("An error has occurred.");
                }
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <SafeAreaView
            className="home-auth flex-1"
            edges={["right", "left", "bottom"]}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <KeyboardAwareScrollView
                    contentContainerStyle={{flexGrow: 1}}
                    enableOnAndroid={true}
                    extraScrollHeight={35}
                    keyboardOpeningTime={100}
                    keyboardShouldPersistTaps="handled"
                    style={updated ? {display: "none"} : {}}
                >
                    <View className="flex flex-col flex-1 w-full p-10 items-center"
                          style={updated ? {display: "none"} : {}}>
                        <Image
                            source={require("../../../assets/images/forgot-password.png")}
                            alt="logo"
                            className="w-full h-64"
                            resizeMode="contain"
                        />
                        <View className={"px-5 w-full mt-2 text-[#0A0A0A]"}>
                            <Text className={"text-xl"}>Old Password</Text>
                            <TextInput
                                className={
                                    "w-full h-14 border border-gray-300 rounded-xl mt-3 px-5"
                                }
                                autoCapitalize={"none"}
                                secureTextEntry={true}
                                autoComplete="off"
                                textContentType="none"
                                importantForAutofill="no"
                                returnKeyType="next"
                                value={oldPassword}
                                onChangeText={(text) => {
                                    setOldPassword(text);
                                }}
                            />
                        </View>
                        <View className={"px-5 w-full mt-3 text-[#0A0A0A]"}>
                            <Text className={"text-xl"}>New Password</Text>
                            <TextInput
                                className={
                                    "w-full h-14 border border-gray-300 rounded-xl mt-3 px-5"
                                }
                                autoCapitalize={"none"}
                                secureTextEntry={true}
                                autoComplete="off"
                                textContentType="none"
                                importantForAutofill="no"
                                returnKeyType="next"
                                value={newPassword}
                                onChangeText={(text) => {
                                    setNewPassword(text);
                                }}
                            />
                        </View>
                        <View className={"px-5 w-full mt-3 text-[#0A0A0A]"}>
                            <Text className={"text-xl"}>Confirm New Password</Text>
                            <TextInput
                                className={
                                    "w-full h-14 border border-gray-300 rounded-xl mt-3 px-5"
                                }
                                autoCapitalize={"none"}
                                secureTextEntry={true}
                                autoComplete="off"
                                textContentType="none"
                                importantForAutofill="no"
                                returnKeyType="done"
                                value={confirmPassword}
                                onChangeText={(text) => {
                                    setConfirmPassword(text);
                                }}
                            />
                        </View>

                        <Text className={"text-base text-red-600 my-1"}>{error}</Text>

                        <TouchableOpacity
                            className="w-[75%] bg-[#3944D5] h-16 rounded-full flex flex-row items-center justify-center my-2"
                            onPress={handleSubmit}
                        >
                            {loading ? (
                                <ActivityIndicator color={"#FFFFFF"} size={"small"}/>
                            ) : (
                                <Text className="text-white text-lg font-bold">
                                    Change Password
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </KeyboardAwareScrollView>
            </TouchableWithoutFeedback>
            <View className={"flex flex-col w-full flex-1"} style={!updated ? {display: "none"} : {}}>
                <Image source={require("../../../assets/images/change-pass-success.png")}
                       className={"w-full h-64 mt-10"}/>
                <View className={"w-full flex items-center"}>
                    <Text className={"text-3xl text-[#0A0A0A] font-bold text-center mb-6 w-full px-10 mt-12"}>Your
                        password has been changed successfully.</Text>
                    <Text className={"w-full px-12 text-center text-lg"}>Make sure to use your new password the next
                        time you sign in.</Text>
                    <TouchableOpacity
                        className="w-[85%] bg-[#3944D5] h-14 rounded-full flex flex-row items-center justify-center mt-8"
                        onPress={handleSubmit}
                    >
                        {loading ? (
                            <ActivityIndicator size={"small"} color={"#FFFFFF"} />
                        ) : (
                            <View className="flex flex-row items-center">
                                <Image
                                    source={require('../../../assets/icons/back-arrow-white.png')}
                                    className="w-5 h-5 mr-1"
                                />
                                <Text className="text-white text-lg font-bold">Go back to profile</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

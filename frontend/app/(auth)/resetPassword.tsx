import api from "@/config/api";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
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
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ResetPassword({
  onChange,
}: {
  onChange?: (otp: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [otp, setOTP] = useState("");
  const [error, setError] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getEmail = async () => {
      const em: string | null =
        await SecureStore.getItemAsync("passResetEmail");
      const tok: string | null =
        await SecureStore.getItemAsync("passResetToken");
      setEmail(em as string);
      setOTP(tok as string);
      await SecureStore.deleteItemAsync("passResetEmail");
      await SecureStore.deleteItemAsync("passResetToken");
    };
    getEmail();
  }, []);

  const handleSubmit = async () => {
    if (!loading) {
      setError("");
      if (newPassword.length < 8) {
        setError("Password must be at least 8 chartacters.");
        return;
      }
      if (confirmPassword !== newPassword) {
        setError("Passwords do not match.");
        return;
      }
      setLoading(true);
      try {
        await api.post(`/auth/reset-password`, {
          email: email,
          otp: otp,
          newPassword: newPassword,
        });
        router.push("/(auth)/signin");
      } catch (error: any) {
          if (error.status === 503) {
              alert("Server error, please try again later.");
              router.replace("/homeAuth")
          } else {
              console.log(error);
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
          contentContainerStyle={{ flexGrow: 1 }}
          enableOnAndroid={true}
          extraScrollHeight={35}
          keyboardOpeningTime={100}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex flex-col flex-1 w-full p-10 items-center">
            <Image
              source={require("../../assets/images/forgot-password.png")}
              alt="logo"
              className="w-full h-64"
              resizeMode="contain"
            />
            <Text className="text-[#0A0A0A] text-lg mt-5 font-bold">
              Reset Password
            </Text>

            <View className={"px-5 w-full mt-10 text-[#0A0A0A]"}>
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
            <View className={"px-5 w-full mt-5 text-[#0A0A0A]"}>
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

            <Text className={"text-base text-red-600 my-2"}>{error}</Text>

            <TouchableOpacity
              className="w-[75%] bg-[#3944D5] h-16 rounded-full flex flex-row items-center justify-center my-8"
              onPress={handleSubmit}
            >
              {loading ? (
                <ActivityIndicator color={"#FFFFFF"} size={"small"} />
              ) : (
                <Text className="text-white text-lg font-bold">
                  Reset Password
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAwareScrollView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

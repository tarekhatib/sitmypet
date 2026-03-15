import api from "@/config/api";
import { Link, router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useState } from "react";
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

const Signin = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!loading) {
      if (!formData.email || !formData.password) {
        setError("Please fill out all the required fields.");
        return;
      }
      setLoading(true);
      try {
        const res = await api.post(`/auth/login`, formData);
        await SecureStore.setItemAsync(
          "lastname",
          String(res.data.user.lastname)
        );
        await SecureStore.setItemAsync(
          "firstname",
          String(res.data.user.firstname)
        );
        await SecureStore.setItemAsync("email", String(res.data.user.email));
        await SecureStore.setItemAsync("id", String(res.data.user.id));
        await SecureStore.setItemAsync(
          "accessToken",
          String(res.data.accessToken)
        );
        await SecureStore.setItemAsync(
          "refreshToken",
          String(res.data.refreshToken)
        );
        router.push("/verifyUser");
      } catch (error: any) {
          console.log(error.status, error);
        if (error.status === 401) {
          setError("Invalid email or password.");
        } else if (error.status === 403) {
          await SecureStore.setItemAsync("email", String(formData.email));
          router.push("/(auth)/verifyEmail");
        } else if (error.status === 503) {
              alert("Server error, please try again later.");
              router.replace("/homeAuth")
          }
        else {
          setError("An error has occurred, please try again later.");
        }
      } finally {
        setLoading(false);
      }
    }
  };
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAwareScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          enableOnAndroid={true}
          extraScrollHeight={35}
          keyboardOpeningTime={100}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex flex-col flex-1 w-full p-10 items-center">
            <Text className="text-[#0A0A0A] text-5xl self-start">Welcome</Text>
            <Image
              source={require("../../assets/images/loginIcon.png")}
              alt="logo"
              className="w-full h-60"
              resizeMode="contain"
            />
            <View className={"px-5 w-full mt-10 text-[#0A0A0A]"}>
              <Text className={"text-xl"}>Email</Text>
              <TextInput
                className={
                  "w-full h-14 border border-gray-300 rounded-xl mt-3 px-5"
                }
                autoCapitalize={"none"}
                keyboardType="email-address"
                autoComplete="off"
                textContentType="none"
                importantForAutofill="no"
                returnKeyType="next"
                onChangeText={(text) => {
                  setFormData((prevState) => ({
                    ...prevState,
                    email: text,
                  }));
                }}
              />
            </View>
            <View className={"px-5 w-full mt-5 text-[#0A0A0A]"}>
              <Text className={"text-xl"}>Password</Text>
              <TextInput
                className={
                  "w-full h-14 border border-gray-300 rounded-xl mt-3 px-5"
                }
                autoCapitalize={"none"}
                secureTextEntry={true}
                returnKeyType="done"
                autoComplete="off"
                textContentType="none"
                importantForAutofill="no"
                onChangeText={(text) => {
                  setFormData((prevState) => ({
                    ...prevState,
                    password: text,
                  }));
                }}
              />
            </View>
            <Text className={"text-base text-red-500 mt-5"}>{error}</Text>
            <TouchableOpacity
              className="w-[85%] bg-[#3944D5] h-14 rounded-full flex flex-row items-center justify-center mt-5 mb-5"
              onPress={handleSubmit}
            >
              {loading ? (
                <ActivityIndicator color={"#FFFFFF"} size={"small"} />
              ) : (
                <Text className="text-white text-lg font-bold">Login</Text>
              )}
            </TouchableOpacity>

            <Link href={"/(auth)/forgotPassword"}>
              <Text className={"text-gray-600 underline"}>
                Forgot password?
              </Text>
            </Link>

            <View className="flex-grow" />

            <View className={"flex flex-row justify-around w-full mb-5"}>
              <View className="flex flex-col items-center justify-center">
                <Text className="text-text-gray-600 text-sm">Need help?</Text>
                <Link href={"/contactPage"}>
                  <Text className="text-[#0A0A0A] text-lg font-bold">
                    Contact us
                  </Text>
                </Link>
              </View>
              <View className="flex flex-col items-center justify-center">
                <Text className="text-gray-600 text-sm">{"No account?"}</Text>
                <Link href={"/(auth)/signup"}>
                  <Text className="text-[#0A0A0A] text-lg font-bold">
                    Register now
                  </Text>
                </Link>
              </View>
            </View>
          </View>
        </KeyboardAwareScrollView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};
export default Signin;

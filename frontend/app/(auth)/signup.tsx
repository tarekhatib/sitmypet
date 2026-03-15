import api from "@/config/api";
import { Checkbox } from "expo-checkbox";
import { Link, router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";

const SignUp = () => {
  const [isAccepted, setIsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async () => {
    if (!loading) {
      if (!isAccepted) {
        setError(
          "You must agree to the Terms and Conditions before proceeding."
        );
        return;
      }
      if (
        !formData.email ||
        !formData.password ||
        !formData.firstname ||
        !formData.confirmPassword ||
        !formData.lastname
      ) {
        setError("Please fill out all the required fields.");
        return;
      }
      if (formData.password.length < 8) {
        setError("Password must be at least 8 chartacters.");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
      setLoading(true);
      try {
        const res = await api.post(`/auth/register`, {
          firstname: formData.firstname,
          lastname: formData.lastname,
          email: formData.email,
          password: formData.password,
        });
        await SecureStore.setItemAsync("firstname", String(formData.firstname));
        await SecureStore.setItemAsync("lastname", String(formData.lastname));
        await SecureStore.setItemAsync("email", String(formData.email));
        router.push("/(auth)/verifyEmail");
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
  };

  return (
    <SafeAreaView className="flex-1 py-12" edges={["left", "right", "bottom"]}>
      <TouchableWithoutFeedback
        onPress={Keyboard.dismiss}
        className={"bg-green-200 h-screen"}
      >
        <KeyboardAwareScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          enableOnAndroid={true}
          extraScrollHeight={35}
          keyboardOpeningTime={100}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex flex-col flex-1 w-full px-10 items-center">
            <View
              className={"flex flex-row items-center justify-center w-full"}
            >
              <View className={"px-5 pr-2 w-[50%] text-[#0A0A0A] "}>
                <Text className={"text-xl"}>First Name</Text>
                <TextInput
                  className={
                    "w-full h-14 border border-gray-300 rounded-xl mt-3 px-5"
                  }
                  autoCapitalize={"none"}
                  autoComplete="off"
                  textContentType="none"
                  importantForAutofill="no"
                  onChangeText={(text) => {
                    setFormData((prevState) => ({
                      ...prevState,
                      firstname: text,
                    }));
                  }}
                ></TextInput>
              </View>
              <View className={"px-5 pl-2 w-[50%] text-[#0A0A0A]"}>
                <Text className={"text-xl"}>Last Name</Text>
                <TextInput
                  className={
                    "w-full h-14 border border-gray-300 rounded-xl mt-3 px-5"
                  }
                  autoCapitalize={"none"}
                  autoComplete="off"
                  textContentType="none"
                  importantForAutofill="no"
                  onChangeText={(text) => {
                    setFormData((prevState) => ({
                      ...prevState,
                      lastname: text,
                    }));
                  }}
                ></TextInput>
              </View>
            </View>
            <View className={"px-5 w-full mt-5 text-[#0A0A0A]"}>
              <Text className={"text-xl"}>Email</Text>
              <TextInput
                className={
                  "w-full h-14 border border-gray-300 rounded-xl mt-3 px-5"
                }
                autoComplete="off"
                textContentType="none"
                importantForAutofill="no"
                value={formData.email}
                autoCapitalize={"none"}
                keyboardType="email-address"
                onChangeText={(text) => {
                  setFormData((prevState) => ({
                    ...prevState,
                    email: text,
                  }));
                }}
              ></TextInput>
            </View>
            <View className={"px-5 w-full mt-5 text-[#0A0A0A]"}>
              <Text className={"text-xl"}>Password</Text>
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
                value={formData.password}
                onChangeText={(text) => {
                  setFormData((prevState) => ({
                    ...prevState,
                    password: text,
                  }));
                }}
              ></TextInput>
            </View>
            <View className={"px-5 w-full mt-5 text-[#0A0A0A]"}>
              <Text className={"text-xl"}>Confirm Password</Text>
              <TextInput
                className={
                  "w-full h-14 border border-gray-300 rounded-xl mt-3 px-5"
                }
                autoCapitalize={"none"}
                secureTextEntry={true}
                autoComplete="off"
                textContentType="none"
                importantForAutofill="no"
                value={formData.confirmPassword}
                returnKeyType="done"
                onChangeText={(text) => {
                  setFormData((prevState) => ({
                    ...prevState,
                    confirmPassword: text,
                  }));
                }}
              ></TextInput>
            </View>
            <View
              className={"px-5 pr-10 w-full mt-7 flex flex-row items-center"}
            >
              <Checkbox
                value={isAccepted}
                onValueChange={setIsAccepted}
                color={isAccepted ? "#3944D5" : undefined}
                className={"mr-3"}
              />
              <Text className={"text-sm text-gray-600"}>
                I agree to the{" "}
                <Link href={"/termsAndConditions"}>
                  <Text className={"font-bold underline"}>terms of use</Text>
                </Link>{" "}
                and acknowledge the{" "}
                <Link href={"/privacyPolicy"}>
                  <Text className={"font-bold underline"}>privacy policy</Text>
                </Link>
                .
              </Text>
            </View>
            <Text className={"text-base text-red-500 mt-5"}>{error}</Text>
            <TouchableOpacity
              className="w-[85%] bg-[#3944D5] h-14 rounded-full flex flex-row items-center justify-center mb-10 mt-6"
              onPress={handleSubmit}
            >
              {loading ? (
                <ActivityIndicator color={"#FFFFFF"} size={"small"} />
              ) : (
                <Text className="text-white text-lg font-bold">
                  Create Account
                </Text>
              )}
            </TouchableOpacity>

            <View className="flex-grow" />

            <View className="flex flex-col items-center justify-center mb-5">
              <Text className="text-text-gray-600 text-sm">Need help?</Text>
              <Link href={"/contactPage"}>
                <Text className="text-[#0A0A0A] text-lg font-bold">
                  Contact us
                </Text>
              </Link>
            </View>
          </View>
        </KeyboardAwareScrollView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};
export default SignUp;

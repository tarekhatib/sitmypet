import api from "@/config/api";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  Linking,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async () => {
      if (isSent){
          router.back();
          return;
      }
    if (!loading) {
      try {
        setLoading(true);
        const res = await api.post(`/contact`, formData);
        setIsSent(true);
      } catch (error: any) {
          if (error.status === 503) {
              alert("Server error, please try again later.");
          } else {
              console.log(error)
          }
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <SafeAreaView className="flex-1 py-10" edges={["left", "right", "bottom"]}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAwareScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          enableOnAndroid={true}
          extraScrollHeight={35}
          keyboardOpeningTime={100}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex flex-col flex-1 w-full px-10 items-center" style={isSent ? {justifyContent: "center"} : {}}>
            <View className={"px-5 w-full text-[#0A0A0A] "} style={isSent ? {display: "none"} : {}}>
              <Text className={"text-xl"}>Full Name</Text>
              <TextInput
                className={
                  "w-full h-14 border border-gray-300 rounded-xl mt-3 px-5"
                }
                value={formData.fullName}
                onChangeText={(text) => {
                  setFormData((prevState) => ({
                    ...prevState,
                    fullName: text,
                  }));
                }}
                autoCapitalize={"none"}
              ></TextInput>
            </View>
            <View className={"px-5 w-full mt-5 text-[#0A0A0A]"} style={isSent ? {display: "none"} : {}}>
              <Text className={"text-xl"}>Email</Text>
              <TextInput
                className={
                  "w-full h-14 border border-gray-300 rounded-xl mt-3 px-5"
                }
                value={formData.email}
                onChangeText={(text) => {
                  setFormData((prevState) => ({
                    ...prevState,
                    email: text,
                  }));
                }}
                autoCapitalize={"none"}
              ></TextInput>
            </View>
            <View className={"px-5 w-full mt-5 text-[#0A0A0A]"} style={isSent ? {display: "none"} : {}}>
              <Text className={"text-xl"}>Subject</Text>
              <TextInput
                className={
                  "w-full h-14 border border-gray-300 rounded-xl mt-3 px-5"
                }
                value={formData.subject}
                onChangeText={(text) => {
                  setFormData((prevState) => ({
                    ...prevState,
                    subject: text,
                  }));
                }}
                autoCapitalize={"none"}
              ></TextInput>
            </View>
            <View className={"px-5 w-full mt-5 text-[#0A0A0A]"} style={isSent ? {display: "none"} : {}}>
              <Text className={"text-xl"}>Message</Text>
              <TextInput
                className={
                  "w-full h-36 border border-gray-300 rounded-xl mt-3 px-5 py-3"
                }
                multiline={true}
                value={formData.message}
                onChangeText={(text) => {
                  setFormData((prevState) => ({
                    ...prevState,
                    message: text,
                  }));
                }}
                textAlignVertical={"top"}
              ></TextInput>
            </View>
              <View className={"w-full flex items-center"} style={!isSent ? {display: "none"} : {}}>
                  <Text className={"text-3xl text-[#0A0A0A] font-bold text-center mb-6 w-full px-10"}>We have received your message</Text>
                  <Text className={"w-full px-12 text-center text-lg"}>An agent will contact you by email within 24 hours.</Text>
              </View>
            <TouchableOpacity
              className="w-[85%] bg-[#3944D5] h-14 rounded-full flex flex-row items-center justify-center mt-7"
              onPress={handleSubmit}
            >
              {loading ? (
                <ActivityIndicator size={"small"} color={"#FFFFFF"} />
              ) : (
                  <View className="flex flex-row items-center">
                      <Image
                          source={require('../assets/icons/back-arrow-white.png')}
                          className="w-5 h-5 mr-1"
                          style={!isSent ? {display: "none"} : {}}
                      />
                      <Text className="text-white text-lg font-bold">{isSent ? "Go Back" : "Send Message"}</Text>
                  </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              className="w-[85%] bg-[#26BE5A] h-14 rounded-full flex flex-row items-center justify-center my-5"
              onPress={() => Linking.openURL("https://wa.me/96170820520")}
            >
              <Image
                source={require("../assets/icons/whatsapp.png")}
                alt="logo"
                className="w-6 h-6 mr-3"
              />
              <Text className="text-white text-lg font-bold">
                Whatsapp Support
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAwareScrollView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};
export default ContactPage;

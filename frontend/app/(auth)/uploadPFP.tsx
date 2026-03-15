import { Link, router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Keyboard,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import api from "@/config/api";
import { backendPath } from "@/config/backConfig";

export enum MediaTypeOptions {
  All = "All",
  Videos = "Videos",
  Images = "Images",
}

const UploadPFP = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [docLoading, setDocLoading] = useState(false);
  const [imageURL, setImageURL] = useState(
    "https://pub-4f8704924751443bbd3260d113d11a8f.r2.dev/uploads/pfps/default_pfp.png",
  );

  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);

  const pickImage = async () => {
    setDocLoading(true);

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alert("Permission required");
      setDocLoading(false);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (result.canceled) {
      setDocLoading(false);
      return;
    }

    const pickedImage = result.assets[0];
    setImage(pickedImage);

    const formData = new FormData();
    formData.append("file", {
      uri: pickedImage.uri,
      name: "profile.jpg",
      type: "image/jpeg",
    } as any);

    try {
      const res = await api.post("/users/me/profile-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setImageURL(res.data.profileImageUrl);
    } catch (e: any) {
      if (e.status === 400) {
        setError("Invalid image format or size.");
      } if (e.status === 503) {
            alert("Server error, please try again later.");
        } else {
          console.log(e)
        setError("An error has occurred.");
      }
    } finally {
      setDocLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["right", "left", "bottom"]}>
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
              source={{ uri: imageURL }}
              alt="logo"
              className="w-44 h-44 rounded-full mt-10"
              resizeMode="cover"
            />
            <View className={"px-5 w-full mt-10 text-[#0A0A0A]"}>
              <Text className={"text-4xl text-center"}>
                No profile is complete without YOU!
              </Text>
              <Text className={"text-base text-center text-gray-400 mt-5"}>
                Add a profile picture to complete your profile
              </Text>
              <Text className={"text-base text-center text-gray-400 "}>
                JPG, JPEG, PNG, up to 5MB
              </Text>
            </View>
            <TouchableOpacity
              onPress={pickImage}
              className="w-[85%] bg-gray-300 h-16 rounded-full flex flex-row items-center justify-center mt-8 mb-3"
            >
              {docLoading ? (
                <ActivityIndicator color={"#000000"} size={"small"} />
              ) : (
                <>
                  <Image
                    source={require("../../assets/icons/upload-cloud.png")}
                    className={"w-6 h-6 mr-3"}
                  />
                  <Text className="text-[#0A0A0A] text-lg font-bold">
                    {image ? "Change photo" : "Upload PFP"}
                  </Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              disabled={image ? false : true}
              onPress={() => router.replace("/(auth)/homeAuth")}
              className={`w-[85%] h-16 rounded-full flex flex-row items-center justify-center mt-3 mb-5 bg-[#3944D5] ${image ? "" : "opacity-30"}`}
            >
              {loading ? (
                <ActivityIndicator color={"#FFFFFF"} size={"small"} />
              ) : (
                <Text className={`text-white text-lg font-bold`}>Continue</Text>
              )}
            </TouchableOpacity>
            <Link href={"/(auth)/homeAuth"} className={"mt-3"}>
              <Text className={"text-[#0A0A0A] text-base underline font-bold"}>
                Skip this step for now
              </Text>
            </Link>
          </View>
        </KeyboardAwareScrollView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};
export default UploadPFP;

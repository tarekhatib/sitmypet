import {View, Text, ScrollView, Image, TouchableOpacity, TextInput, ActivityIndicator} from 'react-native'
import React, {useCallback, useState} from 'react'
import {SafeAreaView} from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import CustomDropdown from "@/components/CustomDropdown";
import DatePicker from "react-native-date-picker";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import api from "@/config/api";
import {router, useFocusEffect} from "expo-router";
import {type} from "node:os";

type Pet = {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
}

const services = [
    {id: "", createdAt: "", name: "Dog Walking", updatedAt: ""},
    {id: "", createdAt: "", name: "Pet Sitting", updatedAt: ""},
    {id: "", createdAt: "", name: "Grooming", updatedAt: ""},
    {id: "", createdAt: "", name: "Health Care", updatedAt: ""},
];


const CreatePost = () => {
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [status, setStatus] = useState({message: "", type: ""});
    const [uploading, setUploading] = useState<boolean>(false);
    const [fetching, setFetching] = useState<boolean>(false);
    const [selectedPet, setSelectedPet] = useState<string | null>(null);
    const [pets, setPets] = useState<Pet[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        petId: "",
        scheduledTime: "",
        duration: "",
        price: 0,
        imageUrl: "",
        location: "",
        serviceName: ""
    });
    const [isPickerVisible, setPickerVisible] = useState(false);
    const [date, setDate] = useState<Date | null>(null);

    const showDatePicker = () => setPickerVisible(true);
    const hideDatePicker = () => setPickerVisible(false);

    const handleConfirm = (selectedDate: Date) => {
        setDate(selectedDate);
        setFormData(prev => ({
            ...prev,
            scheduledTime: selectedDate.toISOString(),
        }));
        hideDatePicker();
    };

    const submitPost = async () => {
        setStatus({message: "", type: ""});
        if (loading) return;
        if (uploading){
            setStatus({message: "Uploading image, please wait...", type: "error"});
            return;
        }
        if (!imageUri) {
            setStatus({message: "Please upload an image.", type: "error"});
            return;
        }
        setLoading(true);
        try {
            const res = await api.post("/posts", formData);
            setStatus({message: "Post uploaded successfully.", type: "success"});
            setFormData({
                title: "",
                description: "",
                petId: "",
                scheduledTime: "",
                duration: "",
                price: 0,
                imageUrl: "",
                location: "",
                serviceName: ""
            })
            setSelectedPet(null)
            setImageUri(null)
            setDate(null)
        } catch (e: any) {
            if (e.status === 400) {
                setStatus({message: "Please fill out all fields.", type: "error"});
            } else if (e.status === 500 || e.status === 503) {
                setStatus({message: "Server error, please try again later.", type: "error"});
                router.push("/homeAuth")
            } else {
                setStatus({message: "An error has occurred.", type: "error"});
            }
        } finally {
            setLoading(false);
        }
    }

    useFocusEffect(useCallback(() => {
        const fetchLoc = async () => {
            setFetching(true);
            setStatus({message: "", type: ""})
            setFormData({
                title: "",
                description: "",
                petId: "",
                scheduledTime: "",
                duration: "",
                price: 0,
                imageUrl: "",
                location: "",
                serviceName: ""
            })
            setDate(null)
            setSelectedPet(null)
            setImageUri(null)
            try {
                const res = await api.get("/users/me");
                if (res.data.location === null) {
                    alert("Please set your location from the edit profile section before proceeding.");

                    setTimeout(() => {
                        setFetching(false);
                        router.push("/(tabs)/(profile)/editProfile");
                    }, 0);
                } else {
                    setFormData(prev => ({...prev, location: res.data.location.name}));
                }
            } catch (e: any) {
                if (e.status === 503) {
                    alert("Server error, please try again later.");
                    router.replace("/homeAuth")
                } else {
                    console.log(e)
                }
            }
        }
        const fetchPets = async () => {
            try {
                const res = await api.get("/owner/pets");
                if (res.data.length === 0) {
                    alert("You currently don't have any registered pets. Please add a new pet before proceeding.");
                    setTimeout(() => {
                        setFetching(false);
                        router.push("/(tabs)/(profile)/myPets");
                    }, 0);
                } else {
                    setPets(res.data);
                }
            } catch (e: any) {
                if (e.status === 503) {
                    alert("Server error, please try again later.");
                    router.replace("/homeAuth")
                } else {
                    console.log(e)
                }
            } finally {
                setFetching(false);
            }
        }
        fetchLoc();
        fetchPets()
    }, []))

    const pickImage = async () => {
        setUploading(true);
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            alert("Permission required");
            setUploading(false);
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.8,
        });

        if (result.canceled) {
            setUploading(false);
            return;
        }

        const pickedImage = result.assets[0];
        setImageUri(pickedImage.uri);

        const formData = new FormData();
        formData.append("file", {
            uri: pickedImage.uri,
            name: "profile.jpg",
            type: "image/jpeg",
        } as any);

        try {
            const res = await api.post("/posts/upload-image", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            setFormData(prev => ({...prev, imageUrl: res.data.imageUrl}))
        } catch (e: any) {
            if (e.status === 400) {
                setStatus({message: "Invalid image format or size.", type: "error"});
            } else if (e.status === 503) {
                alert("Server error, please try again later.");
                router.replace("/homeAuth")
            }else {
                setStatus({message: "An error has occurred.", type: "error"});
            }
        } finally {
            setUploading(false);
        }
    };

    return (
        <SafeAreaView className="home-auth flex-1" edges={["right", "top", "left"]}>
            {fetching ? <View className={"flex-1 flex justify-center items-center"}>
                <View>
                    <ActivityIndicator size="large" />
                    <Text className={"text-center font-bold text-xl mt-3 text-[#0a0a0a]"}>Please wait...</Text>
                </View>
            </View> : <ScrollView className={"w-full flex-1"}>
                <View className="flex flex-col flex-1 w-full p-10 items-center">
                    <Text className="text-[#0A0A0A] text-5xl self-start">Create Post</Text>
                </View>
                <TouchableOpacity className={'relative w-full px-10 mb-4'} onPress={pickImage}>
                    <Image
                        source={(imageUri && imageUri !== "") ? {uri: imageUri} : require("../../assets/images/placeholder.png")}
                        alt="logo"
                        className="w-full h-52 rounded-3xl border border-[#dddddd]"
                        resizeMode="cover"
                    />
                </TouchableOpacity>
                <View className={'w-full flex-row flex justify-between px-10 my-4'}>
                    <CustomDropdown
                        data={pets}
                        value={selectedPet}
                        onChange={(value) => {
                            setSelectedPet(value);
                            setFormData(prev => ({...prev, petId: pets.filter(pet => pet.name === value)[0].id}));
                        }}
                        placeholder="Select Pet"
                        wrapperWidth={"w-[45%]"}
                        buttonColor={"#f1f1f1"}
                    />
                    <CustomDropdown
                        data={services}
                        value={formData.serviceName}
                        onChange={(value) => {
                            setFormData(prev => ({...prev, serviceName: value}));
                        }}
                        placeholder="Select Service"
                        wrapperWidth={"w-[45%]"}
                        buttonColor={"#f1f1f1"}
                    />
                </View>
                <View className={"px-5 w-full text-[#0A0A0A]"}>
                    <Text className={"text-xl"}>Title</Text>
                    <TextInput
                        className="w-full h-14 border border-gray-300 rounded-xl mt-3 px-5"
                        value={formData.title}
                        onChangeText={(text) =>
                            setFormData(prev => ({...prev, title: text}))
                        }
                        autoCapitalize="none"
                        autoComplete="off"
                        textContentType="none"
                        importantForAutofill="no"
                        returnKeyType="next"
                    />
                </View>
                <View className={"px-5 w-full mt-4 text-[#0A0A0A]"}>
                    <Text className={"text-xl"}>Description</Text>
                    <TextInput
                        className="w-full h-28 border border-gray-300 rounded-xl mt-3 px-5 py-3"
                        multiline={true}
                        value={formData.description}
                        onChangeText={(text) =>
                            setFormData(prev => ({...prev, description: text}))
                        }
                        autoCapitalize="none"
                        autoComplete="off"
                        textContentType="none"
                        importantForAutofill="no"
                        returnKeyType="next"
                    />
                </View>
                <View className={"w-full flex-row flex mt-4"}>
                    <View className={"px-5 pr-2 w-[50%] text-[#0A0A0A] "}>
                        <Text className={"text-xl"}>Duration</Text>
                        <TextInput
                            className="w-full h-14 border border-gray-300 rounded-xl mt-3 px-5 placeholder:text-xl pb-2"
                            value={formData.duration}
                            onChangeText={(text) =>
                                setFormData(prev => ({...prev, duration: text}))
                            }
                            autoCapitalize="none"
                            style={{textAlignVertical: 'center'}}
                            autoComplete="off"
                            textContentType="none"
                            importantForAutofill="no"
                            placeholder="5 Days"
                        />
                    </View>
                    <View className={"px-5 pl-2 w-[50%] text-[#0A0A0A]"}>
                        <Text className={"text-xl"}>Price</Text>
                        <View
                            className={
                                "w-full h-14 border border-gray-300 rounded-xl mt-3 px-3 flex-row items-center"
                            }
                        >
                            <Text className={"text-2xl text-[#0a0a0a]"}>$</Text>
                            <TextInput
                                className="w-full h-14 px-2 flex flex-row items-center justify-center placeholder:text-xl pb-2"
                                value={formData.price.toString()}
                                onChangeText={(text) =>
                                    setFormData(prev => ({...prev, price: Number(text)}))
                                }
                                style={{textAlignVertical: 'center'}}
                                autoCapitalize="none"
                                autoComplete="off"
                                placeholder="0.00"
                                textContentType="none"
                                importantForAutofill="no"
                                keyboardType="numeric"
                            />
                        </View>
                    </View>
                </View>
                <View className={"px-5 w-full mt-4 text-[#0A0A0A]"}>
                    <Text className={"text-xl"}>Job Date</Text>
                    <TouchableOpacity onPress={showDatePicker} className={
                        "w-full h-14 border border-gray-300 rounded-xl mt-3 px-5 flex-row items-center justify-between"
                    }>
                        <Text>
                            {date
                                ? date.toLocaleDateString() + " " + date.toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                            })
                                : "Choose date & time"}
                        </Text>
                        <Image source={require("../../assets/icons/arrow-down.png")} className={"w-4 h-4"}/>
                    </TouchableOpacity>
                    <DateTimePickerModal
                        isVisible={isPickerVisible}
                        mode="datetime"
                        onConfirm={handleConfirm}
                        onCancel={hideDatePicker}
                        date={date || new Date()}
                    />
                </View>
                <Text
                    className={`${status.type === "error" ? "text-rose-600" : "text-green-600"} font-bold my-4 text-center`}>{status.message}</Text>
                <TouchableOpacity
                    className="w-[85%] ml-[7.5%] bg-[#3944D5] h-14 rounded-full flex flex-row items-center justify-center mb-28"
                    onPress={submitPost}
                >
                    {loading ? (
                        <ActivityIndicator color={"#FFFFFF"} size={"small"}/>
                    ) : (
                        <Text className="text-white text-lg font-bold">Submit Post</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>}
        </SafeAreaView>
    );
}
export default CreatePost

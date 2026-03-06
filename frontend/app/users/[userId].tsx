import {
    View,
    Text,
    Image,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Linking,
    Alert,
    FlatList, TouchableWithoutFeedback
} from 'react-native'
import React, {useCallback, useEffect, useState} from 'react'
import {router, useFocusEffect, useLocalSearchParams} from 'expo-router'
import api from "@/config/api";
import {SafeAreaView} from "react-native-safe-area-context";
import {backendPath} from "@/config/backConfig";
import * as SecureStore from "expo-secure-store";
import TodaysBookingCard from "@/components/TodaysBookingCard";
import SitterNearYouCard from "@/components/SitterNearYouCard";

type Pet = {
    id: string;
    name: string;
    breed: string;
    imageUrl: string | null;
};

export type UserProfileResponse = {
    contactInfo: {
        id: string;
        firstname: string;
        lastname: string;
        email: string;
        location: string;
        profileImageUrl: string;
    };
    ownerInfo: {
        jobsPosted: number;
        sittersWorkedWith: number;
    };
    pets: Pet[];
    posts: any[];
    previousRating: number | null;
    sitterInfo: {
        averageRating: number;
        clientsWorkedWith: number;
        reviewsCount: number;
    };
};

const starNums = ["one", "two", "three", "four", "five"];


const UserProfile = () => {
    const {userId} = useLocalSearchParams<{ userId: string }>();
    const [loading, setLoading] = useState(false);
    const [isPetsOpen, setIsPetsOpen] = useState(true);
    const [enabled, setEnabled] = useState<boolean>(true);
    const [rating, setRating] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [user, setUser] = useState<UserProfileResponse>();
    const [filledStars, setFilledStars] = useState({one: false, two: false, three: false, four: false, five: false});

    const fillStars = (starNum: number) => {
        let tempStars: any = {};
        setEnabled(true);
        setRating(starNum + 1);
        for (let i = 0; i < 5; i++) {
            if (i <= starNum) tempStars[starNums[i]] = true;
            else tempStars[starNums[i]] = false;
        }
        setFilledStars(tempStars);
    }

    const reviewUser = async () => {
        if (submitting) {
            return;
        }
        setEnabled(false)
        setSubmitting(true);
        try {
            const res = await api.post(`users/${userId}/reviews`, {rating: rating});
        } catch (e: any) {
            if (e.status === 400) {
                alert("You dont have any past bookings with this user before.")
            } else if (e.status === 503) {
                alert("Server error, please try again later.");
                router.replace("/homeAuth")
            }
        } finally {
            setSubmitting(false);
        }
    }

    useFocusEffect(useCallback(() => {
        setFilledStars({one: false, two: false, three: false, four: false, five: false})
        setRating(0)
        setIsPetsOpen(true)
        const fetchUser = async () => {
            setLoading(true);
            try {
                const res = await api.get(`users/${userId}/profile`);
                setUser(res.data);
                if (res.data.ownerInfo.previousRating) {
                    fillStars(res.data.ownerInfo.previousRating - 4);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        fetchUser()
    }, []))

    return (
        <SafeAreaView edges={["bottom", "right", "left"]} className={"relative flex-1"}>
            {loading ? <View className={"flex flex-col flex-1 justify-center items-center h-full w-full"}>
                    <ActivityIndicator size="large"/>
                    <Text className={"text-2xl mt-6 text-[#0a0a0a] text-center"}>Fetching user...</Text>
                </View> :
                <ScrollView horizontal={false} className={"flex-1"}>
                    <View className={"flex p-10 py-7 flex-1"}>
                        <View className={"w-full flex flex-row h-20 items-center"}>
                            <Image source={{uri: user?.contactInfo.profileImageUrl}}
                                   className={"w-16 h-16 rounded-full"}/>
                            <View className={"flex-1 flex flex-col h-20 py-3 px-5 justify-between "}>
                                <View className={"flex flex-row items-center"}>
                                    <Text
                                        className={"text-xl text-[#0a0a0a] font-semibold"}>{user?.contactInfo.firstname + " " + user?.contactInfo.lastname}</Text>
                                    <Image source={require("../../assets/icons/verified-shield.png")}
                                           className={"w-4 h-4 ml-2"}/>
                                </View>
                                <Text
                                    className={"text-sm text-gray-500 font-semibold"}>{user?.contactInfo.location ? user?.contactInfo.location : "Location not set"}</Text>
                            </View>
                        </View>
                        <Text className={"text-2xl text-[#0a0a0a] mt-8"}>Pet Sitter Profile</Text>
                        <View className={"w-full flex flex-row items-center rounded-2xl bg-gray-200 h-20 mt-5"}>
                            <View className={"w-[33%] flex items-center justify-center border-r border-r-gray-400"}>
                                <Text
                                    className={"text-xl font-bold text-[#0a0a0a]"}>{user?.sitterInfo.clientsWorkedWith}</Text>
                                <Text className={" text-gray-500"}>Clients</Text>
                            </View>
                            <View className={"w-[33%] flex items-center justify-center border-r border-r-gray-400"}>
                                <Text
                                    className={"text-xl font-bold text-[#0a0a0a]"}>{user?.sitterInfo.reviewsCount}</Text>
                                <Text className={" text-gray-500"}>Reviews</Text>
                            </View>
                            <View className={"w-[33%] flex items-center justify-center"}>
                                <View className={"w-full flex flex-row justify-center items-center"}>
                                    <Image source={require("../../assets/icons/star.png")} alt="Star"
                                           className={"w-6 h-6 mr-2"}/>
                                    <Text
                                        className={"text-xl font-bold text-[#0a0a0a]"}>{user?.sitterInfo.averageRating ? user?.sitterInfo.clientsWorkedWith : "-"}</Text>
                                </View>
                                <Text className={" text-gray-600"}>Rating</Text>
                            </View>
                        </View>
                        <Text className={"text-2xl text-[#0a0a0a] mt-8"}>Pet Owner Profile</Text>
                        <View className={"w-full flex flex-row items-center rounded-2xl bg-gray-200 h-20 mt-5"}>
                            <View className={"w-[50%] flex items-center justify-center border-r border-r-gray-400"}>
                                <Text
                                    className={"text-xl font-bold text-[#0a0a0a]"}>{user?.ownerInfo.sittersWorkedWith}</Text>
                                <Text className={" text-gray-500"}>Sitter Worked With</Text>
                            </View>
                            <View className={"w-[50%] flex items-center justify-center"}>
                                <Text
                                    className={"text-xl font-bold text-[#0a0a0a]"}>{user?.ownerInfo.jobsPosted}</Text>
                                <Text className={" text-gray-500"}>Posts</Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            className="w-[100%] mb-4 mt-8"
                            onPress={() => setIsPetsOpen(prev => !prev)}
                        >
                            <View className="w-full flex flex-row justify-between items-center">
                                <Text className={"text-2xl text-[#0a0a0a]"}>Pets</Text>
                                <Text>{isPetsOpen ? "▲" : "▼"}</Text>
                            </View>
                        </TouchableOpacity>
                        {isPetsOpen && (
                            user?.pets && user.pets.length > 0 ? (
                                user.pets.map((pet) => (
                                    <View key={pet.id} className={"w-full"}>
                                        <View className={"w-full rounded-full h-20 py-4 flex flex-row items-center"}>
                                            <Image
                                                source={
                                                    pet.imageUrl
                                                        ? {uri: pet.imageUrl}
                                                        : require("../../assets/images/dog-placeholder.png")
                                                }
                                                className={"w-16 h-16 mr-4 rounded-full"}
                                            />
                                            <View className={"flex justify-around flex-1 h-20 py-3"}>
                                                <Text className={"font-bold text-lg text-[#0a0a0a]"}>{pet.name}</Text>
                                                <Text
                                                    className={"font-semibold text-sm text-gray-500"}>{pet.breed}</Text>
                                            </View>
                                        </View>
                                        <View className={"w-[50%] ml-[25%] h-[2px] bg-gray-300 my-3"}/>
                                    </View>
                                ))
                            ) : (
                                <Text className={"text-center"}>This user has no registered pets</Text>
                            )
                        )}
                        <Text className={"text-2xl text-[#0a0a0a] mt-8"}>Posts</Text>
                        {user?.posts && user.posts.length > 0 ? <FlatList
                            data={user?.posts}
                            horizontal={true}
                            className={"w-full mt-5"}
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={(item) => item.id}
                            renderItem={({item}) => (
                                <View className="w-[300px] h-60 pl-8">
                                    <SitterNearYouCard {...item} />
                                </View>
                            )}
                        /> : <Text className={"text-center mt-5"}>This user has no posts</Text>}
                        <Text className={"text-2xl text-[#0a0a0a] mt-8"}>Contact Information</Text>
                        <Text className={"text-gray-500 text-lg mt-5"}>Email: {user?.contactInfo.email}</Text>
                        <Text className={"text-2xl text-[#0a0a0a] mt-8"}>Rate User</Text>
                        <View className={"w-full flex flex-row items-center justify-center mt-5"}>
                            <TouchableWithoutFeedback onPress={() => fillStars(0)}>
                                <Image
                                    source={filledStars.one ? require("../../assets/icons/star.png") : require("../../assets/icons/star-outline.png")}
                                    alt="Star" className={"w-12 h-12 mx-1"}/>
                            </TouchableWithoutFeedback>
                            <TouchableWithoutFeedback onPress={() => fillStars(1)}>
                                <Image
                                    source={filledStars.two ? require("../../assets/icons/star.png") : require("../../assets/icons/star-outline.png")}
                                    alt="Star" className={"w-12 h-12 mx-1"}/>
                            </TouchableWithoutFeedback>
                            <TouchableWithoutFeedback onPress={() => fillStars(2)}>
                                <Image
                                    source={filledStars.three ? require("../../assets/icons/star.png") : require("../../assets/icons/star-outline.png")}
                                    alt="Star" className={"w-12 h-12 mx-1"}/>
                            </TouchableWithoutFeedback>
                            <TouchableWithoutFeedback onPress={() => fillStars(3)}>
                                <Image
                                    source={filledStars.four ? require("../../assets/icons/star.png") : require("../../assets/icons/star-outline.png")}
                                    alt="Star" className={"w-12 h-12 mx-1"}/>
                            </TouchableWithoutFeedback>
                            <TouchableWithoutFeedback onPress={() => fillStars(4)}>
                                <Image
                                    source={filledStars.five ? require("../../assets/icons/star.png") : require("../../assets/icons/star-outline.png")}
                                    alt="Star" className={"w-12 h-12 mx-1"}/>
                            </TouchableWithoutFeedback>
                        </View>
                        {rating === 0 ? <></> : <TouchableOpacity
                            disabled={!enabled}
                            onPress={reviewUser}
                            className="w-[40%] ml-[30%] bg-[#3944D5] h-12 rounded-full flex flex-row items-center justify-center mt-5 mb-5"
                        >
                            {submitting ? (
                                <ActivityIndicator color={"#FFFFFF"} size={"small"}/>
                            ) : (
                                <Text
                                    className="text-white text-lg font-semibold">{user?.previousRating ? "Update" : "Submit"}</Text>
                            )}
                        </TouchableOpacity>}

                    </View>
                </ScrollView>
            }
        </SafeAreaView>
    )
}
export default UserProfile;

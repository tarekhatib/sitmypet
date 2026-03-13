import {View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator, Linking, Alert} from 'react-native'
import React, {useEffect, useState} from 'react'
import {router, useLocalSearchParams} from 'expo-router'
import api from "@/config/api";
import {SafeAreaView} from "react-native-safe-area-context";
import {backendPath} from "@/config/backConfig";
import * as SecureStore from "expo-secure-store";

type Owner = {
    id: string;
    firstname: string;
    lastname: string;
    profileImageUrl: string;
    emailVerified: boolean;
    clientRating: number;
    createdAt: string;
    email: string;
    reviewsCount: number;
};

type Pet = {
    id: string;
    name: string;
    breed: string;
    imageUrl: string | null;
    ownerId: string;
    createdAt: string;
    updatedAt: string;
};

type Service = {
    id: string;
    createdAt: string;
    name: string;
    updatedAt: string;
}

type Post = {
    id: string;
    title: string;
    description: string;
    location: string;
    duration: string;
    imageUrl: string;
    service: Service;
    price: string;
    scheduledTime: string;
    status: "OPEN" | "CLOSED" | "PENDING";
    ownerId: string;
    petId: string;
    owner: Owner;
    pet: Pet;
    createdAt: string;
    updatedAt: string;
    isSaved: boolean;
    isApplied: boolean;
};

const PostDetails = () => {
    const {postId} = useLocalSearchParams<{ postId: string }>();
    const [post, setPost] = useState<Post>();
    const [role, setRole] = useState("");
    const [expired, setExpired] = useState(true);
    const [loading, setLoading] = useState<boolean>(false);
    const [deleting, setDeleting] = useState<boolean>(false);
    const [applying, setApplying] = useState<boolean>(false);
    const [isApplied, setIsApplied] = useState<boolean>(false);
    const [userId, setUserId] = useState<string>("");

    const deletePost = async () => {
        try {
            setDeleting(true);
            const res = await api.delete(`/posts/${postId}`);
            await SecureStore.setItemAsync("deletedPost", "true");
            router.back();
        } catch (error) {
            console.error(error);
        } finally {
            setDeleting(false);
        }
    };

    const showConfirmAlert = () => {
        Alert.alert(
            "Confirm Action",
            "Are you sure you want to delete this post?",
            [
                {
                    text: "No",
                    onPress: () => console.log("User pressed No"),
                    style: "cancel"
                },
                {
                    text: "Yes",
                    onPress: () => deletePost()
                }
            ],
            {cancelable: false}
        );
    };

    const handleSave = async () => {
        if (!post) return;

        setPost(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                isSaved: !prev.isSaved,
            };
        });

        try {
            await api.post(`/sitter/posts/${post.id}/toggle-save`);
        } catch (e) {
            console.log(e);
        }
    };

    const handleEmailPress = async () => {
        if (!post?.owner?.email) return;

        const email = post.owner.email.trim();
        const subject = encodeURIComponent("Regarding your pet sitting post");
        const body = encodeURIComponent("Hi " + post.owner.firstname + ",\n\nI'm interested in your post.");
        const url = `mailto:${email}?subject=${subject}&body=${body}`;

        try {
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
            } else {
                console.log("Mail app is not available on this device (simulator issue).");
            }
        } catch (e) {
            console.log(e);
        }
    };

    const formatLongDate = (isoDate: string) => {
        const date = new Date(isoDate);
        const month = date.toLocaleDateString('en-US', {month: 'long'});
        const dayOfMonth = date.getDate();
        const time = date.toLocaleTimeString('en-US', {hour: 'numeric', minute: '2-digit', hour12: true}); // 5:00 PM
        return `${month} ${dayOfMonth}, ${time}`;
    };

    const handeApplication = async () => {
        if (applying) return;
        setApplying(true);
        if (isApplied) {
            try {
                const res = await api.delete(`/applications/withdraw/${post?.id}`);
                setIsApplied(false);
            } catch (e) {
                console.log(e);
            } finally {
                setApplying(false);
            }
        } else {
            try {
                const res = await api.post(`/applications/apply/${post?.id}`);
                setIsApplied(true);
            } catch (e) {
                console.log(e);
            } finally {
                setApplying(false);
            }
        }
    }

    useEffect(() => {
        if (!post) return;
        setIsApplied(post.isApplied)
    }, [post]);

    const fetchHomeData = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/posts/${postId}`);
            setExpired(new Date(res.data.scheduledTime) < new Date());
            setPost(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const getUserId = async () => {
            const id = await SecureStore.getItemAsync("id");
            const rl = await SecureStore.getItemAsync("role");
            setRole(role as string);
            setUserId(id as string);
        }
        getUserId();
        fetchHomeData();
    }, []);

    return (
        <SafeAreaView edges={["bottom", "right", "left"]} className={"relative flex-1"}>
            {loading ? <View className={"flex flex-col flex-1 justify-center items-center h-full w-full"}>
                    <ActivityIndicator size="large"/>
                    <Text className={"text-2xl mt-6 text-[#0a0a0a] text-center"}>Fetching post...</Text>
                </View> :
                <ScrollView horizontal={false} className={"mb-48 flex-1"}>
                    <View className={"flex p-10 py-7"}>
                        <Image
                            source={{uri: post?.imageUrl}}
                            className="w-full h-56 rounded-3xl"
                            resizeMode="cover"
                        />
                        <View className={"w-full flex flex-row items-center py-5"}>
                            <Text className="text-2xl flex-1 text-[#0a0a0a] pr-3" numberOfLines={2}>{post?.title}</Text>
                            <TouchableOpacity onPress={handleSave}>
                                {post?.isSaved ?
                                    <Image source={require("../../assets/icons/bookmark-filled.png")}
                                           tintColor={'#3944D5'}
                                           className={"w-8 h-8"}/> :
                                    <Image source={require("../../assets/icons/bookmark.png")} className={"w-8 h-8"}/>}
                            </TouchableOpacity>
                        </View>
                        <View className={"w-full flex flex-row items-center"}>
                            <Image
                                source={require("../../assets/icons/pin.png")}
                                className={"w-4 h-4"}
                            />
                            <Text className={"text-gray-500 ml-2 font-semibold text-sm"}>
                                {post?.location}
                            </Text>
                            <View className={"w-1 h-1 rounded-full ml-2 bg-gray-500"}/>
                            <Text className={"text-gray-500 ml-2 font-semibold text-sm"}>
                                {post?.service.name}
                            </Text>
                            <View className={"w-[1px] h-[12px] rounded-full ml-2 bg-gray-500"}/>
                            <Text className={"text-gray-500 ml-2 font-semibold text-sm"}>
                                {post?.duration}
                            </Text>
                        </View>
                        <View className={"w-full flex flex-row items-center justify-between mt-4"}>
                            <Text className={"text-gray-500 ml-2 font-semibold text-sm"}>
                                {formatLongDate(post?.scheduledTime as string)}
                            </Text>
                            <Text className={"text-gray-700 mr-2 font-semibold text-xl"}>
                                ${post?.price}
                            </Text>
                        </View>
                        <View className={"w-full flex flex-row items-center rounded-2xl bg-gray-200 h-20 mt-3"}>
                            <View className={"w-[33%] flex items-center justify-center border-r border-r-gray-400"}>
                                <Image source={require("../../assets/icons/verified-shield.png")} alt="Verified shield"
                                       className={"w-6 h-6 mb-1"}/>
                                <Text className={"text-gray-500"}>Verified</Text>
                            </View>
                            <View className={"w-[33%] flex items-center justify-center border-r border-r-gray-400"}>
                                <Text
                                    className={"text-xl font-bold text-[#0a0a0a]"}>{post?.owner.reviewsCount ?? 0}</Text>
                                <Text className={" text-gray-500"}>Reviews</Text>
                            </View>
                            <View className={"w-[33%] flex items-center justify-center"}>
                                <View className={"w-full flex flex-row justify-center items-center"}>
                                    <Image source={require("../../assets/icons/star.png")} alt="Star"
                                           className={"w-6 h-6 mr-2"}/>
                                    <Text
                                        className={"text-xl font-bold text-[#0a0a0a]"}>{post?.owner.reviewsCount == 0 ? "-" : post?.owner.clientRating}</Text>
                                </View>
                                <Text className={" text-gray-600"}>Rating</Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            className={"w-full flex flex-row items-center my-2 mb-2 mt-6 rounded-full py-2"}
                            onPress={() => router.replace(`/users/${post?.owner.id}`)}>
                            <Image source={{uri: post?.owner.profileImageUrl}} className={"w-16 h-16 rounded-full"}/>
                            <View className={"flex justify-around ml-3 py-2"}>
                                <Text numberOfLines={1}
                                      className={"text-xl font-bold text-[#0a0a0a] flex-1"}>{post?.owner.firstname + " " + post?.owner.lastname}</Text>
                                <Text numberOfLines={1}
                                      className={"text-gray-500 text-sm font-bold"}>Joined {post?.owner.createdAt.split("-")[0]}</Text>
                            </View>
                        </TouchableOpacity>
                        <Text className={"text-xl text-[#0a0a0a] mt-5"}>Description</Text>
                        <Text className={"text-lg text-gray-500 mb-6"}>{post?.description}</Text>
                    </View>
                </ScrollView>
            }
            {loading ? <></> : userId === post?.ownerId ? <View
                className={"bg-white flex justify-around p-10 h-60 w-full absolute bottom-0 left-0 rounded-tl-[35px] rounded-tr-[35px] shadow-xl"}>
                <TouchableOpacity
                    disabled={expired}
                    className={`w-full h-14 ${expired ? "bg-gray-200" : "bg-[#E7E8FF]"} rounded-full flex items-center justify-center`}
                    onPress={() => router.push(`/posts/applications/${post?.id}`)}>
                    <Text
                        className={`text-lg  ${expired ? "text-gray-500 font-semibold" : "text-[#3944D5] font-bold"}`}>{expired ? "Post Expired" : "View Applications"}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={showConfirmAlert}
                    className={"w-full h-14 bg-[#fcb3b3] rounded-full flex flex-row justify-center items-center"}>
                    {deleting ? <ActivityIndicator size="small" color={"#dc2626"}/> :
                        <Text className={"text-red-600 font-bold text-lg"}>Delete Post</Text>}
                </TouchableOpacity>
            </View> : <View
                className={"bg-white flex justify-around p-10 h-60 w-full absolute bottom-0 left-0 rounded-tl-[35px] rounded-tr-[35px] shadow-xl"}>
                <TouchableOpacity
                    onPress={handleEmailPress}
                    className={"w-full h-14 bg-gray-200 rounded-full flex items-center justify-center"}
                >
                    <Text className={"text-lg font-bold text-[#0a0a0a]"}>Contact via email</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    className={`w-full h-14 ${isApplied ? "bg-[#E7E8FF]" : expired ? "bg-gray-200" : "bg-[#3944D5]"} rounded-full flex items-center justify-center`}
                    onPress={handeApplication}
                    disabled={(expired || role === "OWNER")}
                >
                    {applying ? <ActivityIndicator size="small" color={"#ffffff"}/> : expired ? <Text
                        className={"text-lg text-gray-500 font-semibold"}>Post Expired</Text> : role === "OWNER" ? <Text
                        className={"text-lg text-gray-500 font-semibold"}>{"Can't apply as owner"}</Text> : !isApplied ?
                        <Text className={"text-lg font-bold text-white"}>Apply to job</Text> :
                        <Text className={`text-lg font-bold text-[#3944D5]`}>Withdraw application</Text>}
                </TouchableOpacity>
            </View>}
        </SafeAreaView>
    )
}
export default PostDetails;

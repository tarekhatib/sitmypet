import {View, Text, Image, TouchableOpacity, ActivityIndicator, FlatList} from 'react-native'
import React, {useCallback, useState} from 'react'
import {SafeAreaView} from "react-native-safe-area-context";
import api from "@/config/api";
import {router, useFocusEffect} from "expo-router";

type Post = {
    id: string;
    title: string;
    duration: string;
    location: string;
    service: any;
}

type SitterProfile = {
    [key: string]: any;
};

type Sitter = {
    id: string;
    firstname: string;
    lastname: string;
    profile: SitterProfile;
    profileImageUrl: string;
};

type PostStatus = "PENDING" | "ACCEPTED" | "REJECTED";

type PostWithSitter = {
    createdAt: string;
    id: string;
    post: Post;
    sitter: Sitter;
    status: PostStatus;
};

const Requests = () => {
    const [rejecting, setRejecting] = useState({appId: "", rejecting: false});
    const [accepting, setAccepting] = useState({appId: "", accepting: false});
    const [fetching, setFetching] = useState(false);
    const [requests, setRequests] = useState<PostWithSitter[]>([]);

    useFocusEffect(useCallback(() => {
        const fetchReq = async () => {
            setFetching(true);
            try {
                const res = await api.get("/owner/requests");
                setRequests(res.data);
            } catch (error: any) {
                if (error.status === 503) {
                    alert("Server error, please try again later.");
                    router.replace("/homeAuth")
                } else {
                    console.log(error)
                }
            } finally {
                setFetching(false);
            }
        }
        fetchReq();
    }, []))

    const rejectApplication = async (appId: string) => {
        if (rejecting.rejecting) return;
        try {
            setRejecting({appId: appId, rejecting: true});
            const res = await api.post(`/applications/${appId}/reject`);
            setRequests(requests.filter((req) => req.id !== appId));
        } catch (error: any) {
            if (error.status === 503) {
                alert("Server error, please try again later.");
                router.replace("/homeAuth")
            } else {
                console.log(error)
            }
        } finally {
            setRejecting({appId: "", rejecting: false});
        }
    };

    const acceptApplication = async (appId: string, postId: string) => {
        if (accepting.accepting) return;
        try {
            setAccepting({appId: appId, accepting: true});
            const res = await api.post(`/applications/${appId}/accept`);
            setRequests(requests.filter((req) => req.post.id !== postId));
        } catch (error: any) {
            if (error.status === 503) {
                alert("Server error, please try again later.");
                router.replace("/homeAuth")
            } else {
                console.log(error)
            }
        } finally {
            setAccepting({appId: "", accepting: false});
        }
    };

    return (
        <SafeAreaView className="home-auth flex-1" edges={["right", "top", "left"]}>
            <View className="flex flex-col flex-1 w-full p-10 items-center">
                <Text className="text-[#0A0A0A] text-5xl self-start mb-10">Requests</Text>
                {fetching ? <View className={"flex flex-col flex-1 justify-center items-center h-full w-full"}>
                    <View className="w-full h-60 rounded-3xl flex flex-col border border-gray-200 mb-7 p-4 animate-pulse mt-10">

                        <View className="w-full h-20 flex flex-row items-center">
                            <View className="w-16 h-16 rounded-full bg-gray-200 mr-3" />

                            <View className="flex-1 justify-center">
                                <View className="w-40 h-4 bg-gray-200 rounded mb-2" />
                                <View className="w-28 h-3 bg-gray-200 rounded" />
                            </View>

                            <View className="flex flex-row items-center">
                                <View className="w-10 h-10 rounded-full bg-gray-200 mr-4" />
                                <View className="w-10 h-10 rounded-full bg-gray-200" />
                            </View>
                        </View>

                        <View className="flex-1 mt-2">
                            <View className="w-3/4 h-4 bg-gray-200 rounded mb-3" />

                            <View className="flex flex-row items-center">
                                <View className="w-20 h-3 bg-gray-200 rounded mr-2" />
                                <View className="w-1 h-1 rounded-full bg-gray-300 mr-2" />
                                <View className="w-16 h-3 bg-gray-200 rounded mr-2" />
                                <View className="w-[1px] h-[12px] bg-gray-300 mr-2" />
                                <View className="w-12 h-3 bg-gray-200 rounded" />
                            </View>
                        </View>

                        <View className="mt-2 w-full flex-row justify-between">
                            <View className="w-[48%] h-14 bg-gray-200 rounded-full" />
                            <View className="w-[48%] h-14 bg-gray-200 rounded-full" />
                        </View>

                    </View>
                    <View className="w-full h-60 rounded-3xl flex flex-col border border-gray-200 mb-7 p-4 animate-pulse">

                        <View className="w-full h-20 flex flex-row items-center">
                            <View className="w-16 h-16 rounded-full bg-gray-200 mr-3" />

                            <View className="flex-1 justify-center">
                                <View className="w-40 h-4 bg-gray-200 rounded mb-2" />
                                <View className="w-28 h-3 bg-gray-200 rounded" />
                            </View>

                            <View className="flex flex-row items-center">
                                <View className="w-10 h-10 rounded-full bg-gray-200 mr-4" />
                                <View className="w-10 h-10 rounded-full bg-gray-200" />
                            </View>
                        </View>

                        <View className="flex-1 mt-2">
                            <View className="w-3/4 h-4 bg-gray-200 rounded mb-3" />

                            <View className="flex flex-row items-center">
                                <View className="w-20 h-3 bg-gray-200 rounded mr-2" />
                                <View className="w-1 h-1 rounded-full bg-gray-300 mr-2" />
                                <View className="w-16 h-3 bg-gray-200 rounded mr-2" />
                                <View className="w-[1px] h-[12px] bg-gray-300 mr-2" />
                                <View className="w-12 h-3 bg-gray-200 rounded" />
                            </View>
                        </View>

                        <View className="mt-2 w-full flex-row justify-between">
                            <View className="w-[48%] h-14 bg-gray-200 rounded-full" />
                            <View className="w-[48%] h-14 bg-gray-200 rounded-full" />
                        </View>

                    </View>
                    <View className="w-full h-60 rounded-3xl flex flex-col border border-gray-200 mb-7 p-4 animate-pulse">

                        <View className="w-full h-20 flex flex-row items-center">
                            <View className="w-16 h-16 rounded-full bg-gray-200 mr-3" />

                            <View className="flex-1 justify-center">
                                <View className="w-40 h-4 bg-gray-200 rounded mb-2" />
                                <View className="w-28 h-3 bg-gray-200 rounded" />
                            </View>

                            <View className="flex flex-row items-center">
                                <View className="w-10 h-10 rounded-full bg-gray-200 mr-4" />
                                <View className="w-10 h-10 rounded-full bg-gray-200" />
                            </View>
                        </View>

                        <View className="flex-1 mt-2">
                            <View className="w-3/4 h-4 bg-gray-200 rounded mb-3" />

                            <View className="flex flex-row items-center">
                                <View className="w-20 h-3 bg-gray-200 rounded mr-2" />
                                <View className="w-1 h-1 rounded-full bg-gray-300 mr-2" />
                                <View className="w-16 h-3 bg-gray-200 rounded mr-2" />
                                <View className="w-[1px] h-[12px] bg-gray-300 mr-2" />
                                <View className="w-12 h-3 bg-gray-200 rounded" />
                            </View>
                        </View>

                        <View className="mt-2 w-full flex-row justify-between">
                            <View className="w-[48%] h-14 bg-gray-200 rounded-full" />
                            <View className="w-[48%] h-14 bg-gray-200 rounded-full" />
                        </View>

                    </View>
                </View> : requests.length === 0 ?
                    <View className={"flex flex-col flex-1 justify-center items-center h-full w-full"}>
                        <Text
                            className={"text-xl mb-10 text-[#0a0a0a] text-center"}>{"You haven't received any requests"}</Text>
                    </View> :
                    <FlatList data={requests} horizontal={false} showsVerticalScrollIndicator={false}
                              keyExtractor={(item) => item.id} renderItem={({item}) => (
                        <View className={"w-full h-64 rounded-3xl flex flex-col border border-gray-200 mb-7"} style={{
                            shadowColor: "#000",
                            shadowOffset: {width: 0, height: 6},
                            shadowOpacity: 0.15,
                            shadowRadius: 8,
                            elevation: 5,
                        }}>
                            <View className="w-full h-20 flex flex-row px-4 mt-1 mb-2 items-center">
                                <Image source={{uri: item.sitter.profileImageUrl}}
                                       className={"rounded-full w-16 h-16 mr-3"}/>
                                <View
                                    className={"flex justify-around py-3 h-20 flex-1"}><Text
                                    className={"text-lg text-[#0a0a0a] font-bold"}>{item.sitter.firstname + " " + item.sitter.lastname}</Text>
                                    <Text
                                        className={"text-sm text-gray-500 font-semibold"}>{item.sitter.profile.location ? item.sitter.profile.location.name : "Unknown Location"}
                                    </Text>
                                </View>
                                <View className={"flex flex-row items-center"}>
                                    <TouchableOpacity
                                        className={"bg-[#fcb3b3] h-10 w-10 rounded-full flex items-center justify-center mr-4"}
                                        onPress={() => rejectApplication(item.id)}>
                                        {(rejecting.rejecting && rejecting.appId === item.id) ?
                                            <ActivityIndicator size={"small"} color={"#DC2626"}/> :
                                            <Image source={require("../../assets/icons/close.png")}
                                                   className={"w-6 h-6"} tintColor={"#DC2626"}/>}
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        className={"bg-[#cacbed] h-10 w-10 rounded-full flex items-center justify-center"}
                                        onPress={() => acceptApplication(item.id, item.post.id)}>
                                        {(accepting.accepting && accepting.appId === item.id) ?
                                            <ActivityIndicator size={"small"} color={"#3944D5"}/> :
                                            <Image source={require("../../assets/icons/tick.png")}
                                                   className={"w-6 h-6"} tintColor={"#3944D5"}/>}
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View
                                className={
                                    "w-full overflow-hidden mt-2 flex-col flex-1 px-4"
                                }
                            >
                                <Text
                                    numberOfLines={1}
                                    ellipsizeMode="tail"
                                    className="w-full font-bold"
                                >
                                    {item.post.title}
                                </Text>
                                <View className={"w-full flex flex-row items-center mt-2"}>
                                    <Image
                                        source={require("../../assets/icons/pin.png")}
                                        className={"w-4 h-4"}
                                    />
                                    <Text className={"text-gray-500 ml-2 font-semibold text-sm"}>
                                        {item.post.location}
                                    </Text>
                                    <View className={"w-1 h-1 rounded-full ml-2 bg-gray-500"}/>
                                    <Text className={"text-gray-500 ml-2 font-semibold text-sm"}>
                                        {item.post.service.name}
                                    </Text>
                                    <View className={"w-[1px] h-[12px] rounded-full ml-2 bg-gray-500"}/>
                                    <Text className={"text-gray-500 ml-2 font-semibold text-sm"}>
                                        {item.post.duration}
                                    </Text>
                                </View>
                            </View>
                            <View className={"mt-2 w-full flex-row flex justify-between px-4 mb-7"}>
                                <TouchableOpacity
                                    className={`w-[48%] h-14 bg-[#E7E8FF] rounded-full flex items-center justify-center`}
                                    onPress={() => router.push(`/posts/${item.post.id}`)}
                                >
                                    <Text className={`text-lg font-bold text-[#3944D5]`}>View Post</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    className={`w-[48%] h-14 bg-gray-200 rounded-full flex items-center justify-center`}
                                    onPress={() => router.push(`/users/${item.sitter.id}`)}
                                >
                                    <Text className={`text-lg font-bold text-[#0a0a0a]`}>Sitter Profile</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}/>}
            </View>
        </SafeAreaView>
    )
}
export default Requests

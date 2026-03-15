import {
    View,
    Text,
    Image,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Linking,
    Alert,
    FlatList
} from 'react-native'
import React, {useCallback, useEffect, useState} from 'react'
import {router, useFocusEffect, useLocalSearchParams} from 'expo-router'
import api from "@/config/api";
import {SafeAreaView} from "react-native-safe-area-context";
import {backendPath} from "@/config/backConfig";
import * as SecureStore from "expo-secure-store";
import SitterNearYouCard from "@/components/SitterNearYouCard";

type Sitter = {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
    profileImageUrl: string;
    profile: any;
};

type Application = {
    id: string;
    createdAt: string;
    status: "PENDING" | "ACCEPTED" | "REJECTED"; // adjust if you have more statuses
    sitter: Sitter;
};

const PostDetails = () => {
    const {postId} = useLocalSearchParams<{ postId: string }>();
    const [applications, setApplications] = useState<Application[]>();
    const [loading, setLoading] = useState<boolean>(false);
    const [rejecting, setRejecting] = useState({appId: "", rejecting: false});
    const [accepting, setAccepting] = useState({appId: "", accepting: false});
    const [accepted, setAccepted] = useState(false);
    const [userId, setUserId] = useState<string>("");

    const fetchHomeData = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/applications/${postId}`);
            setApplications(res.data);
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
    };

    const rejectApplication = async (appId: string) => {
        if (rejecting.rejecting) return;
        try {
            setRejecting({appId: appId, rejecting: true});
            const res = await api.post(`/applications/${appId}/reject`);
            setApplications(applications?.filter((app) => app.id !== appId));
        } catch (error: any) {
            if (error.status === 503) {
                alert("Server error, please try again later.");
            } else {
                console.log(error)
            }
        } finally {
            setRejecting({appId: "", rejecting: false});
        }
    };

    const acceptApplication = async (appId: string) => {
        if (accepting.accepting) return;
        try {
            setAccepting({appId: appId, accepting: true});
            const res = await api.post(`/applications/${appId}/accept`);
            setAccepted(true);
        } catch (error: any) {
            if (error.status === 503) {
                alert("Server error, please try again later.");
            } else {
                console.log(error)
            }
        } finally {
            setAccepting({appId: "", accepting: false});
        }
    };

    useFocusEffect(useCallback(() => {
        fetchHomeData();
    }, []))

    return (
        <SafeAreaView edges={["bottom", "right", "left"]} className={"relative flex-1"}>
            {loading ? <View className={"flex flex-col flex-1 justify-center items-center h-full w-full"}>
                <ActivityIndicator size="large"/>
                <Text className={"text-2xl mt-6 text-[#0a0a0a] text-center"}>Fetching applications...</Text>
            </View> : accepted ? <>
                <View className={"flex flex-col flex-1 justify-center items-center h-full w-full"}>
                    <Text className={"text-2xl text-[#0a0a0a] text-center"}>This post already has an accepted
                        application.</Text>
                </View>
            </> : applications && applications.length > 0 ?
                <FlatList data={applications} horizontal={false} showsVerticalScrollIndicator={false}
                          className={"pt-6"}
                          keyExtractor={(item) => item.id}
                          renderItem={({item}) => (
                              <>
                                  <View className="w-full h-20 flex flex-row px-10 mt-1 mb-2 items-center">
                                      <Image source={{uri: item.sitter.profileImageUrl}}
                                             className={"rounded-full w-16 h-16 mr-3"}/>
                                      <View
                                          className={"flex justify-around py-3 h-20 flex-1"}><Text
                                          className={"text-lg text-[#0a0a0a] font-bold"}>{item.sitter.firstname + " " + item.sitter.lastname}</Text>
                                          <Text
                                              className={"text-sm text-gray-500 font-semibold"}>{item.createdAt.split("T")[0] + " at " + item.createdAt.split("T")[1].split(".")[0]}
                                          </Text>
                                      </View>
                                      <View className={"flex flex-row items-center"}>
                                          <TouchableOpacity
                                              className={"bg-[#fcb3b3] h-10 w-10 rounded-full flex items-center justify-center mr-4"}
                                              onPress={() => rejectApplication(item.id)}>
                                              {(rejecting.rejecting && rejecting.appId === item.id) ?
                                                  <ActivityIndicator size={"small"} color={"#DC2626"}/> :
                                                  <Image source={require("../../../assets/icons/close.png")}
                                                         className={"w-6 h-6"} tintColor={"#DC2626"}/>}
                                          </TouchableOpacity>
                                          <TouchableOpacity
                                              className={"bg-[#cacbed] h-10 w-10 rounded-full flex items-center justify-center"}
                                              onPress={() => acceptApplication(item.id)}>
                                              {(accepting.accepting && accepting.appId === item.id) ?
                                                  <ActivityIndicator size={"small"} color={"#3944D5"}/> :
                                                  <Image source={require("../../../assets/icons/tick.png")}
                                                         className={"w-6 h-6"} tintColor={"#3944D5"}/>}
                                          </TouchableOpacity>
                                      </View>
                                  </View>
                                  <View className={"w-[60%] ml-[20%] h-[1px] bg-gray-300 mb-1"}/>
                              </>
                          )}/> :
                <View className={"flex-1 flex justify-center items-center px-10"}><Text
                    className={"text-center text-lg text-[#0a0a0a]"}>This post has no pending
                    applications...</Text></View>
            }
        </SafeAreaView>
    )
}
export default PostDetails;

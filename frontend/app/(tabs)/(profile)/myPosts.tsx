import { router, useFocusEffect } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useCallback, useEffect, useState } from "react";
import {
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "@/config/api";
import SitterNearYouCardLoading from "@/components/SitterNearYouCardLoading";
import SitterNearYouCard from "@/components/SitterNearYouCard";

export type Pet = {
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
};

export type Post = {
  id: string;
  title: string;
  location: string;
  duration: string;
  imageUrl: string;
  service: Service;
  rating: number;
  reviewCount: number;
  ownerName: string;
  isSaved: boolean;
  createdAt: string;
};

export default function MyPosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  const getMyPosts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/posts");
      setPosts(res.data ?? []);
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

    useEffect(() => {
        getMyPosts();
    }, []);

    useFocusEffect(useCallback(
        () => {
            const getDeleted = async () => {
                const deleted = await SecureStore.getItemAsync("deletedPost");
                if (deleted === "true")
                {
                    getMyPosts();
                    await SecureStore.setItemAsync("deletedPost", "false");
                }
            }
            getDeleted()
        }, []
    ));

  const handleRemove = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  return (
    <SafeAreaView className="flex-1" edges={["right", "left"]}>
      {loading ? (
        <View className="flex mt-5">
          <View className={"w-full h-60 px-8 mb-6"}>
            <SitterNearYouCardLoading />
          </View>
          <View className={"w-full h-60 px-8 mb-6"}>
            <SitterNearYouCardLoading />
          </View>
          <View className={"w-full h-60 px-8 mb-6"}>
            <SitterNearYouCardLoading />
          </View>
        </View>
      ) : posts.length === 0 ? (
        <View className={"flex-1 flex items-center justify-center px-10 mb-24"}>
          <Text className="text-xl font-semibold text-[#0A0A0A] mb-2">
            No posts found
          </Text>
          <Text className="text-center text-base text-gray-500">
              {"You haven't posted anything yet."}
          </Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          className={"w-full mt-5"}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View className={"w-full h-60 px-8 mb-6"}>
              <SitterNearYouCard
                {...item}
                onUnsave={() => handleRemove(item.id)}
              />
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 75 }}
        />
      )}
    </SafeAreaView>
  );
}

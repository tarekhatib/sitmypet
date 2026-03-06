import {BlurView} from "expo-blur";
import React, {useState} from "react";
import {Image, Pressable, Text, View} from "react-native";

type NearbySitter = {
    id: string;
    sitterName: string;
    sitterImageUrl: string;
    location: string;
    rating: number;
    reviewCount: number;
    isSaved: boolean;
};

const OwnerNearYouCard = (props: NearbySitter) => {
    return (
        <View
            className={
                "flex flex-col px-4 py-4 w-full h-full rounded-3xl border-gray-300 border"
            }
        >
            <View className={"w-full h-[80%] rounded-2xl overflow-hidden relative mb-2"}>
                <View className={"rounded-full absolute top-1 right-3 z-10 overflow-hidden"}>
                    <BlurView
                        intensity={60}
                        tint="dark"
                        className="flex-row items-center px-2 py-1"
                    >
                        <Image
                            source={require("../assets/icons/star.png")}
                            className={"w-4 h-4 ml-1"}
                        />
                        <Text className={"text-[#FFCA00] text-sm ml-1"}>{props.rating}</Text>
                        <Text className={"text-sm text-white ml-1"}>{`(${props.reviewCount})`}</Text>
                    </BlurView>
                </View>
                <Image
                    source={{uri: props.sitterImageUrl}}
                    className={"w-14 h-14 absolute rounded-full"}
                    resizeMode={"cover"}
                />
                <Text className={"text-[#0A0A0A] text-lg bottom-0 absolute left-0 font-bold"}>{props.sitterName}</Text>
            </View>
            <View
                className={
                    "w-full overflow-hidden flex-col justify-end flex-1"
                }
            >
                <View className={"w-full flex flex-row items-center"}>
                    <Image
                        source={require("../assets/icons/pin.png")}
                        className={"w-4 h-4"}
                    />
                    <Text className={"text-gray-500 ml-2 font-semibold text-sm"}>
                        {props.location}
                    </Text>
                </View>
            </View>
        </View>
    );
};

export default OwnerNearYouCard;

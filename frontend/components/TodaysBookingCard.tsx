import React from "react";
import {Image, Text, View} from "react-native";

type Service = {
    id: string;
    createdAt?: string;
    name: string;
    updatedAt?: string;
}

type TodaysBooking = {
    id: string;
    location: string;
    ownerImageURL?: string;
    ownerName?: string;
    sitterImageURL?: string;
    sitterName?: string;
    petName: string;
    service: Service;
    time: string;
    styling: string;
    longDate?: boolean;
};

const serviceIcons: Record<string, any> = {
    "dog walking": require("../assets/icons/dogWalking.png"),
    "pet sitting": require("../assets/icons/petSitting.png"),
    "grooming": require("../assets/icons/petGrooming.png"),
    "health care": require("../assets/icons/petHealth.png"),
};

const formatLongDate = (isoDate: string) => {
    const date = new Date(isoDate);
    const month = date.toLocaleDateString('en-US', {month: 'short'}); // Feb
    const dayOfMonth = date.getDate();
    const time = date.toLocaleTimeString('en-US', {hour: 'numeric', minute: '2-digit', hour12: true}); // 5:00 PM
    return `${month} ${dayOfMonth}, ${time}`;
};

const TodaysBookingCard = (props: TodaysBooking) => {
    return (
        <View
            className={
                `flex flex-col px-6 py-6 rounded-3xl border-gray-300 border ml-8 justify-between ${props.styling}`
            }
        >
            <View className={"flex-row flex w-full justify-between items-center "}>
                <View className={"flex flex-row"}>
                    <Image
                        source={props.ownerName ? { uri: props.ownerImageURL } : { uri: props.sitterImageURL }}
                        alt="Home Image"
                        className={"w-12 h-12 rounded-full"}
                        resizeMode={"cover"}
                    />
                    <View className={"flex flex-col ml-3"}>
                        <Text className={"text-base text-[#0A0A0A] text-left"}>
                            {props.ownerName ? props.ownerName : props.sitterName}
                        </Text>
                        <Text className={"text-sm text-gray-500 text-left"}>
                            {props.petName}
                        </Text>
                    </View>
                </View>
                <Image
                    source={serviceIcons[props.service.name.toLowerCase()]}
                    className="w-10 h-10 rounded-full"
                    resizeMode="cover"
                />
            </View>
            <View
                className={"w-full flex-row h-20 p-4 bg-[#E8ECED] rounded-2xl justify-between"}
            >
                <View className={"flex justify-around"}>
                    <Text className={"text-xs text-gray-500"}>Service type</Text>
                    <Text className={"text-base"}>{props.service.name}</Text>
                </View>
                <View className={"h-full w-[1px] bg-gray-300"}/>

                <View className={"flex justify-around"}>
                    <Text className={"text-xs text-gray-500"}>{props.location}</Text>
                    <Text className={"text-base"}>
                        {props.longDate && props.time ? formatLongDate(props.time) : props.time}
                    </Text>
                </View>
            </View>
        </View>
    );
}

export default TodaysBookingCard;

import SitterNearYouCard from "@/components/SitterNearYouCard";
import React, {useEffect, useState} from "react";
import {ScrollView, Text, View, TouchableOpacity} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";
import api from "@/config/api";
import SitterNearYouCardLoading from "@/components/SitterNearYouCardLoading";
import TodaysBookingCard from "@/components/TodaysBookingCard";
import TodaysBookingCardLoading from "@/components/TodaysBookingCardLoading";
import GlobalBookingCard from "@/components/GlobalBookingCard";
import {router} from "expo-router";

interface Appointment {
    id: string;
    location: string;
    ownerImageURL: string;
    ownerName: string;
    sitterImageURL: string;
    sitterName: string;
    petName: string;
    service: {
        id: string;
        name: string;
    };
    time: string;
}

type AppointmentList = Appointment[];

const TodaysBookings = () => {
    const [loading, setLoading] = useState(false);
    const [completed, setCompleted] = useState<AppointmentList>([]);
    const [unCompleted, setUnCompleted] = useState<AppointmentList>([]);
    const [isFutureOpen, setIsFutureOpen] = useState(true);
    const [isPastOpen, setIsPastOpen] = useState(true);
    const [role, setRole] = useState("");


    useEffect(() => {
        const getBookings = async () => {
            setLoading(true);
            try {
                const tempRole = await SecureStore.getItemAsync("role");
                setRole(tempRole as string);
                const res = await api.get("/bookings");
                const allBookings: AppointmentList = res.data;
                const now = new Date();

                const futureBookings = allBookings.filter(
                    booking => new Date(booking.time) >= now
                );

                const pastBookings = allBookings.filter(
                    booking => new Date(booking.time) < now
                );
                setCompleted(pastBookings);
                setUnCompleted(futureBookings);
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
        getBookings();
    }, []);

    return (
        <SafeAreaView className={"flex-1"} edges={["right", "left"]}>
            {loading ? (
                <View className="flex mt-10">
                    <View className={"w-[90%] ml-[5%] px-6 mb-14 mt-10"}>
                        <TodaysBookingCardLoading/>
                    </View>
                    <View className={"w-[90%] ml-[5%] px-6 mb-14"}>
                        <TodaysBookingCardLoading/>
                    </View>
                    <View className={"w-[90%] ml-[5%] px-6 mb-10"}>
                        <TodaysBookingCardLoading/>
                    </View>
                </View>
            ) : (
                <ScrollView
                  className="w-full mt-10"
                  contentContainerStyle={{ paddingBottom: 20 }}
                >
                  <TouchableOpacity
                    className="w-[86%] ml-[7%] mb-4"
                    onPress={() => setIsFutureOpen(prev => !prev)}
                  >
                    <View className="w-full px-5 flex flex-row justify-between">
                      <Text className="text-xl font-bold text-[#0a0a0a]">Future Bookings</Text>
                      <Text>{isFutureOpen ? "▲" : "▼"}</Text>
                    </View>
                  </TouchableOpacity>
                  {isFutureOpen &&
                    unCompleted.map((booking) => (
                      <View key={booking.id} className="w-full mb-6">
                        <TodaysBookingCard {...booking} styling="w-[86%] ml-[7%] h-52" longDate={true} isSitter={role === "SITTER"} />
                      </View>
                    ))
                  }

                  <TouchableOpacity
                    className="w-[86%] ml-[7%] mb-4 mt-5"
                    onPress={() => setIsPastOpen(prev => !prev)}
                  >
                    <View className="w-full px-5 flex flex-row justify-between">
                      <Text className="text-xl font-bold text-[#0a0a0a]">Past Bookings</Text>
                      <Text>{isPastOpen ? "▲" : "▼"}</Text>
                    </View>
                  </TouchableOpacity>
                  {isPastOpen &&
                    completed.map((booking) => (
                      <View key={booking.id} className="w-full mb-6">
                        <TodaysBookingCard {...booking} styling="w-[86%] ml-[7%] h-52" longDate={true} isSitter={role === "SITTER"} />
                      </View>
                    ))
                  }
                </ScrollView>
            )}
        </SafeAreaView>
    );
};
export default TodaysBookings;

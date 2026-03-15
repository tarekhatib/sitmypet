import {router} from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, {useEffect, useState, useRef} from "react";
import {
    Image,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    StyleSheet,
    FlatList, ActivityIndicator,
} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import "../global.css";
import {BlurView} from "expo-blur";
import api from "@/config/api";
import SitterNearYouCardLoading from "@/components/SitterNearYouCardLoading";
import SitterNearYouCard from "@/components/SitterNearYouCard";
import {Animated} from "react-native";
import {Button, Menu, PaperProvider} from "react-native-paper";
import CustomDropdown from "@/components/CustomDropdown";

type Service = {
    id: string;
    createdAt: string;
    name: string;
    updatedAt: string;
}

type NearbyRequest = {
    id: string;
    title: string;
    location: string;
    duration: string;
    imageUrl: string;
    isSaved: boolean;
    service: Service;
    rating: number;
    reviewCount: number;
};

type Location = {
    id: string;
    createdAt: string;
    name: string;
    updatedAt: string;
};

export default function Explore() {
    const [nearYouFound, setNearYouFound] = useState<NearbyRequest[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [filter_toggled, setFilterToggled] = useState(false);
    const [sort_toggled, setSortToggled] = useState(false);
    const [sortOption, setSortOption] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [filterOptions, setFilterOptions] = useState({minRating: 0, location: "", services: ""});
    const filterHeight = useRef(new Animated.Value(0)).current;
    const sortHeight = useRef(new Animated.Value(0)).current;
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const fetchData = async (pageNumber: number, isLoadMore = false) => {
        if ((loading && !isLoadMore) || (loadingMore && isLoadMore) || (!hasMore && pageNumber !== 1)) return;
        isLoadMore ? setLoadingMore(true) : setLoading(true);

        try {
            const res = await api.get("/sitter/explore", {
                params: {
                    search: searchTerm,
                    sortBy: sortOption,
                    ...filterOptions,
                    page: pageNumber,
                    limit: 5,
                },
            });

            const requests = res.data.posts ?? [];

            if (isLoadMore) {
                setNearYouFound(prev => [...prev, ...requests]);
            } else {
                setNearYouFound(requests);
            }

            setHasMore(requests.length > 0);
            setPage(pageNumber + 1);
        } catch (error: any) {
            if (error.status === 503) {
                alert("Server error, please try again later.");
                router.replace("/homeAuth")
            } else {
                console.log(error)
            }
        } finally {
            isLoadMore ? setLoadingMore(false) : setLoading(false);
        }
    };

    useEffect(() => {
        setPage(1);
        setHasMore(true);
        fetchData(1, false);
    }, [searchTerm, sortOption, filterOptions]);

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const res = await api.get("/locations");
                setLocations(res.data);
            } catch (error: any) {
                if (error.status === 503) {
                    alert("Server error, please try again later.");
                    router.replace("/homeAuth")
                } else {
                    console.log(error)
                }
            }
        };
        fetchLocations();
    }, []);

    useEffect(() => {
        Animated.timing(filterHeight, {
            toValue: filter_toggled ? 320 : 0,
            duration: 300,
            useNativeDriver: false,
        }).start();
    }, [filter_toggled]);

    useEffect(() => {
        Animated.timing(sortHeight, {
            toValue: sort_toggled ? 280 : 0,
            duration: 300,
            useNativeDriver: false,
        }).start();
    }, [sort_toggled]);

    const renderFooter = () => {
        if (!loadingMore) return null;

        return (
            <View className="py-6">
                <ActivityIndicator size="small" color="#0A0A0A" />
            </View>
        );
    };

    return (
        <PaperProvider>
            <SafeAreaView className="flex-1" edges={["left", "right", "top"]}>
                <View className="flex flex-col w-full p-10 items-center pb-5">
                    <Text className="text-[#0A0A0A] text-4xl self-start">Explore</Text>
                    <View className={"flex flex-row w-full items-center mt-6 justify-between"}>
                        <View
                            style={{
                                shadowColor: "#000",
                                shadowOffset: {width: 0, height: 8},
                                shadowOpacity: 0.18,
                                shadowRadius: 20,
                                elevation: 12,
                            }}
                        >
                            <View
                                style={{
                                    borderRadius: 50,
                                    overflow: "hidden",
                                    width: 200,
                                    height: 50,
                                }}
                            >
                                <BlurView
                                    intensity={30}
                                    tint="light"
                                    style={{
                                        flex: 1,
                                        flexDirection: "row",
                                        alignItems: "center",
                                        paddingHorizontal: 14,
                                        borderWidth: 1,
                                        borderColor: "rgba(255,255,255,0.25)",
                                    }}
                                >
                                    <View
                                        style={{
                                            ...StyleSheet.absoluteFillObject,
                                            backgroundColor: "rgba(210,210,210,0.15)",
                                        }}
                                    />

                                    <Image
                                        source={require("../../assets/icons/search.png")}
                                        tintColor="#666666"
                                        style={{width: 18, height: 18, marginRight: 8, zIndex: 2}}
                                    />

                                    <TextInput
                                        placeholder="Search"
                                        placeholderTextColor="#666666"
                                        style={{
                                            flex: 1,
                                            color: "#666666",
                                            fontSize: 14,
                                            zIndex: 2,
                                        }}
                                        value={searchTerm}
                                        autoCapitalize={"none"}
                                        onChangeText={(text) => setSearchTerm(text)}
                                    />
                                </BlurView>
                            </View>
                        </View>
                        <TouchableOpacity onPress={() => {
                            setFilterToggled(!filter_toggled)
                            setSortToggled(false);
                        }}>
                            <View
                                style={{
                                    shadowColor: "#000",
                                    shadowOffset: {width: 0, height: 6},
                                    shadowOpacity: 0.2,
                                    shadowRadius: 14,
                                    elevation: 10,
                                }}
                            >
                                <View
                                    style={{
                                        borderRadius: 50,
                                        overflow: "hidden",
                                        width: 50,
                                        height: 50,
                                    }}
                                >
                                    <BlurView
                                        intensity={30}
                                        tint="light"
                                        style={{
                                            flex: 1,
                                            flexDirection: "row",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            borderWidth: 1,
                                            borderColor: "rgba(255,255,255,0.25)",
                                        }}
                                    >
                                        <View
                                            style={{
                                                ...StyleSheet.absoluteFillObject,
                                                backgroundColor: "rgba(210,210,210,0.15)",
                                            }}
                                        />
                                        <Image source={require("../../assets/icons/filter.png")} className={"w-8 h-8"}/>

                                    </BlurView>
                                </View>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {
                            setSortToggled(!sort_toggled);
                            setFilterToggled(false)
                        }}>
                            <View
                                style={{
                                    shadowColor: "#000",
                                    shadowOffset: {width: 0, height: 6},
                                    shadowOpacity: 0.2,
                                    shadowRadius: 14,
                                    elevation: 10,
                                }}
                            >
                                <View
                                    style={{
                                        borderRadius: 50,
                                        overflow: "hidden",
                                        width: 50,
                                        height: 50,
                                    }}
                                >
                                    <BlurView
                                        intensity={30}
                                        tint="light"
                                        style={{
                                            flex: 1,
                                            flexDirection: "row",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            borderWidth: 1,
                                            borderColor: "rgba(255,255,255,0.25)",
                                        }}
                                    >
                                        <View
                                            style={{
                                                ...StyleSheet.absoluteFillObject,
                                                backgroundColor: "rgba(210,210,210,0.15)",
                                            }}
                                        />
                                        <Image source={require("../../assets/icons/sort.png")} className={"w-8 h-8"}/>
                                    </BlurView>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                <Animated.View
                    style={{
                        height: filterHeight,
                        shadowOpacity: 0.25,
                        shadowRadius: 20,
                        elevation: 20,
                    }}
                    className="w-full overflow-hidden px-5"
                >
                    <View
                        style={{
                            flex: 1,
                            paddingTop: 0,
                            padding: 20,
                        }}
                    >
                        <Text className="text-xl font-semibold mb-4">Filters</Text>

                        <Text className="text-sm text-gray-500 mb-2">Service Type</Text>
                        <View className="flex-row mb-4 flex-wrap">
                            <TouchableOpacity
                                className="px-4 py-2 mr-2 rounded-full bg-gray-200"
                                style={[
                                    {
                                        shadowColor: "#000",
                                        shadowOffset: {width: 0, height: 1},
                                        shadowOpacity: 0.08,
                                        shadowRadius: 3,
                                        elevation: 2,
                                    },
                                    filterOptions.services === "Dog Walking" ? {backgroundColor: "#0A0A0A"} : {},
                                ]}
                                onPress={() => {
                                    setFilterOptions(prevState => (filterOptions.services === "Dog Walking" ? {
                                        ...prevState,
                                        services: ""
                                    } : {
                                        ...prevState,
                                        services: "Dog Walking"
                                    }))
                                }}>
                                <Text
                                    style={filterOptions.services === "Dog Walking" ? {color: "white"} : {color: "black"}}>Walking</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="px-4 py-2 mr-2 rounded-full bg-gray-200"
                                style={[
                                    {
                                        shadowColor: "#000",
                                        shadowOffset: {width: 0, height: 1},
                                        shadowOpacity: 0.08,
                                        shadowRadius: 3,
                                        elevation: 2,
                                    },
                                    filterOptions.services === "Pet Sitting" ? {backgroundColor: "#0A0A0A"} : {},
                                ]}
                                onPress={() => {
                                    setFilterOptions(prevState => (filterOptions.services === "Pet Sitting" ? {
                                        ...prevState,
                                        services: ""
                                    } : {
                                        ...prevState,
                                        services: "Pet Sitting"
                                    }))
                                }}>
                                <Text
                                    style={filterOptions.services === "Pet Sitting" ? {color: "white"} : {color: "black"}}>Sitting</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="px-4 py-2 rounded-full bg-gray-200"
                                style={[
                                    {
                                        shadowColor: "#000",
                                        shadowOffset: {width: 0, height: 1},
                                        shadowOpacity: 0.08,
                                        shadowRadius: 3,
                                        elevation: 2,
                                    },
                                    filterOptions.services === "Grooming" ? {backgroundColor: "#0A0A0A"} : {},
                                ]}
                                onPress={() => {
                                    setFilterOptions(prevState => (filterOptions.services === "Grooming" ? {
                                        ...prevState,
                                        services: ""
                                    } : {
                                        ...prevState,
                                        services: "Grooming"
                                    }))
                                }}>
                                <Text
                                    style={filterOptions.services === "Grooming" ? {color: "white"} : {color: "black"}}>Grooming</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="px-4 py-2 rounded-full bg-gray-200 mt-2"
                                style={[
                                    {
                                        shadowColor: "#000",
                                        shadowOffset: {width: 0, height: 1},
                                        shadowOpacity: 0.08,
                                        shadowRadius: 3,
                                        elevation: 2,
                                    },
                                    filterOptions.services === "Health Care" ? {backgroundColor: "#0A0A0A"} : {},
                                ]}
                                onPress={() => {
                                    setFilterOptions(prevState => (filterOptions.services === "Health Care" ? {
                                        ...prevState,
                                        services: ""
                                    } : {
                                        ...prevState,
                                        services: "Health Care"
                                    }))
                                }}>
                                <Text
                                    style={filterOptions.services === "Health Care" ? {color: "white"} : {color: "black"}}>Health Care</Text>
                            </TouchableOpacity>
                        </View>

                        <Text className="text-sm text-gray-500 mb-2">Minimum Rating</Text>
                        <View className="flex-row mb-6">
                            <TouchableOpacity
                                className="px-4 py-2 mr-2 rounded-full bg-gray-200"
                                style={[
                                    {
                                        shadowColor: "#000",
                                        shadowOffset: {width: 0, height: 1},
                                        shadowOpacity: 0.08,
                                        shadowRadius: 3,
                                        elevation: 2,
                                    },
                                    filterOptions.minRating === 3 ? {backgroundColor: "#0A0A0A"} : {},
                                ]}
                                onPress={() => {
                                    setFilterOptions(prevState => (filterOptions.minRating === 3 ? {
                                        ...prevState,
                                        minRating: 0
                                    } : {
                                        ...prevState,
                                        minRating: 3
                                    }))
                                }}>
                                <Text style={filterOptions.minRating === 3 ? {color: "white"} : {color: "black"}}>★
                                    3+</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="px-4 py-2 mr-2 rounded-full bg-gray-200"
                                style={[
                                    {
                                        shadowColor: "#000",
                                        shadowOffset: {width: 0, height: 1},
                                        shadowOpacity: 0.08,
                                        shadowRadius: 3,
                                        elevation: 2,
                                    },
                                    filterOptions.minRating === 4 ? {backgroundColor: "#0A0A0A"} : {},
                                ]}
                                onPress={() => {
                                    setFilterOptions(prevState => (filterOptions.minRating === 4 ? {
                                        ...prevState,
                                        minRating: 0
                                    } : {
                                        ...prevState,
                                        minRating: 4
                                    }))
                                }}>
                                <Text style={filterOptions.minRating === 4 ? {color: "white"} : {color: "black"}}>★
                                    4+</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="px-4 py-2 rounded-full bg-gray-200"
                                style={[
                                    {
                                        shadowColor: "#000",
                                        shadowOffset: {width: 0, height: 1},
                                        shadowOpacity: 0.08,
                                        shadowRadius: 3,
                                        elevation: 2,
                                    },
                                    filterOptions.minRating === 5 ? {backgroundColor: "#0A0A0A"} : {},
                                ]}
                                onPress={() => {
                                    setFilterOptions(prevState => (filterOptions.minRating === 5 ? {
                                        ...prevState,
                                        minRating: 0
                                    } : {
                                        ...prevState,
                                        minRating: 5
                                    }))
                                }}>
                                <Text style={filterOptions.minRating === 5 ? {color: "white"} : {color: "black"}}>★
                                    5</Text>
                            </TouchableOpacity>
                        </View>
                        <Text className="text-sm text-gray-500 mb-2">Location</Text>
                        <CustomDropdown
                            data={locations}
                            value={filterOptions.location}
                            onChange={(value: any) =>
                                setFilterOptions(prevState => ({
                                    ...prevState,
                                    location: value,
                                }))
                            }
                            placeholder="Select location"
                        />

                        <View className="flex-row justify-between mt-6">
                            <TouchableOpacity
                                onPress={() => setFilterOptions({minRating: 0, location: "", services: ""})}>
                                <Text className="text-gray-500">Reset</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Animated.View>
                <Animated.View
                    style={{
                        height: sortHeight,
                        shadowOpacity: 0.25,
                        shadowRadius: 20,
                        elevation: 20,
                    }}
                    className="w-full overflow-hidden px-5 "
                >
                    <View
                        style={{
                            padding: 20,
                            paddingTop: 0,
                            paddingBottom: 0
                        }}
                    >
                        <Text className="text-xl font-semibold mb-4">Sort By</Text>

                        <TouchableOpacity className="py-3 border-b border-gray-200 flex flex-row items-center"
                                          onPress={() => setSortOption("nearest_first")}>
                            <Image source={require("../../assets/icons/tick.png")} className={"w-4 h-4 mr-4"}
                                   style={sortOption !== "nearest_first" ? {display: "none"} : {}}/>
                            <Text className="text-base">Nearest First</Text>
                        </TouchableOpacity>


                        <TouchableOpacity className="py-3 border-b border-gray-200 flex flex-row items-center"
                                          onPress={() => setSortOption("highest_rated")}>
                            <Image source={require("../../assets/icons/tick.png")} className={"w-4 h-4 mr-4"}
                                   style={sortOption !== "highest_rated" ? {display: "none"} : {}}/>
                            <Text className="text-base">Highest Rated</Text>
                        </TouchableOpacity>


                        <TouchableOpacity className="py-3 border-b border-gray-200 flex flex-row items-center"
                                          onPress={() => setSortOption("most_reviews")}>
                            <Image source={require("../../assets/icons/tick.png")} className={"w-4 h-4 mr-4"}
                                   style={sortOption !== "most_reviews" ? {display: "none"} : {}}/>
                            <Text className="text-base">Most Reviews</Text>
                        </TouchableOpacity>


                        <TouchableOpacity className="py-3 border-b border-gray-200 flex flex-row items-center"
                                          onPress={() => setSortOption("lowest_price")}>
                            <Image source={require("../../assets/icons/tick.png")} className={"w-4 h-4 mr-4"}
                                   style={sortOption !== "lowest_price" ? {display: "none"} : {}}/>
                            <Text className="text-base">Lowest Price</Text>
                        </TouchableOpacity>

                        <TouchableOpacity className="py-3 flex flex-row items-center"
                                          onPress={() => setSortOption("highest_price")}>
                            <Image source={require("../../assets/icons/tick.png")} className={"w-4 h-4 mr-4"}
                                   style={sortOption !== "highest_price" ? {display: "none"} : {}}/>
                            <Text className="text-base">Highest Price</Text>
                        </TouchableOpacity>
                    </View>
                    <View className="flex-row justify-between px-5 mt-8">
                        <TouchableOpacity onPress={() => setSortOption("")}>
                            <Text className="text-gray-500">Reset</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
                {loading && !loadingMore ? (
                    <View className="flex mt-5">
                        <View className={"w-full h-60 px-8 mb-6"}>
                            <SitterNearYouCardLoading/>
                        </View>
                        <View className={"w-full h-60 px-8 mb-6"}>
                            <SitterNearYouCardLoading/>
                        </View>
                        <View className={"w-full h-60 px-8 mb-6"}>
                            <SitterNearYouCardLoading/>
                        </View>
                    </View>
                ) : nearYouFound.length === 0 ? (
                    <View className="flex-1 flex items-center justify-center px-10">
                        <Text className="text-xl font-semibold text-[#0A0A0A] mb-2">
                            No posts found
                        </Text>
                        <Text className="text-center text-base text-gray-500">
                            There are no posts matching your search or filters right now. Try adjusting your filters or
                            check back later.
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={nearYouFound}
                        className="w-full mt-2"
                        keyExtractor={(item) => item.id}
                        renderItem={({item}) => (
                            <View className="w-full h-72 px-8 mb-6">
                                <SitterNearYouCard {...item} />
                            </View>
                        )}
                        contentContainerStyle={{paddingBottom: 75}}
                        onEndReached={() => fetchData(page, true)}
                        onEndReachedThreshold={0.5}
                        ListFooterComponent={renderFooter}
                    />
                )}
            </SafeAreaView>
        </PaperProvider>
    );
}

const styles = StyleSheet.create({
    dropdown: {
        height: 50,
        borderColor: 'gray',
        borderWidth: 0.5,
        borderRadius: 8,
        paddingHorizontal: 8,
        backgroundColor: '#fefefe',
    },
});
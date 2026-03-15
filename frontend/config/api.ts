import { backendPath } from "@/config/backConfig";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import * as SecureStore from "expo-secure-store";
import {router} from "expo-router";

interface DecodedToken {
    exp: number;
}

const api = axios.create({
    baseURL: `${backendPath}`,
    withCredentials: true,
});

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (token: string | null) => void;
    reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

async function clearAuthData() {
    try {
        await SecureStore.deleteItemAsync("accessToken");
        await SecureStore.deleteItemAsync("refreshToken");
        await SecureStore.deleteItemAsync("id");
        await SecureStore.deleteItemAsync("role");
        await SecureStore.deleteItemAsync("firstname");
        await SecureStore.deleteItemAsync("lastname");
        await SecureStore.deleteItemAsync("profileImageUrl");
        await SecureStore.deleteItemAsync("email");
        await SecureStore.deleteItemAsync("isVerified");
    } catch (error) {
        console.log("Failed to clear auth data:", error);
    }
}

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    config.headers = config.headers ?? {};
    const token = await SecureStore.getItemAsync("accessToken");
    const refresh = await SecureStore.getItemAsync("refreshToken");
    if (token) {
        try {
            const decoded = jwtDecode<DecodedToken>(token);
            const isExpired = Date.now() / 1000 > decoded.exp;

            if (isExpired && !isRefreshing) {
                isRefreshing = true;

                try {
                    const res = await axios.post(
                        `${backendPath}/auth/refresh`,
                        { refreshToken:  refresh},
                        { withCredentials: true }
                    );
                    const newToken = res.data.accessToken;
                    const newRefreshToken = res.data.refreshToken;
                    await SecureStore.setItemAsync("accessToken", newToken);
                    await SecureStore.setItemAsync("refreshToken", newRefreshToken);
                    api.defaults.headers.common[
                        "Authorization"
                        ] = `Bearer ${newToken}`;
                    processQueue(null, newToken);
                    config.headers.Authorization = `Bearer ${newToken}`;
                } catch (err: any) {
                    if (err.status === 401 || err.status === 403) {
                        processQueue(err, null);
                        await clearAuthData();
                        router.replace("/(auth)/signin");
                    }
                } finally {
                    isRefreshing = false;
                }
            } else if (isExpired && isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({
                        resolve: (token: string | null) => {
                            if (token) {
                                config.headers.Authorization = `Bearer ${token}`;
                            }
                            resolve(config);
                        },
                        reject: (err) => reject(err),
                    });
                });
            } else {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch {
            await clearAuthData();
            router.replace("/(auth)/signin");
        }
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        if (error.response && error.response.status === 401) {
            await clearAuthData();
        }
        return Promise.reject(error);
    }
);

export default api;

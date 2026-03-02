import { Platform } from "react-native";

const STORAGE_KEY = "dwz_assets";

export type AssetData = {
    currentAmount: number;
    updatedAt: string;
};

export const AssetRepository = {
    async get(): Promise<AssetData | null> {
        if (Platform.OS === "web") {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : null;
        }
        // Native: fallback to same localStorage-like approach via AsyncStorage
        // For now return null on native (not the primary target)
        return null;
    },

    async save(amount: number): Promise<void> {
        if (Platform.OS === "web") {
            const data: AssetData = { currentAmount: amount, updatedAt: new Date().toISOString() };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        }
    },
};

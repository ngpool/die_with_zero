import "../global.css";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, Text, ActivityIndicator } from "react-native";

import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { db } from "../src/db/client";
import migrations from "../drizzle/migrations";

export default function RootLayout() {
    const { success, error } = useMigrations(db, migrations);

    if (error) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <Text>Migration failed! {error.message}</Text>
            </View>
        );
    }

    if (!success) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <SafeAreaProvider>
            <Slot />
            <StatusBar style="auto" />
        </SafeAreaProvider>
    );
}

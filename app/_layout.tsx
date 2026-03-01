import "../global.css";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, Text, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";

import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { db, initDb } from "../src/db/client";
import migrations from "../drizzle/migrations";

export default function RootLayout() {
    const [isDbInitialized, setIsDbInitialized] = useState(false);

    useEffect(() => {
        initDb().then(() => setIsDbInitialized(true));
    }, []);

    if (!isDbInitialized) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return <MigrationManager />;
}

function MigrationManager() {
    const { success, error: migrationError } = useMigrations(db, migrations);

    if (migrationError) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <Text>Migration failed! {migrationError.message}</Text>
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

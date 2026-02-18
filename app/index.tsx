import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { UserProfileRepository } from "../src/repositories/UserProfileRepository";

export default function Index() {
    const [isLoading, setIsLoading] = useState(true);
    const [hasProfile, setHasProfile] = useState(false);

    useEffect(() => {
        async function checkProfile() {
            try {
                const profile = await UserProfileRepository.getProfile();
                setHasProfile(!!profile);
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        }
        checkProfile();
    }, []);

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    if (hasProfile) {
        return <Redirect href="/(tabs)" />;
    }

    return <Redirect href="/onboarding" />;
}

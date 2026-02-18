import { router } from "expo-router";
import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { UserProfileRepository } from "../src/repositories/UserProfileRepository";
import { LifeExpectancyService } from "../src/services/LifeExpectancyService";

export default function Onboarding() {
    const [name, setName] = useState("");
    const [dob, setDob] = useState(""); // YYYY-MM-DD
    const [expectancy, setExpectancy] = useState("80");

    const handleSave = async () => {
        const lifeExpectancyYears = Number.parseInt(expectancy, 10);
        // Simple validation
        if (!name || !dob || Number.isNaN(lifeExpectancyYears)) {
            alert("Please fill in all fields correctly.");
            return;
        }

        try {
            await UserProfileRepository.createOrUpdateProfile({
                name,
                dateOfBirth: dob,
                lifeExpectancyYears,
            });
            router.replace("/(tabs)");
        } catch (e) {
            console.error(e);
            alert("Failed to save profile.");
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white p-6">
            <View className="flex-1 justify-center space-y-6">
                <Text className="text-3xl font-bold text-center mb-8">
                    Welcome to Die With Zero
                </Text>

                <View>
                    <Text className="text-gray-700 mb-2">Name</Text>
                    <TextInput
                        className="border border-gray-300 rounded-lg p-3 text-lg"
                        placeholder="Your Name"
                        value={name}
                        onChangeText={setName}
                    />
                </View>

                <View>
                    <Text className="text-gray-700 mb-2">Date of Birth (YYYY-MM-DD)</Text>
                    <TextInput
                        className="border border-gray-300 rounded-lg p-3 text-lg"
                        placeholder="2000-01-01"
                        value={dob}
                        onChangeText={setDob}
                    />
                </View>

                <View>
                    <Text className="text-gray-700 mb-2">Life Expectancy (Years)</Text>
                    <TextInput
                        className="border border-gray-300 rounded-lg p-3 text-lg"
                        placeholder="80"
                        keyboardType="numeric"
                        value={expectancy}
                        onChangeText={setExpectancy}
                    />
                </View>

                <TouchableOpacity
                    className="bg-black py-4 rounded-lg mt-8"
                    onPress={handleSave}
                >
                    <Text className="text-white text-center font-bold text-lg">
                        Start My Journey
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

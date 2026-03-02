import { router } from "expo-router";
import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View, StatusBar, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { UserProfileRepository } from "../src/repositories/UserProfileRepository";
import { LinearGradient } from 'expo-linear-gradient';

export default function Onboarding() {
    const [name, setName] = useState("");
    const [dob, setDob] = useState(""); // YYYY-MM-DD
    const [expectancy, setExpectancy] = useState("80");

    const handleSave = async () => {
        const lifeExpectancyYears = Number.parseInt(expectancy, 10);
        if (!name || !dob || Number.isNaN(lifeExpectancyYears)) {
            alert("すべての項目を正しく入力してください。");
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
            alert("プロフィールの保存に失敗しました。");
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#020617' }}>
            <StatusBar barStyle="light-content" />
            <LinearGradient
                colors={['#020617', '#0f172a', '#1e1b4b']}
                style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
            />

            <SafeAreaView style={{ flex: 1 }}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={{ flex: 1 }}
                >
                    <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={{ paddingHorizontal: 32 }}>
                        <View style={{ flex: 1, justifyContent: 'center', paddingVertical: 48 }}>
                            <View style={{ marginBottom: 48 }}>
                                <Text style={{ color: '#818cf8', fontWeight: 'bold', letterSpacing: 4, fontSize: 12, textTransform: 'uppercase', marginBottom: 12 }}>
                                    Maximize Your Life
                                </Text>
                                <Text style={{ fontSize: 48, fontWeight: '900', color: '#ffffff', lineHeight: 54, letterSpacing: -1 }}>
                                    Die With{"\n"}
                                    <Text style={{ color: '#6366f1' }}>Zero</Text>
                                </Text>
                                <View style={{ height: 4, width: 48, backgroundColor: '#6366f1', marginTop: 16, borderRadius: 9999 }} />
                            </View>

                            <View style={{ gap: 24 }}>
                                <View>
                                    <Text style={{ color: '#94a3b8', fontSize: 14, fontWeight: '500', marginBottom: 8, marginLeft: 4 }}>お名前</Text>
                                    <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 16, padding: 16 }}>
                                        <TextInput
                                            style={{ color: '#ffffff', fontSize: 18, fontWeight: '500' }}
                                            placeholder="Your Name"
                                            placeholderTextColor="#64748b"
                                            value={name}
                                            onChangeText={setName}
                                        />
                                    </View>
                                </View>

                                <View>
                                    <Text style={{ color: '#94a3b8', fontSize: 14, fontWeight: '500', marginBottom: 8, marginLeft: 4 }}>生年月日 (YYYY-MM-DD)</Text>
                                    <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 16, padding: 16 }}>
                                        <TextInput
                                            style={{ color: '#ffffff', fontSize: 18, fontWeight: '500' }}
                                            placeholder="1990-01-01"
                                            placeholderTextColor="#64748b"
                                            value={dob}
                                            onChangeText={setDob}
                                        />
                                    </View>
                                </View>

                                <View>
                                    <Text style={{ color: '#94a3b8', fontSize: 14, fontWeight: '500', marginBottom: 8, marginLeft: 4 }}>希望寿命 (才)</Text>
                                    <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 16, padding: 16 }}>
                                        <TextInput
                                            style={{ color: '#ffffff', fontSize: 18, fontWeight: '500' }}
                                            placeholder="80"
                                            placeholderTextColor="#64748b"
                                            keyboardType="numeric"
                                            value={expectancy}
                                            onChangeText={setExpectancy}
                                        />
                                    </View>
                                </View>

                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={handleSave}
                                    style={{ marginTop: 32, borderRadius: 16, overflow: 'hidden' }}
                                >
                                    <LinearGradient
                                        colors={['#6366f1', '#4f46e5']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={{ paddingVertical: 20 }}
                                    >
                                        <Text style={{ color: '#ffffff', textAlign: 'center', fontWeight: '900', fontSize: 18, letterSpacing: 1 }}>
                                            JOURNEY START
                                        </Text>
                                    </LinearGradient>
                                </TouchableOpacity>

                                <Text style={{ color: '#64748b', textAlign: 'center', fontSize: 12, marginTop: 24, lineHeight: 18 }}>
                                    人生を再定義するために、情報を入力してください。{"\n"}
                                    データは端末内にのみ保存されます。
                                </Text>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}

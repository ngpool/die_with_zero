import { useEffect, useState } from "react";
import {
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ScrollView,
    ActivityIndicator,
    Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { UserProfileRepository } from "../../src/repositories/UserProfileRepository";
import { LinearGradient } from 'expo-linear-gradient';

export default function ProfileScreen() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [lifeExpectancy, setLifeExpectancy] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        setIsLoading(true);
        const profile = await UserProfileRepository.getProfile();
        if (profile) {
            setName(profile.name);
            setDateOfBirth(profile.dateOfBirth);
            setLifeExpectancy(profile.lifeExpectancyYears.toString());
        }
        setIsLoading(false);
    };

    const handleSave = async () => {
        if (!name.trim() || !dateOfBirth.trim() || !lifeExpectancy.trim()) {
            alert("すべての項目を入力してください。");
            return;
        }

        if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) {
            alert("生年月日は YYYY-MM-DD の形式で入力してください。例: 1990-01-01");
            return;
        }

        setIsSaving(true);
        try {
            const data = {
                name: name.trim(),
                dateOfBirth: dateOfBirth.trim(),
                lifeExpectancyYears: parseInt(lifeExpectancy, 10),
            };
            console.log('[Profile] Saving:', data);
            await UserProfileRepository.createOrUpdateProfile(data);
            console.log('[Profile] Save success');
            setSaveSuccess(true);
            // Navigate home after 1.5 seconds (forces home to remount)
            setTimeout(() => router.replace('/'), 1500);
        } catch (error) {
            console.error('[Profile] Save error:', error);
            alert("保存に失敗しました: " + String(error));
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <View style={{ flex: 1, backgroundColor: '#020617', justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator color="#6366f1" size="large" />
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#020617' }}>
            <LinearGradient
                colors={['#020617', '#0f172a', '#1e1b4b']}
                style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
            />

            <SafeAreaView style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={{ padding: 24 }}>
                    {/* Header row with Home button */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
                        <Text style={{ color: '#ffffff', fontSize: 32, fontWeight: '900' }}>マイページ</Text>
                        <TouchableOpacity
                            onPress={() => router.push('/')}
                            style={{ backgroundColor: 'rgba(255, 255, 255, 0.07)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.15)', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 6 }}
                        >
                            <Text style={{ fontSize: 15 }}>🏠</Text>
                            <Text style={{ color: '#cbd5e1', fontSize: 13, fontWeight: '600' }}>ホーム</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={{ gap: 24 }}>
                        {/* Name Input */}
                        <View>
                            <Text style={{ color: '#94a3b8', fontSize: 12, fontWeight: 'bold', letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' }}>名前</Text>
                            <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', paddingHorizontal: 20, paddingVertical: 16 }}>
                                <TextInput
                                    style={{ color: '#ffffff', fontSize: 16 }}
                                    placeholder="お名前を入力してください"
                                    placeholderTextColor="#64748b"
                                    value={name}
                                    onChangeText={setName}
                                />
                            </View>
                        </View>

                        {/* Birthday Input */}
                        <View>
                            <Text style={{ color: '#94a3b8', fontSize: 12, fontWeight: 'bold', letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' }}>生年月日 (YYYY-MM-DD)</Text>
                            <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', paddingHorizontal: 20, paddingVertical: 16 }}>
                                <TextInput
                                    style={{ color: '#ffffff', fontSize: 16 }}
                                    placeholder="1990-01-01"
                                    placeholderTextColor="#64748b"
                                    value={dateOfBirth}
                                    onChangeText={setDateOfBirth}
                                    keyboardType="numbers-and-punctuation"
                                />
                            </View>
                        </View>

                        {/* Life Expectancy Input */}
                        <View>
                            <Text style={{ color: '#94a3b8', fontSize: 12, fontWeight: 'bold', letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' }}>希望寿命 (歳)</Text>
                            <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', paddingHorizontal: 20, paddingVertical: 16 }}>
                                <TextInput
                                    style={{ color: '#ffffff', fontSize: 16 }}
                                    placeholder="80"
                                    placeholderTextColor="#64748b"
                                    value={lifeExpectancy}
                                    onChangeText={setLifeExpectancy}
                                    keyboardType="number-pad"
                                />
                            </View>
                        </View>

                        {/* Save Button */}
                        <TouchableOpacity
                            onPress={handleSave}
                            disabled={isSaving || saveSuccess}
                            style={{ marginTop: 16, overflow: 'hidden', borderRadius: 24 }}
                        >
                            <LinearGradient
                                colors={saveSuccess ? ['#10b981', '#059669'] : ['#6366f1', '#4f46e5']}
                                style={{ paddingVertical: 20, alignItems: 'center', justifyContent: 'center' }}
                            >
                                {isSaving ? (
                                    <ActivityIndicator color="#ffffff" />
                                ) : saveSuccess ? (
                                    <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: 'bold' }}>✓ 保存しました！ホームへ戻ります...</Text>
                                ) : (
                                    <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: 'bold' }}>保存する</Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

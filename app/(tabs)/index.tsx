import { useCallback, useEffect, useRef, useState } from "react";
import {
    FlatList,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Animated,
    StatusBar,
    ScrollView,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { UserProfileRepository } from "../../src/repositories/UserProfileRepository";
import { GoalRepository, Goal } from "../../src/repositories/GoalRepository";
import { AssetRepository } from "../../src/repositories/AssetRepository";
import { LifeExpectancyService } from "../../src/services/LifeExpectancyService";
import { LinearGradient } from 'expo-linear-gradient';
import { initDb } from "../../src/db/client";

type TimeRemaining = {
    years: number;
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    totalSeconds: number;
    totalLifeSeconds: number;
};

export default function HomeScreen() {
    const router = useRouter();
    const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(
        null
    );
    const [goals, setGoals] = useState<Goal[]>([]);
    const [newGoalTitle, setNewGoalTitle] = useState("");
    const [newGoalDueDate, setNewGoalDueDate] = useState("");
    const [newGoalAmount, setNewGoalAmount] = useState("");
    const [lifePercentage, setLifePercentage] = useState(0);
    const [currentAssets, setCurrentAssets] = useState<number | null>(null);
    const [assetInput, setAssetInput] = useState("");
    const [editingAsset, setEditingAsset] = useState(false);

    const [profile, setProfile] = useState<any>(null);
    const profileRef = useRef<any>(null); // useRef to avoid stale closure in setInterval
    const [isLoading, setIsLoading] = useState(true);

    // Run on every time the screen comes into focus (e.g. returning from profile page)
    useFocusEffect(
        useCallback(() => {
            const init = async () => {
                await initDb();
                await loadData();
            };
            init();
            const interval = setInterval(() => updateTimer(), 1000);
            return () => clearInterval(interval);
        }, [])
    );

    const loadData = async () => {
        setIsLoading(true);
        const userProfileData = await UserProfileRepository.getProfile();
        if (userProfileData) {
            setProfile(userProfileData);
            profileRef.current = userProfileData;
            updateTimer(userProfileData);
        }
        const goalList = await GoalRepository.getAllGoals();
        setGoals(goalList);
        const assetData = await AssetRepository.get();
        if (assetData) {
            setCurrentAssets(assetData.currentAmount);
            setAssetInput(String(assetData.currentAmount));
        }
        setIsLoading(false);
    };

    const updateTimer = (manualProfile?: any) => {
        const activeProfile = manualProfile || profileRef.current; // always get latest
        if (activeProfile && activeProfile.dateOfBirth) {
            const remaining = LifeExpectancyService.calculateRemainingTime(
                activeProfile.dateOfBirth,
                activeProfile.lifeExpectancyYears
            );

            if (!remaining) return;

            // Calculate total life duration and used time for progress bar
            const parts = activeProfile.dateOfBirth.split('-');
            const dob = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));

            const deathDate = new Date(dob);
            deathDate.setFullYear(dob.getFullYear() + activeProfile.lifeExpectancyYears);

            const now = new Date();
            const totalLifeMs = deathDate.getTime() - dob.getTime();
            const usedLifeMs = now.getTime() - dob.getTime();
            const percentage = Math.min(100, Math.max(0, (usedLifeMs / totalLifeMs) * 100));

            setLifePercentage(percentage);
            setTimeRemaining({ ...remaining, totalSeconds: 0, totalLifeSeconds: 0 });
        }
    };

    const handleSaveAsset = async () => {
        const amount = parseFloat(assetInput.replace(/,/g, ""));
        if (isNaN(amount)) return;
        await AssetRepository.save(amount);
        setCurrentAssets(amount);
        setEditingAsset(false);
    };

    const handleAddGoal = async () => {
        if (!newGoalTitle.trim()) return;
        await GoalRepository.createGoal({
            title: newGoalTitle.trim(),
            dueDate: newGoalDueDate.trim() || undefined,
            targetAmount: newGoalAmount.trim() ? parseFloat(newGoalAmount.replace(/,/g, "")) : undefined,
        });
        setNewGoalTitle("");
        setNewGoalDueDate("");
        setNewGoalAmount("");
        setGoals(await GoalRepository.getAllGoals());
    };

    const toggleGoal = async (id: number, current: boolean) => {
        await GoalRepository.toggleGoal(id, !current);
        setGoals(await GoalRepository.getAllGoals());
    };

    const deleteGoal = async (id: number) => {
        await GoalRepository.deleteGoal(id);
        setGoals(await GoalRepository.getAllGoals());
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#020617' }}>
            <StatusBar barStyle="light-content" />
            <LinearGradient
                colors={['#020617', '#0f172a', '#1e1b4b']}
                style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
            />

            <SafeAreaView style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={{ paddingBottom: 40 }} style={{ paddingHorizontal: 20 }}>
                    {/* Header */}
                    <View style={{ marginTop: 24, marginBottom: 32 }}>
                        {/* Profile Button */}
                        <TouchableOpacity
                            onPress={() => router.push('/profile')}
                            style={{ alignSelf: 'flex-end', marginBottom: 16, backgroundColor: 'rgba(99, 102, 241, 0.15)', borderWidth: 1, borderColor: 'rgba(99, 102, 241, 0.4)', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 6 }}
                        >
                            <Text style={{ fontSize: 16 }}>👤</Text>
                            <Text style={{ color: '#818cf8', fontSize: 13, fontWeight: '600' }}>マイページ</Text>
                        </TouchableOpacity>
                        <Text style={{ color: '#818cf8', fontWeight: 'bold', letterSpacing: 2, fontSize: 12, textTransform: 'uppercase', marginBottom: 8 }}>
                            人生の進捗状況
                        </Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                            <Text style={{ fontSize: 44, fontWeight: '900', color: '#ffffff', letterSpacing: -1 }}>
                                {lifePercentage.toFixed(4)}<Text style={{ fontSize: 24, color: '#6366f1' }}>%</Text>
                            </Text>
                            <Text style={{ color: '#94a3b8', fontSize: 14, fontWeight: '500', marginBottom: 8 }}>経過</Text>
                        </View>
                        {/* Gradient Progress Bar */}
                        <View style={{ height: 10, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 999, marginTop: 16, overflow: 'hidden' }}>
                            <LinearGradient
                                colors={['#10b981', '#f59e0b', '#ef4444']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={{ height: '100%', width: `${lifePercentage}%`, borderRadius: 999 }}
                            />
                        </View>
                    </View>

                    {/* Bento Grid */}
                    <View style={{ gap: 16 }}>
                        {/* Countdown Card (Large) */}
                        <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)', borderRadius: 32, padding: 32, alignItems: 'center' }}>
                            <Text style={{ color: '#94a3b8', fontSize: 12, fontWeight: 'bold', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 24 }}>残り時間</Text>
                            {isLoading ? (
                                <ActivityIndicator color="#6366f1" />
                            ) : timeRemaining ? (
                                <View style={{ alignItems: 'center', width: '100%' }}>
                                    <Text style={{ fontSize: 80, fontWeight: '900', color: '#ffffff', letterSpacing: -4, textAlign: 'center' }}>
                                        {timeRemaining.years}
                                        <Text style={{ fontSize: 24, fontWeight: '300', color: '#64748b', letterSpacing: 0 }}> 年</Text>
                                    </Text>

                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 32 }}>
                                        <View style={{ alignItems: 'center' }}>
                                            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#ffffff' }}>{timeRemaining.days}</Text>
                                            <Text style={{ fontSize: 10, color: '#64748b', fontWeight: '800' }}>日</Text>
                                        </View>
                                        <View style={{ width: 1, height: 30, backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
                                        <View style={{ alignItems: 'center' }}>
                                            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#ffffff' }}>{timeRemaining.hours}</Text>
                                            <Text style={{ fontSize: 10, color: '#64748b', fontWeight: '800' }}>時間</Text>
                                        </View>
                                        <View style={{ width: 1, height: 30, backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
                                        <View style={{ alignItems: 'center' }}>
                                            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#ffffff' }}>{timeRemaining.minutes}</Text>
                                            <Text style={{ fontSize: 10, color: '#64748b', fontWeight: '800' }}>分</Text>
                                        </View>
                                        <View style={{ width: 1, height: 30, backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
                                        <View style={{ alignItems: 'center' }}>
                                            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#ffffff' }}>{timeRemaining.seconds}</Text>
                                            <Text style={{ fontSize: 10, color: '#64748b', fontWeight: '800' }}>秒</Text>
                                        </View>
                                    </View>
                                </View>
                            ) : (
                                <View style={{ alignItems: 'center', gap: 12 }}>
                                    <Text style={{ color: '#64748b', fontSize: 14 }}>プロフィールが設定されていません</Text>
                                    <TouchableOpacity
                                        onPress={() => router.push('/profile')}
                                        style={{ backgroundColor: '#6366f1', borderRadius: 16, paddingHorizontal: 20, paddingVertical: 10 }}
                                    >
                                        <Text style={{ color: '#ffffff', fontWeight: 'bold' }}>マイページで設定する</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                        {/* Asset Tracker Card */}
                        <View style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 28, padding: 24 }}>
                            <Text style={{ color: '#94a3b8', fontSize: 11, fontWeight: 'bold', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>💰 総資産</Text>

                            {!editingAsset ? (
                                <TouchableOpacity onPress={() => setEditingAsset(true)} style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 10 }}>
                                    <Text style={{ fontSize: 36, fontWeight: '900', color: '#10b981', letterSpacing: -1 }}>
                                        {currentAssets !== null ? currentAssets.toLocaleString() : '---'}
                                    </Text>
                                    <Text style={{ color: '#64748b', fontSize: 16, marginBottom: 6 }}>円</Text>
                                    <Text style={{ color: '#6366f1', fontSize: 12, marginBottom: 8, marginLeft: 4 }}>編集</Text>
                                </TouchableOpacity>
                            ) : (
                                <View style={{ flexDirection: 'row', gap: 10 }}>
                                    <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(16,185,129,0.4)', paddingHorizontal: 16, paddingVertical: 12 }}>
                                        <TextInput
                                            style={{ color: '#10b981', fontSize: 20, fontWeight: 'bold' }}
                                            placeholder="0"
                                            placeholderTextColor="#334155"
                                            value={assetInput}
                                            onChangeText={setAssetInput}
                                            keyboardType="numeric"
                                            autoFocus
                                        />
                                    </View>
                                    <TouchableOpacity onPress={handleSaveAsset} style={{ backgroundColor: '#10b981', borderRadius: 16, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' }}>
                                        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 13 }}>保存</Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            {/* Compare with financial goals */}
                            {(() => {
                                const financialGoals = goals.filter(g => g.targetAmount && !g.isCompleted);
                                if (financialGoals.length === 0 || currentAssets === null) return null;
                                return (
                                    <View style={{ marginTop: 16, gap: 10 }}>
                                        <Text style={{ color: '#94a3b8', fontSize: 11, fontWeight: 'bold' }}>目標資産との比較</Text>
                                        {financialGoals.map(goal => {
                                            const pct = Math.min(100, (currentAssets / goal.targetAmount!) * 100);
                                            const reached = currentAssets >= goal.targetAmount!;
                                            return (
                                                <View key={goal.id}>
                                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                                                        <Text style={{ color: '#e2e8f0', fontSize: 12, fontWeight: '600' }}>{goal.title}</Text>
                                                        <Text style={{ color: reached ? '#10b981' : '#f59e0b', fontSize: 12, fontWeight: 'bold' }}>
                                                            {pct.toFixed(1)}% {reached ? '✓達成' : `/ ${goal.targetAmount!.toLocaleString()}円`}
                                                        </Text>
                                                    </View>
                                                    <View style={{ height: 6, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 999, overflow: 'hidden' }}>
                                                        <LinearGradient
                                                            colors={reached ? ['#10b981', '#059669'] : ['#6366f1', '#f59e0b']}
                                                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                                            style={{ height: '100%', width: `${pct}%`, borderRadius: 999 }}
                                                        />
                                                    </View>
                                                </View>
                                            );
                                        })}
                                    </View>
                                );
                            })()}
                        </View>

                        {/* Goal Section */}
                        <View style={{ marginTop: 24 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                                <Text style={{ color: '#ffffff', fontSize: 24, fontWeight: '900' }}>目標設定</Text>
                                <TouchableOpacity
                                    onPress={() => router.push('/calendar')}
                                    style={{ backgroundColor: 'rgba(99,102,241,0.15)', borderWidth: 1, borderColor: 'rgba(99,102,241,0.4)', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 5 }}
                                >
                                    <Text style={{ fontSize: 13 }}>📅</Text>
                                    <Text style={{ color: '#818cf8', fontSize: 13, fontWeight: '600' }}>カレンダー</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Goal title input */}
                            <View style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 20, paddingVertical: 14, marginBottom: 10 }}>
                                <TextInput
                                    style={{ color: '#ffffff', fontSize: 16 }}
                                    placeholder="目標を入力してください"
                                    placeholderTextColor="#64748b"
                                    value={newGoalTitle}
                                    onChangeText={setNewGoalTitle}
                                />
                            </View>

                            {/* Target amount + due date row */}
                            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
                                <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 18, borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)', paddingHorizontal: 14, paddingVertical: 12 }}>
                                    <TextInput
                                        style={{ color: '#10b981', fontSize: 14 }}
                                        placeholder="目標金額 (円, 任意)"
                                        placeholderTextColor="#334155"
                                        value={newGoalAmount}
                                        onChangeText={setNewGoalAmount}
                                        keyboardType="numeric"
                                    />
                                </View>
                                <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 14, paddingVertical: 12 }}>
                                    <TextInput
                                        style={{ color: '#ffffff', fontSize: 14 }}
                                        placeholder="期限 (YYYY-MM-DD)"
                                        placeholderTextColor="#64748b"
                                        value={newGoalDueDate}
                                        onChangeText={setNewGoalDueDate}
                                    />
                                </View>
                            </View>

                            {/* Add button */}
                            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
                                <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 16, paddingVertical: 14 }}>
                                    <TextInput
                                        style={{ color: '#ffffff', fontSize: 14 }}
                                        placeholder="達成期限 (YYYY-MM-DD)"
                                        placeholderTextColor="#64748b"
                                        value={newGoalDueDate}
                                        onChangeText={setNewGoalDueDate}
                                    />
                                </View>
                                <TouchableOpacity
                                    onPress={handleAddGoal}
                                    style={{ width: 52, height: 52, backgroundColor: '#6366f1', borderRadius: 18, alignItems: 'center', justifyContent: 'center' }}
                                >
                                    <Text style={{ color: '#ffffff', fontSize: 26, fontWeight: 'bold' }}>+</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Goal list */}
                            <FlatList
                                data={goals || []}
                                keyExtractor={(item) => item?.id?.toString() ?? Math.random().toString()}
                                scrollEnabled={false}
                                renderItem={({ item }) => (
                                    <View style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 24, padding: 18, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', flexDirection: 'row', alignItems: 'center' }}>
                                        <TouchableOpacity
                                            onPress={() => item?.id && toggleGoal(item.id, item.isCompleted)}
                                            style={{ width: 28, height: 28, borderRadius: 10, borderWidth: 2, borderColor: item?.isCompleted ? '#6366f1' : 'rgba(255,255,255,0.15)', backgroundColor: item?.isCompleted ? '#6366f1' : 'transparent', alignItems: 'center', justifyContent: 'center', marginRight: 14 }}
                                        >
                                            {item?.isCompleted && <Text style={{ color: '#fff', fontSize: 14 }}>✓</Text>}
                                        </TouchableOpacity>
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ color: item?.isCompleted ? '#64748b' : '#ffffff', fontSize: 15, fontWeight: '600', textDecorationLine: item?.isCompleted ? 'line-through' : 'none' }}>
                                                {item?.title}
                                            </Text>
                                            {item?.dueDate && (
                                                <Text style={{ color: '#818cf8', fontSize: 11, marginTop: 3 }}>📅 {item.dueDate} まで</Text>
                                            )}
                                        </View>
                                        <TouchableOpacity onPress={() => item?.id && deleteGoal(item.id)}>
                                            <Text style={{ color: '#ef4444', fontSize: 12, fontWeight: 'bold', marginLeft: 10 }}>削除</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                                ListEmptyComponent={
                                    <View style={{ padding: 32, alignItems: 'center', opacity: 0.5 }}>
                                        <Text style={{ color: '#94a3b8' }}>目標がありません。追加してみましょう！</Text>
                                    </View>
                                }
                            />
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

import { useState, useCallback } from "react";
import {
    Text,
    TouchableOpacity,
    View,
    ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { GoalRepository, Goal } from "../../src/repositories/GoalRepository";
import { UserProfileRepository } from "../../src/repositories/UserProfileRepository";

type Profile = { dateOfBirth: string; lifeExpectancyYears: number; name: string };

export default function CalendarScreen() {
    const router = useRouter();
    const [goals, setGoals] = useState<Goal[]>([]);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

    useFocusEffect(
        useCallback(() => {
            GoalRepository.getAllGoals().then(setGoals);
            UserProfileRepository.getProfile().then((p) => {
                if (p) setProfile(p as Profile);
            });
        }, [])
    );

    if (!profile) {
        return (
            <View style={{ flex: 1, backgroundColor: "#020617", justifyContent: "center", alignItems: "center" }}>
                <LinearGradient colors={["#020617", "#0f172a", "#1e1b4b"]} style={{ position: "absolute", inset: 0 }} />
                <Text style={{ color: "#64748b", fontSize: 15 }}>プロフィールを設定してください</Text>
                <TouchableOpacity onPress={() => router.push("/profile")} style={{ marginTop: 16, backgroundColor: "#6366f1", borderRadius: 16, paddingHorizontal: 20, paddingVertical: 10 }}>
                    <Text style={{ color: "#fff", fontWeight: "bold" }}>マイページへ</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Parse birth year
    const parts = profile.dateOfBirth.split("-");
    const birthYear = parseInt(parts[0], 10);
    const birthMonth = parseInt(parts[1], 10) - 1;
    const birthDay = parseInt(parts[2], 10);
    const deathYear = birthYear + profile.lifeExpectancyYears;

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentAge = currentYear - birthYear - (now < new Date(currentYear, birthMonth, birthDay) ? 1 : 0);

    // Build goal lookup: year -> goals[]
    const goalsByYear: Record<number, Goal[]> = {};
    goals.forEach((g) => {
        if (g.dueDate) {
            const y = parseInt(g.dueDate.substring(0, 4), 10);
            if (!goalsByYear[y]) goalsByYear[y] = [];
            goalsByYear[y].push(g);
        }
    });

    // Build decade groups
    const startDecade = Math.floor(birthYear / 10) * 10;
    const endDecade = Math.floor(deathYear / 10) * 10;
    const decades: number[] = [];
    for (let d = startDecade; d <= endDecade; d += 10) decades.push(d);

    return (
        <View style={{ flex: 1, backgroundColor: "#020617" }}>
            <LinearGradient colors={["#020617", "#0f172a", "#1e1b4b"]} style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }} />

            <SafeAreaView style={{ flex: 1 }}>
                {/* Header */}
                <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12, flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" }}>
                    <View>
                        <Text style={{ color: "#818cf8", fontSize: 11, fontWeight: "bold", letterSpacing: 2, textTransform: "uppercase" }}>人生年表</Text>
                        <Text style={{ color: "#ffffff", fontSize: 26, fontWeight: "900", marginTop: 2 }}>{profile.name}の人生</Text>
                        <Text style={{ color: "#64748b", fontSize: 12, marginTop: 4 }}>
                            {birthYear}年 → {deathYear}年（{profile.lifeExpectancyYears}歳まで）
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => router.push("/")}
                        style={{ backgroundColor: "rgba(255,255,255,0.07)", borderWidth: 1, borderColor: "rgba(255,255,255,0.13)", borderRadius: 18, paddingHorizontal: 14, paddingVertical: 7, flexDirection: "row", alignItems: "center", gap: 5, marginTop: 4 }}
                    >
                        <Text style={{ fontSize: 13 }}>🏠</Text>
                        <Text style={{ color: "#cbd5e1", fontSize: 13, fontWeight: "600" }}>ホーム</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 60 }}>
                    {/* Timeline */}
                    {decades.map((decadeStart) => {
                        const decadeEnd = decadeStart + 9;
                        const decadeAgeStart = decadeStart - birthYear;
                        const decadeAgeEnd = decadeEnd - birthYear;
                        const isPast = decadeEnd < currentYear;
                        const isCurrent = decadeStart <= currentYear && currentYear <= decadeEnd;

                        return (
                            <View key={decadeStart} style={{ marginBottom: 8 }}>
                                {/* Decade header */}
                                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4, marginTop: 12 }}>
                                    <View style={{ width: 3, height: 24, borderRadius: 2, backgroundColor: isCurrent ? "#6366f1" : isPast ? "#334155" : "#1e293b", marginRight: 10 }} />
                                    <Text style={{ color: isCurrent ? "#818cf8" : isPast ? "#475569" : "#64748b", fontSize: 12, fontWeight: "bold", letterSpacing: 1 }}>
                                        {Math.max(0, decadeAgeStart)}〜{decadeAgeEnd}歳
                                    </Text>
                                    <Text style={{ color: isPast ? "#334155" : "#334155", fontSize: 11, marginLeft: 8 }}>
                                        （{decadeStart}〜{decadeEnd}年）
                                    </Text>
                                    {isCurrent && (
                                        <View style={{ marginLeft: 8, backgroundColor: "rgba(99,102,241,0.2)", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 }}>
                                            <Text style={{ color: "#818cf8", fontSize: 10, fontWeight: "bold" }}>現在</Text>
                                        </View>
                                    )}
                                </View>

                                {/* Years in this decade */}
                                {Array.from({ length: 10 }, (_, i) => decadeStart + i).map((year) => {
                                    if (year < birthYear || year > deathYear) return null;
                                    const age = year - birthYear;
                                    if (age < 0) return null;

                                    const isCurrentYear = year === currentYear;
                                    const isDeathYear = year === deathYear;
                                    const yearGoals = goalsByYear[year] ?? [];
                                    const hasGoals = yearGoals.length > 0;

                                    return (
                                        <View key={year} style={{ flexDirection: "row", minHeight: hasGoals ? undefined : 32 }}>
                                            {/* Timeline line */}
                                            <View style={{ width: 40, alignItems: "center", paddingTop: 6 }}>
                                                <View style={{ width: 1, position: "absolute", top: 0, bottom: 0, backgroundColor: isCurrentYear ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.06)" }} />
                                                <View style={{
                                                    width: isCurrentYear ? 10 : isDeathYear ? 10 : 6,
                                                    height: isCurrentYear ? 10 : isDeathYear ? 10 : 6,
                                                    borderRadius: 5,
                                                    backgroundColor: isCurrentYear ? "#6366f1" : isDeathYear ? "#ef4444" : hasGoals ? "#f59e0b" : "rgba(255,255,255,0.1)",
                                                    zIndex: 1,
                                                }} />
                                            </View>

                                            {/* Content */}
                                            <View style={{ flex: 1, paddingLeft: 8, paddingTop: 2, paddingBottom: hasGoals ? 12 : 0 }}>
                                                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                                                    <Text style={{
                                                        color: isCurrentYear ? "#ffffff" : isDeathYear ? "#ef4444" : year < currentYear ? "#334155" : "#475569",
                                                        fontSize: isCurrentYear ? 14 : 12,
                                                        fontWeight: isCurrentYear ? "bold" : "normal",
                                                    }}>
                                                        {year}年
                                                    </Text>
                                                    <Text style={{ color: isCurrentYear ? "#818cf8" : "#334155", fontSize: 11 }}>
                                                        {isDeathYear ? "（" + age + "歳・目標）" : age + "歳"}
                                                    </Text>
                                                    {isCurrentYear && (
                                                        <View style={{ backgroundColor: "#6366f1", borderRadius: 6, paddingHorizontal: 6, paddingVertical: 1 }}>
                                                            <Text style={{ color: "#fff", fontSize: 9, fontWeight: "bold" }}>今年</Text>
                                                        </View>
                                                    )}
                                                </View>

                                                {/* Goals for this year */}
                                                {yearGoals.map((goal) => (
                                                    <TouchableOpacity
                                                        key={goal.id}
                                                        onPress={() => setSelectedGoal(selectedGoal?.id === goal.id ? null : goal)}
                                                        style={{ marginTop: 6, backgroundColor: goal.isCompleted ? "rgba(99,102,241,0.1)" : "rgba(245,158,11,0.1)", borderWidth: 1, borderColor: goal.isCompleted ? "rgba(99,102,241,0.3)" : "rgba(245,158,11,0.4)", borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8, flexDirection: "row", alignItems: "center", gap: 8 }}
                                                    >
                                                        <Text style={{ fontSize: 12 }}>{goal.isCompleted ? "✅" : "🎯"}</Text>
                                                        <View style={{ flex: 1 }}>
                                                            <Text style={{ color: goal.isCompleted ? "#64748b" : "#ffffff", fontSize: 13, fontWeight: "600", textDecorationLine: goal.isCompleted ? "line-through" : "none" }}>
                                                                {goal.title}
                                                            </Text>
                                                            {goal.dueDate && (
                                                                <Text style={{ color: "#818cf8", fontSize: 10, marginTop: 1 }}>{goal.dueDate}</Text>
                                                            )}
                                                        </View>
                                                        {/* Toggle & Delete: shown when selected */}
                                                        {selectedGoal?.id === goal.id && (
                                                            <View style={{ flexDirection: "row", gap: 8 }}>
                                                                <TouchableOpacity
                                                                    onPress={async () => {
                                                                        await GoalRepository.toggleGoal(goal.id, !goal.isCompleted);
                                                                        setGoals(await GoalRepository.getAllGoals());
                                                                        setSelectedGoal(null);
                                                                    }}
                                                                    style={{ backgroundColor: "#6366f1", borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4 }}
                                                                >
                                                                    <Text style={{ color: "#fff", fontSize: 10, fontWeight: "bold" }}>
                                                                        {goal.isCompleted ? "未達成" : "達成"}
                                                                    </Text>
                                                                </TouchableOpacity>
                                                                <TouchableOpacity
                                                                    onPress={async () => {
                                                                        await GoalRepository.deleteGoal(goal.id);
                                                                        setGoals(await GoalRepository.getAllGoals());
                                                                        setSelectedGoal(null);
                                                                    }}
                                                                    style={{ backgroundColor: "rgba(239,68,68,0.15)", borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4 }}
                                                                >
                                                                    <Text style={{ color: "#ef4444", fontSize: 10, fontWeight: "bold" }}>削除</Text>
                                                                </TouchableOpacity>
                                                            </View>
                                                        )}
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>
                        );
                    })}
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

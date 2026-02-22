import { useEffect, useState } from "react";
import {
    FlatList,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TodoRepository } from "../../src/repositories/TodoRepository";
import { UserProfileRepository } from "../../src/repositories/UserProfileRepository";
import { LifeExpectancyService } from "../../src/services/LifeExpectancyService";

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
    const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(
        null
    );
    const [todos, setTodos] = useState<any[]>([]);
    const [newTodoTitle, setNewTodoTitle] = useState("");
    const [lifePercentage, setLifePercentage] = useState(0);

    useEffect(() => {
        loadData();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, []);

    const loadData = async () => {
        const profile = await UserProfileRepository.getProfile();
        if (profile) {
            updateTimer(profile);
        }
        const todoList = await TodoRepository.getAllTodos();
        setTodos(todoList);
    };

    const updateTimer = async (cachedProfile?: any) => {
        const profile = cachedProfile || (await UserProfileRepository.getProfile());
        if (profile) {
            const remaining = LifeExpectancyService.calculateRemainingTime(
                profile.dateOfBirth,
                profile.lifeExpectancyYears
            );

            // Calculate total life duration and used time for progress bar
            const dob = new Date(profile.dateOfBirth);
            const deathDate = new Date(dob);
            deathDate.setFullYear(dob.getFullYear() + profile.lifeExpectancyYears);

            const now = new Date();
            const totalLifeMs = deathDate.getTime() - dob.getTime();
            const usedLifeMs = now.getTime() - dob.getTime();
            const percentage = Math.min(100, Math.max(0, (usedLifeMs / totalLifeMs) * 100));

            setLifePercentage(percentage);
            setTimeRemaining({ ...remaining, totalSeconds: 0, totalLifeSeconds: 0 }); // Simplified for now
        }
    };

    const handleAddTodo = async () => {
        if (!newTodoTitle.trim()) return;
        await TodoRepository.createTodo({ title: newTodoTitle });
        setNewTodoTitle("");
        const todoList = await TodoRepository.getAllTodos();
        setTodos(todoList);
    };

    const toggleTodo = async (id: number, currentStatus: boolean) => {
        await TodoRepository.toggleTodoCompletion(id, !currentStatus);
        const todoList = await TodoRepository.getAllTodos();
        setTodos(todoList);
    };

    const deleteTodo = async (id: number) => {
        await TodoRepository.deleteTodo(id);
        const todoList = await TodoRepository.getAllTodos();
        setTodos(todoList);
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-50 px-4 pt-2">
            {/* Header / Life Status */}
            <View className="mb-6">
                <Text className="text-slate-500 font-medium tracking-widest text-xs uppercase mb-1">
                    Life Progress
                </Text>
                <View className="flex-row justify-between items-end mb-2">
                    <Text className="text-3xl font-bold text-slate-800">
                        {lifePercentage.toFixed(4)}%
                    </Text>
                    <Text className="text-slate-400 font-medium mb-1">
                        used
                    </Text>
                </View>

                {/* Progress Bar */}
                <View className="h-3 bg-slate-200 rounded-full overflow-hidden w-full">
                    <View
                        className="h-full bg-slate-800 rounded-full"
                        style={{ width: `${lifePercentage}%` }}
                    />
                </View>
            </View>

            {/* Countdown Card */}
            <View className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-8 items-center">
                <Text className="text-slate-400 font-medium tracking-widest text-xs uppercase mb-4">
                    Time Remaining
                </Text>
                {timeRemaining ? (
                    <View className="items-center w-full">
                        <Text className="text-6xl font-black text-slate-900 tracking-tighter mb-2">
                            {timeRemaining.years}
                            <Text className="text-2xl font-light text-slate-400"> YEARS</Text>
                        </Text>

                        <View className="flex-row justify-between w-full px-4 mt-2">
                            <View className="items-center">
                                <Text className="text-2xl font-bold text-slate-700">{timeRemaining.days}</Text>
                                <Text className="text-xs text-slate-400 uppercase font-medium">Days</Text>
                            </View>
                            <View className="w-[1px] h-10 bg-slate-100" />
                            <View className="items-center">
                                <Text className="text-2xl font-bold text-slate-700">{timeRemaining.hours}</Text>
                                <Text className="text-xs text-slate-400 uppercase font-medium">Hours</Text>
                            </View>
                            <View className="w-[1px] h-10 bg-slate-100" />
                            <View className="items-center">
                                <Text className="text-2xl font-bold text-slate-700">{timeRemaining.minutes}</Text>
                                <Text className="text-xs text-slate-400 uppercase font-medium">Mins</Text>
                            </View>
                            <View className="w-[1px] h-10 bg-slate-100" />
                            <View className="items-center">
                                <Text className="text-2xl font-bold text-slate-700">{timeRemaining.seconds}</Text>
                                <Text className="text-xs text-slate-400 uppercase font-medium">Secs</Text>
                            </View>
                        </View>
                    </View>
                ) : (
                    <Text className="text-slate-400">Calculing life expectancy...</Text>
                )}
            </View>

            {/* Todo Section */}
            <View className="flex-1">
                <Text className="text-slate-800 font-bold text-xl mb-4 px-1">
                    Focus for Today
                </Text>

                <View className="flex-row gap-3 mb-6">
                    <TextInput
                        className="flex-1 bg-white p-4 rounded-2xl border border-slate-200 text-slate-700 shadow-sm"
                        placeholder="What really matters?"
                        placeholderTextColor="#94a3b8"
                        value={newTodoTitle}
                        onChangeText={setNewTodoTitle}
                    />
                    <TouchableOpacity
                        onPress={handleAddTodo}
                        className="bg-slate-900 w-14 items-center justify-center rounded-2xl shadow-md active:bg-slate-800"
                    >
                        <Text className="text-white font-bold text-2xl">+</Text>
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={todos}
                    keyExtractor={(item) => item.id.toString()}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    renderItem={({ item }) => (
                        <View className="bg-white p-4 rounded-2xl mb-3 flex-row items-center justify-between shadow-sm border border-slate-100">
                            <TouchableOpacity
                                onPress={() => toggleTodo(item.id, item.isCompleted)}
                                className="flex-row items-center flex-1"
                            >
                                <View className={`w-6 h-6 rounded-full border-2 mr-3 items-center justify-center transition-colors ${item.isCompleted ? 'bg-slate-200 border-slate-200' : 'border-slate-300'}`}>
                                    {item.isCompleted && <View className="w-3 h-3 bg-slate-500 rounded-full" />}
                                </View>
                                <Text className={`text-base font-medium flex-1 ${item.isCompleted ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                    {item.title}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => deleteTodo(item.id)}
                                className="p-2 -mr-2"
                            >
                                <Text className="text-slate-300 font-bold text-xs uppercase tracking-wide">Del</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    ListEmptyComponent={
                        <View className="items-center justify-center py-10 opacity-50">
                            <Text className="text-slate-400 text-center">No focus items yet.</Text>
                            <Text className="text-slate-400 text-center text-xs mt-1">Add something meaningful to do.</Text>
                        </View>
                    }
                />
            </View>
        </SafeAreaView>
    );
}

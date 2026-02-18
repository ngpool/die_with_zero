import { useEffect, useState } from "react";
import {
    FlatList,
    Text,
    TextInput,
    TouchableOpacity,
    View,
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
};

export default function HomeScreen() {
    const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(
        null
    );
    const [todos, setTodos] = useState<any[]>([]);
    const [newTodoTitle, setNewTodoTitle] = useState("");

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
            setTimeRemaining(remaining);
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
        <SafeAreaView className="flex-1 bg-gray-50 p-4">
            {/* Timer Section */}
            <View className="bg-white p-6 rounded-2xl shadow-sm mb-6 items-center">
                <Text className="text-gray-500 mb-2 font-medium">TIME REMAINING</Text>
                {timeRemaining ? (
                    <View className="items-center">
                        <Text className="text-5xl font-extrabold text-slate-800">
                            {timeRemaining.years}
                            <Text className="text-xl text-gray-400 font-normal"> YEARS</Text>
                        </Text>
                        <View className="flex-row space-x-4 mt-2">
                            <Text className="text-lg text-slate-600">
                                {timeRemaining.days} <Text className="text-sm">DAYS</Text>
                            </Text>
                            <Text className="text-lg text-slate-600">
                                {timeRemaining.hours} <Text className="text-sm">HRS</Text>
                            </Text>
                            <Text className="text-lg text-slate-600">
                                {timeRemaining.minutes} <Text className="text-sm">MIN</Text>
                            </Text>
                            <Text className="text-lg text-slate-600">
                                {timeRemaining.seconds} <Text className="text-sm">SEC</Text>
                            </Text>
                        </View>
                    </View>
                ) : (
                    <Text>Loading...</Text>
                )}
            </View>

            {/* Todo Section */}
            <View className="flex-1">
                <Text className="text-xl font-bold mb-4 text-slate-800">
                    What matters now?
                </Text>

                <View className="flex-row gap-2 mb-4">
                    <TextInput
                        className="flex-1 bg-white p-3 rounded-xl border border-gray-200"
                        placeholder="Add a new goal..."
                        value={newTodoTitle}
                        onChangeText={setNewTodoTitle}
                    />
                    <TouchableOpacity
                        onPress={handleAddTodo}
                        className="bg-slate-800 p-3 rounded-xl justify-center px-6"
                    >
                        <Text className="text-white font-bold">Add</Text>
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={todos}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <View className="bg-white p-4 rounded-xl mb-2 flex-row items-center justify-between shadow-sm">
                            <TouchableOpacity
                                onPress={() => toggleTodo(item.id, item.isCompleted)}
                                className="flex-row items-center flex-1"
                            >
                                <View className={`w-6 h-6 rounded-full border-2 mr-3 ${item.isCompleted ? 'bg-green-500 border-green-500' : 'border-gray-300'}`} />
                                <Text className={`text-lg ${item.isCompleted ? 'text-gray-400 line-through' : 'text-slate-700'}`}>
                                    {item.title}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => deleteTodo(item.id)}>
                                <Text className="text-red-400 font-medium">Delete</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                />
            </View>
        </SafeAreaView>
    );
}

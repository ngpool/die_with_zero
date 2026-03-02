import { Tabs } from "expo-router";
import { Platform } from "react-native";

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: Platform.select({
                    ios: {
                        position: "absolute",
                    },
                    default: {},
                }),
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Home",
                    tabBarLabel: "Home",
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: "マイページ",
                    tabBarLabel: "マイページ",
                }}
            />
            <Tabs.Screen
                name="calendar"
                options={{
                    title: "カレンダー",
                    tabBarLabel: "カレンダー",
                }}
            />
        </Tabs>
    );
}

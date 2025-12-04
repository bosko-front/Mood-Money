import {Tabs} from "expo-router";
import React from "react";
import {StyleSheet, View} from "react-native";
import {Colors} from "@/src/constants/colors";
import {Home, BarChart3, Settings, Plus, Bot} from "lucide-react-native";
import {HapticTab} from "@/src/components/ui/haptic-tab";
import {IconSymbol} from "@/src/components/ui/icon-symbol";

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: Colors.primary,
                tabBarInactiveTintColor: Colors.textSecondary,
                headerShown: false,
                tabBarShowLabel: false,
                tabBarButton: HapticTab,
                tabBarStyle: {
                    backgroundColor: Colors.surface,
                    borderTopColor: Colors.border,
                    borderTopWidth: StyleSheet.hairlineWidth,
                },
            }}
        >
            {/* 🏠 HOME */}
            <Tabs.Screen
                name="index"
                options={{
                    title: "Home",
                    tabBarIcon: ({color, size}) =>
                        <IconSymbol name="house.fill" color={color} size={size} />
                }}
            />

            {/* 📊 DASHBOARD */}
            <Tabs.Screen
                name="dashboard"
                options={{
                    title: "Dashboard",
                    tabBarIcon: ({color, size}) =>
                        <IconSymbol name="chart.bar.fill" color={color} size={size} />

                }}
            />
            {/* ➕ ADD ENTRY */}
            <Tabs.Screen
                name="add-entry"
                options={{
                    title: "Add Entry",
                    tabBarIcon: () => (
                        <View
                            style={{
                                backgroundColor: Colors.primary,
                                borderRadius: 32,
                                padding: 12,
                                marginBottom: 24,
                                shadowColor: Colors.primary,
                                shadowOpacity: 0.2,
                                shadowRadius: 6,
                                elevation: 3,
                            }}
                        >
                            <IconSymbol name="plus.circle.fill" color={Colors.surface} size={26} />
                        </View>
                    ),
                }}
            />


            {/* 🤖 AI INSIGHTS */}
            <Tabs.Screen
                name="ai-insights"
                options={{
                    title: "AI Insights",
                    tabBarIcon: ({color, size}) =>
                        <IconSymbol name="brain.head.profile" color={color} size={size} />
                }}
            />

            {/* ⚙️ SETTINGS */}
            <Tabs.Screen
                name="settings"
                options={{
                    title: "Settings",
                    tabBarIcon: ({color, size}) =>
                        <IconSymbol name="gearshape.fill" color={color} size={size} />
                }}
            />
        </Tabs>
    );
}

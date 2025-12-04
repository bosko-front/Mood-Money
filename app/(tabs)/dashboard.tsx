import React from "react";
import {ActivityIndicator, StyleSheet, Text, View, ScrollView, Button} from "react-native";
import {LinearGradient} from "expo-linear-gradient";
import {Colors} from "@/src/constants/colors";
import {BarChart} from "@/src/components/dashboard/BarChart";
import DonutChart from "@/src/components/dashboard/PieChart";
import {useAuthStore} from "@/src/store/useAuthStore";
import {DropdownComponent} from "@/src/components/dashboard/DropdownComponent";
import {useFilterStore} from "@/src/store/useFilterStore";
import {timeFilters} from "@/src/constants/timeFilters";
import {useSpendingStats} from "@/src/hooks/useSpendingStats";
import { useSharedValue, withRepeat, withTiming} from "react-native-reanimated";
import LottieView from "lottie-react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";

export default function DashboardScreen() {
    const user = useAuthStore((state) => state.user);
    const {daysRange, setDaysRange} = useFilterStore();
    const {moodData, categoryData, loading} = useSpendingStats(user?.uid, daysRange);
    const pulse = useSharedValue(1);
    const inset = useSafeAreaInsets();


    React.useEffect(() => {
        pulse.value = withRepeat(
            withTiming(1.2, { duration: 1000 }),
            -1,
            true
        );
    }, []);



    return (
        <View style={styles.container}>
            <LinearGradient colors={[Colors.primary, Colors.secondary]} style={[styles.header,{paddingTop:inset.top + 20}]}
                            >
                <View>
                    <Text style={styles.headerTitle}>Dashboard</Text>
                    <Text style={styles.headerSubtitle}>Your spending by mood</Text>
                </View>
                <LottieView
                    source={require("@/assets/gifs/BarChart.json")}
                    autoPlay
                    loop
                    style={{ width: 90, height: 90 }}
                />
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.filterCard}>
                    <Text style={styles.sectionTitle}>Filters</Text>
                    <DropdownComponent
                        label="Time range"
                        options={timeFilters.map(f => ({label: f.label, value: f.value}))}
                        selectedValue={daysRange}
                        onSelect={(v) => setDaysRange(v)}
                    />
                </View>



                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Spending by Mood</Text>
                        <Text style={styles.cardSubtitle}>Track how emotions impact expenses</Text>
                    </View>
                    <View style={styles.cardBody}>
                        {loading ? (
                            <ActivityIndicator size="large" color={Colors.secondary}/>
                        ) : (
                            <BarChart data={moodData}/>
                        )}
                    </View>
                </View>

                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Mood Distribution</Text>
                        <Text style={styles.cardSubtitle}>Where your spending concentrates</Text>
                    </View>
                    <View style={styles.cardBody}>
                        {loading ? (
                            <ActivityIndicator size="large" color={Colors.secondary}/>
                        ) : (
                            <DonutChart data={categoryData}/>
                        )}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {flex: 1, backgroundColor: Colors.background},
    header: {
        height: 160,
        alignItems: "center",
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingBottom: 24,
        marginBottom:24,
        paddingHorizontal:20
    },
    headerIcon: {
        fontSize: 32,
    },
    headerTitle: {color: Colors.surface, fontSize: 26, fontWeight: "700"},
    headerSubtitle: {color: Colors.surface, opacity: 0.9, fontSize: 15},
    content: {
        paddingHorizontal: 16,
        paddingBottom: 32,
        gap: 16,
    },
    filterCard: {
        backgroundColor: Colors.surface,
        borderRadius: 12,
        padding: 12,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: Colors.border,
        shadowColor: Colors.black,
        shadowOpacity: 0.05,
        shadowRadius: 6,
        shadowOffset: {width: 0, height: 2},
        elevation: 2,
        gap: 8,
    },
    sectionTitle: {
        color: Colors.textPrimary,
        fontWeight: "600",
        fontSize: 14,
        marginBottom: 4,
    },
    card: {
        backgroundColor: Colors.surface,
        borderRadius: 14,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: Colors.border,
        shadowColor: Colors.black,
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: {width: 0, height: 3},
        elevation: 3,
        overflow: "hidden",
    },
    cardHeader: {
        paddingHorizontal: 14,
        paddingTop: 14,
        paddingBottom: 6,
        backgroundColor: Colors.white,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.border,
    },
    cardTitle: {
        color: Colors.textPrimary,
        fontSize: 16,
        fontWeight: "700",
    },
    cardSubtitle: {
        color: Colors.textSecondary,
        fontSize: 12,
        marginTop: 2,
    },
    cardBody: {
        minHeight: 220,
        backgroundColor: Colors.white,
    },
    placeholderBody: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 24,
    },
    placeholderText: {
        color: Colors.gray[500],
    },
});

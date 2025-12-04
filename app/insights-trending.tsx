import {View, Text, ScrollView, StyleSheet, Animated, Easing, TouchableOpacity} from "react-native";
import {useAuthStore} from "@/src/store/useAuthStore";
import {useTrendingData} from "@/src/hooks/useTrendingData";

import {Colors} from "@/src/constants";
import TrendingBarChart from "@/src/components/insights/BarChart";
import {LinearGradient} from "expo-linear-gradient";
import LottieView from "lottie-react-native";
import React from "react";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';

export default function InsightsTrending() {
    const user = useAuthStore((state) => state.user);
    const {data, loading} = useTrendingData(user?.uid);
    const inset = useSafeAreaInsets();
    const router = useRouter();

    // Pulsating dot animation next to percent change
    const pulse = React.useRef(new Animated.Value(1)).current;
    React.useEffect(() => {
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(pulse, {
                    toValue: 1.25,
                    duration: 800,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(pulse, {
                    toValue: 1,
                    duration: 800,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        );
        loop.start();
        return () => {
            loop.stop();
        };
    }, [pulse]);

    // 🔹 Compute totals and insights
    const currentTotal = data.reduce((sum, item) => sum + item.currentWeek, 0);
    const previousTotal = data.reduce((sum, item) => sum + item.previousWeek, 0);
    const percentChange = previousTotal
        ? ((currentTotal - previousTotal) / previousTotal) * 100
        : 0;

    // 🔹 Sort categories by change
    const sorted = [...data].sort(
        (a, b) =>
            ((b.currentWeek - b.previousWeek) / (b.previousWeek || 1)) * 100 -
            ((a.currentWeek - a.previousWeek) / (a.previousWeek || 1)) * 100
    );

    const topIncrease = sorted.filter(
        (item) => item.currentWeek > item.previousWeek
    )[0];
    const topDecrease = sorted.filter(
        (item) => item.currentWeek < item.previousWeek
    )[0];

    // 🔹 Generate smart summary
    let insightText = "";
    if (percentChange > 10)
        insightText = "Your total spending increased this week. Review top categories like " + (topIncrease?.category ?? "shopping") + ".";
    else if (percentChange < -10)
        insightText = "Nice work! You reduced spending overall, especially in " + (topDecrease?.category ?? "some areas") + ".";
    else
        insightText = "Your overall spending is steady compared to last week.";


    const goBack = async () =>{
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.back();
    }

    const InsightsTrendingHeader = () => {
        return (
            <LinearGradient colors={[Colors.primary, Colors.secondary]}
                            start={{x: 0, y: 0}}
                            end={{x: 1, y: 1}}
                            style={[styles.lockedHeader, {paddingTop: inset.top + 24}]}>

                <TouchableOpacity
                    onPress={goBack}
                    style={[styles.backButton, { top: inset.top + 24 }]}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityRole="button"
                    accessibilityLabel="Go back"
                >
                    <Ionicons name="chevron-back" size={26} color={Colors.surface} />
                </TouchableOpacity>
                <View>
                    <Text style={styles.lockedTitle}>Trending Insights </Text>
                    <Text style={styles.headerSubtitle}>Your personalized weekly summary</Text>
                </View>
            </LinearGradient>
        )
    }


    const ColorGradientTopBar = () => {
        return (
            <LinearGradient
                colors={[Colors.primary, Colors.secondary]}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={{
                    height: 3,
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                    marginBottom: 8,
                }}
            />
        )
    }

    return (
        <View style={styles.safeView}>
            <InsightsTrendingHeader/>
            <ScrollView contentContainerStyle={styles.content}>

                {/* 1️⃣ Weekly Summary Card */}
                <View style={styles.card}>

                    <Text style={styles.cardTitle}>Weekly Summary</Text>
                    <ColorGradientTopBar/>
                    <View style={styles.summaryRow}>
                        <View style={styles.summaryBox}>
                            <Text style={styles.summaryLabel}>This Week</Text>
                            <Text style={styles.summaryValue}>
                                ${currentTotal.toFixed(0)}
                            </Text>
                        </View>
                        <View style={styles.summaryBox}>
                            <Text style={styles.summaryLabel}>Last Week</Text>
                            <Text style={styles.summaryValue}>
                                ${previousTotal.toFixed(0)}
                            </Text>
                        </View>
                        <View style={styles.summaryBox}>
                            <View style={styles.percentRow}>
                                <Text
                                    style={[
                                        styles.summaryChange,
                                        {color: percentChange >= 0 ? "#22c55e" : "#ef4444"},
                                    ]}
                                >
                                    {percentChange >= 0 ? "+" : ""}
                                    {percentChange.toFixed(1)}%
                                </Text>
                                <Animated.View
                                style={[
                                styles.pulseDot,
                                {
                                    backgroundColor:
                                        percentChange >= 0 ? "#22c55e" : "#ef4444",
                                    // soft glow/shadow for nicer look
                                    shadowColor: percentChange >= 0 ? "#22c55e" : "#ef4444",
                                    shadowOpacity: 0.6,
                                    shadowRadius: 6,
                                    shadowOffset: { width: 0, height: 2 },
                                    elevation: 4,
                                    transform: [{scale: pulse}],
                                },
                            ]}
                                />
                            </View>
                        </View>
                    </View>
                </View>

                {/* 2️⃣ Top Movers Card */}
                <View style={styles.card}>

                    <Text style={styles.cardTitle}>Top Changes</Text>
                    <ColorGradientTopBar/>
                    <View style={styles.cardBody}>
                        {topIncrease && (
                            <View style={styles.trendRow}>
                                <LottieView
                                    source={require("@/assets/gifs/increase.json")}
                                    autoPlay
                                    loop
                                    style={styles.trendIcon}
                                />
                                <Text style={styles.insightText}>
                                    Biggest increase in{" "}
                                    <Text style={styles.bold}>{topIncrease.category}</Text> (+ $
                                    {topIncrease.currentWeek - topIncrease.previousWeek})
                                </Text>
                            </View>
                        )}

                        {topDecrease && (
                            <View style={styles.trendRow}>
                                <LottieView
                                    source={require("@/assets/gifs/decrease.json")}
                                    autoPlay
                                    loop
                                    style={styles.trendIcon}
                                />
                                <Text style={styles.insightText}>
                                    Biggest decrease in{" "}
                                    <Text style={styles.bold}>{topDecrease.category}</Text> (− $
                                    {topDecrease.previousWeek - topDecrease.currentWeek})
                                </Text>
                            </View>
                        )}
                    </View>

                </View>

                {/* 3️⃣ Smart Summary Card */}
                <View style={styles.card}>

                    <Text style={styles.cardTitle}>Insight</Text>
                    <ColorGradientTopBar/>
                    <View style={styles.cardBody}>
                        <Text style={styles.insightText}>{insightText}</Text>
                    </View>
                </View>

                {/* 4️⃣ Chart Card */}

                <View style={styles.card}>

                    <Text style={styles.cardTitle}>
                        Category Spend — This Week vs Last Week
                    </Text>
                    <ColorGradientTopBar/>
                    <View style={styles.cardBody}>
                        <TrendingBarChart data={data} loading={loading}/>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    safeView: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    content: {
        padding: 16,
        paddingBottom: 80,
    },
    screenTitle: {
        fontSize: 22,
        fontWeight: "700",
        marginBottom: 12,
        color: Colors.textPrimary,
    },

    lockedHeader: {
        height: 160,
        justifyContent: "center",
        alignItems: "center",
        paddingBottom: 24,
        flexDirection: 'row'
    },
    backButton: {
        position: 'absolute',
        left: 16,
        // top is set dynamically with inset in component
        padding: 6,
        borderRadius: 20,
        backgroundColor: 'transparent',
        zIndex: 10,
    },
    lockedTitle: {color: Colors.surface, fontSize: 26, fontWeight: "700"},
    headerSubtitle: {color: Colors.surface, opacity: 0.9, fontSize: 15},





    card: {
        borderRadius: 20,
        padding: 18,
        marginBottom: 18,
        backgroundColor: Colors.white,
        // subtle gradient effect
        shadowColor: Colors.black,
        shadowOpacity: 0.06,
        shadowOffset: {width: 0, height: 4},
        shadowRadius: 6,
        elevation: 3,
        borderWidth: 1,
        borderColor: Colors.gray[200],
    },
    cardTitle: {
        fontSize: 17,
        fontWeight: "700",
        color: Colors.primary,
        marginBottom: 10,
        letterSpacing: 0.3,
    },
    cardBody: {
        paddingVertical: 6,
    },

    summaryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    summaryBox: {
        alignItems: "flex-start",
        flex: 1,
    },
    summaryLabel: {
        color: Colors.textSecondary,
        fontSize: 13,
        marginBottom: 2,
    },
    summaryValue: {
        fontSize: 20,
        fontWeight: "700",
        color: Colors.textPrimary,
    },

    summaryChange: {
        fontSize: 20,
        fontWeight: "800",
        backgroundClip: "text",
        color: Colors.primary,
    },

    percentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 12,
    },

    pulseDot: {
        width: 12,
        height: 12,
        borderRadius: 4,
        marginLeft: 10,
    },

    insightText: {
        fontSize: 15,
        lineHeight: 22,
        color: Colors.textPrimary,
    },
    bold: {
        fontWeight: "700",
        color: Colors.accent,
    },
    trendRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    trendIcon: {
        width: 33,
        height: 33,
        marginRight: 6,
    },

});

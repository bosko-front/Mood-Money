import React, {useCallback, useEffect, useState} from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Button,
    ActivityIndicator,
    TouchableOpacity,
    Alert, RefreshControl, FlatList, Modal,
} from "react-native";
import {LinearGradient} from "expo-linear-gradient";
import {Colors} from "@/src/constants/colors";
import {useFocusEffect, useRouter} from "expo-router";
import {useAuthStore} from "@/src/store/useAuthStore";
import {db} from "@/firebaseConfig";
import EmptyState from "@/src/components/insights/EmptyState";
import LoadingInsights from "@/src/components/insights/LoadingInsights";
import LottieView from "lottie-react-native";
import { useSafeAreaInsets} from "react-native-safe-area-context";
import * as Haptics from 'expo-haptics';

type Insight = {
    title: string;
    description: string;
    recommendation?: string;
};

type InsightEntry = {
    id: string;
    generatedAt: string;
    availableAfter: string;
    insights: Insight[];
};

export default function AiInsightsScreen() {
    const router = useRouter();
    const {user, isPremium} = useAuthStore();
    const [insights, setInsights] = useState<Insight[]>([]);
    const [history, setHistory] = useState<InsightEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [nextAvailable, setNextAvailable] = useState<string | null>(null);
    const inset = useSafeAreaInsets();
    const [refreshing, setRefreshing] = useState(false);
    const [selectedHistory, setSelectedHistory] = useState<InsightEntry | null>(null);
    const [modalVisible, setModalVisible] = useState(false);



    useFocusEffect(
        useCallback(() => {
            if (user && isPremium) loadInsightsHistory();
        }, [user, isPremium])
    );

    const onRefresh = useCallback(async () => {
        if (!user || !isPremium) return;
        setRefreshing(true);
        await loadInsightsHistory();
        setRefreshing(false);
    }, [user, isPremium]);

    const loadInsightsHistory = async () => {
        try {
            const insightsRef = db
                .collection('users')
                .doc(user?.uid)
                .collection('aiInsights');
            const snapshot = await insightsRef.orderBy('generatedAt', 'desc').get();
            const allInsights = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...(doc.data() as any),
            })) as InsightEntry[];

            setHistory(allInsights);
            setInsights(allInsights[0]?.insights || []);

            const latestAvailable = allInsights[0]?.availableAfter;
            if (latestAvailable && new Date(latestAvailable) > new Date()) {
                setNextAvailable(latestAvailable);
            } else {
                setNextAvailable(null);
            }
        } catch (err) {
            console.error("Error loading insights:", err);
        }
    };


    const fetchAndGenerateInsights = async () => {
        if (!user) return;

        setLoading(true);
        try {
            // 1️⃣ Check last insight (limit 1x per week)
            const insightsRef = db
                .collection('users')
                .doc(user.uid)
                .collection('aiInsights');

            const lastSnapshot = await insightsRef
                .orderBy('generatedAt', 'desc')
                .limit(1)
                .get();

            const lastInsight = lastSnapshot.docs[0]?.data() as InsightEntry | undefined;
            const now = new Date();

            if (lastInsight && new Date(lastInsight.availableAfter) > now) {
                Alert.alert(
                    "AI Insights",
                    `Next AI insight will be available ${new Date(lastInsight.availableAfter).toLocaleDateString()}.`
                );
                setInsights(lastInsight.insights || []);
                setNextAvailable(lastInsight.availableAfter);
                setLoading(false);
                return;
            }

            // 2️⃣ Collect only entries from the last 7 days
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            const entriesSnap = await db
                .collection('users')
                .doc(user.uid)
                .collection('spendingEntries')
                .get();

            const allEntries = entriesSnap.docs.map((doc) => doc.data());
            const recentEntries = allEntries.filter((e: any) => {
                if (!e.timestamp) return false;

                const date =
                    typeof e.timestamp?.toDate === 'function'
                        ? e.timestamp.toDate()
                        : e.timestamp?.seconds
                            ? new Date(e.timestamp.seconds * 1000)
                            : new Date(e.timestamp);

                return date >= sevenDaysAgo;
            });

            if (recentEntries.length < 3) {
                Alert.alert(
                    "Not enough data",
                    "Not enough data for the past 7 days. Add some new entries and try again."
                );
                setLoading(false);
                return;
            }

            // 3️⃣ Call AI API with recent data
            const res = await fetch("https://moodmoney-ai.vercel.app/api/ai-insights", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(recentEntries),
            });

            const data = await res.json();
            const newInsights = data.insights || [];

            // 4️⃣ Save to Firestore
            const nextWeek = new Date();
            nextWeek.setDate(nextWeek.getDate() + 7);

            const docRef = await insightsRef.add({
                generatedAt: now.toISOString(),
                availableAfter: nextWeek.toISOString(),
                insights: newInsights,
            });

            const newEntry: InsightEntry = {
                id: docRef.id,
                generatedAt: now.toISOString(),
                availableAfter: nextWeek.toISOString(),
                insights: newInsights,
            };

            // ✅ Consistent state update (auto-null if expired)
            setNextAvailable(new Date(nextWeek) > new Date() ? nextWeek.toISOString() : null);
            setInsights(newInsights);
            setHistory((prev) => [newEntry, ...prev]);
        } catch (err) {
            console.error("Error generating insights:", err);
            Alert.alert(
                "Error",
                "Error while generating insights. Please try again later or contact support if the problem persists."
            );
        } finally {
            setLoading(false);
        }
    };




    const InsightsHeader = () => {
        return (
            <LinearGradient colors={[Colors.primary, Colors.secondary]}
                            start={{x: 0, y: 0}}
                            end={{x: 1, y: 1}}
                            style={[styles.lockedHeader, {paddingTop: inset.top + 24}]}>
                <View>
                    <Text style={styles.lockedTitle}>AI Insights </Text>
                    <Text style={styles.headerSubtitle}>Your personalized weekly summary</Text>
                </View>
                <LottieView
                    source={require("@/assets/gifs/ai.json")}
                    autoPlay
                    loop
                    style={{width: 100, height: 100}}
                />
            </LinearGradient>
        )
    }

    if (!isPremium) {
        return (
            <View style={styles.lockedContainer}>
                <InsightsHeader/>
                <View style={styles.lockedContent}>
                    <LottieView
                        source={require("@/assets/gifs/LockedIcon.json")}
                        autoPlay
                        loop
                        style={{width: 150, height: 150}}
                    />
                    <Text style={styles.lockedText}>
                        Unlock personalized AI insights to understand your moods & spending better.
                    </Text>
                    <Button title="Upgrade to Premium" onPress={() => router.push("/subscription")}/>
                </View>
            </View>
        );
    }


    const viewTrending = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        return router.push('/insights-trending')
    }

    return (
        <View style={styles.container}>
            <InsightsHeader/>

            {nextAvailable && (
                <View style={styles.badgeContainer}>
                    <Text style={styles.badgeText}>
                        Next insight available: {new Date(nextAvailable).toLocaleDateString()}
                    </Text>

                </View>
            )}

            {history.length > 0 && !nextAvailable && (
                <Button title="Generate Insights" onPress={fetchAndGenerateInsights} disabled={loading}/>

            )}

            {loading ? (
                <View style={styles.emptyContainer}>
                    <LoadingInsights/>
                </View>
            ) : insights.length === 0 ? (
                <View style={styles.emptyContainer}>

                    <EmptyState/>
                    <Button title="Generate new Insights here" onPress={fetchAndGenerateInsights} disabled={loading}/>

                </View>
            ) : (
                <>
                    <FlatList
                        data={insights}
                        keyExtractor={(item, index) => `current-${index}`}
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        contentContainerStyle={{padding: 16}}
                        ListHeaderComponent={
                            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                                <Text style={styles.sectionTitle}>This Week’s Insights</Text>
                                <Button title="View Trending" onPress={viewTrending}/>
                            </View>
                        }
                        renderItem={({item}) => (
                            <LinearGradient colors={["#fff", "#f8f8ff"]} style={styles.card}>
                                <Text style={styles.title}>{item.title}</Text>
                                <Text style={styles.description}>{item.description}</Text>
                                {item.recommendation && (
                                    <Text style={styles.recommendation}>💡 {item.recommendation}</Text>
                                )}
                            </LinearGradient>
                        )}
                        ListFooterComponent={
                            history.length > 1 ? (
                                <View style={{marginTop: 32}}>
                                    <Text style={[styles.sectionTitle, {paddingHorizontal: 0}]}>Previous Insights</Text>
                                    <FlatList
                                        data={history.slice(1)}
                                        keyExtractor={(item) => item.id}
                                        scrollEnabled={false}
                                        renderItem={({item}) => (
                                            <TouchableOpacity
                                                style={styles.historyItem}
                                                onLongPress={async () => {
                                                    try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}
                                                    setSelectedHistory(item);
                                                    setModalVisible(true);
                                                }}
                                            >
                                                <Text style={styles.historyDate}>
                                                    {new Date(item.generatedAt).toLocaleDateString()}
                                                </Text>
                                                <Text style={styles.historyNote}>{item.insights[0]?.title || "AI Summary"}</Text>
                                            </TouchableOpacity>
                                        )}
                                    />
                                </View>
                            ) : null
                        }
                    />

                    <Modal
                        visible={modalVisible}
                        animationType="slide"
                        transparent
                        onRequestClose={() => setModalVisible(false)}
                    >
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContent}>
                                <Text style={styles.modalTitle}>
                                    {selectedHistory ? new Date(selectedHistory.generatedAt).toLocaleDateString() : "Insights"}
                                </Text>
                                <FlatList
                                    data={selectedHistory?.insights || []}
                                    keyExtractor={(_, i) => `modal-${i}`}
                                    renderItem={({item}) => (
                                        <View style={styles.modalCard}>
                                            <Text style={styles.title}>{item.title}</Text>
                                            <Text style={styles.description}>{item.description}</Text>
                                            {item.recommendation && (
                                                <Text style={styles.recommendation}>💡 {item.recommendation}</Text>
                                            )}
                                        </View>
                                    )}
                                />
                                <Button title="Close" onPress={() => setModalVisible(false)} />
                            </View>
                        </View>
                    </Modal>
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {flex: 1, backgroundColor: Colors.background},
    header: {
        height: 160,
        justifyContent: "flex-end",
        paddingHorizontal: 24,
        paddingBottom: 24,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    headerTitle: {color: Colors.surface, fontSize: 26, fontWeight: "700"},
    headerSubtitle: {color: Colors.surface, opacity: 0.9, fontSize: 15},
    badgeContainer: {
        alignSelf: "center",
        marginTop: 8,
        marginBottom: 12,
        backgroundColor: "#E8F0FF",
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 6,
    },
    badgeText: {color: Colors.primary, fontSize: 13, fontWeight: "600"},
    sectionTitle: {fontWeight: "700", fontSize: 16, marginVertical: 12, color: Colors.textPrimary},
    card: {
        backgroundColor: Colors.surface,
        borderRadius: 16,
        padding: 18,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 3,
    },
    title: {fontWeight: "700", fontSize: 16, marginBottom: 4},
    description: {fontSize: 15, color: Colors.textSecondary, marginBottom: 8},
    recommendation: {fontSize: 14, fontWeight: "600", color: Colors.primary},
    emptyText: {textAlign: "center", color: Colors.textSecondary, marginTop: 24},

    historyItem: {
        backgroundColor: "#f1f1f1",
        borderRadius: 10,
        padding: 12,
        marginBottom: 8,
    },
    historyDate: {fontSize: 13, color: Colors.textSecondary},
    historyNote: {fontSize: 14, fontWeight: "600", color: Colors.textPrimary},

    lockedContainer: {flex: 1, backgroundColor: Colors.background},
    lockedHeader: {
        height: 160,
        justifyContent: "center",
        alignItems: "center",
        paddingBottom: 24,
        flexDirection: 'row'
    },
    lockedTitle: {color: Colors.surface, fontSize: 26, fontWeight: "700"},
    lockedContent: {flex: 1, alignItems: "center", justifyContent: "center", padding: 24},
    lockedEmoji: {fontSize: 64, marginBottom: 16},
    lockedText: {
        textAlign: "center",
        fontSize: 16,
        color: Colors.textSecondary,
        marginBottom: 24,
        lineHeight: 22,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    emptyGif: {
        width: 200,
        height: 200,
        marginBottom: 16,
    },

    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        maxHeight: '80%',
        backgroundColor: Colors.surface,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        padding: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginBottom: 12,
    },
    modalCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 5,
        elevation: 2,
    },


});

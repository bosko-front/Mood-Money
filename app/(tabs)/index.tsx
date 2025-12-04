import React, {useEffect, useCallback, useMemo, useState, useRef} from 'react';
import {
    View,
    Text,
    StyleSheet,
    RefreshControl,
    ActivityIndicator,
    FlatList, Pressable, TouchableOpacity,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import {Colors} from '@/src/constants';
import {useAuthStore} from '@/src/store/useAuthStore';
import {useEntriesStore, SpendingEntry} from '@/src/store/useEntriesStore';
import EntryItem from '@/src/components/home/EntryItem';
import KPIRow from '@/src/components/home/KPIRow';
import EmptyState from '@/src/components/home/EmptyState';
import {categoryIcons} from '@/src/constants/entries';
import {LinearGradient} from "expo-linear-gradient";
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Sheet, {SheetRef} from "@/src/components/shared/sheetComponent";
import FiltersModalSheet from "@/src/components/home/FiltersModal";
import Animated, {
    useSharedValue,
    useAnimatedScrollHandler,
    interpolate,
    useAnimatedStyle, Extrapolation
} from 'react-native-reanimated';
import {ListFilter} from "lucide-react-native";
import {moodEmojis} from "@/src/constants/moods";

export default function HomeScreen() {
    const insets = useSafeAreaInsets();
    const user = useAuthStore((s) => s.user);
    const entries = useEntriesStore((s) => s.entries);
    const loading = useEntriesStore((s) => s.loading);
    const refreshing = useEntriesStore((s) => s.refreshing);

    const refresh = useEntriesStore((s) => s.refresh);
    const filterSheet = useRef<SheetRef>(null);
    const scrollY = useSharedValue(0);
    const HEADER_HEIGHT = 200;
    const ITEM_HEIGHT = 112;
    // Ensure entries are loaded on initial mount and whenever the logged-in user changes
    const lastFetchedUidRef = useRef<string | null>(null);
    useEffect(() => {
        if (user?.uid && lastFetchedUidRef.current !== user.uid) {
            lastFetchedUidRef.current = user.uid;
            refresh(user.uid);
        }
    }, [user?.uid, refresh]);


    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
    });



    const animatedHeaderStyle = useAnimatedStyle(() => {
        const translateY = interpolate(
            scrollY.value,
            [0, HEADER_HEIGHT],
            [0, -HEADER_HEIGHT + 100],
            Extrapolation.CLAMP
        );
        return {transform: [{translateY}]};
    });

    const animatedTitleStyle = useAnimatedStyle(() => {
        const scale = interpolate(scrollY.value, [0, 80], [1, 0.9], Extrapolation.CLAMP);
        const translateY = interpolate(scrollY.value, [0, 80], [0, -20], Extrapolation.CLAMP);
        return {transform: [{scale}, {translateY}]};
    });

    // Pills disappear subtly (fade + slight translate) as user scrolls
    const animatedSummaryStyle = useAnimatedStyle(() => {
        const opacity = interpolate(scrollY.value, [0, 60, 110], [1, 0.5, 0], Extrapolation.CLAMP);
        const translateY = interpolate(scrollY.value, [0, 110], [0, -8], Extrapolation.CLAMP);
        return {opacity, transform: [{translateY}]};
    });

    // Compact textual summary appears as pills disappear
    const animatedCompactSummaryStyle = useAnimatedStyle(() => {
        const opacity = interpolate(scrollY.value, [40, 100], [0, 1], Extrapolation.CLAMP);
        const translateY = interpolate(scrollY.value, [40, 100], [8, 0], Extrapolation.CLAMP);
        return {opacity, transform: [{translateY}]};
    });


    const onRefresh = useCallback(async () => {
        if (user?.uid) {
            await refresh(user.uid);
        }
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }, [refresh, user?.uid]);

    // Daily summary
    const isSameDay = (d1: Date, d2: Date) =>
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();

    const today = new Date();

    const todayEntries = entries.filter((e) =>
        isSameDay(e.timestamp.toDate(), today)
    );

    const totalSpending = todayEntries.reduce((sum, e) => sum + e.amount, 0);
    const averageMood = todayEntries.length
        ? Math.round(todayEntries.reduce((sum, e) => sum + e.mood, 0) / todayEntries.length)
        : 0;


    // Filtering & sorting state
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [moodFilter, setMoodFilter] = useState<'All' | 'Positive' | 'Neutral' | 'Negative'>('All');
    const [sortBy, setSortBy] = useState<'date' | 'amount' | 'mood'>('date');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

    const allCategories = useMemo(() => {
        const base = Object.keys(categoryIcons);
        const fromData = Array.from(new Set(entries.map((e) => e.category)));
        const merged = Array.from(new Set(['All', ...base, ...fromData]));
        return merged;
    }, [entries]);

    const displayedEntries = useMemo(() => {
        let list = [...entries];
        // category filter
        if (selectedCategory !== 'All') {
            list = list.filter((e) => e.category === selectedCategory);
        }
        // mood filter
        if (moodFilter !== 'All') {
            list = list.filter((e) => {
                if (moodFilter === 'Positive') return e.mood <= 2;
                if (moodFilter === 'Neutral') return e.mood === 3 || e.mood === 4;
                if (moodFilter === 'Negative') return e.mood >= 5;
                return true;
            });
        }
        // sort
        list.sort((a, b) => {
            let cmp = 0;
            if (sortBy === 'date') {
                cmp = a.timestamp.toDate().getTime() - b.timestamp.toDate().getTime();
            } else if (sortBy === 'amount') {
                cmp = a.amount - b.amount;
            } else if (sortBy === 'mood') {
                cmp = a.mood - b.mood;
            }
            return sortDir === 'asc' ? cmp : -cmp;
        });
        return list;
    }, [entries, selectedCategory, moodFilter, sortBy, sortDir]);

    const renderEntry = ({item}: { item: SpendingEntry }) => <EntryItem item={item}/>;


    const closeModal = () => {
        filterSheet.current?.hide();
    }

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary}/>
            </View>
        );
    }

    const PageHeader = () => {
        return (
            <Animated.View style={[styles.header, animatedHeaderStyle,{paddingTop: insets.top + 20}]}>
                <LinearGradient
                    colors={[Colors.primary, Colors.secondary]}
                    style={StyleSheet.absoluteFill}
                />
                <Animated.Text style={[styles.headerTitle, animatedTitleStyle]}>
                    {`Welcome  ${user?.displayName?.split(' ')[0] ?? '👋'}`}
                </Animated.Text>
                {/* Compact summary text that fades in as you scroll */}
                <Animated.View
                    style={[
                        styles.compactSummaryContainer,
                        { top: insets.top + HEADER_HEIGHT / 2  }, // center within header
                        animatedCompactSummaryStyle,
                    ]}
                >
                    <Text style={styles.headerSubtitle}>
                        {`Today’s spent: $${totalSpending.toFixed(2)} · Avg. mood ${
                            todayEntries.length ? moodEmojis[averageMood - 1] : '—'
                        }`}
                    </Text>
                </Animated.View>

                <Animated.View style={[animatedSummaryStyle]}>
                    <View style={styles.headerSummaryRow}>
                        {/* KPI Pills */}
                        <View style={styles.summaryPill}>
                            <Text style={styles.summaryPillLabel}>Today’s Spend</Text>
                            <View style={styles.summaryValueRow}>
                                <Text style={styles.summaryEmoji}>💸</Text>
                                <Text style={styles.summaryPillValue}>${totalSpending.toFixed(2)}</Text>
                            </View>
                        </View>
                        <View style={styles.summaryPill}>
                            <Text style={styles.summaryPillLabel}>Avg. Mood</Text>
                            <View style={styles.summaryValueRow}>
                                {todayEntries.length ? (
                                    <Text style={styles.summaryEmoji}>{moodEmojis[averageMood - 1]}</Text>
                                ) : (
                                    <Text style={styles.summaryPillValue}>No entries today</Text>
                                )}
                            </View>
                        </View>
                    </View>
                </Animated.View>
            </Animated.View>
        )
    }

    const Kpis = () => {
        return (
            <View style={styles.listTopBlock}>
                <KPIRow entries={entries}/>
                <View style={styles.filtersTriggerRow}>
                    <Pressable
                        style={styles.filtersTriggerBtn}
                        accessibilityRole="button"
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        onPress={() => {
                            filterSheet.current?.show();
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }}
                    >
                        <ListFilter size={20} color={Colors.textPrimary} />

                        {(() => {
                            const activeCount =
                                (selectedCategory !== 'All' ? 1 : 0) +
                                (moodFilter !== 'All' ? 1 : 0) +
                                (sortBy !== 'date' || sortDir !== 'desc' ? 1 : 0);
                            return activeCount > 0 ? (
                                <View style={styles.filtersBadge}>
                                    <Text style={styles.filtersBadgeText}>{activeCount}</Text>
                                </View>
                            ) : null;
                        })()}
                    </Pressable>
                </View>
            </View>
        )
    }

    return (
        <View style={styles.container}>
           <PageHeader/>

            <Animated.FlatList
                data={displayedEntries}
                keyExtractor={(item) => item.id}
                renderItem={renderEntry}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>}
                onScroll={scrollHandler}
                ListHeaderComponent={Kpis}
                scrollEventThrottle={16}
                contentContainerStyle={{
                    paddingTop: HEADER_HEIGHT,
                    paddingBottom: 100,
                }}
                getItemLayout={(data, index) => ({
                    length: ITEM_HEIGHT,
                    offset: ITEM_HEIGHT * index,
                    index,
                })}
                ListEmptyComponent={<EmptyState/>}
            />

            <Sheet ref={filterSheet} snapPoint={50}>
                <FiltersModalSheet
                    allCategories={allCategories}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    moodFilter={moodFilter}
                    setMoodFilter={setMoodFilter}
                    sortBy={sortBy}
                    onClose={closeModal}
                    setSortBy={setSortBy}
                    sortDir={sortDir}
                    toggleSortDir={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
                    onReset={() => {
                        setSelectedCategory('All');
                        setMoodFilter('All');
                        setSortBy('date');
                        setSortDir('desc');
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                />
            </Sheet>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {flex: 1, backgroundColor: Colors.background},
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 200, //todo this is ok now, it shouuld be same as HEADER_HEIGHT
        justifyContent: 'flex-end',
        paddingHorizontal: 16,
        paddingBottom: 16,
        zIndex: 10,
        overflow: 'hidden',
    },
    headerTitle: {
        color: Colors.white,
        fontSize: 26,
        fontWeight: '700',
    },
    headerSubtitle: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 14,
    },
    headerSummaryRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 14,
    },
    summaryPill: {
        backgroundColor: 'rgba(255,255,255,0.85)',
        borderColor: 'rgba(255,255,255,0.35)',
        borderWidth: 1,
        borderRadius: 14,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginRight: 8,
        shadowColor: Colors.black,
        shadowOpacity: 0.05,
        shadowOffset: {width: 0, height: 2},
        shadowRadius: 6,
        elevation: 1,
    },
    summaryPillLabel: {
        color: Colors.gray[600],
        fontSize: 12,
        marginBottom: 2,
    },
    summaryPillValue: {
        color: Colors.textPrimary,
        fontSize: 16,
        fontWeight: '700',
    },
    summaryValueRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    summaryEmoji: {
        fontSize: 18,
        marginRight: 2,
    },
    listTopBlock: {
        backgroundColor: Colors.background,
        paddingTop: 16,
        paddingBottom: 8,
    },
    // Filters trigger button row
    filtersTriggerRow: {
        paddingHorizontal: 16,
        marginTop: 8,
        marginBottom: 4,
    },
    filtersTriggerBtn: {
        alignSelf: 'flex-end',
        backgroundColor: Colors.surface,
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: Colors.border,
        shadowColor: Colors.black,
        shadowOpacity: 0.03,
        shadowOffset: {width: 0, height: 2},
        shadowRadius: 4,
        elevation: 1,
        position: 'relative'
    },
    filtersTriggerText: {
        color: Colors.textPrimary,
        fontSize: 13,
        fontWeight: '600',
    },
    filtersBadge: {
        position: 'absolute',
        top: -6,
        right: -6,
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: Colors.accent,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
        borderWidth: 1,
        borderColor: Colors.white,
    },
    filtersBadgeText: {
        color: Colors.white,
        fontSize: 10,
        fontWeight: '800',
    },
    activeFiltersRow: {
        paddingHorizontal: 16,
        marginTop: 8,
        flexDirection: 'row-reverse',
        flexWrap: 'wrap',
    },
    filterChip: {
        backgroundColor: Colors.gray[100],
        borderColor: Colors.border,
        borderWidth: 1,
        borderRadius: 14,
        paddingHorizontal: 10,
        paddingVertical: 6,
        marginRight: 8,
        marginBottom: 8,
    },
    filterChipText: {
        color: Colors.textPrimary,
        fontSize: 12,
        fontWeight: '600',
    },
    loadingContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},
    compactSummaryContainer: {
        position: 'absolute',
        alignSelf: 'center',
        zIndex: 5,
    },
});

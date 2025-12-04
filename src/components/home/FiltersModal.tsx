import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '@/src/constants';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type MoodFilter = 'All' | 'Positive' | 'Neutral' | 'Negative';
type SortBy = 'date' | 'amount' | 'mood';

type Props = {
    allCategories: string[];
    selectedCategory: string;
    setSelectedCategory: (c: string) => void;
    moodFilter: MoodFilter;
    setMoodFilter: (m: MoodFilter) => void;
    sortBy: SortBy;
    setSortBy: (s: SortBy) => void;
    sortDir: 'asc' | 'desc';
    toggleSortDir: () => void;
    onReset: () => void;
    onClose: () => void;
};

export default function FiltersModalSheet(props: Props) {
    const {
        allCategories,
        selectedCategory,
        setSelectedCategory,
        moodFilter,
        setMoodFilter,
        sortBy,
        setSortBy,
        sortDir,
        toggleSortDir,
        onReset,
        onClose,
    } = props;

    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { paddingBottom: Math.max(16, insets.bottom + 8) }]}>
            {/* Header with X button */}
            <View style={styles.header}>
                <Text style={styles.sheetTitle}>Filters & Sorting</Text>
                <TouchableOpacity onPress={() => { onClose(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }} style={styles.closeBtn} hitSlop={{top:8,bottom:8,left:8,right:8}}>
                    <Ionicons name="close" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
            </View>

            {/* Grouped content card */}
            <View style={styles.card}>
                {/* Category */}
                <Text style={styles.sectionTitle}>Category</Text>
                <View style={styles.chipsRow}>
                    {allCategories.map((cat) => {
                        const active = selectedCategory === cat;
                        return (
                            <TouchableOpacity
                                key={cat}
                                onPress={() => {
                                    setSelectedCategory(cat);
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                }}
                                style={[styles.chip, active && styles.chipActive]}
                            >
                                <Text style={[styles.chipText, active && styles.chipTextActive]}>{cat}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <View style={styles.divider} />

                {/* Mood */}
                <Text style={styles.sectionTitle}>Mood</Text>
                <View style={styles.chipsRow}>
                    {(['All', 'Positive', 'Neutral', 'Negative'] as const).map((mf) => {
                        const active = moodFilter === mf;
                        return (
                            <TouchableOpacity
                                key={mf}
                                onPress={() => {
                                    setMoodFilter(mf);
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                }}
                                style={[styles.chip, active && styles.chipActive]}
                            >
                                <Text style={[styles.chipText, active && styles.chipTextActive]}>{mf}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <View style={styles.divider} />

                {/* Sort */}

                    <Text style={styles.sectionTitle}>Sort by</Text>
                    <View style={styles.sortControls}>
                        {([
                            { key: 'date', label: 'Date' },
                            { key: 'amount', label: 'Amount' },
                            { key: 'mood', label: 'Mood' },
                        ] as const).map((opt) => {
                            const active = sortBy === opt.key;
                            return (
                                <TouchableOpacity
                                    key={opt.key}
                                    onPress={() => {
                                        setSortBy(opt.key);
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    }}
                                    style={[styles.sortChip, active && styles.sortChipActive]}
                                >
                                    <Text style={[styles.sortChipText, active && styles.sortChipTextActive]}>{opt.label}</Text>
                                </TouchableOpacity>
                            );
                        })}
                        <TouchableOpacity onPress={() => { toggleSortDir(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }} style={styles.sortDirBtn}>
                            <Ionicons name={sortDir === 'asc' ? 'arrow-up' : 'arrow-down'} size={18} color={Colors.textPrimary} />
                        </TouchableOpacity>
                    </View>

            </View>

            {/* Bottom action bar */}
            <View style={[styles.sheetFooter, { paddingBottom: Math.max(10, insets.bottom) }]}>
                <TouchableOpacity
                    style={styles.resetBtn}
                    onPress={() => { onReset(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                >
                    <Text style={styles.resetText}>Reset</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingHorizontal: 16, justifyContent: 'flex-start', },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
    closeBtn: { padding: 4 },
    sheetTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
    sectionTitle: { fontSize: 12, fontWeight: '700', color: Colors.gray[600], marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.6 },
    card: {
        backgroundColor: Colors.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: 12,
    },
    divider: { height: 1, backgroundColor: Colors.border, marginVertical: 10 },
    chipsRow: { flexDirection: 'row', flexWrap: 'wrap' },
    chip: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: Colors.gray[100],
        marginRight: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    chipActive: { backgroundColor: Colors.secondary, borderColor: Colors.secondary, shadowColor: Colors.black, shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4 },
    chipText: { color: Colors.textPrimary, fontSize: 12, fontWeight: '500' },
    chipTextActive: { color: Colors.white },
    sortRow: { flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
    sortControls: { flexDirection: 'row', alignItems: 'center' },
    sortChip: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 14,
        backgroundColor: Colors.gray[100],
        borderWidth: 1,
        borderColor: Colors.border,
        marginRight: 8,
    },
    sortChipActive: { backgroundColor: Colors.secondary, borderColor: Colors.secondary, shadowColor: Colors.black, shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4 },
    sortChipText: { fontSize: 12, color: Colors.textPrimary, fontWeight: '600' },
    sortChipTextActive: { color: Colors.white },
    sortDirBtn: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: Colors.gray[100],
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    sheetFooter: { flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'stretch', marginTop: 14,   paddingTop: 10, paddingHorizontal: 16 },
    resetBtn: { width: '100%', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, backgroundColor: Colors.gray[100], borderWidth: 1, borderColor: Colors.warning },
    resetText: { color: Colors.warning, fontWeight: '700', fontSize: 14, textAlign: 'center' },
});

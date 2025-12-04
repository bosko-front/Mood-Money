import React, { useMemo } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/src/constants';
import { SpendingEntry } from '@/src/store/useEntriesStore';

type Props = {
    entries: SpendingEntry[];
};

export default function KPIScroll({ entries }: Props) {
    // Use start of today (00:00:00) so all entries from the current day are included
    const today = (() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    })();
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    // For "last 30 days", anchor to calendar days including today.
    // Start from the beginning of today and go back 29 full days to include exactly 30 days total.
    const thirtyDaysStart = (() => {
        const d = new Date(today); // today is already start-of-day
        d.setDate(d.getDate() - 29);
        return d;
    })();

    const metrics = useMemo(() => {
        // Helper to filter entries by date
        const filterByDate = (from: Date) =>
            entries.filter((e) => e.timestamp.toDate() >= from);

        const todayEntries = filterByDate(today);
        const weekEntries = filterByDate(oneWeekAgo);
        const monthEntries = filterByDate(thirtyDaysStart);

        const calcMoodPct = (list: typeof entries) => {
            const posCount = list.filter((e) => e.mood <= 2).length;
            const negCount = list.filter((e) => e.mood >= 5).length;
            const total = posCount + negCount;
            return total
                ? { pos: Math.round((posCount / total) * 100), neg: Math.round((negCount / total) * 100) }
                : { pos: 0, neg: 0 };
        };

        const todayMood = calcMoodPct(todayEntries);
        const weekMood = calcMoodPct(weekEntries);
        const monthMood = calcMoodPct(monthEntries);

        const avgSpending = (list: typeof entries) =>
            list.length ? list.reduce((sum, e) => sum + e.amount, 0) / list.length : 0;

        const largestExpense = (list: typeof entries) =>
            list.length ? Math.max(...list.map((e) => e.amount)) : 0;

        return [
            { label: "Today's entries", value: todayEntries.length },
            { label: "Largest expense today", value: `$${largestExpense(todayEntries).toFixed(2)}` },
            { label: "Mood today", value: `${todayMood.pos}% pos • ${todayMood.neg}% neg` },
            { label: "Avg spend last 7d", value: `$${avgSpending(weekEntries).toFixed(2)}` },
            { label: "Total entries last 7d", value: weekEntries.length },
            { label: "Mood last 7d", value: `${weekMood.pos}% pos • ${weekMood.neg}% neg` },
            { label: "Avg spend last 30d", value: `$${avgSpending(monthEntries).toFixed(2)}` },
            { label: "Total entries last 30d", value: monthEntries.length },
            { label: "Mood last 30d", value: `${monthMood.pos}% pos • ${monthMood.neg}% neg` },
        ];
    }, [entries]);

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8 }}
        >
            {metrics.map((kpi, idx) => (
                <View key={idx} style={styles.kpiCard}>
                    <Text style={styles.kpiLabel}>{kpi.label}</Text>
                    <Text style={styles.kpiValue}>{kpi.value}</Text>
                </View>
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    kpiCard: {
        backgroundColor: Colors.surface,
        borderRadius: 14,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginRight: 12,
        borderWidth: 1,
        borderColor: Colors.border,
        shadowColor: Colors.black,
        shadowOpacity: 0.03,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 1,
    },
    kpiLabel: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
    kpiValue: {
        fontSize: 16,
        fontWeight: '700',
        marginTop: 4,
        color: Colors.textPrimary,
    },
});

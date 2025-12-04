import { useEffect, useState } from "react";
import { db } from "@/firebaseConfig";
import { moods } from "@/src/constants/moods";
import { categories } from "@/src/constants/entries";
import {getAggregateKey} from "@/src/helpers/getAggregateKey";

type MoodData = { mood: number; total: number };
type CategoryData = { category: string; total: number };

export const useSpendingStats = (userId?: string, daysRange?: number) => {
    const [moodData, setMoodData] = useState<MoodData[]>([]);
    const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId || !daysRange) return;
        const key = getAggregateKey(daysRange);
        const ref = db
            .collection('users')
            .doc(userId)
            .collection('spendingAggregates')
            .doc(key);

        const unsub = ref.onSnapshot((snap) => {
            const data = snap.data();
            if (!data) {
                setMoodData([]);
                setCategoryData([]);
                setLoading(false);
                return;
            }

            // 🔧 reconstruct totals from flattened Firestore keys
            const moodTotals: Record<number, number> = {};
            const categoryTotals: Record<string, number> = {};

            Object.entries(data).forEach(([key, value]) => {
                if (key.startsWith("moodTotals.")) {
                    const moodKey = Number(key.split(".")[1]);
                    moodTotals[moodKey] = value as number;
                }
                if (key.startsWith("categoryTotals.")) {
                    const catKey = key.split(".")[1];
                    categoryTotals[catKey] = value as number;
                }
            });

            // ✅ Bar chart — include zeros
            setMoodData(
                moods.map(({ value }) => ({
                    mood: value,
                    total: moodTotals[value] || 0,
                }))
            );

            // ✅ Pie chart — exclude zero totals
            setCategoryData(
                categories
                    .map((cat) => ({
                        category: cat,
                        total: categoryTotals[cat] || 0,
                    }))
                    .filter((item) => item.total > 0)
            );

            setLoading(false);
        });

        return () => unsub();
    }, [userId, daysRange]);

    return { moodData, categoryData, loading };
};

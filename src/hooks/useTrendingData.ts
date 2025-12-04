import { useEffect, useState } from "react";
import { db } from "@/firebaseConfig";
import { categories } from "@/src/constants/entries";
import { getWeeklyKey } from "@/src/helpers/getAggregateKeyVariants";

 export type TrendingData = {
    category: string;
    currentWeek: number;
    previousWeek: number;
};

export const useTrendingData = (userId?: string) => {
    const [data, setData] = useState<TrendingData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) return;

        const fetchData = async () => {
            setLoading(true);

            const now = new Date();

            // 🔹 trenutna i prethodna nedelja
            const currentKey = getWeeklyKey(now);

            const prev = new Date(now);
            prev.setDate(now.getDate() - 7);
            const prevKey = getWeeklyKey(prev);

            const userRef = db.collection('users').doc(userId);
            const [currentSnap, prevSnap] = await Promise.all([
                userRef.collection('spendingAggregates').doc(currentKey).get(),
                userRef.collection('spendingAggregates').doc(prevKey).get(),
            ]);

            const currentData = currentSnap.data() || {};
            const prevData = prevSnap.data() || {};

            // 🔧 Rekonstruši totals iz Firestore ključeva
            const categoryTotals = (source: any) => {
                const totals: Record<string, number> = {};
                Object.entries(source).forEach(([key, value]) => {
                    if (key.startsWith("categoryTotals.")) {
                        const cat = key.split(".")[1];
                        totals[cat] = value as number;
                    }
                });
                return totals;
            };

            const currentTotals = categoryTotals(currentData);
            const previousTotals = categoryTotals(prevData);

            // 🔄 Spoji u jedan niz
            const merged = categories.map((cat) => ({
                category: cat,
                currentWeek: currentTotals[cat] || 0,
                previousWeek: previousTotals[cat] || 0,
            }));

            setData(merged);
            setLoading(false);
        };

        fetchData();
    }, [userId]);

    return { data, loading };
};

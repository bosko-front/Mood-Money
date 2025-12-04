// src/store/useEntriesStore.ts
import {create} from 'zustand';
import {db} from '@/firebaseConfig';
import firestore, {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';
import {getHalfYearKey, getMonthlyKey, getQuarterlyKey, getWeeklyKey} from "@/src/helpers/getAggregateKeyVariants";

export interface SpendingEntry {
    id: string;
    amount: number;
    category: string;
    description?: string | null;
    mood: number; // 1–6
    timestamp: FirebaseFirestoreTypes.Timestamp;
    userId?: string;
}

type NewEntry = Omit<SpendingEntry, 'id' | 'timestamp'> & { timestamp?: FirebaseFirestoreTypes.Timestamp };

type EntriesState = {
    entries: SpendingEntry[];
    loading: boolean;
    refreshing: boolean;
    addEntry: (userId: string, data: Omit<NewEntry, 'userId'>) => Promise<void>;
    refresh: (userId: string) => Promise<void>;
    clear: () => void;
};

export const useEntriesStore = create<EntriesState>((set, get) => ({
    entries: [],
    loading: false,
    refreshing: false,


    addEntry: async (userId, data) => {
        const userRef = db.collection('users').doc(userId);
        const newEntry = {
            amount: data.amount,
            category: data.category,
            description: data.description?.trim() || null,
            mood: data.mood,
            timestamp: firestore.Timestamp.now(),
        };

        await userRef.collection('spendingEntries').add(newEntry);

        await updateAggregates(userId, newEntry);

        await get().refresh(userId);
    },


    refresh: async (userId: string) => {
        set({ refreshing: true });
        try {
            const entriesRef = db.collection('users').doc(userId).collection('spendingEntries');
            const snap = await entriesRef.orderBy('timestamp', 'desc').limit(20).get();

            const data: SpendingEntry[] = snap.docs.map((d) => ({
                id: d.id,
                ...(d.data() as FirebaseFirestoreTypes.DocumentData),
            })) as SpendingEntry[];

            set({ entries: data });
        } finally {
            set({ refreshing: false });
        }
    },

    clear: () => set({entries: []}),
}));

export const updateAggregates = async (
    userId: string,
    entry: { mood: number; category: string; amount: number; timestamp: FirebaseFirestoreTypes.Timestamp }
) => {
    const entryDate = entry.timestamp.toDate();

    // 🧩 Izračunaj sve periode u kojima unos treba da se pojavi
    const keys = [
        getWeeklyKey(entryDate),
        getMonthlyKey(entryDate),
        getQuarterlyKey(entryDate),
        getHalfYearKey(entryDate),
    ];

    // 🔄 Updajtuj sve agregate paralelno
    const updates = keys.map((key) => {
        const ref = db.collection('users').doc(userId).collection('spendingAggregates').doc(key);
        return ref.set(
            {
                updatedAt: firestore.FieldValue.serverTimestamp(),
                [`moodTotals.${entry.mood}`]: firestore.FieldValue.increment(entry.amount),
                [`categoryTotals.${entry.category}`]: firestore.FieldValue.increment(entry.amount),
            },
            { merge: true }
        );
    });

    await Promise.all(updates);
};
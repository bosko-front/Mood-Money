import { db } from "@/firebaseConfig";
import firestore from "@react-native-firebase/firestore";
import { updateAggregates } from "@/src/store/useEntriesStore";

const moods = [1, 2, 3, 4, 5, 6];
const categories = ["Food", "Shopping", "Transport", "Entertainment", "Health"];

export const generateTestEntries = async (userId: string, count = 50) => {
    const promises = [];

    for (let i = 0; i < count; i++) {
        const randomMood = moods[Math.floor(Math.random() * moods.length)];
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        const randomAmount = Math.floor(Math.random() * 100) + 1;

        // Random timestamp within last 180 days
        const daysAgo = Math.floor(Math.random() * 180);
        const timestamp = firestore.Timestamp.fromDate(new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000));

        const newEntry = {
            mood: randomMood,
            category: randomCategory,
            amount: randomAmount,
            timestamp,
        };

        // Add to Firestore (React Native Firebase)
        const addPromise = db
            .collection("users")
            .doc(userId)
            .collection("spendingEntries")
            .add({
                ...newEntry,
                description: `Test entry ${i + 1}`,
            });

        // Update aggregates
        const aggPromise = addPromise.then(() => updateAggregates(userId, newEntry));

        promises.push(aggPromise);
    }

    await Promise.all(promises);

    console.log(`${count} test entries added!`);
};

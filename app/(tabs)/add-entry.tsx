// /app/(tabs)/add-entry.tsx
import React, { useState } from 'react';
import {
    View, Text, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator
} from 'react-native';
import { Colors} from "@/src/constants";
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import {useAuthStore} from "@/src/store/useAuthStore";
import {LinearGradient} from "expo-linear-gradient";
import { useEntriesStore } from '@/src/store/useEntriesStore';
import {moodEmojis} from "@/src/constants/moods";
import {categories} from "@/src/constants/entries";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import LottieView from "lottie-react-native";


export default function AddEntryScreen() {
    const {user} = useAuthStore()
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState(categories[0]);
    const [description, setDescription] = useState('');
    const [mood, setMood] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const addEntry = useEntriesStore((s) => s.addEntry);
    const inset = useSafeAreaInsets();

    const handleSave = async () => {
        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            alert('Please enter a valid positive amount');
            return;
        }
        if (!mood) {
            alert('Please select a mood');
            return;
        }
        if (!user?.uid) {
            alert('You must be logged in.');
            return;
        }
        setLoading(true);
        try {
            await addEntry(user.uid, {
                amount: numericAmount,
                category,
                description,
                mood,
            });
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            setAmount('');
            setCategory(categories[0]);
            setDescription('');
            setMood(null);
            router.back();
        } catch (error) {
            console.error('Error saving entry:', error);
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            alert('Failed to save entry, please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: Colors.background }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            {/* Header */}
            <LinearGradient
                colors={[Colors.primary, Colors.secondary]}

                style={[styles.header, { paddingTop: inset.top + 20 }]}
            >
                <View>
                    <Text style={styles.headerTitle}>Add New Entry</Text>
                    <Text style={styles.headerSubtitle}>Track your mood & spending</Text>
                </View>
                {/*<LottieView*/}
                {/*    source={require("@/assets/gifs/ManageMoney.json")}*/}
                {/*    autoPlay*/}
                {/*    loop*/}
                {/*    style={{ width: 90, height: 90 }}*/}
                {/*/>*/}
            </LinearGradient>

            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.formContainer}>
                    <Text style={styles.label}>Amount ($)</Text>
                    <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        placeholder="0.00"
                        value={amount}
                        onChangeText={setAmount}
                    />

                    <Text style={styles.label}>Category</Text>
                    <View style={styles.dropdown}>
                        {categories.map((cat) => (
                            <TouchableOpacity
                                key={cat}
                                style={[
                                    styles.dropdownItem,
                                    category === cat && { backgroundColor: Colors.secondary + '20' },
                                ]}
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    setCategory(cat);
                                }}
                            >
                                <Text
                                    style={[
                                        styles.dropdownText,
                                        category === cat && { color: Colors.secondary, fontWeight: '600' },
                                    ]}
                                >
                                    {cat}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={styles.label}>Description (optional)</Text>
                    <TextInput
                        style={[styles.input, { height: 80 }]}
                        placeholder="Add a note..."
                        value={description}
                        onChangeText={setDescription}
                        multiline
                    />

                    <Text style={styles.label}>Mood</Text>
                    <View style={styles.moodContainer}>
                        {moodEmojis.map((emoji, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    setMood(index + 1);
                                }}
                                style={[
                                    styles.moodButton,
                                    mood === index + 1 && { backgroundColor: Colors.secondary + '40' },
                                ]}
                            >
                                <Text style={{ fontSize: 28 }}>{emoji}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
                        {loading ? (
                            <ActivityIndicator color={Colors.secondary} />
                        ) : (
                            <Text style={styles.saveButtonText}>Save</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    header: {
        height: 160,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingBottom: 24,
        marginBottom: 24,
        paddingHorizontal: 20,
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: '700',
        color: Colors.surface,
    },
    headerSubtitle: {
        fontSize: 15,
        color: Colors.surface,
        opacity: 0.9,
        marginTop: 4,
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
    },
    formContainer: {
        backgroundColor: Colors.surface,
        borderRadius: 16,
        padding: 20,
        shadowColor: Colors.black,
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        elevation: 2,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        color: Colors.textPrimary,
    },
    input: {
        backgroundColor: Colors.gray[50],
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        marginBottom: 16,
        color: Colors.textPrimary,
    },
    dropdown: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 16,
    },
    dropdownItem: {
        paddingVertical: 8,
        paddingHorizontal: 14,
        backgroundColor: Colors.gray[100],
        borderRadius: 12,
        marginRight: 8,
        marginBottom: 8,
    },
    dropdownText: {
        color: Colors.textPrimary,
    },
    moodContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    moodButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: Colors.gray[100],
        justifyContent: 'center',
        alignItems: 'center',
    },
    saveButton: {
        backgroundColor: Colors.surface,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.primary
    },
    saveButtonText: {
        color: Colors.primary,
        fontSize: 16,
        fontWeight: '600',
    },
});
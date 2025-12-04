import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/src/constants';

let LottieView: typeof import('lottie-react-native').default | null = null;
try {
    const mod = require('lottie-react-native');
    LottieView = mod?.default ?? mod;
} catch {}

let NoResultAnim: any = null;
try {
    NoResultAnim = require('@/assets/gifs/no-result-found.json');
} catch {}

export default function EmptyState() {
    return (
        <View style={styles.emptyContainer}>
            {LottieView && NoResultAnim ? (
                <LottieView
                    source={NoResultAnim}
                    autoPlay
                    loop
                    style={{ width: 220, height: 220 }}
                    resizeMode="contain"
                />
            ) : (
                <Ionicons name="wallet-outline" size={48} color={Colors.gray[400]} />
            )}
            <Text style={styles.emptyText}>No entries found</Text>
            <Text style={styles.emptySubText}>Try adjusting filters or add your first record 💸</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
    emptyText: { fontSize: 18, color: Colors.textPrimary, fontWeight: '600', marginTop: 8 },
    emptySubText: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
});

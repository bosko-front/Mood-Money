import React from 'react';
import {View, Text, StyleSheet, ActivityIndicator} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/src/constants';

let LottieView: typeof import('lottie-react-native').default | null = null;
try {
    const mod = require('lottie-react-native');
    LottieView = mod?.default ?? mod;
} catch {}

let NoResultAnim: any = null;
try {
    NoResultAnim = require('@/assets/gifs/loading-insights.json');
} catch {}

export default function LoadingInsights() {
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
                <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 16 }} />
            )}

        </View>
    );
}

const styles = StyleSheet.create({
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
    emptyText: { fontSize: 18, color: Colors.textPrimary, fontWeight: '600', marginTop: 8 },
    emptySubText: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
});

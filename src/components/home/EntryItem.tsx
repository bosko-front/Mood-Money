import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/src/constants';
import { formatDistanceToNow } from 'date-fns';
import { SpendingEntry } from '@/src/store/useEntriesStore';
import { categoryIcons } from '@/src/constants/entries';
import { moodEmojis } from '@/src/constants/moods';
import * as Haptics from 'expo-haptics';

type Props = { item: SpendingEntry };

export default function EntryItem({ item }: Props) {
    const [modalVisible, setModalVisible] = useState(false);

    const handleLongPress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setModalVisible(true);
    };


    return (
       <>
           <TouchableOpacity onLongPress={handleLongPress}>
                <View style={styles.card}>
                    <View style={styles.headerRow}>
                        <View style={styles.categoryRow}>
                            <Ionicons
                                name={categoryIcons[item.category] as any}
                                size={22}
                                color={Colors.primary}
                                style={{ marginRight: 8 }}
                            />
                            <Text style={styles.categoryText}>{item.category}</Text>
                        </View>
                        <Text style={styles.amountText}>${item.amount.toFixed(2)}</Text>
                    </View>

                    {item.description ? <Text style={styles.descriptionText}>{item.description}</Text> : null}

                    <View style={styles.footerRow}>
                        <Text style={styles.moodEmoji}>{moodEmojis[item.mood - 1]}</Text>
                        <Text style={styles.timestampText}>
                            {formatDistanceToNow(item.timestamp.toDate(), { addSuffix: true })}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>

            {/* Modal for description */}
            <Modal
                visible={modalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableOpacity
                    style={modalStyles.overlay}
                    activeOpacity={1}
                    onPressOut={() => setModalVisible(false)}
                >
                    <View style={modalStyles.modalContent}>
                        <Text style={modalStyles.modalTitle}>Description</Text>
                        <Text style={modalStyles.modalText}>{item.description || 'No description'}</Text>
                    </View>
                </TouchableOpacity>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.surface,
        marginHorizontal: 16,
        marginVertical: 8,
        padding: 16,
        borderRadius: 16,
        shadowColor: Colors.black,
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 8,
        elevation: 2,
    },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    categoryRow: { flexDirection: 'row', alignItems: 'center' },
    categoryText: { fontSize: 16, color: Colors.textPrimary, fontWeight: '500' },
    amountText: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
    descriptionText: { marginTop: 6, color: Colors.textSecondary },
    footerRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, alignItems: 'center' },
    moodEmoji: { fontSize: 20 },
    timestampText: { fontSize: 12, color: Colors.textSecondary },
});

const modalStyles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.35)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: Colors.surface,
        padding: 20,
        borderRadius: 16,
        width: '80%',
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 8,
    },
    modalText: {
        fontSize: 14,
        color: Colors.textPrimary,
    },
});

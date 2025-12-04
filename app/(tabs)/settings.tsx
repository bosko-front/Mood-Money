import React from "react";
import {View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Modal} from "react-native";
import {Colors} from "@/src/constants/colors";
import {useAuthStore} from "@/src/store/useAuthStore";
import {LinearGradient} from "expo-linear-gradient";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {router, useFocusEffect} from "expo-router";
import * as Haptics from 'expo-haptics';
import DeleteAccountModal from "@/src/components/ui/deleteAccountModal";
import { Ionicons } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import {useCustomerInfoStore} from "@/src/store/useCustomerInfoStore";

export default function SettingsScreen() {
    const {logout, deleteAccLoader, error, clearError, user, isPremium} = useAuthStore();
    const inset = useSafeAreaInsets();
    const [showModal, setShowModal] = React.useState(false);
    const { expirationDate, willRenew } = useCustomerInfoStore();

    const formattedDate = React.useMemo(() => {
        if (!expirationDate) return null;
        try {
            return new Date(expirationDate).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
            });
        } catch (e) {
            return null;
        }
    }, [expirationDate]);

    // Determine if subscription has already expired (past date)
    const hasExpired = React.useMemo(() => {
        if (!expirationDate) return false;
        const exp = new Date(expirationDate);
        return !isNaN(exp.getTime()) && exp.getTime() < Date.now();
    }, [expirationDate]);


    useFocusEffect(
        React.useCallback(() => {
            clearError();
        }, [])
    );

    const handleLogout = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        Alert.alert("Confirm", "Are you sure you want to log out?", [
            {text: "Cancel"},
            {text: "Logout", onPress: () => logout()},
        ]);
    };


    const goToSubscriptionPage = async () => {
        await Haptics.selectionAsync();
        router.push('/subscription')
    }

    const openDeleteModal = async () => {
        await Haptics.selectionAsync();
        setShowModal(true);
    }

    const getInitials = () => {
        const name = user?.displayName?.trim();
        if (name && name.length > 0) {
            const parts = name.split(" ").filter(Boolean);
            const first = parts[0]?.[0] || "";
            const last = parts[1]?.[0] || "";
            return (first + last).toUpperCase();
        }
        const email = user?.email || "";
        return email.slice(0, 2).toUpperCase();
    }

    const DeleteModal = () => {
        return (
            <Modal visible={showModal} animationType="fade" transparent>
                <View
                    style={{
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: "rgba(0,0,0,0.5)",
                        padding: 20,
                    }}
                >
                    <View
                        style={{
                            width: "100%",
                            maxWidth: 400,
                            backgroundColor: Colors.surface,
                            borderRadius: 16,
                            padding: 20,
                            shadowColor: "#000",
                            shadowOpacity: 0.2,
                            shadowRadius: 10,
                            elevation: 5,
                        }}
                    >
                        {/* Delete Account Modal Content */}
                        <DeleteAccountModal/>

                        {/* Cancel Button */}
                        <TouchableOpacity
                            onPress={() => setShowModal(false)}
                            style={{
                                marginTop: 20,
                                backgroundColor: Colors.gray[300],
                                paddingVertical: 12,
                                borderRadius: 12,
                                alignItems: "center",
                            }}
                        >
                            <Text style={{fontWeight: "600", color: Colors.textPrimary}}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        )
    }

    return (
        <View style={styles.container}>
            <LinearGradient colors={[Colors.primary, Colors.secondary]}

                            style={[styles.header, {paddingTop: inset.top + 20}]}>
                <View>
                    <Text style={styles.headerTitle}>Settings</Text>
                    {user?.displayName || user?.email ? (
                        <Text style={styles.headerSubtitle}>
                            {user?.displayName ? `Welcome, ${user.displayName}` : user?.email}
                        </Text>
                    ) : null}
                </View>
                <LottieView
                    source={require("@/assets/gifs/Gears.json")}
                    autoPlay
                    loop
                    style={{width: 90, height: 90}}
                />
            </LinearGradient>


            {/* Profile card */}
            <View style={styles.card}>
                <View style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{getInitials()}</Text>
                    </View>
                    <View style={{flex: 1}}>
                        <Text style={styles.nameText} numberOfLines={1}>
                            {user?.displayName || 'Anonymous'}
                        </Text>
                        {!!user?.email && (
                            <Text style={styles.emailText} numberOfLines={1}>{user.email}</Text>
                        )}
                    </View>
                    {isPremium ? (
                        <View style={styles.premiumBadge}>
                            <Ionicons name="star" size={12} color={Colors.white} />
                            <Text style={styles.premiumBadgeText}>Premium</Text>
                        </View>
                    ) : (
                        <View style={styles.freeBadge}>
                            <Ionicons name="star-outline" size={12} color={Colors.textPrimary} />
                            <Text style={styles.freeBadgeText}>Free</Text>
                        </View>
                    )}
                </View>
                {!!formattedDate && (
                    <View style={{marginTop: 10}}>
                        <Text style={styles.subText}>
                            {willRenew
                                ? `Next billing date: ${formattedDate}`
                                : hasExpired
                                    ? `Your subscription ended ${formattedDate}`
                                    : `Your subscription ends ${formattedDate}`}
                        </Text>
                    </View>
                )}
            </View>

            {/* Actions */}
            <View style={styles.list}>
                <TouchableOpacity style={styles.row} onPress={goToSubscriptionPage}>
                    <View style={styles.rowLeft}>
                        <View style={[styles.iconWrap, {backgroundColor: Colors.gray[100]}]}>
                            <Ionicons name="card-outline" size={18} color={Colors.textPrimary} />
                        </View>
                        <Text style={styles.rowText}>Manage Subscription</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={Colors.gray[400]} />
                </TouchableOpacity>

                <View style={styles.divider} />

                <TouchableOpacity style={styles.row} onPress={handleLogout}>
                    <View style={styles.rowLeft}>
                        <View style={[styles.iconWrap, {backgroundColor: '#FDECEC'}]}>
                            <Ionicons name="log-out-outline" size={18} color={Colors.error} />
                        </View>
                        <Text style={[styles.rowText, {color: Colors.error}]}>Logout</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={Colors.gray[400]} />
                </TouchableOpacity>
            </View>

            {/* Danger zone */}
            <View style={styles.list}>
                <TouchableOpacity style={styles.row} onPress={openDeleteModal}>
                    <View style={styles.rowLeft}>
                        <View style={[styles.iconWrap, {backgroundColor: '#FDECEC'}]}>
                            <Ionicons name="trash-outline" size={18} color={Colors.error} />
                        </View>
                        <Text style={[styles.rowText, {color: Colors.error}]}>Delete account</Text>
                    </View>
                    {deleteAccLoader ? (
                        <ActivityIndicator size="small" color={Colors.error} />
                    ) : (
                        <Ionicons name="chevron-forward" size={18} color={Colors.gray[400]} />
                    )}
                </TouchableOpacity>
            </View>
            {error &&
                <View>
                    <Text>{error}</Text>
                </View>
            }

            <DeleteModal/>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {flex: 1, backgroundColor: Colors.background},
    headerTitle: {color: Colors.surface, fontSize: 26, fontWeight: "700"},
    headerSubtitle: {color: Colors.surface, opacity: 0.9, fontSize: 15},
    header: {
        height: 160,
        alignItems: "center",
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingBottom: 24,
        marginBottom: 24,
        paddingHorizontal: 20,
    },

    title: {fontSize: 26, fontWeight: "700", marginBottom: 24, color: Colors.textPrimary},
    card: {
        backgroundColor: Colors.surface,
        borderRadius: 16,
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 16,
        shadowColor: Colors.black,
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 2,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: Colors.gray[100],
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {color: Colors.textPrimary, fontWeight: '800'},
    nameText: {color: Colors.textPrimary, fontSize: 16, fontWeight: '800'},
    emailText: {color: Colors.textSecondary, fontSize: 13, marginTop: 2},
    premiumBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: Colors.secondary,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
    },
    premiumBadgeText: {color: Colors.white, fontSize: 12, fontWeight: '800'},
    freeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: Colors.gray[100],
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    freeBadgeText: {color: Colors.textPrimary, fontSize: 12, fontWeight: '800'},

    list: {
        backgroundColor: Colors.surface,
        borderRadius: 16,
        marginHorizontal: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    row: {
        paddingHorizontal: 16,
        paddingVertical: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    rowLeft: {flexDirection: 'row', alignItems: 'center', gap: 12},
    iconWrap: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rowText: {color: Colors.textPrimary, fontSize: 15, fontWeight: '700'},
    divider: {height: 1, backgroundColor: Colors.border, marginLeft: 16},
    subText: {color: Colors.textSecondary, fontSize: 13},
});

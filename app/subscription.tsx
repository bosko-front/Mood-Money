import React, {useEffect} from "react";
import {View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Linking} from "react-native";
import {Colors} from "@/src/constants";
import {LinearGradient} from "expo-linear-gradient";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {Ionicons} from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import {router} from "expo-router";
import {syncPremiumStatus, useAuthStore} from "@/src/store/useAuthStore";
import Purchases, {CustomerInfo, PurchasesOfferings, PurchasesPackage} from "react-native-purchases";
import {useCustomerInfoStore} from "@/src/store/useCustomerInfoStore";
import {RC_ENTITLEMENT_STRING} from "@/src/helpers/entitlement";
import * as WebBrowser from 'expo-web-browser';

export default function Subscription() {
    const insets = useSafeAreaInsets();
    const {isPremium} = useAuthStore();
    const [yearly, setYearly] = React.useState(true);
    const [isPurchasing, setIsPurchasing] = React.useState(false);
    const [restorePurchaseLoading, setRestorePurchaseLoading] = React.useState(false);
    const [offerings, setOfferings] = React.useState<PurchasesOfferings | null>();
    const {
        isActive,
        billingIssueDetectedAt,
        willRenew,
        expirationDate,
        latestPurchaseDate,
        unsubscribeDetectedAt
    } = useCustomerInfoStore();
    const [loadingOfferings, setLoadingOfferings] = React.useState(true);
    const [offeringsError, setOfferingsError] = React.useState<string | null>(null);

// loadingOfferings and offeringsError are implemented and wired into UI/CTA states

    useEffect(() => {
        getOfferings();
    }, []);


    useEffect(() => {
        const listener = (customerInfo: CustomerInfo) => {
            // Handle the updated customer info here
            syncPremiumStatus(useAuthStore.getState().user?.uid || "");
            // Refresh your UI or grant/revoke access based on entitlements
        };

        // Add the listener
        Purchases.addCustomerInfoUpdateListener(listener);

        // Remove the listener when the component unmounts
        return () => {
            Purchases.removeCustomerInfoUpdateListener(listener);
        };
    }, []);


    async function getOfferings() {
        try {
            setLoadingOfferings(true);
            setOfferingsError(null);
            const fetched = await Purchases.getOfferings();
            if (fetched.current && fetched.current.availablePackages.length) {
                setOfferings(fetched);
            } else {
                setOfferings(null);
                setOfferingsError("No active plans are available right now.");
            }
        } catch (e: any) {
            setOfferingsError(e?.message || "Failed to load plans.");
        } finally {
            setLoadingOfferings(false);
        }
    }

    const onPrimaryCta = async () => {
        setIsPurchasing(true);
        try {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

            if (isPremium) {
                await Purchases.showManageSubscriptions();
                await syncPremiumStatus(useAuthStore.getState().user?.uid || "");
                return;
            }

            const pkg: PurchasesPackage | undefined = offerings?.current?.availablePackages.find(p => {
                if (yearly) {
                    return p.packageType === Purchases.PACKAGE_TYPE.ANNUAL || p.identifier.toLowerCase().includes("year");
                } else {
                    return p.packageType === Purchases.PACKAGE_TYPE.MONTHLY || p.identifier.toLowerCase().includes("month");
                }
            });


            if (!pkg) {
                Alert.alert("Purchase unavailable", "Please try again later.");
                return;
            }

            const {customerInfo} = await Purchases.purchasePackage(pkg);

            if (customerInfo.entitlements.active[RC_ENTITLEMENT_STRING]) {
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                await syncPremiumStatus(useAuthStore.getState().user?.uid || "");
                console.log('customerInfo:', customerInfo);
            } else {
                Alert.alert("Purchase failed", "Please try again later.");
            }

        } catch (e: any) {
            if (e?.code === Purchases.PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR || e?.userCancelled) {
                console.log("User canceled the purchase");
            } else {
                Alert.alert("Purchase error", e?.message || "Something went wrong.");
                console.error("Purchase error:", e);
            }
        } finally {
            setIsPurchasing(false);
        }
    };

    const openInApp = async (url: string) => {
        try {
            await WebBrowser.openBrowserAsync(url, {
                presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
                controlsColor: Colors.primary,
                dismissButtonStyle: 'done',
            });
        } catch (e) {
            // Fallback to system linking if in-app browser fails
            Linking.openURL(url);
        }
    };


    const onSecondaryCta = async () => {
        await Haptics.selectionAsync();
        try {
            setRestorePurchaseLoading(true);
            const customerInfo = await Purchases.restorePurchases();
            const isPro = customerInfo.entitlements.active[RC_ENTITLEMENT_STRING] != null;
            await syncPremiumStatus(useAuthStore.getState().user?.uid || "");
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert(isPro ? "Purchases Restored" : "No purchases found");
        } catch (e) {
            Alert.alert("Restore failed", "Please try again later.");
        } finally {
            setRestorePurchaseLoading(false);
        }
    };

    const benefits = [
        {icon: "sparkles", text: "AI-powered spending insights"},
        {icon: "stats-chart", text: "Advanced analytics & trends"},
        {icon: "lock-closed", text: "Privacy-first experience"},
        {icon: "checkmark-circle", text: "Priority support"},
    ];

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[Colors.primary, Colors.secondary]}
                style={[styles.header, {paddingTop: insets.top + 20}]}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
                        <Ionicons name="chevron-back" size={24} color={Colors.white}/>
                    </TouchableOpacity>
                    <View style={{flex: 1}}>
                        <Text style={styles.headerTitle}>{isPremium ? "Your Premium" : "Go Premium"}</Text>
                        <Text style={styles.headerSubtitle}>
                            {isPremium ? "Thanks for supporting MoodMoney" : "Unlock the full power of your finances"}
                        </Text>
                    </View>
                </View>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                {/* Billing issue banner */}
                {!!billingIssueDetectedAt && (
                    <TouchableOpacity
                        onPress={async () => {
                            try {
                                await Purchases.showManageSubscriptions();
                            } catch {
                                Alert.alert(
                                    "Manage Subscription",
                                    "Open your App Store / Play Store subscription settings to manage your plan."
                                );
                            }
                        }}
                        style={styles.billingBanner}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="warning" size={18} color={Colors.white}/>
                        <Text style={styles.billingBannerText}>
                            Payment issue detected. Please update your payment method.
                        </Text>
                        <View style={styles.managePill}>
                            <Text style={styles.managePillText}>Manage</Text>
                        </View>
                    </TouchableOpacity>
                )}
                {/* Plan toggle */}
                {!isPremium && (
                    <View style={styles.toggleWrap}>
                        <View style={styles.toggle}>
                            <TouchableOpacity
                                onPress={() => setYearly(false)}
                                style={[styles.toggleBtn, !yearly && styles.toggleBtnActive]}
                                disabled={loadingOfferings}
                            >
                                <Text
                                    style={[styles.toggleText, !yearly && styles.toggleTextActive, loadingOfferings && {opacity: 0.6}]}>Monthly</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setYearly(true)}
                                style={[styles.toggleBtn, yearly && styles.toggleBtnActive]}
                                disabled={loadingOfferings}
                            >
                                <Text
                                    style={[styles.toggleText, yearly && styles.toggleTextActive, loadingOfferings && {opacity: 0.6}]}>Yearly
                                    <Text style={styles.savePill}> Save 25%</Text>
                                </Text>
                            </TouchableOpacity>
                        </View>
                        {loadingOfferings && (
                            <Text style={styles.loadingText}>Loading plans…</Text>
                        )}
                        {!!offeringsError && !loadingOfferings && (
                            <View style={styles.errorWrap}>
                                <Text style={styles.errorText}>{offeringsError}</Text>
                                <TouchableOpacity onPress={getOfferings} style={styles.retryBtn}>
                                    <Text style={styles.retryText}>Try again</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                )}

                {/* Plan card */}
                <View style={styles.card}>
                    <View style={styles.priceRow}>
                        <View style={{flexDirection: "row", alignItems: "flex-end"}}>
                            <Text style={styles.priceMain}>
                                {isPremium
                                    ? "Active"
                                    : (() => {
                                        const pkg = yearly
                                            ? offerings?.current?.availablePackages[0]
                                            : offerings?.current?.availablePackages[1];
                                        const product = pkg?.product;
                                        if (!product) return "";
                                        return `${product.priceString}`;
                                    })()
                                }
                            </Text>
                            {!isPremium && (
                                <Text style={styles.priceSub}>{yearly ? "/year" : "/month"}</Text>
                            )}
                        </View>
                        {!isPremium && yearly && (
                            <View style={styles.badge}>
                                <Ionicons name="star" size={14} color={Colors.white}/>
                                <Text style={styles.badgeText}>Best value</Text>
                            </View>
                        )}
                    </View>
                    <Text style={styles.cardSubtitle}>
                        {isPremium ? "You currently have access to all premium features." :
                            "One simple plan for everything you need."}
                    </Text>

                    <View style={styles.divider}/>

                    {/* Benefits */}
                    <View style={{gap: 12}}>
                        {benefits.map((b, idx) => (
                            <View key={idx} style={styles.benefitRow}>
                                <View style={styles.checkIcon}>
                                    <Ionicons name={b.icon as any} size={16} color={Colors.white}/>
                                </View>
                                <Text style={styles.benefitText}>{b.text}</Text>
                            </View>
                        ))}
                    </View>

                    {/* CTA */}
                    <TouchableOpacity
                        style={[styles.primaryCta, (isPurchasing || loadingOfferings || !!offeringsError || !offerings) && {opacity: 0.7}]}
                        onPress={onPrimaryCta}
                        disabled={isPurchasing || loadingOfferings || !!offeringsError || !offerings}
                    >
                        <Text style={styles.primaryCtaText}>
                            {(() => {
                                if (isPremium) return "Manage Subscription";
                                if (loadingOfferings || !!offeringsError || !offerings) return "Continue";
                                // Show Renew only if there was a previous sub and it won't auto-renew
                                const hadSubBefore = Boolean(latestPurchaseDate || expirationDate || unsubscribeDetectedAt);
                                const shouldRenew = hadSubBefore && !willRenew;
                                if (shouldRenew) return "Renew Subscription";
                                return yearly ? "Start Yearly" : "Start Monthly";
                            })()}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.secondaryCta} onPress={onSecondaryCta}
                                      disabled={restorePurchaseLoading}>
                        <Text style={styles.secondaryCtaText}>
                            {restorePurchaseLoading ? "Restoring..." : "Restore Purchases"}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Footer notes */}
                <Text style={styles.legalText}>
                    Subscriptions renew automatically. You can cancel anytime in your device settings.
                </Text>

                <View style={styles.legalContainer}>
                    <View style={styles.legalLinksRow}>
                        <TouchableOpacity
                            onPress={() => openInApp('https://github.com/bosko-front/Mood-Money/blob/main/TERMS_OF_USE.md')}
                            accessibilityRole="link"
                        >
                            <Text style={styles.legalLinkText}>Terms of Use</Text>
                        </TouchableOpacity>
                        <Text style={styles.legalSeparator}>•</Text>
                        <TouchableOpacity
                            onPress={() => openInApp('https://github.com/bosko-front/Mood-Money/blob/main/PRIVACY_POLICY.md')}
                            accessibilityRole="link"
                        >
                            <Text style={styles.legalLinkText}>Privacy Policy</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>



            {isPurchasing && (
                <View style={styles.loadingOverlay} pointerEvents="auto">
                    <ActivityIndicator size="large" color={Colors.white}/>
                    <Text style={styles.loadingOverlayText}>
                        {isPremium ? "Opening subscription manager…" : "Processing purchase…"}
                    </Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {flex: 1, backgroundColor: Colors.background},
    header: {
        paddingHorizontal: 16,
        paddingBottom: 20,
        justifyContent: "flex-end",
    },
    headerContent: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    headerTitle: {color: Colors.white, fontSize: 26, fontWeight: "800"},
    headerSubtitle: {color: Colors.white, opacity: 0.9, marginTop: 4},

    scroll: {padding: 16, paddingBottom: 40},

    loadingOverlay: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        backgroundColor: 'rgba(0,0,0,0.45)',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
        zIndex: 100,
    },
    loadingOverlayText: {
        color: Colors.white,
        marginTop: 12,
        fontSize: 16,
        textAlign: 'center',
    },

    toggleWrap: {alignItems: "center", marginBottom: 12},
    toggle: {
        backgroundColor: Colors.surface,
        borderRadius: 12,
        padding: 4,
        flexDirection: "row",
        borderWidth: 1,
        borderColor: Colors.border,
    },
    toggleBtn: {
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 8,
    },
    toggleBtnActive: {
        backgroundColor: Colors.gray[100],
    },
    toggleText: {color: Colors.textPrimary, fontWeight: "700"},
    toggleTextActive: {color: Colors.textPrimary},
    savePill: {color: Colors.secondary, fontSize: 12, fontWeight: "800"},

    card: {
        backgroundColor: Colors.surface,
        borderRadius: 16,
        padding: 16,
        shadowColor: Colors.black,
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 2,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    priceRow: {flexDirection: "row", alignItems: "center", justifyContent: "space-between"},
    priceMain: {fontSize: 32, fontWeight: "800", color: Colors.textPrimary},
    priceSub: {fontSize: 14, color: Colors.textSecondary, marginLeft: 6, marginBottom: 4},
    badge: {
        backgroundColor: Colors.accent,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    badgeText: {color: Colors.white, fontSize: 12, fontWeight: "800"},
    cardSubtitle: {color: Colors.textSecondary, marginTop: 8},
    divider: {height: 1, backgroundColor: Colors.border, marginVertical: 16},

    benefitRow: {flexDirection: "row", alignItems: "center", gap: 12},
    checkIcon: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: Colors.secondary,
        alignItems: "center",
        justifyContent: "center",
    },
    benefitText: {color: Colors.textPrimary, fontSize: 15, flex: 1},

    primaryCta: {
        marginTop: 20,
        backgroundColor: Colors.primary,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
    },
    primaryCtaText: {color: Colors.white, fontWeight: "800", fontSize: 16},
    secondaryCta: {marginTop: 12, alignItems: "center", paddingVertical: 10},
    secondaryCtaText: {color: Colors.textSecondary, fontWeight: "700"},

    legalText: {textAlign: "center", color: Colors.textSecondary, fontSize: 12, marginTop: 16},

    // Legal links styling
    legalContainer: {
        marginTop: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    legalLinksRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: 8,
    },
    legalLinkText: {
        color: Colors.primary,
        fontSize: 12,
        fontWeight: '700',
    },
    legalSeparator: {
        color: Colors.textSecondary,
        fontSize: 12,
        opacity: 0.8,
    },

    // New styles for loading/error and billing banner
    loadingText: {marginTop: 8, color: Colors.textSecondary},
    errorWrap: {marginTop: 8, alignItems: "center", gap: 8},
    errorText: {color: Colors.error, textAlign: "center"},
    retryBtn: {
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    retryText: {color: Colors.primary, fontWeight: "800"},

    billingBanner: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        backgroundColor: Colors.error,
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
    },
    billingBannerText: {color: Colors.white, flex: 1, fontWeight: "600"},
    managePill: {
        backgroundColor: "rgba(255,255,255,0.2)",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
    },
    managePillText: {color: Colors.white, fontWeight: "800"},
});

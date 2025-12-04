import React from "react";
import {View, StyleSheet, ScrollView, Image, Text, KeyboardAvoidingView, Platform} from "react-native";
import {LinearGradient} from "expo-linear-gradient";
import {Colors, Radius, Spacing, Typography} from "@/src/constants"


export default function AuthLayout({children}: { children: React.ReactNode }) {
    return (
        <LinearGradient colors={[Colors.primary, Colors.secondary]} style={styles.gradient}>
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.logoContainer}>
                    <Image
                        source={require("../../../assets/images/my.png")}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <Text style={styles.logoText}>Mood Money</Text>
                </View>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                    <View style={styles.card}>{children}</View>
                </KeyboardAvoidingView>
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
        padding: Spacing.xl,
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: "center",
    },
    logoContainer: {
        alignItems: "center",
        marginBottom: Spacing.xl,
    },
    logo: {
        width: 80,
        height: 80,
        borderRadius: Radius.lg20,
    },
    logoText: {
        ...Typography.headingMd,
        color: Colors.white,
        marginTop: Spacing.sm,
        fontWeight: "700",
    },
    card: {
        backgroundColor: Colors.white,
        borderRadius: Radius.lg20,
        padding: Spacing.xxl,
        shadowColor: Colors.black,
        shadowOpacity: 0.15,
        shadowOffset: {width: 0, height: 5},
        shadowRadius: 10,
        elevation: 6,
    },
});

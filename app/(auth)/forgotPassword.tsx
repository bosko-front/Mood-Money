import React, {useState} from "react";
import {Text, TextInput, TouchableOpacity, StyleSheet, Alert} from "react-native";
import {Colors as COLORS, Spacing, Typography} from "@/src/constants"
import AuthLayout from "@/src/components/ui/AuthLayout";
import {router, useFocusEffect, useRouter} from "expo-router";
import {useAuthStore} from "@/src/store/useAuthStore";
import * as Haptics from 'expo-haptics';

export default function ForgotPasswordScreen() {
    const [email, setEmail] = useState("");
    const router = useRouter();
    const {resetPassword, loginLoading, error, clearError} = useAuthStore();

    useFocusEffect(
        React.useCallback(() => {
            clearError();
        }, [])
    );


    const handleReset = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        if (!email) {
            Alert.alert("Error", "Please enter your email address");
            return;
        }

        await resetPassword(email.trim());

    };

    const goBack = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.back()

    };

    return (
        <AuthLayout>
            <Text style={styles.title}>Forgot Password 🔑</Text>
            <Text style={styles.subtitle}>
                Enter your email address and we’ll send you a link to reset your password.
            </Text>

            <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={COLORS.gray[400]}
                value={email}
                onChangeText={setEmail}
            />

            <TouchableOpacity style={styles.button}
                              onPress={handleReset}
                              disabled={loginLoading}>
                <Text style={styles.buttonText}>
                    {loginLoading ? "Sending..." : "Send Reset Link"}
                </Text>
            </TouchableOpacity>
            {error && <Text style={{color: "red", marginBottom: 10}}>{error}</Text>}

            <TouchableOpacity onPress={goBack} style={styles.backButton}>
                <Text style={styles.backText}>← Back to Sign In</Text>
            </TouchableOpacity>
        </AuthLayout>
    );
}

const styles = StyleSheet.create({
    title: {
        ...Typography.headingLg,
        color: COLORS.primary,
        marginBottom: Spacing.sm,
    },
    subtitle: {
        ...Typography.bodyMd,
        color: COLORS.gray[500],
        marginBottom: Spacing.xl,
    },
    input: {
        borderWidth: 1,
        borderColor: COLORS.gray[300],
        borderRadius: 10,
        padding: Spacing.md,
        fontSize: 16,
        color: COLORS.black,
        marginBottom: Spacing.lg,
    },
    button: {
        backgroundColor: COLORS.primary,
        paddingVertical: Spacing.md,
        borderRadius: 10,
        alignItems: "center",
        marginBottom: Spacing.xl,
    },
    buttonText: {
        color: COLORS.white,
        ...Typography.bodyMd,
        fontWeight: "600",
    },
    backButton: {
        alignItems: "center",
    },
    backText: {
        color: COLORS.primary,
        ...Typography.bodySm,
        fontWeight: "600",
    },
});

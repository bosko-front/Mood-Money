import React, { useMemo, useState } from "react";
import {
    View,
    Text,
    TextInput,
    Button,
    StyleSheet,
    ActivityIndicator,
    Alert,
    TouchableWithoutFeedback, Keyboard
} from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import {useAuthStore} from "@/src/store/useAuthStore";

export default function DeleteAccountModal() {
    const deleteAccount = useAuthStore((state) => state.deleteAccount);
    const deleteAccLoader = useAuthStore((state) => state.deleteAccLoader);
    const error = useAuthStore((state) => state.error);
    const getAuthProvider = useAuthStore((state) => state.getAuthProvider);

    const [password, setPassword] = useState("");
    const [confirmText, setConfirmText] = useState("");

    const provider = useMemo(() => getAuthProvider(), [getAuthProvider]);

    const handleDelete = async () => {
        if (!provider) {
            Alert.alert("Error", "User not logged in.");
            return;
        }

        try {
            if (provider === "password") {
                if (!password) {
                    Alert.alert("Password required", "Please enter your password to delete your account.");
                    return;
                }
                await deleteAccount({ password });
            } else if (provider === "apple") {
                const appleCredential = await AppleAuthentication.signInAsync({
                    requestedScopes: [
                        AppleAuthentication.AppleAuthenticationScope.EMAIL,
                        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    ],
                });

                if (!appleCredential.identityToken) {
                    Alert.alert("Error", "Apple login failed.");
                    return;
                }

                await deleteAccount({ appleIdentityToken: appleCredential.identityToken });
            }

        } catch (err: any) {
            console.log("Delete error", err);
            
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
            <Text style={styles.title}>Delete Account</Text>

            {/* Description */}
            <View style={styles.infoBox}>
                <Text style={styles.infoTitle}>This action is permanent</Text>
                <Text style={styles.infoText}>
                    Deleting your account will permanently remove your profile, saved data, and settings. This cannot be
                    undone. If you just want to take a break, consider signing out instead.
                </Text>
            </View>

            {provider === "password" && (
                <TextInput
                    placeholder="Enter your password"
                    secureTextEntry
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                />
            )}

            {provider === "password" && (
                <Text style={styles.helperText}>For security, please confirm your password.</Text>
            )}

            {provider === "apple" && (
                <Text style={styles.helperText}>
                    You will be asked to re-authenticate with Apple to confirm ownership before deletion.
                </Text>
            )}

            {/* Type-to-confirm */}
            <Text style={styles.confirmLabel}>Type DELETE to confirm</Text>
            <TextInput
                placeholder="DELETE"
                autoCapitalize="characters"
                value={confirmText}
                onChangeText={setConfirmText}
                style={styles.input}
            />
            {error && <Text style={styles.error}>{error}</Text>}
            <Button
                title={deleteAccLoader ? "Deleting..." : "Delete Account"}
                onPress={handleDelete}
                disabled={deleteAccLoader || !(confirmText.trim() === "DELETE" && (provider !== "password" || !!password))}
                color="#E53935"
            />

            {deleteAccLoader && <ActivityIndicator style={{ marginTop: 10 }} />}
        </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20 },
    title: { fontSize: 22, fontWeight: "700", marginBottom: 12 },
    input: { borderWidth: 1, borderColor: "#ccc", padding: 12, marginBottom: 10, borderRadius: 8 },
    error: { color: "#D32F2F", marginBottom: 10 },
    infoBox: {
        backgroundColor: "#FFF3F3",
        borderColor: "#F8D7DA",
        borderWidth: 1,
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
    },
    infoTitle: { fontWeight: "700", color: "#B71C1C", marginBottom: 6 },
    infoText: { color: "#5D4037" },
    helperText: { color: "#555", marginBottom: 10 },
    confirmLabel: { fontWeight: "600", marginBottom: 6 },
});

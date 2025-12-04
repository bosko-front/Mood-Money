import React, {useState} from "react";
import {View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator} from "react-native";
import {Eye, EyeOff} from "lucide-react-native";
import {Colors as COLORS, Spacing, Radius, Typography} from "@/src/constants"
import {router, useFocusEffect} from "expo-router";
import AuthLayout from "@/src/components/ui/AuthLayout";
import {scaleFont} from "@/src/utils/scaling";
import {useAuthStore} from "@/src/store/useAuthStore";
import * as Haptics from "expo-haptics";

export default function SignUpScreen() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const {register, error, loginLoading, clearError} = useAuthStore()


    useFocusEffect(
        React.useCallback(() => {
            clearError();
        }, [])
    );

    const handleSignUp = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        if (!name || !email || !password || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }
        try {
            await register(email.trim(), password, name);
            Alert.alert(
                'Account Created',
                'Account created successfully. Please verify your email before signing in.',
                [
                    { text: 'OK', onPress: () => router.replace('./signIn') }
                ]
            );
        } catch (err) {
            console.error(err);
        }

    };


    const goBack = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.back()

    };

    return (
        <AuthLayout>
            <Text style={styles.title}>Create Account ✨</Text>
            <Text style={styles.subtitle}>Join us and start spending smart</Text>

            <View style={styles.inputWrapper}>
                <TextInput
                    style={styles.input}
                    placeholder="Name"
                    placeholderTextColor={COLORS.gray[400]}
                    value={name}
                    onChangeText={setName}
                />
            </View>
            <View style={styles.inputWrapper}>
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor={COLORS.gray[400]}
                    value={email}
                    onChangeText={setEmail}
                />
            </View>
            <View style={styles.inputWrapper}>
                <TextInput
                    style={[styles.input, {paddingRight: 40}]}
                    placeholder="Password"
                    placeholderTextColor={COLORS.gray[400]}
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                />
                <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowPassword(!showPassword)}
                >
                    {showPassword ? (
                        <EyeOff size={20} color={COLORS.gray[500]}/>
                    ) : (
                        <Eye size={20} color={COLORS.gray[500]}/>
                    )}
                </TouchableOpacity>
            </View>

            <View style={styles.inputWrapper}>
                <TextInput
                    style={[styles.input, {paddingRight: 40}]}
                    placeholder="Confirm Password"
                    placeholderTextColor={COLORS.gray[400]}
                    secureTextEntry={!showConfirmPassword}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                />
                <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                    {showConfirmPassword ? (
                        <EyeOff size={20} color={COLORS.gray[500]}/>
                    ) : (
                        <Eye size={20} color={COLORS.gray[500]}/>
                    )}
                </TouchableOpacity>
            </View>
            {error && (
                <Text style={styles.errorText}>{error}</Text>
            )}

            <TouchableOpacity style={styles.button} onPress={handleSignUp} disabled={loginLoading}>
                <View style={{flexDirection:'row'}}>
                    {loginLoading &&
                        <ActivityIndicator size="small" color="white"  />
                    }
                    <Text style={styles.buttonText}> Sign Up</Text>

                </View>
            </TouchableOpacity>

            <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an account?</Text>
                <TouchableOpacity onPress={goBack}>
                    <Text style={styles.linkText}> Sign in</Text>
                </TouchableOpacity>
            </View>
        </AuthLayout>
    );
}

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
        justifyContent: "center",
        padding: Spacing.xl,
    },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: Radius.lg20,
        padding: Spacing.xxl,
        shadowColor: COLORS.black,
        shadowOpacity: 0.15,
        shadowOffset: {width: 0, height: 5},
        shadowRadius: 10,
        elevation: 6,
    },
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
    inputWrapper: {
        position: "relative",
        marginBottom: Spacing.md,
    },
    input: {
        borderWidth: 1,
        borderColor: COLORS.gray[300],
        borderRadius: 10,
        padding: Spacing.md,
        fontSize: scaleFont(16),
        color: COLORS.black,
    },
    eyeIcon: {
        position: "absolute",
        right: 12,
        top: 14,
    },
    button: {
        backgroundColor: COLORS.primary,
        paddingVertical: Spacing.md,
        borderRadius: Radius.md,
        alignItems: "center",
        marginTop: Spacing.xl,
        marginBottom: Spacing.xl,
    },
    buttonText: {
        color: COLORS.white,
        ...Typography.bodyMd,
        fontWeight: "600",
    },
    footer: {
        flexDirection: "row",
        justifyContent: "center",
    },
    footerText: {
        color: COLORS.gray[600],
        ...Typography.bodySm,
    },
    linkText: {
        color: COLORS.primary,
        ...Typography.bodySm,
    },
    errorText:{
        color:COLORS.error
    }
});

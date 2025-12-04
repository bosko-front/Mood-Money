import React, {useState} from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Image,
    Alert,
    ActivityIndicator,
} from "react-native";
import {Colors as COLORS, Spacing, Radius, Typography} from "@/src/constants"
import {router, useFocusEffect} from "expo-router";
import AuthLayout from "@/src/components/ui/AuthLayout";
import {scaleFont} from "@/src/utils/scaling";
import {useAuthStore} from "@/src/store/useAuthStore";
import AppleSignIn from "@/src/components/auth/apple-sign-in";
import * as Haptics from 'expo-haptics';


export default function SignInScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const {login, loginLoading, error, clearError} = useAuthStore()

    useFocusEffect(
        React.useCallback(() => {
            clearError();
        }, [])
    );


    const forgotPasswordPress = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.push("/forgotPassword");
    }

    const handleLogin = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        login(email.trim(), password);

    };

    const goToSignUp = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.push("/signUp");

    };


    return (
        <AuthLayout>
            <Text style={styles.title}>Welcome back 👋</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>

            <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={COLORS.gray[400]}
                value={email}
                onChangeText={setEmail}
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={COLORS.gray[400]}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />

            <TouchableOpacity onPress={forgotPasswordPress}>
                <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <View style={{flexDirection: 'row'}}>
                    {loginLoading &&
                        <ActivityIndicator size="small" color="white"/>
                    }
                    <Text style={styles.buttonText}> Sign In</Text>
                </View>
            </TouchableOpacity>
            <AppleSignIn/>
            {error && (
                <Text style={styles.errorText}>{error}</Text>
            )}


            <View style={styles.footer}>
                <Text style={styles.footerText}>Don’t have an account?</Text>
                <TouchableOpacity onPress={goToSignUp}>
                    <Text style={styles.linkText}> Create one</Text>
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
    input: {
        borderWidth: 1,
        borderColor: COLORS.gray[300],
        borderRadius: 10,
        padding: Spacing.md,
        fontSize: scaleFont(16),
        color: COLORS.black,
        marginBottom: Spacing.md,
    },
    forgotText: {
        alignSelf: "flex-end",
        color: COLORS.primary,
        ...Typography.bodySm,
        marginBottom: Spacing.lg,
    },
    button: {
        backgroundColor: COLORS.primary,
        paddingVertical: Spacing.md,
        borderRadius: Radius.md,
        alignItems: "center",
        marginBottom: Spacing.xl,
    },
    buttonText: {
        color: COLORS.white,
        ...Typography.bodyMd,
        fontWeight: "600",
    },
    socialRow: {
        flexDirection: "row",
        justifyContent: "center",
        gap: Spacing.lg,
        marginBottom: Spacing.xl,
    },
    socialButton: {
        borderWidth: 1,
        borderColor: COLORS.gray[300],
        borderRadius: Radius.xxl,
        padding: Spacing.md,
    },
    socialIcon: {
        width: 24,
        height: 24,
    },
    footer: {

        paddingTop:30,
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
    errorText: {
        color: COLORS.error
    }
});

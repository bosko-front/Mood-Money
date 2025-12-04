import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator,
} from "react-native";
import {LinearGradient} from "expo-linear-gradient";
import {Colors} from "@/src/constants";
import {useAuthStore} from "@/src/store/useAuthStore";
import {db} from "@/firebaseConfig";
import * as Haptics from "expo-haptics";
import {useRouter} from "expo-router";
import OnboardingAnimation from "@/src/components/onBoarding/onboarding-animation";

const {width} = Dimensions.get("window");

export default function OnBoardingScreen() {
    const {user, setUserOnboarded} = useAuthStore();
    const [loading, setLoading] = React.useState(false);
    const router = useRouter();

    const handleStart = async () => {
        if (!user) return;

        try {
            setLoading(true);
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            await db
                .collection('users')
                .doc(user.uid)
                .set({ isUserOnboarded: true }, { merge: true });
            setUserOnboarded(true);

            // small delay for UX
            setTimeout(() => {
                router.replace("/(tabs)");
            }, 400);
        } catch (err) {
            console.error("Failed to update onboarding flag:", err);
            alert("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <LinearGradient colors={[Colors.primary, Colors.secondary]} style={styles.container}>
            <View style={styles.content}>

                <View style={styles.imageContainer}>
                    <OnboardingAnimation/>
                </View>

                {/* Text section */}
                <View style={styles.textContainer}>
                    <Text style={styles.title}>Welcome to MoodMoney 💸</Text>
                    <Text style={styles.subtitle}>
                        Track your mood and spending habits easily. Gain insights that help you spend smarter
                        and feel better every day.
                    </Text>
                </View>

                {/* Button */}
                <TouchableOpacity style={styles.button} onPress={handleStart} disabled={loading}>
                    {loading ? (
                        <ActivityIndicator color={Colors.white}/>
                    ) : (
                        <Text style={styles.buttonText}>Start Tracking</Text>
                    )}
                </TouchableOpacity>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    content: {
        flex: 1,
        width: "100%",
        paddingHorizontal: 24,
        justifyContent: "space-between",
        alignItems: "center",
        paddingBottom: 60,
        paddingTop: 80,
    },
    imageContainer: {
        paddingTop:20,
        alignItems: "center",
        justifyContent: "center",

    },
    imagePlaceholder: {
        width: width * 0.8,
        height: width * 0.6,
        borderRadius: 16,
        backgroundColor: Colors.white + "20",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: Colors.white + "30",
    },
    gifText: {
        color: Colors.white,
        opacity: 0.8,
        fontSize: 16,
    },
    textContainer: {
        alignItems: "center",
        marginTop: 20,
        paddingHorizontal: 10,
    },
    title: {
        fontSize: 26,
        fontWeight: "700",
        color: Colors.white,
        textAlign: "center",
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        color: Colors.white,
        opacity: 0.9,
        textAlign: "center",
        lineHeight: 22,
    },
    button: {
        backgroundColor: Colors.accent,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
        width: "100%",
        shadowColor: Colors.black,
        shadowOpacity: 0.2,
        shadowOffset: {width: 0, height: 4},
        shadowRadius: 4,
        elevation: 4,
    },
    buttonText: {
        color: Colors.white,
        fontSize: 18,
        fontWeight: "600",
    },
});

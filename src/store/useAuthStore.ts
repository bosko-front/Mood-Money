// src/store/useAuthStore.ts
import {create} from "zustand";
import {auth, db} from "@/firebaseConfig";
import type {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {getFriendlyFirebaseError} from "@/src/helpers/errorHelper";
import {Alert} from "react-native";
import {router} from "expo-router";
import authModule from '@react-native-firebase/auth';
import * as Haptics from 'expo-haptics';
import * as AppleAuthentication from 'expo-apple-authentication';
import Purchases from "react-native-purchases";
import {updateCusInfoStore} from "@/src/helpers/updateCusInfoStore";
import {RC_ENTITLEMENT_STRING} from "@/src/helpers/entitlement";

type AuthState = {
    /** Currently authenticated Firebase user (or null if signed out) */
    user: FirebaseAuthTypes.User | null;
    isUserOnboarded: boolean;
    isPremium: boolean;
    loginLoading: boolean;
    appleLoginLoading: boolean;
    deleteAccLoader: boolean;
    error: string | null;
    /**
     * Start listening to auth state changes and hydrate the store (and premium state).
     */
    initAuth: () => void;
    /**
     * Create a new account with email/password and optional display name.
     * Returns the Firebase UserCredential.
     */
    register: (email: string, password: string, name?: string) => Promise<FirebaseAuthTypes.UserCredential>;
    /**
     * Sign in with email/password and load onboarding/premium flags.
     */
    login: (email: string, password: string) => Promise<void>;
    /**
     * Sign in with Apple (via Expo), creating a Firestore user document if first login.
     */
    appleLogin: () => Promise<void>;
    /**
     * Send a password reset email if the account exists.
     */
    resetPassword: (email: string) => Promise<void>;
    /**
     * Sign the current user out and disconnect purchases.
     */
    logout: () => Promise<void>;
    /**
     * Permanently delete the account and related Firestore data after re-auth.
     */
    deleteAccount: (options?: { password?: string, appleIdentityToken?: string }) => Promise<void>;
    /**
     * Returns the current auth provider id simplified to 'password' | 'apple' | null.
     */
    getAuthProvider: () => "password" | "apple" | null;
    /** Clear the last auth error from the store. */
    clearError: () => void;
    /** Manually set onboarding flag in the store. */
    setUserOnboarded: (value: boolean) => void;


};


export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    loginLoading: false,
    appleLoginLoading: false,
    deleteAccLoader: false,
    error: null,
    isUserOnboarded: false,
    isPremium: false,


    register: async (email, password, name) => {
        try {
            set({loginLoading: true, error: null});

            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            console.log("userCredential", userCredential);

            if (name) {
                await userCredential.user.updateProfile({ displayName: name });
            }
            await db.collection('users').doc(userCredential.user.uid).set({
                email,
                displayName: name || "",
                isUserOnboarded: false,
                createdAt: new Date().toISOString(),
            });

            // Note: RN Firebase supports optional ActionCodeSettings, but a simple call works for in-app auth flows
            await userCredential.user.sendEmailVerification();
            set({user: userCredential.user, isUserOnboarded: false});

            return userCredential;
        } catch (err: any) {
            const errorCode = err.code || "";
            const friendlyMessage = getFriendlyFirebaseError(errorCode);
            set({error: friendlyMessage, loginLoading: false});
            throw err;
        } finally {
            set({loginLoading: false});
        }
    },


    login: async (email, password) => {
        try {
            set({loginLoading: true, error: null});

            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;

            if (user && !user.emailVerified) {
                set({loginLoading: false,error: "Please verify your email"});
                return;
            }

            // ✅ Fetch onboarding flag from Firestore
            const userDocRef = db.collection('users').doc(user.uid);
            const userSnap = await userDocRef.get();
            const existsLogin = typeof (userSnap as any).exists === 'function' ? (userSnap as any).exists() : !!(userSnap as any).exists;

            if (existsLogin) {
                const data = userSnap.data() as any;
                set({user, isUserOnboarded: data.isUserOnboarded ?? false});
            } else {
                // fallback if document doesn't exist (rare)
                await userDocRef.set({isUserOnboarded: false});
                set({user, isUserOnboarded: false});
            }
            await Purchases.logIn(user.uid);
            await syncPremiumStatus(user.uid)
            set({loginLoading: false});
        } catch (err: any) {
            const errorCode = err.code || "";
            const friendlyMessage = getFriendlyFirebaseError(errorCode);
            set({error: friendlyMessage, loginLoading: false});

        }
    },


    appleLogin: async () => {
        try {
            set({appleLoginLoading: true, error: null});

            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

            const appleCredential = await AppleAuthentication.signInAsync({
                requestedScopes: [
                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    AppleAuthentication.AppleAuthenticationScope.EMAIL,
                ],
            });

            if (!appleCredential.identityToken) {
                throw new Error("Apple Sign-In failed: No identity token returned");
            }

            // Create Apple credential and sign in via RN Firebase
            const credential = authModule.AppleAuthProvider.credential(
                appleCredential.identityToken,
                undefined // rawNonce (optional here as we don't use one in this flow)
            );

            const userCredential = await auth.signInWithCredential(credential);
            const user = userCredential.user;

            // Check if Firestore user exists
            const userDocRef = db.collection('users').doc(user.uid);
            const userSnap = await userDocRef.get();
            const existsApple = typeof (userSnap as any).exists === 'function' ? (userSnap as any).exists() : !!(userSnap as any).exists;

            if (!existsApple) {
                // If first time, create user document
                const name = appleCredential.fullName
                    ? `${appleCredential.fullName.givenName ?? ""} ${appleCredential.fullName.familyName ?? ""}`.trim()
                    : "";

                await userDocRef.set({
                    email: user.email ?? "",
                    displayName: name,
                    isUserOnboarded: false,
                    createdAt: new Date().toISOString(),
                });
            }

            // Update store
            const userData = existsApple ? (userSnap.data() as any) : {isUserOnboarded: false};
            await Purchases.logIn(user.uid);
            await syncPremiumStatus(user.uid)
            set({user, isUserOnboarded: userData.isUserOnboarded ?? false,});

        } catch (err: any) {
            console.log("Apple login error", err);

            if (err.code === 'ERR_REQUEST_CANCELED') {
                set({appleLoginLoading: false});
            } else {
                // set({error: err.message || "Apple Sign-In failed", appleLoginLoading: false});
                const errorCode = err.code || "";
                const friendlyMessage = getFriendlyFirebaseError(errorCode);
                set({error: friendlyMessage, appleLoginLoading: false});
            }
        } finally {
            set({appleLoginLoading: false});
        }
    },


    resetPassword: async (email) => {
        try {
            set({loginLoading: true, error: null});

            const normalizedEmail = email.trim().toLowerCase();

            const userQuery = await auth.fetchSignInMethodsForEmail(normalizedEmail);

            if (userQuery.length === 0) {
                set({ error: "No account found with this email.", loginLoading: false });
                return;
            }
            await auth.sendPasswordResetEmail(email);
            Alert.alert(
                "Check your inbox",
                "We sent you a password reset email. Follow the instructions to reset your password.",
                [
                    {text: 'OK', onPress: () => router.replace('./signIn')}
                ]
            );
        } catch (err: any) {
            const errorCode = err.code || "";
            const friendlyMessage = getFriendlyFirebaseError(errorCode);
            set({error: friendlyMessage, loginLoading: false});
            throw err;
        } finally {
            set({loginLoading: false});
        }
    },

    getAuthProvider: () => {
        const user = auth.currentUser;
        if (!user) return null;

        const provider = user.providerData[0]?.providerId;
        if (provider === "password") return "password";
        if (provider === "apple.com") return "apple";
        return null;
    },

    initAuth: () => {
        auth.onAuthStateChanged(async (user) => {
            if (user) {
                const userDoc = await db.collection('users').doc(user.uid).get();
                const existsInit = typeof (userDoc as any).exists === 'function' ? (userDoc as any).exists() : !!(userDoc as any).exists;
                const data = existsInit ? (userDoc.data() as any) : {};
                await Purchases.logIn(user.uid);
                await syncPremiumStatus(user.uid);
                set({user, isUserOnboarded: data.isUserOnboarded ?? false, isPremium:data.isPremium, loginLoading: false});
            } else {
                set({user: null, isUserOnboarded: false, loginLoading: false});
            }
        });
    },

    setUserOnboarded: (value) => set({isUserOnboarded: value}),


    logout: async () => {
        await auth.signOut();
        await Purchases.logOut();
        set({user: null});
    },


    deleteAccount: async (options?: { password?: string; appleIdentityToken?: string }) => {
        try {
            set({deleteAccLoader: true, error: null});

            const user = auth.currentUser;
            if (!user) {
                set({error: "No user is currently logged in"});
                return;
            }

            const userId = user.uid;

            // Helper: detect login provider
            const provider = user.providerData[0]?.providerId;

            const reauth = async (password?: string, appleIdentityToken?: string) => {
                if (provider === "password") {
                    if (!password || !user.email) throw new Error("Password required for re-authentication.");
                    const credential = authModule.EmailAuthProvider.credential(user.email, password);
                    await user.reauthenticateWithCredential(credential);
                } else if (provider === "apple.com") {
                    if (!appleIdentityToken) throw new Error("Apple identity token required for re-authentication.");
                    const credential = authModule.AppleAuthProvider.credential(appleIdentityToken, undefined);
                    await user.reauthenticateWithCredential(credential);
                } else {
                    throw new Error("Unsupported login provider for re-authentication.");
                }
            };

            if (provider === "password") {
                await reauth(options?.password);
            } else if (provider === "apple.com") {
                await reauth(undefined, options?.appleIdentityToken);
            }

            // 1️⃣ Delete all subcollections
            const subcollections = ["spendingEntries", "spendingAggregates", "aiInsights"];
            for (const sub of subcollections) {
                const subColRef = db.collection(`users/${userId}/${sub}`);
                const subDocs = await subColRef.get();
                const batch = db.batch();

                subDocs.forEach((docSnap) => {
                    batch.delete(docSnap.ref);
                });

                await batch.commit();
            }

            // 2️⃣ Delete main user document
            await db.collection('users').doc(userId).delete();

            // 3️⃣ Delete Firebase Auth user
            try {
                await user.delete();
            } catch (err: any) {
                if (err.code === "auth/requires-recent-login") {
                    // Trigger modal/flow in UI to re-auth
                    throw new Error("Recent login required. Please re-authenticate.");
                } else {
                    throw err;
                }
            }

            // 4️⃣ Update store
            set({user: null, isUserOnboarded: false});

            // Notify user only after successful deletion
            Alert.alert("Account deleted", "Your account has been successfully deleted.");

        } catch (err: any) {
            console.log("Delete account error:", err);
            const errorCode = err.code || "";
            const friendlyMessage = getFriendlyFirebaseError(errorCode);
            set({error: friendlyMessage || err.message || "Failed to delete account"});

        } finally {
            set({deleteAccLoader: false});
        }
    },


    clearError: () => set({error: null}),

}));

export const syncPremiumStatus = async (userId: string) => {
    try {

        const customerInfo = await Purchases.getCustomerInfo();
        const isPro = customerInfo.entitlements.active[RC_ENTITLEMENT_STRING] != null;

        // Update store
        useAuthStore.setState({isPremium: isPro})

        await updateCusInfoStore(customerInfo);

        // Update Firestore
        await db.collection('users').doc(userId).set({ isPremium: isPro }, { merge: true });
        console.log('sync ended')
    } catch (err) {
        console.log("Failed to sync premium:", err);
    }
}
import {Stack} from "expo-router";
import {useEffect} from "react";
import {syncPremiumStatus, useAuthStore} from "@/src/store/useAuthStore";
import {GestureHandlerRootView} from "react-native-gesture-handler";
import {BottomSheetModalProvider} from "@gorhom/bottom-sheet";
import Purchases, {CustomerInfo, LOG_LEVEL} from 'react-native-purchases';
import {Platform} from "react-native";


export default function RootLayout() {
    const {user, initAuth, isUserOnboarded, isPremium} = useAuthStore();


    useEffect(() => {
        Purchases.setLogLevel(LOG_LEVEL.VERBOSE);

        const iosApiKey = __DEV__
            ? process.env.EXPO_PUBLIC_RC_TEST_KEY
            : process.env.EXPO_PUBLIC_RC_API_KEY;
        const androidApiKey = 'test_TJuOlPKootFKsuQZjZQszoSluBM';

        if (Platform.OS === 'ios') {
            Purchases.configure({ apiKey: iosApiKey });
        } else if (Platform.OS === 'android') {
            Purchases.configure({ apiKey: androidApiKey });
        }


        initAuth();
    }, []);



    useEffect(() => {
        const listener = (customerInfo: CustomerInfo) => {
            (async () => {
                try {
                    // Call the existing sync function
                    const userId = useAuthStore.getState().user?.uid;
                    if (userId) {
                        await syncPremiumStatus(userId);
                    }
                } catch (error) {
                    console.error("Error syncing premium status:", error);
                }
            })();
        };

        // Add listener
        Purchases.addCustomerInfoUpdateListener(listener);

        // Cleanup on unmount
        return () => {
            // RevenueCat currently only supports removing the listener by reference
            Purchases.removeCustomerInfoUpdateListener(listener);
        };
    }, []);




    return (
        <GestureHandlerRootView style={{flex: 1}}>
            <BottomSheetModalProvider>
                <Stack screenOptions={{headerShown: false}}>
                    <Stack.Protected guard={!user || !user.emailVerified}>
                        <Stack.Screen name="(auth)"/>
                    </Stack.Protected>

                    <Stack.Protected guard={!!user && user.emailVerified}>
                        <Stack.Protected guard={!isUserOnboarded}>
                            <Stack.Screen name="onBoarding"/>
                        </Stack.Protected>

                        <Stack.Screen name="(tabs)"/>
                        <Stack.Screen name="subscription"/>

                        <Stack.Protected guard={isPremium}>
                            <Stack.Screen name="insights-trending"/>
                        </Stack.Protected>

                    </Stack.Protected>
                </Stack>
            </BottomSheetModalProvider>
        </GestureHandlerRootView>
    );
}

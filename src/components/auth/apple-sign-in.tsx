import * as AppleAuthentication from 'expo-apple-authentication';
import {useAuthStore} from "@/src/store/useAuthStore";
import {Colors, Radius} from "@/src/constants";
import {StyleSheet, View, ActivityIndicator} from 'react-native';

export default function AppleSignIn() {

    const appleLogin = useAuthStore((state) => state.appleLogin);
    const appleLoginLoading = useAuthStore((state) => state.appleLoginLoading);

    return (
        <View style={styles.container}>
            {appleLoginLoading ? (
                <View style={[styles.button, styles.loader]}>
                    <ActivityIndicator color={Colors.primary}/>
                </View>
            ) : (
                <AppleAuthentication.AppleAuthenticationButton
                    buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                    buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE_OUTLINE}
                    cornerRadius={Radius.md}
                    style={styles.button}
                    onPress={appleLogin}
                />
            )}
        </View>
    )
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    button: {
        width: '100%',
        height: 44,
    },

    loader: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: Radius.md,
    },
});
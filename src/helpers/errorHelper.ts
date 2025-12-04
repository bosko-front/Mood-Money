export const getFriendlyFirebaseError = (errorCode: string): string => {
    const errorMap: Record<string, string> = {
        "auth/invalid-email": "The email address is not valid.",
        "auth/user-disabled": "This account has been disabled.",
        "auth/user-not-found": "No account found with this email.",
        "auth/wrong-password": "Incorrect password. Please try again.",
        "auth/weak-password": " Password should be at least 6 characters.",
        "auth/invalid-credential": "Invalid login credentials. Please check your email and password.",
        "auth/missing-password": "Please enter your password.",
        "auth/too-many-requests": "Too many failed attempts. Please try again later.",
        "auth/network-request-failed": "Network error. Please check your connection.",
        "auth/popup-closed-by-user": "Login popup was closed before completing sign in.",
    };

    return errorMap[errorCode] || "An unexpected error occurred. Please try again.";
};
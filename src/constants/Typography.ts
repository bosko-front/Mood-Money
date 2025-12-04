import {FONT} from "@/src/utils/fonts";
import {scaleFont} from "@/src/utils/scaling";

export const Typography = {

    // Headings
    headingXL: {
        fontSize: scaleFont(32),
        fontFamily: FONT.bold,
        fontWeight: "700" as const,
        lineHeight: 40,
        letterSpacing: 0.3,
    },
    headingLg: {
        fontSize: scaleFont(24),
        fontFamily: FONT.bold,
        fontWeight: "700" as const,
        lineHeight: 32,
        letterSpacing: 0.2,
    },
    headingMd: {
        fontSize: scaleFont(20),
        fontFamily: FONT.medium,
        fontWeight: "600" as const,
        lineHeight: 28,
    },

    // Body
    bodyLg: {
        fontSize: scaleFont(18),
        fontFamily: FONT.regular,
        fontWeight: "400" as const,
        lineHeight: 26,
    },
    bodyMd: {
        fontSize: scaleFont(16),
        fontFamily: FONT.regular,
        fontWeight: "400" as const,
        lineHeight: 24,
    },
    bodySm: {
        fontSize: scaleFont(14),
        fontFamily: FONT.regular,
        fontWeight: "400" as const,
        lineHeight: 20,
    },
    bodyXs: {
        fontSize: scaleFont(12),
        fontFamily: FONT.regular,
        fontWeight: "400" as const,
        lineHeight: 18,
    },

    // Labels
    labelBold: {
        fontSize: scaleFont(12),
        fontFamily: FONT.medium,
        fontWeight: "600" as const,
        textTransform: "uppercase",
    },
};
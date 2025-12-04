import {useCustomerInfoStore} from "@/src/store/useCustomerInfoStore";
import {RC_ENTITLEMENT_STRING} from "@/src/helpers/entitlement";




export const updateCusInfoStore = async (customerInfo: any) => {
    // Try to read from active entitlement first (when subscription is active)
    const active = customerInfo?.entitlements?.active?.[RC_ENTITLEMENT_STRING || ""] || null;

    // Fallback to the entitlement in the "all" map (useful when it becomes inactive)
    const all = customerInfo?.entitlements?.all?.[RC_ENTITLEMENT_STRING || ""] || null;

    // If we have either active or historical entitlement info, map as much as we can
    const src = active || all;

    if (src) {
        const info = {
            originalPurchaseDate: src.originalPurchaseDate ?? null,
            productIdentifier: src.productIdentifier ?? null,
            unsubscribeDetectedAt: src.unsubscribeDetectedAt ?? null,
            isActive: Boolean(active?.isActive ?? src.isActive ?? false),
            identifier: src.identifier ?? null,
            latestPurchaseDate: src.latestPurchaseDate ?? null,
            expirationDate: src.expirationDate ?? null,
            billingIssueDetectedAt: src.billingIssueDetectedAt ?? null,
            // If not active anymore, willRenew should be false
            willRenew: Boolean(active?.willRenew ?? (src.isActive ? src.willRenew : false) ?? false),
        };
        useCustomerInfoStore.getState().setCustomerInfo(info);
        return;
    }

    // If no entitlement data is available at all, reset the store
    useCustomerInfoStore.getState().resetCustomerInfo();
};
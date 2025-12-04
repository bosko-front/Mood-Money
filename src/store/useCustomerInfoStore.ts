import { create } from "zustand";

export type CustomerInfo = {
    originalPurchaseDate: string | null;
    productIdentifier: string | null;
    unsubscribeDetectedAt: string | null;
    isActive: boolean;
    identifier: string | null;
    latestPurchaseDate: string | null;
    expirationDate: string | null;
    billingIssueDetectedAt: string | null;
    willRenew: boolean;
};

type CustomerInfoState = CustomerInfo & {
    setCustomerInfo: (info: Partial<CustomerInfo>) => void;
    resetCustomerInfo: () => void;
};

export const useCustomerInfoStore = create<CustomerInfoState>((set) => ({
    originalPurchaseDate: null,
    productIdentifier: null,
    unsubscribeDetectedAt: null,
    isActive: false,
    identifier: null,
    latestPurchaseDate: null,
    expirationDate: null,
    billingIssueDetectedAt: null,
    willRenew: false,

    setCustomerInfo: (info) => set((state) => ({ ...state, ...info })),
    resetCustomerInfo: () =>
        set({
            originalPurchaseDate: null,
            productIdentifier: null,
            unsubscribeDetectedAt: null,
            isActive: false,
            identifier: null,
            latestPurchaseDate: null,
            expirationDate: null,
            billingIssueDetectedAt: null,
            willRenew: false,
        }),
}));

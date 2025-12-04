import React, { forwardRef, useCallback, useImperativeHandle, useMemo, useRef } from "react";
import { BottomSheetModal, BottomSheetView, BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import {Colors} from "@/src/constants";

export type SheetRef = {
    show: () => void;
    hide: () => void;
};

type SheetProps = {
    children: React.ReactNode;
    snapPoint: number; // Percentage of screen height
};

const Sheet = forwardRef<SheetRef, SheetProps>(({ children, snapPoint }, ref) => {
    const sheetRef = useRef<BottomSheetModal>(null);

    useImperativeHandle(ref, () => ({
        show: () => sheetRef.current?.present(),
        hide: () => sheetRef.current?.forceClose(),
    }));

    const snapPoints = useMemo(() => [`${snapPoint}%`], [snapPoint]);

    const renderBackdrop = useCallback(
        (props:any) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />,
        []
    );

    return (
        <BottomSheetModal
            ref={sheetRef}
            index={1}
            enablePanDownToClose={true}
            enableHandlePanningGesture
            snapPoints={snapPoints}
            backdropComponent={renderBackdrop}
            handleStyle={{ borderTopLeftRadius: 13, borderTopRightRadius: 13 }}
            handleIndicatorStyle={{ backgroundColor: Colors.primary }}
            style={{ backgroundColor: "#FFFFFF", borderRadius: 13 }}
        >
            <BottomSheetView style={{ flex: 1 }}>{children}</BottomSheetView>
        </BottomSheetModal>
    );
});
Sheet.displayName = "Sheet";

export default Sheet;
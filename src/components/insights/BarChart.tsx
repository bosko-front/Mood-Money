import * as React from "react";
import {Button, Text, ScrollView, StyleSheet, View} from "react-native";
import {BarGroup, CartesianChart, useChartPressState} from "victory-native";
import {Circle, LinearGradient, useFont, vec, Text as SkiaText,} from "@shopify/react-native-skia";
import {Colors} from "@/src/constants";
import {useDerivedValue} from "react-native-reanimated";
import {useMemo} from "react";

const inter = require("@/assets/fonts/Roboto-Regular.ttf");

type TrendingData = {
    category: string;
    currentWeek: number;
    previousWeek: number;
};

type Props = {
    data: TrendingData[];
    loading?: boolean;
};

export default function TrendingBarChart({ data, loading }: Props) {
    const font = useFont(inter, 12);
    const toolTipFont = useFont(inter, 24);

    const {state, isActive} = useChartPressState({
        x: "", // string because your x values are strings
        y: {
            currentWeek: 0,
            previousWeek: 0,
        },
    });

// Derived values for the pressed bar
    const valueY = useDerivedValue(() => "" + state.y.currentWeek.value.value, [state]);
    const valueZ = useDerivedValue(() => "" + state.y.previousWeek.value.value, [state]);

    const textYPositionY = useDerivedValue(() => state.y.currentWeek.position.value - 10, [state]);
    const textYPositionZ = useDerivedValue(() => state.y.previousWeek.position.value - 10, [state]);

    const textXPosition = useDerivedValue(() => {
        if (!toolTipFont) return 0;
        return state.x.position.value - toolTipFont.measureText(valueY.value).width;
    }, [valueY, toolTipFont]);


    const textXPositionZ = useDerivedValue(() => {
        if (!toolTipFont) return 0;
        return state.x.position.value - toolTipFont.measureText(valueZ.value).width / 2 + 20;
    }, [valueZ, toolTipFont]);

    const yMax = useMemo(() => {
        // Find the maximum across both series (y and z) in the insights dataset
        const allValues = data.flatMap((item) => [item.currentWeek, item.previousWeek]);
        const maxY = Math.max(...allValues, 0);
        return maxY === 0 ? 10 : Math.ceil(maxY * 1.2);
    }, [data]);

    if (!data?.length) {
        return (
            <View style={{ alignItems: "center", justifyContent: "center", flex: 1 }}>
                <Text style={{ color: "#888" }}>No data available</Text>
            </View>
        );
    }

    if (loading) {
        return (
            <View style={{ alignItems: "center", justifyContent: "center", flex: 1 }}>
                <Text style={{ color: "#888" }}>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={styles.safeView}>
            <View style={styles.chart}>
                <CartesianChart
                    data={data}
                    xKey="category"
                    yKeys={["currentWeek", "previousWeek"]}
                    domain={{y: [0, yMax]}}
                    chartPressState={state}
                    padding={{left: 10, right: 10, bottom: 5, top: 15}}
                    domainPadding={{left: 50, right: 50, top: 30}}
                    axisOptions={{
                        font,
                        tickCount: {y: 10, x: 5},
                        lineColor: "#d4d4d8",
                        labelColor: Colors.textPrimary
                    }}
                >
                    {({points, chartBounds}) => (
                        <>
                            <BarGroup
                                chartBounds={chartBounds}
                                betweenGroupPadding={0.4}
                                withinGroupPadding={0.1}
                                roundedCorners={{
                                    topLeft: 10,
                                    topRight: 10,
                                }}
                            >
                                <BarGroup.Bar points={points.currentWeek} animate={{type: "timing"}}>
                                    <LinearGradient
                                        start={vec(0, 0)}
                                        end={vec(0, 540)}
                                        colors={["#f472b6", "#be185d90"]}
                                    />
                                </BarGroup.Bar>
                                <BarGroup.Bar points={points.previousWeek} animate={{type: "timing"}}>
                                    <LinearGradient
                                        start={vec(0, 0)}
                                        end={vec(0, 500)}
                                        colors={["#c084fc", "#7c3aed90"]}
                                    />
                                </BarGroup.Bar>
                            </BarGroup>
                            {isActive && toolTipFont && (
                                <>
                                    <SkiaText
                                        font={toolTipFont}
                                        color="gray"
                                        x={textXPosition}
                                        y={textYPositionY}
                                        text={valueY}
                                    />
                                    <SkiaText
                                        font={toolTipFont}
                                        color="gray"
                                        x={textXPositionZ}
                                        y={textYPositionZ}
                                        text={valueZ}
                                    />

                                </>
                            )}
                        </>
                    )}
                </CartesianChart>
            </View>
            <View style={styles.legendContainer}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendColor, {backgroundColor: '#f472b6'}]}/>
                    <Text style={styles.legendLabel}>currentWeek</Text>
                </View>

                <View style={styles.legendItem}>
                    <View style={[styles.legendColor, {backgroundColor: '#c084fc'}]}/>
                    <Text style={styles.legendLabel}>previousWeek</Text>
                </View>

            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    safeView: {
        display: "flex",
        backgroundColor: Colors.background,


    },
    chart: {
        height: 350,
    },
    optionsScrollView: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    options: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        alignItems: "flex-start",
        justifyContent: "flex-start",
    },
    legendContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: 20,
        justifyContent: "center",
    },
    legendItem: {
        flexDirection: "row",
        alignItems: "center",
        marginHorizontal: 8,
        marginVertical: 4,
    },
    legendColor: {
        width: 16,
        height: 16,
        borderRadius: 8,
        marginRight: 6,
    },
    legendLabel: {
        fontSize: 14,
    },
});
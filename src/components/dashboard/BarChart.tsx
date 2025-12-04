import React, { memo, useMemo } from "react";
import {View, Platform, Text, StyleSheet} from "react-native";
import { CartesianChart, Bar, useChartPressState } from "victory-native";
import {
    Circle,
    vec,
    LinearGradient,
    Text as SkiaText,
    useFont,
    matchFont,
} from "@shopify/react-native-skia";
import { useDerivedValue } from "react-native-reanimated";
import { moods } from "@/src/constants/moods";
import { Colors } from "@/src/constants";

const inter = require("@/assets/fonts/Roboto-Regular.ttf");

type BarChartProps = {
    data: { mood: number; total: number }[];
};

const BarChartComponent = ({ data }: BarChartProps) => {
    const toolTipFont = useFont(inter, 24);
    const font = useFont(inter, 12);

    const moodMap = useMemo(
        () => Object.fromEntries(moods.map((m) => [m.value, m.moodEmoji])),
        []
    );

    const emojiFontFamily = Platform.select({
        ios: "Apple Color Emoji",
        android: "sans-serif",
        default: "serif",
    });

    const emojiFont = useMemo(
        () =>
            matchFont({
                fontFamily: emojiFontFamily,
                fontSize: 18,
                fontWeight: "normal",
            }),
        [emojiFontFamily]
    );

    const { state, isActive } = useChartPressState({
        x: 0,
        y: { total: 0 },
    });


    const value = useDerivedValue(() => "$" + state.y.total.value.value, [state]);

    const textYPosition = useDerivedValue(
        () => state.y.total.position.value - 15,
        [value]
    );

    const textXPosition = useDerivedValue(() => {
        if (!toolTipFont) return 0;
        return state.x.position.value - toolTipFont.measureText(value.value).width / 2;
    }, [value, toolTipFont]);

    const yMax = useMemo(() => {
        const maxY = Math.max(...data.map((item) => item.total), 0);
        return maxY === 0 ? 10 : Math.ceil(maxY * 1.2);
    }, [data]);

    if (!data.length) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No data available</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, paddingHorizontal: 10, paddingVertical: 20 }}>
            <CartesianChart
                xKey="mood"
                padding={5}
                yKeys={["total"]}
                domain={{ y: [0, yMax] }}
                domainPadding={{ left: 50, right: 50, top: 30 }}
                axisOptions={{
                    lineColor: "#d4d4d8",
                    labelColor: "black",
                }}
                xAxis={{
                    font: emojiFont,
                    lineColor: "#d4d4d8",
                    labelColor: "black",
                    tickCount: 6,
                    formatXLabel: (value) => moodMap[Number(value)] ?? "",
                }}
                yAxis={[
                    {
                        font: font,
                        labelColor: Colors.textSecondary,
                        lineColor: Colors.gray[300],
                        tickCount: 5,
                    },
                ]}
                chartPressState={state}
                data={data}
            >
                {({ points, chartBounds }) => (
                    <>
                        <Bar
                            points={points.total}
                            chartBounds={chartBounds}
                            barWidth={40}
                            animate={{
                                type: "timing",
                                duration: 1000,
                            }}
                            roundedCorners={{ topLeft: 10, topRight: 10 }}
                        >
                            <LinearGradient
                                colors={[Colors.secondary, Colors.primary]}
                                start={vec(0, 0)}
                                end={vec(0, 400)}
                            />
                        </Bar>

                        {isActive && toolTipFont && (
                            <>
                                <SkiaText
                                    font={toolTipFont}
                                    color="grey"
                                    x={textXPosition}
                                    y={textYPosition}
                                    text={value}
                                />
                                <Circle
                                    cx={state.x.position}
                                    cy={state.y.total.position}
                                    r={8}
                                    color="grey"
                                    opacity={0.8}
                                />
                            </>
                        )}
                    </>
                )}
            </CartesianChart>
        </View>
    );
};


const styles = StyleSheet.create({
    emptyContainer: {
        height: 300,
        justifyContent: "center",
        alignItems: "center",
    },
    emptyText: {
        fontSize: 16,
        color: "#888",
    },
})

// ✅ Correct way to memoize and export
const MemoizedBarChart = memo(
    BarChartComponent,
    (prevProps, nextProps) => {
        if (prevProps.data.length !== nextProps.data.length) return false;
        for (let i = 0; i < prevProps.data.length; i++) {
            if (
                prevProps.data[i].mood !== nextProps.data[i].mood ||
                prevProps.data[i].total !== nextProps.data[i].total
            ) {
                return false;
            }
        }
        return true;
    }
);

export { MemoizedBarChart as BarChart };

import React, {useEffect, useMemo} from "react";
import { Button, ScrollView, StyleSheet, View, Text } from "react-native";
import {LinearGradient, useFont, vec} from "@shopify/react-native-skia";
import { Pie, PolarChart } from "victory-native";
import { Colors } from "@/src/constants";
import { Text as SkiaText } from "@shopify/react-native-skia";

function calculateGradientPoints(
    radius: number,
    startAngle: number,
    endAngle: number,
    centerX: number,
    centerY: number
) {
    const midAngle = (startAngle + endAngle) / 2;
    const startRad = (Math.PI / 180) * startAngle;
    const midRad = (Math.PI / 180) * midAngle;

    const startX = centerX + radius * 0.5 * Math.cos(startRad);
    const startY = centerY + radius * 0.5 * Math.sin(startRad);
    const endX = centerX + radius * Math.cos(midRad);
    const endY = centerY + radius * Math.sin(midRad);

    return { startX, startY, endX, endY };
}

function generateRandomColor(): string {
    const randomColor = Math.floor(Math.random() * 0xffffff);
    return `#${randomColor.toString(16).padStart(6, "0")}`;
}

const inter = require("@/assets/fonts/Roboto-Regular.ttf");


export default function DonutChart({
                                       data = [],
                                   }: {
    data?: { category: string; total: number }[];
}) {

    const font = useFont(inter, 12);

    // Safely map data
    const chartData = useMemo(() => {
        if (!data || data.length === 0) return [];
        return data.map((item) => ({
            label: item.category,
            value: item.total,
            color: generateRandomColor(),
        }));

    }, [data]);

    useEffect(() => {
        console.log('data',data)
    }, [data]);

    if (!chartData.length) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No data available</Text>
            </View>
        );
    }

    return (
        <ScrollView>
            <View style={styles.chartContainer}>
                <PolarChart
                    data={chartData}
                    colorKey="color"
                    valueKey="value"
                    labelKey="label"
                >
                    <Pie.Chart innerRadius="50%">
                        {({ slice }) => {
                            const { startX, startY, endX, endY } = calculateGradientPoints(
                                slice.radius,
                                slice.startAngle,
                                slice.endAngle,
                                slice.center.x,
                                slice.center.y
                            );

                            return (
                                <>
                                    <Pie.Slice animate={{ type: "spring" }}>
                                        <LinearGradient
                                            start={vec(startX, startY)}
                                            end={vec(endX, endY)}
                                            colors={[slice.color, `${slice.color}50`]}
                                            positions={[0, 1]}
                                        />
                                    </Pie.Slice>

                                    <Pie.SliceAngularInset
                                        animate={{ type: "spring" }}
                                        angularInset={{
                                            angularStrokeWidth: 5,
                                            angularStrokeColor: "white",
                                        }}
                                    />

                                    {/* Label text */}
                                    <Pie.Label
                                        font={font}
                                        text={slice.value.toString()}
                                        color="black"
                                        radiusOffset={0.75}
                                    />
                                </>
                            );
                        }}
                    </Pie.Chart>
                </PolarChart>
            </View>

            <View style={styles.legendContainer}>
                {chartData.map((item) => (
                    <View key={item.label} style={styles.legendItem}>
                        <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                        <Text style={styles.legendLabel}>{item.label}</Text>
                    </View>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    chartContainer: {
        height: 400,
        padding: 25,
    },
    desc: {
        fontSize: 16,
        fontWeight: "600",
    },
    emptyContainer: {
        height: 300,
        justifyContent: "center",
        alignItems: "center",
    },
    emptyText: {
        fontSize: 16,
        color: "#888",
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

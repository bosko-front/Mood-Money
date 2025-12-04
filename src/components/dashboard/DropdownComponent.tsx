// src/components/DropdownComponent.tsx
import React from "react";
import * as DropdownMenu from "zeego/dropdown-menu";
import { Text } from "react-native";
import { Colors } from "@/src/constants/colors";

type DropdownOption = {
    label: string;
    value: number;
};

type DropdownValue = string | number | "all";


type DropdownComponentProps = {
    options: DropdownOption[];
    selectedValue?: DropdownValue;
    onSelect?: (value: DropdownValue) => void;
    placeholder?: string;
    label?: string;
};
export const DropdownComponent: React.FC<DropdownComponentProps> = ({
                                                                        options,
                                                                        selectedValue,
                                                                        onSelect,
                                                                        placeholder = "Select...",
                                                                    }) => {
    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger>
                <Text
                    style={{
                        backgroundColor: Colors.gray[100],
                        paddingVertical: 10,
                        paddingHorizontal: 16,
                        borderRadius: 8,
                        fontSize: 16,
                        color: Colors.textPrimary,
                    }}
                >
                    {options.find((o) => o.value === selectedValue)?.label ?? placeholder}
                </Text>
            </DropdownMenu.Trigger>

            <DropdownMenu.Content
                sideOffset={6}
                align="start"
                style={{
                    backgroundColor: Colors.surface,
                    borderRadius: 10,
                    shadowColor: Colors.black,
                    shadowOpacity: 0.08,
                    shadowRadius: 8,
                }}
            >
                {options.map((option) => (
                    <DropdownMenu.Item
                        key={option.value}
                        onSelect={() => onSelect ? onSelect(option.value) : null}
                        textValue={option.label}
                        style={{
                            paddingHorizontal: 16,
                        }}
                    >
                        <DropdownMenu.ItemTitle>
                            <Text
                                style={{
                                    fontSize: 16,
                                    color:
                                        option.value === selectedValue ? Colors.secondary : Colors.textPrimary,
                                    fontWeight: option.value === selectedValue ? "600" : "400",
                                }}
                            >
                                {option.label}
                            </Text>
                        </DropdownMenu.ItemTitle>
                    </DropdownMenu.Item>
                ))}
            </DropdownMenu.Content>
        </DropdownMenu.Root>
    );
};

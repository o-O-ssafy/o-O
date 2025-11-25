package com.ssafy.workspaceservice.enums;

import lombok.Getter;

import java.util.Random;

@Getter
public enum PointerColor {
    RED("#F24822"),
    GREEN("#57E257"),
    ORANGE("#FF824D"),
    BLUE("#29DFFF"),
    PINK("#FF50F0"),
    YELLOW("#FFC60B");

    private final String hex;

    PointerColor(String hex) {
        this.hex = hex;
    }

    public static PointerColor fromHex(String hex) {
        for (PointerColor color : values()) {
            if (color.hex.equalsIgnoreCase(hex)) {
                return color;
            }
        }
        throw new IllegalArgumentException("Unknown color hex: " + hex);
    }

    private static final PointerColor[] VALUES = values();
    private static final int SIZE = VALUES.length;
    private static final Random RANDOM = new Random();

    public static PointerColor randomColor() {
        return VALUES[RANDOM.nextInt(SIZE)];
    }
}
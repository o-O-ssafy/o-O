package com.ssafy.mindmapservice.domain;

import java.util.Random;

/**
 * 초기 마인드맵 노드 생성 시 사용하는 PASTEL 테마 색상
 */
public enum InitialColor {
    PASTEL_PINK("#FFD0EA"),
    PASTEL_YELLOW("#FFEEAC"),
    PASTEL_CYAN("#C2F0F9"),
    PASTEL_ORANGE("#EFB39B"),
    PASTEL_PURPLE("#B9BDFF"),
    PASTEL_BLUE("#C2DCF9"),
    PASTEL_GREEN("#C3F9C2");

    private final String hexCode;
    private static final Random RANDOM = new Random();

    InitialColor(String hexCode) {
        this.hexCode = hexCode;
    }

    public String getHexCode() {
        return hexCode;
    }

    /**
     * PASTEL 테마 색상 중 하나를 랜덤으로 반환합니다.
     *
     * @return 랜덤 HEX 색상 코드
     */
    public static String getRandomColor() {
        InitialColor[] colors = values();
        return colors[RANDOM.nextInt(colors.length)].getHexCode();
    }
}
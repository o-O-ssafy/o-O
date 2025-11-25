# ===== BUILD =====
FROM gradle:8.10.2-jdk21 AS build
WORKDIR /workspace

# wrapper/스크립트 먼저 복사 (캐시 최적화 & 권한 보정)
COPY gradlew ./
COPY gradle/wrapper/ ./gradle/wrapper/
COPY build.gradle settings.gradle ./
RUN chmod +x gradlew

# 소스 복사
COPY src ./src

# Gradle 캐시 사용 (gradle 이미지의 기본 홈을 따라감)
RUN --mount=type=cache,target=/home/gradle/.gradle \
    ./gradlew clean bootJar -x test --no-daemon

# 산출물 복사
RUN JAR_PATH=$(ls build/libs/*SNAPSHOT.jar 2>/dev/null || ls build/libs/*.jar | grep -v plain | head -n1) \
 && cp "$JAR_PATH" /app.jar

# ===== RUNTIME =====
FROM eclipse-temurin:21-jre-alpine
ENV TZ=Asia/Seoul \
    JAVA_OPTS="-XX:+UseG1GC -XX:MaxRAMPercentage=75.0 -XX:InitialRAMPercentage=50.0"
WORKDIR /app

# 헬스체크에 curl/wget 필요하면 하나 설치
RUN apk add --no-cache curl

COPY --from=build /app.jar /app/app.jar

# 앱 포트에 맞춰 통일 (8081을 쓸거면 아래 둘 다 8081로)
EXPOSE 8081
HEALTHCHECK --interval=15s --timeout=3s --retries=10 \
  CMD curl -fsS http://127.0.0.1:8081/actuator/health || exit 1

ENTRYPOINT ["sh","-c","java $JAVA_OPTS -jar /app/app.jar"]

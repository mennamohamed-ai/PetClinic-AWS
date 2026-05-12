FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml ./pom.xml
COPY eureka-server ./eureka-server
COPY api-gateway ./api-gateway
COPY Backend ./Backend
COPY main-service ./main-service
RUN mvn -pl eureka-server -am clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/eureka-server/target/*.jar app.jar
EXPOSE 8761
ENTRYPOINT ["java", "-jar", "app.jar"]

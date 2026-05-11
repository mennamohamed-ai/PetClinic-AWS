package com.clinic.backend.aspect;

import java.util.Arrays;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterThrowing;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class LoggingAspect {
    private static final Logger log = LoggerFactory.getLogger(LoggingAspect.class);

    @Before("execution(* com.clinic.backend.service..*(..))")
    public void logBefore(JoinPoint joinPoint) {
        log.info("Calling: {} with args: {}", joinPoint.getSignature().getName(), Arrays.toString(joinPoint.getArgs()));
    }

    @AfterThrowing(pointcut = "execution(* com.clinic.backend.service..*(..))", throwing = "ex")
    public void logError(JoinPoint joinPoint, Exception ex) {
        log.error("Error in {}: {}", joinPoint.getSignature().getName(), ex.getMessage());
    }
}

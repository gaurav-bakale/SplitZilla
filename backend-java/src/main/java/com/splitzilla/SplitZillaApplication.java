package com.splitzilla;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SplitZillaApplication {
    public static void main(String[] args) {
        SpringApplication.run(SplitZillaApplication.class, args);
    }
}

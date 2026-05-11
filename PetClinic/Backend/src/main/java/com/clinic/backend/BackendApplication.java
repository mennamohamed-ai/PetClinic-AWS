package com.clinic.backend;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import javax.sql.DataSource;

@SpringBootApplication
public class BackendApplication {

	public static void main(String[] args) {

		SpringApplication.run(BackendApplication.class, args);
	}

	@Bean
    CommandLineRunner runner(DataSource dataSource) {
		return args -> {
			System.out.println(
					dataSource.getConnection().getMetaData().getURL()
			);
		};
	}
}

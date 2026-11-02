
package com.cookwise.cookwise_backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    private final RestClient restClient;

    public GeminiService() {
        this.restClient = RestClient.builder()
                .baseUrl("https://generativelanguage.googleapis.com")
                .build();
    }

    public String generateRecipe(
            String ingredients,
            String cuisine,
            String cookingTime) {

        String prompt = """
                You are CookWise AI, a professional cooking assistant.

                Suggest 3 creative recipes using these available ingredients:
                %s

                Preferred cuisine: %s
                Available cooking time: %s

                For each recipe provide:
                1. Recipe name
                2. Short description
                3. Ingredients with quantities
                4. Preparation time
                5. Cooking time
                6. Step-by-step cooking instructions

                Prefer recipes that use the available ingredients.
                Clearly mention any additional ingredients required.
                Return the response in a clean, readable format.
                """.formatted(ingredients, cuisine, cookingTime);

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of(
                                "parts", List.of(
                                        Map.of("text", prompt)
                                )
                        )
                )
        );

        Map<?, ?> response = restClient.post()
                .uri("/v1beta/models/gemini-3.5-flash-lite:generateContent")
                .header("x-goog-api-key", apiKey)
                .header(
                        HttpHeaders.CONTENT_TYPE,
                        MediaType.APPLICATION_JSON_VALUE
                )
                .body(requestBody)
                .retrieve()
                .body(Map.class);

        if (response == null) {
            throw new IllegalStateException(
                    "Gemini returned an empty response."
            );
        }

        List<?> candidates = (List<?>) response.get("candidates");

        if (candidates == null || candidates.isEmpty()) {
            throw new IllegalStateException(
                    "Gemini did not return any recipes."
            );
        }

        Map<?, ?> candidate = (Map<?, ?>) candidates.get(0);
        Map<?, ?> content = (Map<?, ?>) candidate.get("content");
        List<?> parts = (List<?>) content.get("parts");

        if (parts == null || parts.isEmpty()) {
            throw new IllegalStateException(
                    "Gemini returned no recipe text."
            );
        }

        Map<?, ?> firstPart = (Map<?, ?>) parts.get(0);
        Object text = firstPart.get("text");

        if (!(text instanceof String) || ((String) text).isBlank()) {
            throw new IllegalStateException(
                    "Gemini returned an empty recipe."
            );
        }

        return (String) text;
    }
}


package com.cookwise.cookwise_backend.controller;

import com.cookwise.cookwise_backend.service.GeminiService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/recipes")
@CrossOrigin(origins = "*")
public class RecipeController {

    private final GeminiService geminiService;

    public RecipeController(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    @GetMapping("/test")
    public String testApi() {
        return "CookWise AI Backend is working!";
    }

    @PostMapping("/generate")
    public Map<String, String> generateRecipe(
            @RequestBody Map<String, String> request) {

        String ingredients = request.get("ingredients");
        String cuisine = request.getOrDefault("cuisine", "Any");
        String cookingTime = request.getOrDefault("cookingTime", "Any");

        if (ingredients == null || ingredients.isBlank()) {
            throw new IllegalArgumentException("Please provide ingredients.");
        }

        String result = geminiService.generateRecipe(
                ingredients, cuisine, cookingTime
        );

        return Map.of("recipe", result);
    }
}

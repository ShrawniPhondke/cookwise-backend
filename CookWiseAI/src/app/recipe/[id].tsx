
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';

const recipeData: Record<string, any> = {
    '1': {
        name: 'Paneer Butter Masala',
        cuisine: 'Indian',
        emoji: '🍛',
        color: '#FFE3C9',
        description: 'A rich, creamy and delicious North Indian curry made with soft paneer cubes in a buttery tomato gravy.',
        prep: '10 min',
        cook: '20 min',
        servings: 2,
        ingredients: [
            '200g paneer',
            '2 tomatoes',
            '1 onion',
            '2 tbsp butter',
            '2 tbsp fresh cream',
            '1 tsp ginger garlic paste',
            '1 tsp garam masala',
            'Salt to taste',
        ],
        steps: [
            'Cut paneer into medium-sized cubes.',
            'Heat butter in a pan and sauté chopped onions.',
            'Add tomatoes and ginger garlic paste. Cook until soft.',
            'Blend the mixture into a smooth gravy.',
            'Add the gravy back to the pan with spices and cream.',
            'Add paneer cubes and simmer for 5 minutes.',
            'Garnish with fresh cream and serve hot!',
        ],
    },
    '2': {
        name: 'Creamy Pasta',
        cuisine: 'Italian',
        emoji: '🍝',
        color: '#FBE6B9',
        description: 'A comforting pasta dish tossed in a rich and creamy sauce.',
        prep: '5 min',
        cook: '15 min',
        servings: 2,
        ingredients: [
            '200g pasta',
            '1 cup milk',
            '2 tbsp butter',
            '2 tbsp cheese',
            '2 garlic cloves',
            '1 tsp black pepper',
            'Salt to taste',
        ],
        steps: [
            'Boil pasta in salted water until cooked.',
            'Melt butter in a pan and sauté garlic.',
            'Add milk and cheese.',
            'Stir until the sauce becomes creamy.',
            'Add cooked pasta and mix well.',
            'Season with pepper and serve hot!',
        ],
    },
    '3': {
        name: 'Fresh Veggie Salad',
        cuisine: 'Healthy',
        emoji: '🥗',
        color: '#DDF1D5',
        description: 'A refreshing and crunchy salad packed with fresh vegetables.',
        prep: '10 min',
        cook: '0 min',
        servings: 2,
        ingredients: [
            '1 cucumber',
            '2 tomatoes',
            '1 carrot',
            '1 onion',
            '1 tbsp lemon juice',
            'Salt and pepper',
        ],
        steps: [
            'Wash all vegetables thoroughly.',
            'Chop cucumber, tomatoes, carrot and onion.',
            'Add everything to a large bowl.',
            'Add lemon juice, salt and pepper.',
            'Mix well and serve fresh!',
        ],
    },
    '4': {
        name: 'Chocolate Pancakes',
        cuisine: 'Dessert',
        emoji: '🥞',
        color: '#F4D8D0',
        description: 'Soft and fluffy chocolate pancakes for a sweet breakfast treat.',
        prep: '5 min',
        cook: '10 min',
        servings: 2,
        ingredients: [
            '1 cup flour',
            '2 tbsp cocoa powder',
            '1 cup milk',
            '2 tbsp sugar',
            '1 tsp baking powder',
            '1 tbsp butter',
        ],
        steps: [
            'Mix flour, cocoa powder, sugar and baking powder.',
            'Add milk and mix into a smooth batter.',
            'Heat a lightly buttered pan.',
            'Pour a small amount of batter into the pan.',
            'Cook until bubbles appear, then flip.',
            'Serve with chocolate sauce!',
        ],
    },
};

export default function RecipeDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const recipe = recipeData[id ?? ''];

    const [favorite, setFavorite] = useState(false);
    const [checkedIngredients, setCheckedIngredients] = useState<string[]>([]);

    if (!recipe) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Recipe not found</Text>
                <Pressable onPress={() => router.back()}>
                    <Text style={styles.backText}>← Go Back</Text>
                </Pressable>
            </View>
        );
    }

    const toggleIngredient = (ingredient: string) => {
        setCheckedIngredients((previous) =>
            previous.includes(ingredient)
                ? previous.filter((item) => item !== ingredient)
                : [...previous, ingredient]
        );
    };

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>

                {/* Recipe Image Area */}
                <View style={[styles.hero, { backgroundColor: recipe.color }]}>
                    <Pressable style={styles.backButton} onPress={() => router.back()}>
                        <Text style={styles.backButtonText}>←</Text>
                    </Pressable>

                    <Text style={styles.heroEmoji}>{recipe.emoji}</Text>

                    <Pressable
                        style={styles.favoriteButton}
                        onPress={() => setFavorite(!favorite)}
                    >
                        <Text style={styles.favoriteText}>
                            {favorite ? '❤️' : '🤍'}
                        </Text>
                    </Pressable>
                </View>

                {/* Recipe Information */}
                <View style={styles.content}>
                    <Text style={styles.cuisine}>{recipe.cuisine.toUpperCase()}</Text>

                    <Text style={styles.title}>{recipe.name}</Text>

                    <Text style={styles.description}>
                        {recipe.description}
                    </Text>

                    {/* Cooking Information */}
                    <View style={styles.infoContainer}>
                        <View style={styles.infoBox}>
                            <Text style={styles.infoEmoji}>⏱️</Text>
                            <Text style={styles.infoLabel}>Prep time</Text>
                            <Text style={styles.infoValue}>{recipe.prep}</Text>
                        </View>

                        <View style={styles.infoBox}>
                            <Text style={styles.infoEmoji}>🔥</Text>
                            <Text style={styles.infoLabel}>Cook time</Text>
                            <Text style={styles.infoValue}>{recipe.cook}</Text>
                        </View>

                        <View style={styles.infoBox}>
                            <Text style={styles.infoEmoji}>🍽️</Text>
                            <Text style={styles.infoLabel}>Servings</Text>
                            <Text style={styles.infoValue}>{recipe.servings}</Text>
                        </View>
                    </View>

                    {/* Ingredients */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Ingredients 🥕</Text>
                        <Text style={styles.sectionSubtitle}>
                            Tap an ingredient when you have it.
                        </Text>

                        {recipe.ingredients.map((item: string) => (
                            <Pressable
                                key={item}
                                style={styles.ingredientRow}
                                onPress={() => toggleIngredient(item)}
                            >
                                <Text style={styles.checkbox}>
                                    {checkedIngredients.includes(item) ? '☑️' : '⬜'}
                                </Text>
                                <Text
                                    style={[
                                        styles.ingredientText,
                                        checkedIngredients.includes(item) &&
                                        styles.checkedText,
                                    ]}
                                >
                                    {item}
                                </Text>
                            </Pressable>
                        ))}
                    </View>

                    {/* Cooking Instructions */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Cooking Instructions 👩‍🍳</Text>

                        {recipe.steps.map((step: string, index: number) => (
                            <View key={index} style={styles.stepRow}>
                                <View style={styles.stepNumber}>
                                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                                </View>

                                <Text style={styles.stepText}>{step}</Text>
                            </View>
                        ))}
                    </View>

                    <View style={styles.bottomMessage}>
                        <Text style={styles.bottomEmoji}>❤️ 🍳 🥗</Text>
                        <Text style={styles.bottomText}>
                            Happy cooking with CookWise AI!
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF9F2',
    },
    hero: {
        height: 260,
        justifyContent: 'center',
        alignItems: 'center',
    },
    heroEmoji: {
        fontSize: 115,
    },
    backButton: {
        position: 'absolute',
        top: 20,
        left: 20,
        backgroundColor: '#FFFFFF',
        width: 42,
        height: 42,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backButtonText: {
        fontSize: 25,
        color: '#33251F',
    },
    favoriteButton: {
        position: 'absolute',
        top: 20,
        right: 20,
        backgroundColor: '#FFFFFF',
        width: 42,
        height: 42,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    favoriteText: {
        fontSize: 20,
    },
    content: {
        padding: 20,
    },
    cuisine: {
        color: '#E66A45',
        fontWeight: '800',
        fontSize: 11,
        letterSpacing: 1.5,
    },
    title: {
        color: '#33251F',
        fontSize: 27,
        fontWeight: '800',
        marginTop: 7,
    },
    description: {
        color: '#888',
        fontSize: 14,
        lineHeight: 22,
        marginTop: 10,
    },
    infoContainer: {
        flexDirection: 'row',
        marginTop: 24,
        gap: 10,
    },
    infoBox: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: 'center',
    },
    infoEmoji: {
        fontSize: 21,
    },
    infoLabel: {
        color: '#999',
        fontSize: 10,
        marginTop: 7,
    },
    infoValue: {
        color: '#33251F',
        fontSize: 13,
        fontWeight: '800',
        marginTop: 4,
    },
    section: {
        marginTop: 30,
    },
    sectionTitle: {
        color: '#33251F',
        fontSize: 20,
        fontWeight: '800',
    },
    sectionSubtitle: {
        color: '#999',
        fontSize: 12,
        marginTop: 6,
        marginBottom: 12,
    },
    ingredientRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 14,
        borderRadius: 12,
        marginBottom: 8,
    },
    checkbox: {
        fontSize: 18,
    },
    ingredientText: {
        color: '#514139',
        fontSize: 13,
        marginLeft: 12,
    },
    checkedText: {
        textDecorationLine: 'line-through',
        color: '#999',
    },
    stepRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginTop: 17,
        gap: 13,
    },
    stepNumber: {
        backgroundColor: '#FFE3C9',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    stepNumberText: {
        color: '#C45C38',
        fontWeight: '800',
    },
    stepText: {
        flex: 1,
        color: '#514139',
        fontSize: 14,
        lineHeight: 22,
        paddingTop: 4,
    },
    bottomMessage: {
        alignItems: 'center',
        paddingVertical: 30,
    },
    bottomEmoji: {
        fontSize: 24,
    },
    bottomText: {
        color: '#888',
        marginTop: 8,
        fontSize: 13,
    },
    backText: {
        color: '#E66A45',
        padding: 20,
    },
});

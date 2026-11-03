
import React, { useEffect, useState } from 'react';
import Markdown from 'react-native-markdown-display';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    Pressable,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

const cuisines = ['Any', 'Indian', 'Italian', 'Chinese', 'Mexican'];
const cookingTimes = ['15 min', '30 min', '45 min', 'Any'];

const API_URL = 'https://cookwise-backend-zddn.onrender.com/api/recipes/generate';
const FAVORITES_KEY = 'cookwise_ai_favorites';

type AIFavorite = {
    id: string;
    recipe: string;
    ingredients: string;
    cuisine: string;
    cookingTime: string;
    createdAt: string;
};

export default function AIChefScreen() {
    const [ingredients, setIngredients] = useState('');
    const [selectedCuisine, setSelectedCuisine] = useState('Any');
    const [selectedTime, setSelectedTime] = useState('30 min');
    const [generatedRecipe, setGeneratedRecipe] = useState('');
    const [generatedRecipeId, setGeneratedRecipeId] = useState('');
    const [aiFavorites, setAiFavorites] = useState<AIFavorite[]>([]);
    const [loading, setLoading] = useState(false);

    // Load saved AI favourites when the screen opens
    useEffect(() => {
        const loadFavorites = async () => {
            try {
                const saved = await AsyncStorage.getItem(FAVORITES_KEY);

                if (saved) {
                    const parsed: AIFavorite[] = JSON.parse(saved);
                    setAiFavorites(parsed);

                    // Show the most recently saved AI recipe
                    if (parsed.length > 0) {
                        setGeneratedRecipe(parsed[0].recipe);
                        setGeneratedRecipeId(parsed[0].id);
                    }
                }
            } catch (error) {
                console.log('Error loading AI favourites:', error);
            }
        };

        loadFavorites();
    }, []);

    const isFavorite = aiFavorites.some(
        (item) => item.id === generatedRecipeId
    );

    // Automatically save a newly generated recipe
    const saveGeneratedRecipe = async (recipeText: string) => {
        const newFavorite: AIFavorite = {
            id: Date.now().toString(),
            recipe: recipeText,
            ingredients: ingredients.trim(),
            cuisine: selectedCuisine,
            cookingTime: selectedTime,
            createdAt: new Date().toISOString(),
        };

        try {
            const updatedFavorites = [
                newFavorite,
                ...aiFavorites,
            ];

            await AsyncStorage.setItem(
                FAVORITES_KEY,
                JSON.stringify(updatedFavorites)
            );

            setAiFavorites(updatedFavorites);
            setGeneratedRecipeId(newFavorite.id);

            Alert.alert(
                'Added to Favourites ❤️',
                'Your AI-generated recipes have been saved!'
            );
        } catch (error) {
            console.log('Error saving AI favourite:', error);
            Alert.alert(
                'Saving failed',
                'Your recipes were generated, but could not be saved.'
            );
        }
    };

    // Unlike or save the currently displayed AI recipe
    const toggleFavorite = async () => {
        if (!generatedRecipe || !generatedRecipeId) return;

        try {
            let updatedFavorites: AIFavorite[];

            if (isFavorite) {
                updatedFavorites = aiFavorites.filter(
                    (item) => item.id !== generatedRecipeId
                );

                Alert.alert(
                    'Removed from Favourites',
                    'Your recipe has been removed.'
                );
            } else {
                const newFavorite: AIFavorite = {
                    id: generatedRecipeId,
                    recipe: generatedRecipe,
                    ingredients: ingredients.trim(),
                    cuisine: selectedCuisine,
                    cookingTime: selectedTime,
                    createdAt: new Date().toISOString(),
                };

                updatedFavorites = [
                    newFavorite,
                    ...aiFavorites,
                ];

                Alert.alert(
                    'Added to Favourites ❤️',
                    'Your recipe has been saved!'
                );
            }

            await AsyncStorage.setItem(
                FAVORITES_KEY,
                JSON.stringify(updatedFavorites)
            );

            setAiFavorites(updatedFavorites);
        } catch (error) {
            console.log('Error updating AI favourite:', error);
            Alert.alert('Error', 'Could not update your favourites.');
        }
    };

    const generateRecipes = async () => {
        if (!ingredients.trim()) {
            Alert.alert(
                'Add ingredients',
                'Please enter at least one ingredient.'
            );
            return;
        }

        try {
            setLoading(true);
            setGeneratedRecipe('');
            setGeneratedRecipeId('');

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ingredients: ingredients.trim(),
                    cuisine: selectedCuisine,
                    cookingTime: selectedTime,
                }),
            });

            // const data = await response.json();
            const responseText = await response.text();

            console.log("BACKEND RESPONSE:", response.status, responseText);

            let data;

            try {
                data = JSON.parse(responseText);
            } catch {
                throw new Error("Backend did not return valid JSON: " + responseText);
            }

            if (!response.ok) {
                throw new Error(data.message || "Unable to generate recipes.");
            }

            if (!data.recipe) {
                throw new Error("No recipe was returned by the AI.");
            }

            setGeneratedRecipe(data.recipe);
            await saveGeneratedRecipe(data.recipe);

        } catch (error) {
            console.error('Recipe generation error:', error);

            Alert.alert(
                'Recipe generation failed',
                error instanceof Error
                    ? error.message
                    : 'Please check your internet connection and try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Pressable
                        onPress={() => router.back()}
                        style={styles.backButton}
                    >
                        <Text style={styles.backText}>‹</Text>
                    </Pressable>

                    <Text style={styles.headerTitle}>AI Chef ✨</Text>
                    <Text style={styles.subtitle}>
                        Tell me what you have. I'll help you decide what to cook!
                    </Text>
                </View>

                <View style={styles.content}>
                    <View style={styles.chefCard}>
                        <Text style={styles.chefEmoji}>👩‍🍳</Text>
                        <Text style={styles.chefTitle}>
                            Your personal AI Chef
                        </Text>
                        <Text style={styles.chefDescription}>
                            Turn everyday ingredients into something delicious.
                        </Text>
                    </View>

                    <Text style={styles.sectionTitle}>
                        What's in your kitchen? 🥕
                    </Text>
                    <Text style={styles.helper}>
                        Enter ingredients separated by commas.
                    </Text>

                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Paneer, tomato, onion, rice..."
                        placeholderTextColor="#A49A90"
                        value={ingredients}
                        onChangeText={setIngredients}
                        multiline
                    />

                    <Text style={styles.sectionTitle}>
                        Choose your cuisine
                    </Text>
                    <View style={styles.options}>
                        {cuisines.map((cuisine) => (
                            <Pressable
                                key={cuisine}
                                style={[
                                    styles.option,
                                    selectedCuisine === cuisine &&
                                    styles.selectedOption,
                                ]}
                                onPress={() => setSelectedCuisine(cuisine)}
                            >
                                <Text
                                    style={[
                                        styles.optionText,
                                        selectedCuisine === cuisine &&
                                        styles.selectedOptionText,
                                    ]}
                                >
                                    {cuisine}
                                </Text>
                            </Pressable>
                        ))}
                    </View>

                    <Text style={styles.sectionTitle}>
                        How much time do you have? ⏱️
                    </Text>
                    <View style={styles.options}>
                        {cookingTimes.map((time) => (
                            <Pressable
                                key={time}
                                style={[
                                    styles.option,
                                    selectedTime === time &&
                                    styles.selectedOption,
                                ]}
                                onPress={() => setSelectedTime(time)}
                            >
                                <Text
                                    style={[
                                        styles.optionText,
                                        selectedTime === time &&
                                        styles.selectedOptionText,
                                    ]}
                                >
                                    {time}
                                </Text>
                            </Pressable>
                        ))}
                    </View>

                    <Pressable
                        style={[
                            styles.generateButton,
                            loading && styles.disabledButton,
                        ]}
                        onPress={generateRecipes}
                        disabled={loading}
                    >
                        {loading ? (
                            <View style={styles.loadingRow}>
                                <ActivityIndicator color="#FFFFFF" />
                                <Text style={styles.generateButtonText}>
                                    Your AI Chef is cooking...
                                </Text>
                            </View>
                        ) : (
                            <Text style={styles.generateButtonText}>
                                ✨ Generate Recipes
                            </Text>
                        )}
                    </Pressable>

                    {!!generatedRecipe && (
                        <View style={styles.resultCard}>
                            <View style={styles.resultHeader}>
                                <View style={styles.resultHeading}>
                                    <Text style={styles.resultTitle}>
                                        ✨ Your AI-generated recipes
                                    </Text>
                                    <Text style={styles.resultSubtitle}>
                                        Created just for your ingredients
                                    </Text>
                                </View>

                                <Pressable
                                    style={styles.favoriteButton}
                                    onPress={toggleFavorite}
                                >
                                    <Text style={styles.favoriteIcon}>
                                        {isFavorite ? '❤️' : '🤍'}
                                    </Text>
                                </Pressable>
                            </View>

                            <Text style={styles.favoriteStatus}>
                                {isFavorite
                                    ? 'Saved to Favourites'
                                    : 'Removed from Favourites'}
                            </Text>

                            <Markdown style={markdownStyles}>
                                {generatedRecipe}
                            </Markdown>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const markdownStyles = {
    body: {
        fontSize: 15,
        color: '#51463E',
        lineHeight: 24,
    },
    heading1: {
        fontSize: 23,
        fontWeight: 'bold' as const,
        color: '#34251F',
        marginTop: 20,
        marginBottom: 12,
    },
    heading2: {
        fontSize: 20,
        fontWeight: 'bold' as const,
        color: '#B9563E',
        marginTop: 18,
        marginBottom: 10,
    },
    heading3: {
        fontSize: 17,
        fontWeight: 'bold' as const,
        color: '#344B31',
        marginTop: 14,
        marginBottom: 8,
    },
    paragraph: {
        marginTop: 5,
        marginBottom: 10,
        lineHeight: 24,
    },
    strong: {
        fontWeight: 'bold' as const,
        color: '#34251F',
    },
    bullet_list: {
        marginBottom: 12,
    },
    ordered_list: {
        marginBottom: 12,
    },
    list_item: {
        marginBottom: 7,
    },
    hr: {
        backgroundColor: '#F0E7DA',
        height: 1,
        marginVertical: 16,
    },
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF9ED',
    },
    header: {
        backgroundColor: '#FFE4C8',
        padding: 24,
        paddingBottom: 30,
    },
    backButton: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    backText: {
        fontSize: 30,
        color: '#34251F',
        marginTop: -4,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#34251F',
    },
    subtitle: {
        fontSize: 16,
        color: '#796B60',
        marginTop: 8,
        lineHeight: 24,
    },
    content: {
        padding: 20,
    },
    chefCard: {
        backgroundColor: '#E2F0D9',
        padding: 22,
        borderRadius: 22,
        alignItems: 'center',
        marginBottom: 28,
    },
    chefEmoji: {
        fontSize: 55,
    },
    chefTitle: {
        fontSize: 21,
        fontWeight: 'bold',
        color: '#344B31',
        marginTop: 10,
    },
    chefDescription: {
        fontSize: 14,
        color: '#61705B',
        textAlign: 'center',
        marginTop: 7,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#34251F',
        marginBottom: 8,
        marginTop: 18,
    },
    helper: {
        color: '#8A8178',
        fontSize: 14,
        marginBottom: 12,
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        minHeight: 110,
        textAlignVertical: 'top',
        fontSize: 16,
        color: '#34251F',
        borderWidth: 1,
        borderColor: '#F0E7DA',
    },
    options: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginTop: 8,
    },
    option: {
        paddingVertical: 11,
        paddingHorizontal: 17,
        borderRadius: 25,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#F0E7DA',
    },
    selectedOption: {
        backgroundColor: '#E4775C',
        borderColor: '#E4775C',
    },
    optionText: {
        color: '#665B52',
        fontSize: 14,
        fontWeight: '600',
    },
    selectedOptionText: {
        color: '#FFFFFF',
    },
    generateButton: {
        backgroundColor: '#E4775C',
        padding: 18,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 30,
        marginBottom: 25,
    },
    disabledButton: {
        opacity: 0.7,
    },
    loadingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    generateButtonText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: 'bold',
    },
    resultCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        padding: 20,
        marginBottom: 25,
    },
    resultHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    resultHeading: {
        flex: 1,
        paddingRight: 10,
    },
    resultTitle: {
        fontSize: 21,
        fontWeight: 'bold',
        color: '#34251F',
        marginBottom: 12,
    },
    resultSubtitle: {
        fontSize: 13,
        color: '#96877C',
        marginBottom: 10,
    },
    favoriteButton: {
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: '#FFF0E9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    favoriteIcon: {
        fontSize: 24,
    },
    favoriteStatus: {
        fontSize: 12,
        color: '#B9563E',
        fontWeight: '600',
        marginBottom: 12,
    },
});

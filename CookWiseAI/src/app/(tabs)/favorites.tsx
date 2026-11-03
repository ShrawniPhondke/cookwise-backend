
import React, { useCallback, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, router } from 'expo-router';

const NORMAL_FAVORITES_KEY = 'cookwise_favorites';
const AI_FAVORITES_KEY = 'cookwise_ai_favorites';
const IMPORTED_FAVORITES_KEY = 'cookwise_imported_favorites';

type Recipe = {
    id: number;
    name: string;
    cuisine: string;
    time: string;
    emoji: string;
    color: string;
};

type AIFavorite = {
    id: string;
    recipe: string;
    ingredients: string;
    cuisine: string;
    cookingTime: string;
    createdAt: string;
};

type ImportedFavorite = {
    id: string;
    recipe: string;
    createdAt: string;
};

const recipes: Recipe[] = [
    {
        id: 1,
        name: 'Paneer Butter Masala',
        cuisine: 'Indian',
        time: '30 min',
        emoji: '🍛',
        color: '#FFE3C9',
    },
    {
        id: 2,
        name: 'Creamy Pasta',
        cuisine: 'Italian',
        time: '20 min',
        emoji: '🍝',
        color: '#FBE6B9',
    },
    {
        id: 3,
        name: 'Fresh Veggie Salad',
        cuisine: 'Healthy',
        time: '10 min',
        emoji: '🥗',
        color: '#DDF1D5',
    },
    {
        id: 4,
        name: 'Chocolate Pancakes',
        cuisine: 'Dessert',
        time: '15 min',
        emoji: '🥞',
        color: '#F4D8D0',
    },
];

export default function FavoritesScreen() {
    const [normalFavorites, setNormalFavorites] = useState<number[]>([]);
    const [aiFavorites, setAiFavorites] = useState<AIFavorite[]>([]);
    const [importedFavorites, setImportedFavorites] =
        useState<ImportedFavorite[]>([]);

    const loadFavorites = useCallback(async () => {
        try {
            const normalData = await AsyncStorage.getItem(
                NORMAL_FAVORITES_KEY
            );
            const aiData = await AsyncStorage.getItem(AI_FAVORITES_KEY);
            const importedData = await AsyncStorage.getItem(
                IMPORTED_FAVORITES_KEY
            );

            setNormalFavorites(normalData ? JSON.parse(normalData) : []);
            setAiFavorites(aiData ? JSON.parse(aiData) : []);
            setImportedFavorites(
                importedData ? JSON.parse(importedData) : []
            );
        } catch (error) {
            console.log('Error loading favorites:', error);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadFavorites();
        }, [loadFavorites])
    );

    const removeNormalFavorite = async (id: number) => {
        const updated = normalFavorites.filter((item) => item !== id);

        setNormalFavorites(updated);

        await AsyncStorage.setItem(
            NORMAL_FAVORITES_KEY,
            JSON.stringify(updated)
        );
    };

    const removeAIFavorite = async (id: string) => {
        const updated = aiFavorites.filter((item) => item.id !== id);

        setAiFavorites(updated);

        await AsyncStorage.setItem(
            AI_FAVORITES_KEY,
            JSON.stringify(updated)
        );
    };

    const removeImportedFavorite = async (id: string) => {
        const updated = importedFavorites.filter(
            (item) => item.id !== id
        );

        setImportedFavorites(updated);

        await AsyncStorage.setItem(
            IMPORTED_FAVORITES_KEY,
            JSON.stringify(updated)
        );
    };

    const normalRecipeList = recipes.filter((recipe) =>
        normalFavorites.includes(recipe.id)
    );

    const hasFavorites =
        normalRecipeList.length > 0 ||
        aiFavorites.length > 0 ||
        importedFavorites.length > 0;

    return (
        <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.header}>
                <Text style={styles.heading}>My Favourites ❤️</Text>
                <Text style={styles.subtitle}>
                    All your favourite recipes in one place
                </Text>
            </View>

            {!hasFavorites ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyEmoji}>💛</Text>
                    <Text style={styles.emptyTitle}>
                        No favourites yet!
                    </Text>
                    <Text style={styles.emptyText}>
                        Save recipes you love and find them here whenever
                        you need them.
                    </Text>

                    <Pressable
                        style={styles.exploreButton}
                        onPress={() => router.push('/')}
                    >
                        <Text style={styles.exploreButtonText}>
                            Explore Recipes
                        </Text>
                    </Pressable>
                </View>
            ) : (
                <>
                    {normalRecipeList.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>
                                Your Saved Recipes
                            </Text>

                            {normalRecipeList.map((recipe) => (
                                <View
                                    key={recipe.id}
                                    style={styles.card}
                                >
                                    <View
                                        style={[
                                            styles.emojiContainer,
                                            {
                                                backgroundColor:
                                                recipe.color,
                                            },
                                        ]}
                                    >
                                        <Text style={styles.recipeEmoji}>
                                            {recipe.emoji}
                                        </Text>
                                    </View>

                                    <View style={styles.recipeInfo}>
                                        <Text style={styles.recipeName}>
                                            {recipe.name}
                                        </Text>
                                        <Text style={styles.recipeDetails}>
                                            {recipe.cuisine} • {recipe.time}
                                        </Text>
                                    </View>

                                    <Pressable
                                        onPress={() =>
                                            removeNormalFavorite(recipe.id)
                                        }
                                        style={styles.heartButton}
                                    >
                                        <Text style={styles.heart}>
                                            ❤️
                                        </Text>
                                    </Pressable>
                                </View>
                            ))}
                        </View>
                    )}

                    {aiFavorites.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>
                                AI Chef Recipes ✨
                            </Text>

                            {aiFavorites.map((item) => (
                                <View key={item.id} style={styles.aiCard}>
                                    <View style={styles.aiCardHeader}>
                                        <View style={styles.aiTag}>
                                            <Text style={styles.aiTagText}>
                                                ✨ AI Generated
                                            </Text>
                                        </View>

                                        <Pressable
                                            onPress={() =>
                                                removeAIFavorite(item.id)
                                            }
                                        >
                                            <Text style={styles.heart}>
                                                ❤️
                                            </Text>
                                        </Pressable>
                                    </View>

                                    <Text style={styles.aiRecipeTitle}>
                                        Your AI Recipe
                                    </Text>

                                    <Text
                                        style={styles.aiRecipeText}
                                        numberOfLines={5}
                                    >
                                        {item.recipe}
                                    </Text>

                                    <Text style={styles.recipeDetails}>
                                        Ingredients: {item.ingredients}
                                    </Text>

                                    <Text style={styles.recipeDetails}>
                                        {item.cuisine} • {item.cookingTime}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {importedFavorites.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>
                                Imported Recipes 📥
                            </Text>

                            {importedFavorites.map((item) => (
                                <View key={item.id} style={styles.aiCard}>
                                    <View style={styles.aiCardHeader}>
                                        <View style={styles.aiTag}>
                                            <Text style={styles.aiTagText}>
                                                📥 Imported Recipe
                                            </Text>
                                        </View>

                                        <Pressable
                                            onPress={() =>
                                                removeImportedFavorite(item.id)
                                            }
                                        >
                                            <Text style={styles.heart}>
                                                ❤️
                                            </Text>
                                        </Pressable>
                                    </View>

                                    <Text style={styles.aiRecipeTitle}>
                                        Saved Imported Recipe
                                    </Text>

                                    <Text style={styles.aiRecipeText}>
                                        {item.recipe}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    )}
                </>
            )}

            <View style={styles.bottomSpace} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF9F2',
    },
    header: {
        paddingHorizontal: 22,
        paddingTop: 65,
        paddingBottom: 25,
    },
    heading: {
        fontSize: 28,
        fontWeight: '800',
        color: '#29251F',
    },
    subtitle: {
        fontSize: 14,
        color: '#898078',
        marginTop: 7,
    },
    section: {
        paddingHorizontal: 20,
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 19,
        fontWeight: '800',
        color: '#29251F',
        marginBottom: 15,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 12,
        borderRadius: 18,
        marginBottom: 12,
        elevation: 2,
    },
    emojiContainer: {
        width: 65,
        height: 65,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    recipeEmoji: {
        fontSize: 34,
    },
    recipeInfo: {
        flex: 1,
        marginLeft: 13,
    },
    recipeName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#29251F',
    },
    recipeDetails: {
        fontSize: 12,
        color: '#898078',
        marginTop: 6,
    },
    heartButton: {
        padding: 8,
    },
    heart: {
        fontSize: 21,
    },
    aiCard: {
        backgroundColor: '#FFFFFF',
        padding: 17,
        borderRadius: 18,
        marginBottom: 13,
        elevation: 2,
    },
    aiCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    aiTag: {
        backgroundColor: '#FFF0DF',
        paddingHorizontal: 11,
        paddingVertical: 6,
        borderRadius: 20,
    },
    aiTagText: {
        color: '#E87535',
        fontSize: 11,
        fontWeight: '700',
    },
    aiRecipeTitle: {
        fontSize: 17,
        fontWeight: '800',
        color: '#29251F',
        marginBottom: 8,
    },
    aiRecipeText: {
        fontSize: 13,
        lineHeight: 20,
        color: '#5F5850',
        marginBottom: 10,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingHorizontal: 35,
        paddingTop: 90,
    },
    emptyEmoji: {
        fontSize: 65,
        marginBottom: 18,
    },
    emptyTitle: {
        fontSize: 21,
        fontWeight: '800',
        color: '#29251F',
    },
    emptyText: {
        fontSize: 14,
        lineHeight: 22,
        color: '#898078',
        textAlign: 'center',
        marginTop: 10,
    },
    exploreButton: {
        backgroundColor: '#F07845',
        paddingHorizontal: 25,
        paddingVertical: 14,
        borderRadius: 25,
        marginTop: 23,
    },
    exploreButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },
    bottomSpace: {
        height: 40,
    },
});

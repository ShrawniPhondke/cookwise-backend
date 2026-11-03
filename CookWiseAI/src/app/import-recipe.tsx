
import React, { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    Pressable,
    ScrollView,
    Alert,
    Keyboard,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

type ImportMode = 'link' | 'text';

const API_URL = 'https://cookwise-backend-zddn.onrender.com/api/recipes/generate';
const IMPORTED_FAVORITES_KEY = 'cookwise_imported_favorites';

// Remove Markdown symbols from text
const cleanMarkdown = (text: string) => {
    return text
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/^#{1,6}\s*/gm, '')
        .replace(/`/g, '')
        .trim();
};

// Convert Gemini Markdown response into readable sections
const parseRecipe = (recipe: string) => {
    return recipe
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => {
            return line !== '' && !/^[-*_]{3,}$/.test(line);
        })
        .map((line, index) => {
            const heading = line.match(/^#{1,6}\s*(.+)$/);

            if (heading) {
                return {
                    id: index,
                    type: 'heading',
                    text: cleanMarkdown(heading[1]),
                };
            }

            const bullet = line.match(/^[-*•]\s+(.+)$/);

            if (bullet) {
                return {
                    id: index,
                    type: 'bullet',
                    text: cleanMarkdown(bullet[1]),
                };
            }

            const numbered = line.match(/^\d+[.)]\s+(.+)$/);

            if (numbered) {
                return {
                    id: index,
                    type: 'numbered',
                    text: cleanMarkdown(numbered[1]),
                };
            }

            const boldLabel = line.match(/^\*\*(.+?)\*\*\s*:?\s*(.*)$/);

            if (boldLabel) {
                return {
                    id: index,
                    type: 'label',
                    title: cleanMarkdown(boldLabel[1]),
                    text: cleanMarkdown(boldLabel[2]),
                };
            }

            const plainLabel = line.match(
                /^(Recipe name|Short description|Ingredients|Preparation time|Cooking time|Preparation|Instructions|Cooking instructions|Steps)\s*:\s*(.*)$/i
            );

            if (plainLabel) {
                return {
                    id: index,
                    type: 'label',
                    title: plainLabel[1],
                    text: cleanMarkdown(plainLabel[2]),
                };
            }

            return {
                id: index,
                type: 'paragraph',
                text: cleanMarkdown(line),
            };
        });
};

export default function ImportRecipeScreen() {
    const [mode, setMode] = useState<ImportMode>('link');
    const [recipeInput, setRecipeInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [importedRecipe, setImportedRecipe] = useState('');
    const [isSaved, setIsSaved] = useState(false);

    const saveToFavorites = async () => {
        try {
            const existingData = await AsyncStorage.getItem(IMPORTED_FAVORITES_KEY);
            const favorites = existingData ? JSON.parse(existingData) : [];

            const alreadySaved = favorites.some(
                (item: { recipe: string }) => item.recipe === importedRecipe
            );

            if (alreadySaved) {
                setIsSaved(true);
                Alert.alert(
                    'Already saved ❤️',
                    'This recipe is already in Favourites.'
                );
                return;
            }

            favorites.unshift({
                id: Date.now().toString(),
                recipe: importedRecipe,
                createdAt: new Date().toISOString(),
            });

            await AsyncStorage.setItem(
                IMPORTED_FAVORITES_KEY,
                JSON.stringify(favorites)
            );

            setIsSaved(true);
            Alert.alert(
                'Saved! ❤️',
                'Your imported recipe is now in Favourites.'
            );
        } catch (error) {
            Alert.alert(
                'Error',
                'Could not save this recipe. Please try again.'
            );
        }
    };

    const handleImport = async () => {
        Keyboard.dismiss();

        if (!recipeInput.trim()) {
            Alert.alert(
                'Nothing to import',
                mode === 'link'
                    ? 'Please paste a recipe link first.'
                    : 'Please paste the recipe ingredients or instructions.'
            );
            return;
        }

        if (mode === 'link') {
            if (!/^https?:\/\/\S+/i.test(recipeInput.trim())) {
                Alert.alert(
                    'Invalid link',
                    'Please enter a valid URL starting with http:// or https://.'
                );
                return;
            }

            Alert.alert(
                'One more step',
                'Automatic social media link extraction is not connected yet. Please copy the recipe caption or instructions and use Paste Recipe.'
            );
            return;
        }

        try {
            setLoading(true);
            setImportedRecipe('');
            setIsSaved(false);

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ingredients: recipeInput.trim(),
                    cuisine: 'Any',
                    cookingTime: 'Any',
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || 'Unable to import this recipe.'
                );
            }

            if (!data.recipe) {
                throw new Error('Gemini did not return a recipe.');
            }

            setImportedRecipe(data.recipe);
            setIsSaved(false);
        } catch (error) {
            console.log('Import recipe error:', error);

            Alert.alert(
                'Import Failed',
                error instanceof Error
                    ? error.message
                    : 'Something went wrong. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    const recipeSections = importedRecipe
        ? parseRecipe(importedRecipe)
        : [];

    const renderRecipeSection = (
        item: ReturnType<typeof parseRecipe>[number]
    ) => {
        if (item.type === 'heading') {
            return (
                <Text key={item.id} style={styles.recipeHeading}>
                    {item.text}
                </Text>
            );
        }

        if (item.type === 'bullet') {
            return (
                <View key={item.id} style={styles.bulletRow}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.bulletText}>{item.text}</Text>
                </View>
            );
        }

        if (item.type === 'numbered') {
            return (
                <View key={item.id} style={styles.stepRow}>
                    <Text style={styles.stepNumber}>
                        {item.text.match(/^\d+/)?.[0] || '•'}
                    </Text>
                    <Text style={styles.stepText}>
                        {item.text.replace(/^\d+[.)]\s*/, '')}
                    </Text>
                </View>
            );
        }

        if (item.type === 'label') {
            return (
                <View key={item.id} style={styles.labelSection}>
                    <Text style={styles.labelTitle}>{item.title}</Text>
                    {item.text ? (
                        <Text style={styles.paragraph}>{item.text}</Text>
                    ) : null}
                </View>
            );
        }

        return (
            <Text key={item.id} style={styles.paragraph}>
                {item.text}
            </Text>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.header}>
                    <Pressable
                        onPress={() => router.back()}
                        style={styles.backButton}
                    >
                        <Text style={styles.backText}>‹</Text>
                    </Pressable>

                    <Text style={styles.headerTitle}>
                        Import Recipe 🍽️
                    </Text>

                    <Text style={styles.subtitle}>
                        Found something delicious online? Bring it into CookWise AI!
                    </Text>
                </View>

                <View style={styles.content}>
                    <View style={styles.introCard}>
                        <Text style={styles.introEmoji}>📖</Text>
                        <Text style={styles.introTitle}>
                            Save recipes you love
                        </Text>
                        <Text style={styles.introDescription}>
                            Let your AI Chef organize recipe ingredients and cooking instructions.
                        </Text>
                    </View>

                    <Text style={styles.sectionTitle}>
                        How would you like to import?
                    </Text>

                    <View style={styles.modeContainer}>
                        <Pressable
                            style={[
                                styles.modeButton,
                                mode === 'link' && styles.activeMode,
                            ]}
                            onPress={() => {
                                setMode('link');
                                setRecipeInput('');
                                setImportedRecipe('');
                                setIsSaved(false);
                            }}
                        >
                            <Text style={styles.modeEmoji}>🔗</Text>
                            <Text
                                style={[
                                    styles.modeText,
                                    mode === 'link' && styles.activeModeText,
                                ]}
                            >
                                Recipe Link
                            </Text>
                        </Pressable>

                        <Pressable
                            style={[
                                styles.modeButton,
                                mode === 'text' && styles.activeMode,
                            ]}
                            onPress={() => {
                                setMode('text');
                                setRecipeInput('');
                                setImportedRecipe('');
                                setIsSaved(false);
                            }}
                        >
                            <Text style={styles.modeEmoji}>📝</Text>
                            <Text
                                style={[
                                    styles.modeText,
                                    mode === 'text' && styles.activeModeText,
                                ]}
                            >
                                Paste Recipe
                            </Text>
                        </Pressable>
                    </View>

                    <Text style={styles.sectionTitle}>
                        {mode === 'link'
                            ? 'Paste your recipe link'
                            : 'Paste recipe details'}
                    </Text>

                    <Text style={styles.helper}>
                        {mode === 'link'
                            ? 'Add a public recipe or social media post URL.'
                            : 'Paste the recipe caption, ingredients or cooking instructions.'}
                    </Text>

                    <TextInput
                        style={[
                            styles.input,
                            mode === 'link' && styles.linkInput,
                        ]}
                        placeholder={
                            mode === 'link'
                                ? 'https://www.instagram.com/...'
                                : 'Example: Paneer, onion, tomato, spices...'
                        }
                        placeholderTextColor="#A49A90"
                        value={recipeInput}
                        onChangeText={setRecipeInput}
                        multiline={mode === 'text'}
                        autoCapitalize="none"
                        autoCorrect={false}
                        keyboardType={mode === 'link' ? 'url' : 'default'}
                        textAlignVertical="top"
                    />

                    <View style={styles.tipCard}>
                        <Text style={styles.tipTitle}>💡 Quick tip</Text>
                        <Text style={styles.tipText}>
                            For Instagram or YouTube recipes, copy the recipe caption or instructions and paste them using Paste Recipe.
                        </Text>
                    </View>

                    <Pressable
                        style={[
                            styles.importButton,
                            loading && styles.disabledButton,
                        ]}
                        onPress={handleImport}
                        disabled={loading}
                    >
                        {loading ? (
                            <View style={styles.loadingRow}>
                                <ActivityIndicator color="#FFFFFF" />
                                <Text style={styles.importButtonText}>
                                    AI is processing...
                                </Text>
                            </View>
                        ) : (
                            <Text style={styles.importButtonText}>
                                ✨ Import Recipe with AI
                            </Text>
                        )}
                    </Pressable>

                    {importedRecipe !== '' && (
                        <View style={styles.resultCard}>
                            <Text style={styles.resultTitle}>
                                🎉 Your AI Recipe Suggestions
                            </Text>

                            {recipeSections.map(renderRecipeSection)}

                            <Pressable
                                style={[
                                    styles.saveButton,
                                    isSaved && styles.savedButton,
                                ]}
                                onPress={saveToFavorites}
                            >
                                <Text style={styles.saveButtonText}>
                                    {isSaved
                                        ? '❤️ Saved to Favourites'
                                        : '🤍 Save to Favourites'}
                                </Text>
                            </Pressable>

                            <Pressable
                                style={styles.newImportButton}
                                onPress={() => {
                                    setRecipeInput('');
                                    setImportedRecipe('');
                                    setIsSaved(false);
                                }}
                            >
                                <Text style={styles.newImportText}>
                                    Import Another Recipe
                                </Text>
                            </Pressable>
                        </View>
                    )}

                    <Text style={styles.footerText}>
                        Your recipes are ready to explore with CookWise AI.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

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
        fontSize: 30,
        fontWeight: 'bold',
        color: '#34251F',
    },
    subtitle: {
        fontSize: 15,
        color: '#796B60',
        marginTop: 8,
        lineHeight: 23,
    },
    content: {
        padding: 20,
    },
    introCard: {
        backgroundColor: '#E2F0D9',
        borderRadius: 22,
        padding: 22,
        alignItems: 'center',
        marginBottom: 28,
    },
    introEmoji: {
        fontSize: 48,
    },
    introTitle: {
        fontSize: 21,
        fontWeight: 'bold',
        color: '#344B31',
        marginTop: 10,
    },
    introDescription: {
        fontSize: 14,
        color: '#61705B',
        textAlign: 'center',
        lineHeight: 22,
        marginTop: 8,
    },
    sectionTitle: {
        fontSize: 19,
        fontWeight: 'bold',
        color: '#34251F',
        marginBottom: 10,
        marginTop: 12,
    },
    modeContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    modeButton: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F0E7DA',
    },
    activeMode: {
        backgroundColor: '#E4775C',
        borderColor: '#E4775C',
    },
    modeEmoji: {
        fontSize: 25,
        marginBottom: 7,
    },
    modeText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#665B52',
    },
    activeModeText: {
        color: '#FFFFFF',
    },
    helper: {
        color: '#8A8178',
        fontSize: 14,
        lineHeight: 21,
        marginBottom: 12,
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        minHeight: 180,
        fontSize: 15,
        color: '#34251F',
        borderWidth: 1,
        borderColor: '#F0E7DA',
    },
    linkInput: {
        minHeight: 60,
    },
    tipCard: {
        backgroundColor: '#FFF0D1',
        borderRadius: 15,
        padding: 16,
        marginTop: 18,
    },
    tipTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#79552A',
        marginBottom: 7,
    },
    tipText: {
        fontSize: 13,
        color: '#796447',
        lineHeight: 21,
    },
    importButton: {
        backgroundColor: '#E4775C',
        padding: 18,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 25,
    },
    disabledButton: {
        opacity: 0.7,
    },
    loadingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    importButtonText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: 'bold',
    },
    resultCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        marginTop: 24,
        borderWidth: 1,
        borderColor: '#E8DCCF',
    },
    resultTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#344B31',
        marginBottom: 18,
    },
    recipeHeading: {
        fontSize: 19,
        fontWeight: '800',
        color: '#E4775C',
        marginTop: 18,
        marginBottom: 10,
        lineHeight: 27,
    },
    labelSection: {
        marginTop: 13,
    },
    labelTitle: {
        fontSize: 15,
        fontWeight: '800',
        color: '#344B31',
        marginBottom: 5,
    },
    paragraph: {
        fontSize: 14,
        lineHeight: 23,
        color: '#51463E',
        marginTop: 7,
    },
    bulletRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginTop: 7,
        paddingLeft: 5,
    },
    bulletDot: {
        fontSize: 18,
        color: '#E4775C',
        marginRight: 9,
        lineHeight: 23,
    },
    bulletText: {
        flex: 1,
        fontSize: 14,
        lineHeight: 22,
        color: '#51463E',
    },
    stepRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginTop: 12,
        backgroundColor: '#FFF9ED',
        padding: 12,
        borderRadius: 12,
    },
    stepNumber: {
        fontSize: 14,
        fontWeight: '800',
        color: '#FFFFFF',
        backgroundColor: '#E4775C',
        width: 27,
        height: 27,
        borderRadius: 14,
        textAlign: 'center',
        textAlignVertical: 'center',
        overflow: 'hidden',
        marginRight: 10,
    },
    stepText: {
        flex: 1,
        fontSize: 14,
        lineHeight: 22,
        color: '#51463E',
    },
    saveButton: {
        backgroundColor: '#E4775C',
        padding: 16,
        borderRadius: 14,
        alignItems: 'center',
        marginTop: 22,
    },
    savedButton: {
        backgroundColor: '#344B31',
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: 'bold',
    },
    newImportButton: {
        backgroundColor: '#E2F0D9',
        padding: 14,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 22,
    },
    newImportText: {
        color: '#344B31',
        fontWeight: 'bold',
    },
    footerText: {
        textAlign: 'center',
        color: '#96877C',
        fontSize: 12,
        marginTop: 16,
        marginBottom: 20,
    },
});

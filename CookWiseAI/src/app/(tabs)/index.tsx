import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

const categories = ['All', 'Indian', 'Italian', 'Healthy', 'Dessert'];

const recipes = [
  {
    id: 1,
    name: 'Paneer Butter Masala',
    cuisine: 'Indian',
    time: '30 min',
    emoji: '🍛',
    color: '#FFE3C9',
    description: 'Creamy and delicious Indian curry',
  },
  {
    id: 2,
    name: 'Creamy Pasta',
    cuisine: 'Italian',
    time: '20 min',
    emoji: '🍝',
    color: '#FBE6B9',
    description: 'Rich and cheesy comfort food',
  },
  {
    id: 3,
    name: 'Fresh Veggie Salad',
    cuisine: 'Healthy',
    time: '10 min',
    emoji: '🥗',
    color: '#DDF1D5',
    description: 'Fresh, crunchy and nutritious',
  },
  {
    id: 4,
    name: 'Chocolate Pancakes',
    cuisine: 'Dessert',
    time: '15 min',
    emoji: '🥞',
    color: '#F4D8D0',
    description: 'A sweet treat for your day',
  },
];

export default function HomeScreen() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [favorites, setFavorites] = useState<number[]>([]);
  const [favoritesLoaded, setFavoritesLoaded] = useState(false);

  // Load saved favourites
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const savedFavorites = await AsyncStorage.getItem(
            'cookwise_favorites'
        );

        if (savedFavorites !== null) {
          setFavorites(JSON.parse(savedFavorites));
        }
      } catch (error) {
        console.log('Error loading favorites:', error);
      } finally {
        setFavoritesLoaded(true);
      }
    };

    loadFavorites();
  }, []);

  // Save favourites
  useEffect(() => {
    if (!favoritesLoaded) return;

    const saveFavorites = async () => {
      try {
        await AsyncStorage.setItem(
            'cookwise_favorites',
            JSON.stringify(favorites)
        );
      } catch (error) {
        console.log('Error saving favorites:', error);
        Alert.alert('Error', 'Could not save your favourites.');
      }
    };

    saveFavorites();
  }, [favorites, favoritesLoaded]);

  // Search and category filtering
  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch =
        recipe.name.toLowerCase().includes(search.toLowerCase()) ||
        recipe.cuisine.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
        selectedCategory === 'All' ||
        recipe.cuisine === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Add or remove favourites
  const toggleFavorite = (id: number) => {
    setFavorites((previous) =>
        previous.includes(id)
            ? previous.filter((item) => item !== id)
            : [...previous, id]
    );
  };

  return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.logo}>🍳 CookWise AI</Text>
              <Text style={styles.tagline}>Your personal AI chef</Text>
            </View>

            <View style={styles.profile}>
              <Text style={styles.profileEmoji}>👩🏻‍🍳</Text>
            </View>
          </View>

          {/* Welcome */}
          <View style={styles.welcome}>
            <Text style={styles.greeting}>Hello, Foodie! 👋</Text>
            <Text style={styles.heading}>
              What are we cooking{'\n'}today?
            </Text>
            <Text style={styles.subtitle}>
              Discover delicious recipes made just for you.
            </Text>
          </View>

          {/* Search */}
          <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
                style={styles.searchInput}
                placeholder="Search your favourite recipes..."
                placeholderTextColor="#999"
                value={search}
                onChangeText={setSearch}
            />
          </View>

          {/* AI Chef Banner */}
          <Pressable
              style={styles.aiBanner}
              onPress={() => router.push('/ai-chef')}
          >
            <View style={styles.aiContent}>
              <Text style={styles.aiLabel}>
                ✨ YOUR SMART COOKING PARTNER
              </Text>

              <Text style={styles.aiTitle}>
                Not sure what to cook?
              </Text>

              <Text style={styles.aiDescription}>
                Let AI find the perfect recipe using your ingredients.
              </Text>

              <View style={styles.aiButton}>
                <Text style={styles.aiButtonText}>
                  Try AI Chef →
                </Text>
              </View>
            </View>

            <Text style={styles.aiEmoji}>👩‍🍳</Text>
          </Pressable>

          {/* Import Recipe Banner */}
          <Pressable
              style={styles.importBanner}
              onPress={() => router.push('/import-recipe')}
          >
            <View style={styles.importContent}>
              <Text style={styles.importLabel}>
                📲 SAVE RECIPES FROM ANYWHERE
              </Text>

              <Text style={styles.importTitle}>
                Found something delicious?
              </Text>

              <Text style={styles.importDescription}>
                Import recipes from Instagram, YouTube and more.
              </Text>

              <View style={styles.importButton}>
                <Text style={styles.importButtonText}>
                  Import Recipe →
                </Text>
              </View>
            </View>

            <Text style={styles.importEmoji}>📖</Text>
          </Pressable>

          {/* Categories */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Explore Categories
            </Text>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
            >
              {categories.map((category) => (
                  <Pressable
                      key={category}
                      onPress={() => setSelectedCategory(category)}
                      style={[
                        styles.categoryButton,
                        selectedCategory === category &&
                        styles.selectedCategory,
                      ]}
                  >
                    <Text
                        style={[
                          styles.categoryText,
                          selectedCategory === category &&
                          styles.selectedCategoryText,
                        ]}
                    >
                      {category}
                    </Text>
                  </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Recipes */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Popular Recipes 🍽️
              </Text>

              <Text style={styles.recipeCount}>
                {filteredRecipes.length} recipes
              </Text>
            </View>

            {filteredRecipes.length === 0 ? (
                <Text style={styles.emptyText}>
                  No recipes found. Try another search!
                </Text>
            ) : (
                filteredRecipes.map((recipe) => (
                    <Pressable
                        key={recipe.id}
                        style={styles.recipeCard}
                        onPress={() =>
                            router.push({
                              pathname: '/recipe/[id]',
                              params: { id: String(recipe.id) },
                            })
                        }
                    >
                      <View
                          style={[
                            styles.recipeImage,
                            { backgroundColor: recipe.color },
                          ]}
                      >
                        <Text style={styles.foodEmoji}>
                          {recipe.emoji}
                        </Text>
                      </View>

                      <View style={styles.recipeInfo}>
                        <Text style={styles.recipeCategory}>
                          {recipe.cuisine.toUpperCase()}
                        </Text>

                        <Text style={styles.recipeName}>
                          {recipe.name}
                        </Text>

                        <Text style={styles.recipeDescription}>
                          {recipe.description}
                        </Text>

                        <Text style={styles.recipeTime}>
                          ⏱ {recipe.time}
                        </Text>
                      </View>

                      <Pressable
                          style={styles.heartButton}
                          onPress={() => toggleFavorite(recipe.id)}
                      >
                        <Text style={styles.heart}>
                          {favorites.includes(recipe.id) ? '❤️' : '🤍'}
                        </Text>
                      </Pressable>
                    </Pressable>
                ))
            )}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerEmoji}>🥑 🥕 🍅</Text>
            <Text style={styles.footerText}>
              Cook something amazing today!
            </Text>
          </View>

        </ScrollView>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#FFF9F2',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
  },

  logo: {
    fontSize: 23,
    fontWeight: '800',
    color: '#E66A45',
  },

  tagline: {
    fontSize: 12,
    color: '#888',
    marginTop: 3,
  },

  profile: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: '#FFE6D5',
    justifyContent: 'center',
    alignItems: 'center',
  },

  profileEmoji: {
    fontSize: 25,
  },

  welcome: {
    paddingHorizontal: 20,
    marginTop: 28,
  },

  greeting: {
    fontSize: 15,
    color: '#E66A45',
    fontWeight: '700',
  },

  heading: {
    fontSize: 31,
    lineHeight: 39,
    fontWeight: '800',
    color: '#33251F',
    marginTop: 8,
  },

  subtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
  },

  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 22,
    paddingHorizontal: 15,
    height: 52,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#F1E5D9',
  },

  searchIcon: {
    fontSize: 18,
  },

  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 13,
    color: '#33251F',
  },

  aiBanner: {
    flexDirection: 'row',
    backgroundColor: '#FFE3C9',
    marginHorizontal: 20,
    marginTop: 24,
    padding: 17,
    borderRadius: 20,
    alignItems: 'center',
  },

  aiContent: {
    flex: 1,
  },

  aiLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#B85A37',
  },

  aiTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#472A1C',
    marginTop: 9,
  },

  aiDescription: {
    fontSize: 12,
    lineHeight: 18,
    color: '#80533E',
    marginTop: 6,
  },

  aiButton: {
    backgroundColor: '#E66A45',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 12,
  },

  aiButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  aiEmoji: {
    fontSize: 52,
    marginLeft: 5,
  },

  importBanner: {
    flexDirection: 'row',
    backgroundColor: '#E2F0D9',
    marginHorizontal: 20,
    marginTop: 14,
    padding: 17,
    borderRadius: 20,
    alignItems: 'center',
  },

  importContent: {
    flex: 1,
  },

  importLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#58734F',
  },

  importTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#344B31',
    marginTop: 9,
  },

  importDescription: {
    fontSize: 12,
    lineHeight: 18,
    color: '#61705B',
    marginTop: 6,
  },

  importButton: {
    backgroundColor: '#668B59',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 12,
  },

  importButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  importEmoji: {
    fontSize: 48,
    marginLeft: 5,
  },

  section: {
    marginTop: 28,
    paddingHorizontal: 20,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#33251F',
    marginBottom: 15,
  },

  categoryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0E3D8',
    paddingVertical: 10,
    paddingHorizontal: 17,
    borderRadius: 22,
    marginRight: 9,
  },

  selectedCategory: {
    backgroundColor: '#E66A45',
    borderColor: '#E66A45',
  },

  categoryText: {
    color: '#66564D',
    fontSize: 12,
    fontWeight: '600',
  },

  selectedCategoryText: {
    color: '#FFFFFF',
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  recipeCount: {
    fontSize: 11,
    color: '#999',
    marginBottom: 15,
  },

  recipeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 11,
    borderRadius: 17,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: '#F3EAE2',
  },

  recipeImage: {
    width: 88,
    height: 94,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },

  foodEmoji: {
    fontSize: 43,
  },

  recipeInfo: {
    flex: 1,
    marginLeft: 12,
  },

  recipeCategory: {
    fontSize: 9,
    fontWeight: '800',
    color: '#E66A45',
    letterSpacing: 1,
  },

  recipeName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#33251F',
    marginTop: 5,
  },

  recipeDescription: {
    fontSize: 10,
    color: '#888',
    marginTop: 4,
  },

  recipeTime: {
    fontSize: 11,
    color: '#777',
    marginTop: 7,
  },

  heartButton: {
    padding: 5,
    alignSelf: 'flex-start',
  },

  heart: {
    fontSize: 19,
  },

  emptyText: {
    color: '#888',
    textAlign: 'center',
    padding: 25,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
  },

  footer: {
    alignItems: 'center',
    paddingVertical: 30,
  },

  footerEmoji: {
    fontSize: 24,
  },

  footerText: {
    color: '#888',
    fontSize: 12,
    marginTop: 8,
  },
});

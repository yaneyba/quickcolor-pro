import { useState, useEffect } from "react";
import { ScrollView, Text, View, TouchableOpacity, Platform, Alert, TextInput, Modal } from "react-native";
import * as Haptics from "expo-haptics";
import * as Clipboard from "expo-clipboard";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

interface Palette {
  id: number;
  name: string;
  colors: string[];
  date: string;
}

const STORAGE_KEY = "@quickcolor_palettes";
const MAX_FREE_PALETTES = 5;

// Default palettes for first-time users
const DEFAULT_PALETTES: Palette[] = [
  {
    id: 1,
    name: "Sunset Vibes",
    colors: ["#FF6B35", "#F7931E", "#FDC830", "#F37335", "#C73E1D"],
    date: "Dec 28, 2025",
  },
  {
    id: 2,
    name: "Ocean Blues",
    colors: ["#0a7ea4", "#1E90FF", "#00CED1", "#4682B4", "#5F9EA0"],
    date: "Dec 27, 2025",
  },
  {
    id: 3,
    name: "Nature Greens",
    colors: ["#4ADE80", "#22C55E", "#16A34A", "#15803D", "#14532D"],
    date: "Dec 26, 2025",
  },
];

export default function PalettesScreen() {
  const colors = useColors();
  const [palettes, setPalettes] = useState<Palette[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPaletteName, setNewPaletteName] = useState("");
  const [selectedPalette, setSelectedPalette] = useState<Palette | null>(null);

  // Load palettes from storage on mount
  useEffect(() => {
    loadPalettes();
  }, []);

  const loadPalettes = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setPalettes(JSON.parse(stored));
      } else {
        // First time: save default palettes
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PALETTES));
        setPalettes(DEFAULT_PALETTES);
      }
    } catch (error) {
      console.error("Error loading palettes:", error);
      setPalettes(DEFAULT_PALETTES);
    } finally {
      setIsLoading(false);
    }
  };

  const savePalettes = async (newPalettes: Palette[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newPalettes));
      setPalettes(newPalettes);
    } catch (error) {
      console.error("Error saving palettes:", error);
      Alert.alert("Error", "Failed to save palettes");
    }
  };

  const handlePress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const createNewPalette = () => {
    if (palettes.length >= MAX_FREE_PALETTES) {
      Alert.alert("Limit Reached", "Upgrade to Pro for unlimited palettes!");
      return;
    }
    handlePress();
    setShowCreateModal(true);
  };

  const saveNewPalette = () => {
    if (!newPaletteName.trim()) {
      Alert.alert("Error", "Please enter a palette name");
      return;
    }
    handlePress();
    const newPalette: Palette = {
      id: Date.now(),
      name: newPaletteName.trim(),
      colors: ["#FF6B35", "#4ADE80", "#F87171", "#FBBF24", "#0a7ea4"],
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    };
    savePalettes([newPalette, ...palettes]);
    setNewPaletteName("");
    setShowCreateModal(false);
  };

  const deletePalette = (id: number) => {
    Alert.alert(
      "Delete Palette",
      "Are you sure you want to delete this palette?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            handlePress();
            savePalettes(palettes.filter((p) => p.id !== id));
            setSelectedPalette(null);
          },
        },
      ]
    );
  };

  const copyColorToClipboard = async (color: string) => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    await Clipboard.setStringAsync(color);
    Alert.alert("Copied!", `${color} copied to clipboard`);
  };

  const copyAllColors = async (paletteColors: string[]) => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    await Clipboard.setStringAsync(paletteColors.join(", "));
    Alert.alert("Copied!", "All colors copied to clipboard");
  };

  return (
    <>
      <ScreenContainer className="p-6">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View className="flex-1 gap-6">
            {/* Header */}
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-3xl font-bold text-foreground">Palettes</Text>
                <Text className="text-sm text-muted mt-1">{palettes.length} of {MAX_FREE_PALETTES} saved</Text>
              </View>
              <TouchableOpacity
                onPress={createNewPalette}
                activeOpacity={0.7}
                className="w-12 h-12 rounded-full bg-primary items-center justify-center"
              >
                <Text className="text-2xl text-background font-bold">+</Text>
              </TouchableOpacity>
            </View>

            {/* Loading State */}
            {isLoading ? (
              <View className="flex-1 items-center justify-center py-12">
                <Text className="text-muted">Loading palettes...</Text>
              </View>
            ) : palettes.length === 0 ? (
              <View className="flex-1 items-center justify-center py-12">
                <Text className="text-lg text-foreground mb-2">No palettes yet</Text>
                <Text className="text-sm text-muted text-center">
                  Tap the + button to create your first palette
                </Text>
              </View>
            ) : (
              /* Palettes Grid */
              <View className="gap-4">
                {palettes.map((palette) => (
                  <TouchableOpacity
                    key={palette.id}
                    onPress={() => {
                      handlePress();
                      setSelectedPalette(palette);
                    }}
                    onLongPress={() => deletePalette(palette.id)}
                    activeOpacity={0.7}
                    className="bg-surface rounded-2xl p-4 border border-border"
                  >
                    <View className="gap-3">
                      <View className="flex-row items-center justify-between">
                        <Text className="text-lg font-semibold text-foreground">{palette.name}</Text>
                        <IconSymbol name="chevron.right" size={20} color={colors.muted} />
                      </View>
                      <View className="flex-row gap-2">
                        {palette.colors.map((color, index) => (
                          <View
                            key={index}
                            className="flex-1 h-12 rounded-lg"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </View>
                      <Text className="text-xs text-muted">{palette.date} - Long press to delete</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Free Tier Notice */}
            <View className="bg-surface rounded-2xl p-4 border border-border">
              <Text className="text-sm text-muted text-center">
                Free tier: {MAX_FREE_PALETTES} palettes max - Upgrade to Pro for unlimited
              </Text>
              <TouchableOpacity
                onPress={handlePress}
                activeOpacity={0.7}
                className="bg-primary px-6 py-3 rounded-full mt-3"
              >
                <Text className="text-background font-semibold text-center">Upgrade to Pro</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </ScreenContainer>

      {/* Create Palette Modal */}
      <Modal
        visible={showCreateModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-background rounded-t-3xl p-6 gap-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-xl font-bold text-foreground">New Palette</Text>
              <TouchableOpacity
                onPress={() => setShowCreateModal(false)}
                activeOpacity={0.7}
                className="w-8 h-8 rounded-full bg-surface items-center justify-center"
              >
                <Text className="text-foreground font-bold">X</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground text-base"
              placeholder="Palette name"
              placeholderTextColor={colors.muted}
              value={newPaletteName}
              onChangeText={setNewPaletteName}
              autoFocus
            />

            <TouchableOpacity
              onPress={saveNewPalette}
              activeOpacity={0.7}
              className="bg-primary px-6 py-4 rounded-full"
            >
              <Text className="text-background font-semibold text-center">Create Palette</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Palette Detail Modal */}
      <Modal
        visible={selectedPalette !== null}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSelectedPalette(null)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-background rounded-t-3xl p-6 gap-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-xl font-bold text-foreground">{selectedPalette?.name}</Text>
              <TouchableOpacity
                onPress={() => setSelectedPalette(null)}
                activeOpacity={0.7}
                className="w-8 h-8 rounded-full bg-surface items-center justify-center"
              >
                <Text className="text-foreground font-bold">X</Text>
              </TouchableOpacity>
            </View>

            {/* Color Swatches */}
            <View className="gap-3">
              {selectedPalette?.colors.map((color, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => copyColorToClipboard(color)}
                  activeOpacity={0.7}
                  className="flex-row items-center gap-3 bg-surface rounded-xl p-3 border border-border"
                >
                  <View
                    className="w-12 h-12 rounded-lg"
                    style={{ backgroundColor: color }}
                  />
                  <Text className="flex-1 text-base font-semibold text-foreground">{color}</Text>
                  <IconSymbol name="doc.on.doc" size={18} color={colors.muted} />
                </TouchableOpacity>
              ))}
            </View>

            {/* Actions */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => selectedPalette && copyAllColors(selectedPalette.colors)}
                activeOpacity={0.7}
                className="flex-1 bg-primary px-4 py-3 rounded-full"
              >
                <Text className="text-background font-semibold text-center">Copy All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => selectedPalette && deletePalette(selectedPalette.id)}
                activeOpacity={0.7}
                className="flex-1 bg-surface border border-error px-4 py-3 rounded-full"
              >
                <Text className="text-error font-semibold text-center">Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

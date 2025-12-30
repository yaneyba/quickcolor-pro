import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  TextInput,
  Modal,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import * as Clipboard from "expo-clipboard";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScreenContainer } from "@/ui-components/screen-container";
import { IconSymbol } from "@/ui-components/ui/icon-symbol";
import { useColors } from "@/ui-hooks/use-colors";
import {
  getHarmonyColors,
  HarmonyType,
  getContrastRatio,
  getWcagLevel,
} from "@/lib/color-utils";

const STORAGE_KEY = "@quickcolor_palettes";

const PRESET_COLORS = [
  "#FF6B35", "#4ADE80", "#F87171", "#FBBF24", "#0a7ea4",
  "#E879F9", "#38BDF8", "#A78BFA", "#FB923C", "#34D399",
];

const HARMONY_TYPES: { type: HarmonyType; label: string; description: string }[] = [
  { type: "complementary", label: "Complementary", description: "Opposite colors" },
  { type: "triadic", label: "Triadic", description: "3 equally spaced" },
  { type: "analogous", label: "Analogous", description: "Adjacent colors" },
  { type: "split-complementary", label: "Split-Comp", description: "Comp + adjacent" },
  { type: "tetradic", label: "Tetradic", description: "4 equally spaced" },
];

export default function ColorHarmonyScreen() {
  const colors = useColors();
  const router = useRouter();
  const [baseColor, setBaseColor] = useState("#FF6B35");
  const [harmonyType, setHarmonyType] = useState<HarmonyType>("complementary");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [colorInput, setColorInput] = useState("#FF6B35");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [paletteName, setPaletteName] = useState("");

  const harmonyColors = getHarmonyColors(baseColor, harmonyType);

  const handlePress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const copyColor = async (color: string) => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    await Clipboard.setStringAsync(color);
    Alert.alert("Copied!", `${color} copied to clipboard`);
  };

  const copyAllColors = async () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    await Clipboard.setStringAsync(harmonyColors.join(", "));
    Alert.alert("Copied!", "All colors copied to clipboard");
  };

  const applyColorInput = () => {
    const hexRegex = /^#[0-9A-Fa-f]{6}$/;
    if (!hexRegex.test(colorInput)) {
      Alert.alert("Invalid Color", "Please enter a valid HEX color (e.g., #FF6B35)");
      return;
    }
    handlePress();
    setBaseColor(colorInput.toUpperCase());
    setShowColorPicker(false);
  };

  const saveToPalette = async () => {
    if (!paletteName.trim()) {
      Alert.alert("Error", "Please enter a palette name");
      return;
    }

    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const palettes = stored ? JSON.parse(stored) : [];

      const newPalette = {
        id: Date.now(),
        name: paletteName.trim(),
        colors: harmonyColors.slice(0, 5), // Max 5 colors
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      };

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([newPalette, ...palettes]));

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      Alert.alert("Saved!", "Palette saved successfully");
      setPaletteName("");
      setShowSaveModal(false);
    } catch (error) {
      Alert.alert("Error", "Failed to save palette");
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Color Harmony",
          headerShown: true,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.foreground,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 8 }}>
              <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
            </TouchableOpacity>
          ),
        }}
      />
      <ScreenContainer className="p-6">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View className="flex-1 gap-6">
            {/* Base Color Selector */}
            <View className="gap-3">
              <Text className="text-base font-semibold text-foreground">Base Color</Text>
              <TouchableOpacity
                onPress={() => {
                  handlePress();
                  setColorInput(baseColor);
                  setShowColorPicker(true);
                }}
                activeOpacity={0.7}
                className="flex-row items-center gap-4 bg-surface rounded-2xl p-4 border border-border"
              >
                <View
                  className="w-16 h-16 rounded-xl"
                  style={{ backgroundColor: baseColor }}
                />
                <View className="flex-1">
                  <Text className="text-xl font-bold text-foreground">{baseColor}</Text>
                  <Text className="text-sm text-muted">Tap to change</Text>
                </View>
                <IconSymbol name="chevron.right" size={20} color={colors.muted} />
              </TouchableOpacity>
            </View>

            {/* Harmony Type Selector */}
            <View className="gap-3">
              <Text className="text-base font-semibold text-foreground">Harmony Type</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2">
                  {HARMONY_TYPES.map(({ type, label, description }) => (
                    <TouchableOpacity
                      key={type}
                      onPress={() => {
                        handlePress();
                        setHarmonyType(type);
                      }}
                      activeOpacity={0.7}
                      className={`px-4 py-3 rounded-xl border ${
                        harmonyType === type
                          ? "bg-primary border-primary"
                          : "bg-surface border-border"
                      }`}
                    >
                      <Text
                        className={`font-semibold ${
                          harmonyType === type ? "text-background" : "text-foreground"
                        }`}
                      >
                        {label}
                      </Text>
                      <Text
                        className={`text-xs ${
                          harmonyType === type ? "text-background/70" : "text-muted"
                        }`}
                      >
                        {description}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Generated Colors */}
            <View className="gap-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-base font-semibold text-foreground">
                  Generated Colors ({harmonyColors.length})
                </Text>
                <TouchableOpacity onPress={copyAllColors} activeOpacity={0.7}>
                  <Text className="text-primary font-semibold">Copy All</Text>
                </TouchableOpacity>
              </View>

              {/* Color Swatches */}
              <View className="flex-row h-24 rounded-2xl overflow-hidden">
                {harmonyColors.map((color, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => copyColor(color)}
                    activeOpacity={0.7}
                    className="flex-1"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </View>

              {/* Color List */}
              <View className="gap-2">
                {harmonyColors.map((color, index) => {
                  const contrast = getContrastRatio(color, "#000000");
                  const wcag = getWcagLevel(contrast);
                  return (
                    <TouchableOpacity
                      key={index}
                      onPress={() => copyColor(color)}
                      activeOpacity={0.7}
                      className="flex-row items-center gap-3 bg-surface rounded-xl p-3 border border-border"
                    >
                      <View
                        className="w-10 h-10 rounded-lg"
                        style={{ backgroundColor: color }}
                      />
                      <Text className="flex-1 text-base font-semibold text-foreground">
                        {color}
                      </Text>
                      <View className={`px-2 py-1 rounded ${
                        wcag.level === "AAA" ? "bg-success/20" :
                        wcag.level === "AA" ? "bg-primary/20" :
                        wcag.level === "A" ? "bg-warning/20" : "bg-error/20"
                      }`}>
                        <Text className={`text-xs font-semibold ${
                          wcag.level === "AAA" ? "text-success" :
                          wcag.level === "AA" ? "text-primary" :
                          wcag.level === "A" ? "text-warning" : "text-error"
                        }`}>
                          {wcag.level}
                        </Text>
                      </View>
                      <IconSymbol name="doc.on.doc" size={16} color={colors.muted} />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Action Buttons */}
            <View className="gap-3">
              <TouchableOpacity
                onPress={() => {
                  handlePress();
                  setPaletteName(`${harmonyType.charAt(0).toUpperCase() + harmonyType.slice(1)} Harmony`);
                  setShowSaveModal(true);
                }}
                activeOpacity={0.7}
                className="bg-primary px-6 py-4 rounded-full"
              >
                <Text className="text-background font-semibold text-center text-base">
                  Save as Palette
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </ScreenContainer>

      {/* Color Picker Modal */}
      <Modal
        visible={showColorPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowColorPicker(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-background rounded-t-3xl p-6 gap-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-xl font-bold text-foreground">Choose Color</Text>
              <TouchableOpacity
                onPress={() => setShowColorPicker(false)}
                activeOpacity={0.7}
                className="w-8 h-8 rounded-full bg-surface items-center justify-center"
              >
                <Text className="text-foreground font-bold">X</Text>
              </TouchableOpacity>
            </View>

            {/* Color Input */}
            <View className="flex-row items-center gap-4">
              <View
                className="w-16 h-16 rounded-2xl"
                style={{ backgroundColor: colorInput }}
              />
              <TextInput
                className="flex-1 bg-surface border border-border rounded-xl px-4 py-3 text-foreground text-base"
                placeholder="#FF6B35"
                placeholderTextColor={colors.muted}
                value={colorInput}
                onChangeText={setColorInput}
                autoCapitalize="characters"
                maxLength={7}
              />
              <TouchableOpacity
                onPress={applyColorInput}
                activeOpacity={0.7}
                className="bg-primary px-4 py-3 rounded-xl"
              >
                <Text className="text-background font-semibold">Apply</Text>
              </TouchableOpacity>
            </View>

            {/* Preset Colors */}
            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">Presets</Text>
              <View className="flex-row flex-wrap gap-2">
                {PRESET_COLORS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    onPress={() => {
                      handlePress();
                      setBaseColor(color);
                      setColorInput(color);
                      setShowColorPicker(false);
                    }}
                    activeOpacity={0.7}
                    className="w-12 h-12 rounded-xl"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Save Palette Modal */}
      <Modal
        visible={showSaveModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSaveModal(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-background rounded-t-3xl p-6 gap-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-xl font-bold text-foreground">Save Palette</Text>
              <TouchableOpacity
                onPress={() => setShowSaveModal(false)}
                activeOpacity={0.7}
                className="w-8 h-8 rounded-full bg-surface items-center justify-center"
              >
                <Text className="text-foreground font-bold">X</Text>
              </TouchableOpacity>
            </View>

            {/* Preview */}
            <View className="flex-row h-16 rounded-xl overflow-hidden">
              {harmonyColors.slice(0, 5).map((color, index) => (
                <View key={index} className="flex-1" style={{ backgroundColor: color }} />
              ))}
            </View>

            <TextInput
              className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground text-base"
              placeholder="Palette name"
              placeholderTextColor={colors.muted}
              value={paletteName}
              onChangeText={setPaletteName}
              autoFocus
            />

            <TouchableOpacity
              onPress={saveToPalette}
              activeOpacity={0.7}
              className="bg-primary px-6 py-4 rounded-full"
            >
              <Text className="text-background font-semibold text-center">Save Palette</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

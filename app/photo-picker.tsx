import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Platform,
  ScrollView,
  ActivityIndicator,
  Modal,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import * as Clipboard from "expo-clipboard";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScreenContainer } from "@/ui-components/screen-container";
import { IconSymbol } from "@/ui-components/ui/icon-symbol";
import { useColors } from "@/ui-hooks/use-colors";
import { getColorFormats } from "@/lib/color-utils";
import {
  extractColorsFromImage,
  type ExtractedColors,
} from "@/lib/color-extraction";
import { MAX_FREE_PALETTES } from "@/bll-services";

const RECENT_COLORS_KEY = "@quickcolor_recent";
const PALETTES_KEY = "@quickcolor_palettes";

interface ToastMessage {
  title: string;
  message: string;
}

export default function PhotoPickerScreen() {
  const colors = useColors();
  const router = useRouter();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [extractedColors, setExtractedColors] =
    useState<ExtractedColors | null>(null);
  const [selectedColor, setSelectedColor] = useState("#FF6B35");
  const [colorFormats, setColorFormats] = useState(getColorFormats("#FF6B35"));
  const [isExtracting, setIsExtracting] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = (title: string, message: string) => {
    setToast({ title, message });
    setTimeout(() => setToast(null), 2500);
  };

  useEffect(() => {
    if (imageUri) {
      handleColorExtraction(imageUri);
    }
  }, [imageUri]);

  const handleColorExtraction = async (uri: string) => {
    setIsExtracting(true);
    try {
      const extracted = await extractColorsFromImage(uri, { quality: "medium" });
      setExtractedColors(extracted);
      selectColor(extracted.dominant);

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error("Error extracting colors:", error);
      showToast("Error", "Failed to extract colors from image");
    } finally {
      setIsExtracting(false);
    }
  };

  const selectColor = (color: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedColor(color);
    setColorFormats(getColorFormats(color));
  };

  const saveColorToRecent = async () => {
    try {
      const stored = await AsyncStorage.getItem(RECENT_COLORS_KEY);
      let recentColors = stored ? JSON.parse(stored) : [];

      recentColors = recentColors.filter((c: string) => c !== selectedColor);
      recentColors.unshift(selectedColor);
      recentColors = recentColors.slice(0, 10);

      await AsyncStorage.setItem(RECENT_COLORS_KEY, JSON.stringify(recentColors));

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      showToast("Saved!", `${selectedColor} saved to recent colors`);
    } catch (error) {
      showToast("Error", "Failed to save color");
    }
  };

  const savePalette = async () => {
    if (!extractedColors) return;

    try {
      const stored = await AsyncStorage.getItem(PALETTES_KEY);
      const palettes = stored ? JSON.parse(stored) : [];

      // Check free tier limit
      if (palettes.length >= MAX_FREE_PALETTES) {
        showToast("Limit Reached", "Upgrade to Pro for unlimited palettes!");
        return;
      }

      const paletteColors = [
        extractedColors.dominant,
        extractedColors.vibrant,
        extractedColors.darkVibrant,
        extractedColors.lightVibrant,
        extractedColors.muted,
      ]
        .filter((c, i, arr) => arr.indexOf(c) === i)
        .slice(0, 5);

      const newPalette = {
        id: Date.now(),
        name: "Photo Palette",
        colors: paletteColors,
        date: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      };

      await AsyncStorage.setItem(
        PALETTES_KEY,
        JSON.stringify([newPalette, ...palettes])
      );

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      showToast(
        "Palette Created!",
        `${paletteColors.length}-color palette extracted from photo`
      );
    } catch (error) {
      showToast("Error", "Failed to create palette");
    }
  };

  const pickImage = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      showToast(
        "Permission needed",
        "Please grant photo library access to pick colors from photos."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setExtractedColors(null);
      setImageUri(result.assets[0].uri);
    }
  };

  const copyToClipboard = async (text: string, format: string) => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    await Clipboard.setStringAsync(text);
    showToast("Copied!", `${format} value copied to clipboard`);
  };

  const getColorLabel = (key: string): string => {
    const labels: Record<string, string> = {
      dominant: "Dominant",
      vibrant: "Vibrant",
      darkVibrant: "Dark Vibrant",
      lightVibrant: "Light Vibrant",
      muted: "Muted",
      darkMuted: "Dark Muted",
      lightMuted: "Light Muted",
    };
    return labels[key] || key;
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Photo Color Picker",
          headerShown: true,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.foreground,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ marginLeft: 8 }}
            >
              <IconSymbol
                name="chevron.left"
                size={24}
                color={colors.foreground}
              />
            </TouchableOpacity>
          ),
        }}
      />
      <ScreenContainer className="p-0">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View className="flex-1">
            {/* Image Display Area */}
            <View className="h-72 bg-surface relative">
              {imageUri ? (
                <Image
                  source={{ uri: imageUri }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="flex-1 items-center justify-center p-6">
                  <IconSymbol name="photo.fill" size={64} color={colors.muted} />
                  <Text className="text-lg text-foreground mt-4 text-center">
                    No photo selected
                  </Text>
                  <Text className="text-sm text-muted mt-2 text-center">
                    Choose a photo to extract its colors
                  </Text>
                </View>
              )}

              {/* Loading Overlay */}
              {isExtracting && (
                <View className="absolute inset-0 bg-black/50 items-center justify-center">
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text className="text-white mt-2 font-semibold">
                    Extracting colors...
                  </Text>
                </View>
              )}
            </View>

            {/* Content Area */}
            <View className="p-6 gap-6">
              {/* Choose Photo Button */}
              <TouchableOpacity
                onPress={pickImage}
                activeOpacity={0.7}
                className="bg-primary px-6 py-4 rounded-full"
              >
                <Text className="text-background font-semibold text-center text-base">
                  {imageUri ? "Change Photo" : "Choose Photo"}
                </Text>
              </TouchableOpacity>

              {/* Extracted Colors Grid */}
              {extractedColors && (
                <View className="gap-4">
                  <Text className="text-base font-semibold text-foreground">
                    Extracted Colors
                  </Text>

                  {/* Color Preview Bar */}
                  <View className="flex-row h-16 rounded-2xl overflow-hidden">
                    {Object.entries(extractedColors)
                      .filter(([_, color]) => color)
                      .slice(0, 5)
                      .map(([key, color]) => (
                        <TouchableOpacity
                          key={key}
                          onPress={() => selectColor(color)}
                          activeOpacity={0.7}
                          className="flex-1"
                          style={{
                            backgroundColor: color,
                            borderWidth: selectedColor === color ? 3 : 0,
                            borderColor: colors.foreground,
                          }}
                        />
                      ))}
                  </View>

                  {/* Color List */}
                  <View className="gap-2">
                    {Object.entries(extractedColors)
                      .filter(([_, color]) => color)
                      .map(([key, color]) => (
                        <TouchableOpacity
                          key={key}
                          onPress={() => selectColor(color)}
                          activeOpacity={0.7}
                          className={`flex-row items-center gap-3 bg-surface rounded-xl p-3 border ${
                            selectedColor === color
                              ? "border-primary"
                              : "border-border"
                          }`}
                        >
                          <View
                            className="w-12 h-12 rounded-lg"
                            style={{ backgroundColor: color }}
                          />
                          <View className="flex-1">
                            <Text className="text-base font-semibold text-foreground">
                              {color.toUpperCase()}
                            </Text>
                            <Text className="text-sm text-muted">
                              {getColorLabel(key)}
                            </Text>
                          </View>
                          <TouchableOpacity
                            onPress={() => copyToClipboard(color, "HEX")}
                            activeOpacity={0.7}
                          >
                            <IconSymbol
                              name="doc.on.doc"
                              size={20}
                              color={colors.muted}
                            />
                          </TouchableOpacity>
                        </TouchableOpacity>
                      ))}
                  </View>
                </View>
              )}

              {/* Selected Color Details */}
              {extractedColors && (
                <View className="gap-4">
                  <Text className="text-base font-semibold text-foreground">
                    Selected Color
                  </Text>
                  <View className="flex-row items-center gap-4 bg-surface rounded-2xl p-4 border border-border">
                    <View
                      className="w-20 h-20 rounded-2xl shadow-lg"
                      style={{ backgroundColor: selectedColor }}
                    />
                    <View className="flex-1 gap-2">
                      <TouchableOpacity
                        onPress={() => copyToClipboard(colorFormats.hex, "HEX")}
                        activeOpacity={0.7}
                        className="flex-row items-center justify-between"
                      >
                        <Text className="text-lg font-bold text-foreground">
                          {colorFormats.hex}
                        </Text>
                        <IconSymbol
                          name="doc.on.doc"
                          size={18}
                          color={colors.muted}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() =>
                          copyToClipboard(colorFormats.rgbString, "RGB")
                        }
                        activeOpacity={0.7}
                        className="flex-row items-center justify-between"
                      >
                        <Text className="text-sm text-muted">
                          {colorFormats.rgbString}
                        </Text>
                        <IconSymbol
                          name="doc.on.doc"
                          size={14}
                          color={colors.muted}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() =>
                          copyToClipboard(colorFormats.hsvString, "HSV")
                        }
                        activeOpacity={0.7}
                        className="flex-row items-center justify-between"
                      >
                        <Text className="text-sm text-muted">
                          {colorFormats.hsvString}
                        </Text>
                        <IconSymbol
                          name="doc.on.doc"
                          size={14}
                          color={colors.muted}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}

              {/* Action Buttons */}
              {extractedColors && (
                <View className="gap-3">
                  <TouchableOpacity
                    onPress={saveColorToRecent}
                    activeOpacity={0.7}
                    className="bg-surface border border-border px-6 py-4 rounded-full"
                  >
                    <Text className="text-foreground font-semibold text-center text-base">
                      Save Selected Color
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={savePalette}
                    activeOpacity={0.7}
                    className="bg-surface border border-primary px-6 py-4 rounded-full"
                  >
                    <Text className="text-primary font-semibold text-center text-base">
                      Save All as Palette
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        {/* Toast Notification */}
        <Modal
          visible={toast !== null}
          transparent
          animationType="fade"
          onRequestClose={() => setToast(null)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setToast(null)}
            style={{
              flex: 1,
              justifyContent: "flex-end",
              paddingBottom: 100,
              paddingHorizontal: 20,
            }}
          >
            <View
              style={{
                backgroundColor: colors.foreground,
                borderRadius: 12,
                padding: 16,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
                elevation: 5,
              }}
            >
              <Text
                style={{
                  color: colors.background,
                  fontSize: 16,
                  fontWeight: "600",
                  marginBottom: 4,
                }}
              >
                {toast?.title}
              </Text>
              <Text
                style={{
                  color: colors.background,
                  fontSize: 14,
                  opacity: 0.8,
                }}
              >
                {toast?.message}
              </Text>
            </View>
          </TouchableOpacity>
        </Modal>
      </ScreenContainer>
    </>
  );
}

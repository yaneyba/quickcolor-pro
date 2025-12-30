import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
  Alert,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import * as Clipboard from "expo-clipboard";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { getColorFormats, hexToRgb, rgbToHsv, hsvToRgb, rgbToHex } from "@/lib/color-utils";

const SCREEN_WIDTH = Dimensions.get("window").width;
const PICKER_SIZE = 100;

// Sample colors to simulate color picking from different positions
const SAMPLE_COLORS = [
  "#FF6B35", "#4ADE80", "#F87171", "#FBBF24", "#0a7ea4",
  "#E879F9", "#38BDF8", "#A78BFA", "#FB923C", "#34D399",
  "#F472B6", "#60A5FA", "#FACC15", "#2DD4BF", "#C084FC",
];

export default function PhotoPickerScreen() {
  const colors = useColors();
  const router = useRouter();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [pickedColor, setPickedColor] = useState("#FF6B35");
  const [colorFormats, setColorFormats] = useState(getColorFormats("#FF6B35"));
  const RECENT_COLORS_KEY = "@quickcolor_recent";
  const PALETTES_KEY = "@quickcolor_palettes";

  const saveColorToRecent = async () => {
    try {
      const stored = await AsyncStorage.getItem(RECENT_COLORS_KEY);
      let recentColors = stored ? JSON.parse(stored) : [];

      // Remove if already exists, then add to front
      recentColors = recentColors.filter((c: string) => c !== pickedColor);
      recentColors.unshift(pickedColor);

      // Keep only last 10
      recentColors = recentColors.slice(0, 10);

      await AsyncStorage.setItem(RECENT_COLORS_KEY, JSON.stringify(recentColors));

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      Alert.alert("Saved!", `${pickedColor} saved to recent colors`);
    } catch (error) {
      Alert.alert("Error", "Failed to save color");
    }
  };

  const extractPalette = async () => {
    // Generate a palette based on the picked color using harmony
    // Since we can't actually read pixels from the image in React Native without native modules,
    // we'll generate a palette using color harmony from the picked color
    const baseColor = pickedColor;
    const rgb = hexToRgb(baseColor);
    const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);

    // Generate analogous + complementary palette
    const palette = [baseColor];

    // Add 2 analogous colors
    for (const offset of [-30, 30]) {
      const newH = (hsv.h + offset + 360) % 360;
      const newRgb = hsvToRgb(newH, hsv.s, hsv.v);
      palette.push(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
    }

    // Add complementary
    const compH = (hsv.h + 180) % 360;
    const compRgb = hsvToRgb(compH, hsv.s, hsv.v);
    palette.push(rgbToHex(compRgb.r, compRgb.g, compRgb.b));

    // Add a lighter/darker variant
    const darkerRgb = hsvToRgb(hsv.h, hsv.s, Math.max(20, hsv.v - 30));
    palette.push(rgbToHex(darkerRgb.r, darkerRgb.g, darkerRgb.b));

    // Save to palettes
    try {
      const stored = await AsyncStorage.getItem(PALETTES_KEY);
      const palettes = stored ? JSON.parse(stored) : [];

      const newPalette = {
        id: Date.now(),
        name: "Photo Palette",
        colors: palette,
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      };

      await AsyncStorage.setItem(PALETTES_KEY, JSON.stringify([newPalette, ...palettes]));

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      Alert.alert("Palette Created!", "5-color palette saved based on your picked color");
    } catch (error) {
      Alert.alert("Error", "Failed to create palette");
    }
  };

  // Track the last position for gesture continuity
  const lastTranslateX = useSharedValue(SCREEN_WIDTH / 2 - PICKER_SIZE / 2);
  const lastTranslateY = useSharedValue(150);
  const translateX = useSharedValue(SCREEN_WIDTH / 2 - PICKER_SIZE / 2);
  const translateY = useSharedValue(150);

  const pickImage = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please grant photo library access to pick colors from photos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  // Simulate picking a color based on position
  const simulateColorPick = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    // Simulate color picking based on position (in production, would sample actual pixel)
    const positionIndex = Math.floor((translateX.value + translateY.value) / 50) % SAMPLE_COLORS.length;
    const newColor = SAMPLE_COLORS[Math.abs(positionIndex)];
    setPickedColor(newColor);
    const formats = getColorFormats(newColor);
    setColorFormats(formats);
  };

  const copyToClipboard = async (text: string, format: string) => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    await Clipboard.setStringAsync(text);
    Alert.alert("Copied!", `${format} value copied to clipboard`);
  };

  const panGesture = Gesture.Pan()
    .onStart(() => {
      lastTranslateX.value = translateX.value;
      lastTranslateY.value = translateY.value;
    })
    .onUpdate((event) => {
      translateX.value = Math.max(
        0,
        Math.min(SCREEN_WIDTH - PICKER_SIZE, lastTranslateX.value + event.translationX)
      );
      translateY.value = Math.max(0, Math.min(400, lastTranslateY.value + event.translationY));
    })
    .onEnd(() => {
      lastTranslateX.value = translateX.value;
      lastTranslateY.value = translateY.value;
      runOnJS(simulateColorPick)();
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: withSpring(translateX.value) },
      { translateY: withSpring(translateY.value) },
    ],
  }));

  return (
    <>
      <Stack.Screen
        options={{
          title: "Photo Picker",
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
      <ScreenContainer className="p-0">
        <View className="flex-1">
          {/* Image Display Area */}
          <View className="flex-1 bg-surface relative">
            {imageUri ? (
              <>
                <Image
                  source={{ uri: imageUri }}
                  className="w-full h-full"
                  resizeMode="contain"
                />
                {/* Draggable Picker Overlay */}
                <GestureDetector gesture={panGesture}>
                  <Animated.View
                    style={[
                      {
                        position: "absolute",
                        width: PICKER_SIZE,
                        height: PICKER_SIZE,
                        borderRadius: PICKER_SIZE / 2,
                        borderWidth: 4,
                        borderColor: colors.foreground,
                        backgroundColor: "rgba(0,0,0,0.3)",
                        justifyContent: "center",
                        alignItems: "center",
                      },
                      animatedStyle,
                    ]}
                  >
                    <View
                      className="w-12 h-12 rounded-full border-2"
                      style={{
                        backgroundColor: pickedColor,
                        borderColor: colors.foreground,
                      }}
                    />
                  </Animated.View>
                </GestureDetector>
              </>
            ) : (
              <View className="flex-1 items-center justify-center p-6">
                <IconSymbol name="photo.fill" size={64} color={colors.muted} />
                <Text className="text-lg text-foreground mt-4 text-center">
                  No photo selected
                </Text>
                <Text className="text-sm text-muted mt-2 text-center">
                  Tap the button below to choose a photo
                </Text>
              </View>
            )}
          </View>

          {/* Bottom Sheet */}
          <View className="bg-surface border-t border-border p-6 gap-4">
            {/* Color Preview with Copy Buttons */}
            <View className="flex-row items-center gap-4">
              <View
                className="w-16 h-16 rounded-2xl shadow-lg"
                style={{ backgroundColor: pickedColor }}
              />
              <View className="flex-1 gap-1">
                <TouchableOpacity
                  onPress={() => copyToClipboard(colorFormats.hex, "HEX")}
                  activeOpacity={0.7}
                  className="flex-row items-center justify-between"
                >
                  <Text className="text-lg font-bold text-foreground">{colorFormats.hex}</Text>
                  <IconSymbol name="doc.on.doc" size={18} color={colors.muted} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => copyToClipboard(colorFormats.rgbString, "RGB")}
                  activeOpacity={0.7}
                  className="flex-row items-center justify-between"
                >
                  <Text className="text-sm text-muted">{colorFormats.rgbString}</Text>
                  <IconSymbol name="doc.on.doc" size={14} color={colors.muted} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => copyToClipboard(colorFormats.hsvString, "HSV")}
                  activeOpacity={0.7}
                  className="flex-row items-center justify-between"
                >
                  <Text className="text-sm text-muted">{colorFormats.hsvString}</Text>
                  <IconSymbol name="doc.on.doc" size={14} color={colors.muted} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Action Buttons */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={pickImage}
                activeOpacity={0.7}
                className="flex-1 bg-primary px-4 py-3 rounded-full"
              >
                <Text className="text-background font-semibold text-center">
                  {imageUri ? "Change Photo" : "Choose Photo"}
                </Text>
              </TouchableOpacity>
              {imageUri && (
                <TouchableOpacity
                  onPress={saveColorToRecent}
                  activeOpacity={0.7}
                  className="flex-1 bg-surface border border-border px-4 py-3 rounded-full"
                >
                  <Text className="text-foreground font-semibold text-center">Save Color</Text>
                </TouchableOpacity>
              )}
            </View>

            {imageUri && (
              <TouchableOpacity
                onPress={extractPalette}
                activeOpacity={0.7}
                className="bg-surface border border-primary px-4 py-3 rounded-full"
              >
                <Text className="text-primary font-semibold text-center">Extract Palette</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScreenContainer>
    </>
  );
}

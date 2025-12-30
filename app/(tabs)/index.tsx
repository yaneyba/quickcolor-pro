import { useState, useEffect } from "react";
import { ScrollView, Text, View, TouchableOpacity, Platform, Alert } from "react-native";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useRecentColors, useColorService } from "@/hooks";
import { getColorFormats } from "@/lib/color-utils";

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();

  // Use service hooks instead of direct AsyncStorage
  const { colors: recentColors, loading } = useRecentColors();
  const { copyToClipboard } = useColorService();

  const [selectedColor, setSelectedColor] = useState("#FF6B35");
  const [colorFormats, setColorFormats] = useState(getColorFormats("#FF6B35"));

  // Update selected color when recent colors load
  useEffect(() => {
    if (recentColors.length > 0 && selectedColor === "#FF6B35") {
      setSelectedColor(recentColors[0]);
      setColorFormats(getColorFormats(recentColors[0]));
    }
  }, [recentColors]);

  const handlePress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const navigateToScreenPicker = () => {
    handlePress();
    Alert.alert(
      "Coming Soon",
      "Screen Picker will be available in a future update. This feature will allow you to pick colors directly from anywhere on your screen.",
      [{ text: "OK" }]
    );
  };

  const navigateToPhotoPicker = () => {
    handlePress();
    router.push("/photo-picker" as any);
  };

  const navigateToGradientGenerator = () => {
    handlePress();
    router.push("/gradient-generator" as any);
  };

  const navigateToColorHarmony = () => {
    handlePress();
    router.push("/color-harmony" as any);
  };

  const selectRecentColor = (color: string) => {
    handlePress();
    setSelectedColor(color);
    setColorFormats(getColorFormats(color));
  };

  const handleCopyToClipboard = async (text: string, format: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      Alert.alert("Copied!", `${format} value copied to clipboard`);
    }
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-6">
          {/* Hero Section */}
          <View className="items-center gap-3 pt-4">
            <Text className="text-3xl font-bold text-foreground">QuickColor Pro</Text>
            <Text className="text-sm text-muted text-center">
              Professional color picker for designers & developers
            </Text>
          </View>

          {/* Color Preview Circle */}
          <View className="items-center py-6">
            <TouchableOpacity
              onPress={() => handleCopyToClipboard(colorFormats.hex, "HEX")}
              activeOpacity={0.8}
            >
              <View
                className="w-32 h-32 rounded-full shadow-lg"
                style={{ backgroundColor: selectedColor }}
              />
            </TouchableOpacity>
            <View className="mt-4 items-center gap-1">
              <TouchableOpacity onPress={() => handleCopyToClipboard(colorFormats.hex, "HEX")}>
                <Text className="text-xl font-bold text-foreground">{colorFormats.hex}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleCopyToClipboard(colorFormats.rgbString, "RGB")}>
                <Text className="text-sm text-muted">{colorFormats.rgbString}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleCopyToClipboard(colorFormats.hsvString, "HSV")}>
                <Text className="text-sm text-muted">{colorFormats.hsvString}</Text>
              </TouchableOpacity>
              <Text className="text-xs text-muted mt-1">Tap values to copy</Text>
            </View>
          </View>

          {/* Action Cards */}
          <View className="gap-4">
            {/* Screen Picker Card - Coming Soon */}
            <TouchableOpacity
              onPress={navigateToScreenPicker}
              activeOpacity={0.7}
              className="bg-surface rounded-2xl p-6 border border-border"
            >
              <View className="flex-row items-center gap-4">
                <View className="w-12 h-12 rounded-full bg-muted/20 items-center justify-center">
                  <IconSymbol name="eyedropper" size={24} color={colors.muted} />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-lg font-semibold text-foreground">Screen Picker</Text>
                    <View className="bg-muted/20 px-2 py-0.5 rounded">
                      <Text className="text-xs text-muted">Coming Soon</Text>
                    </View>
                  </View>
                  <Text className="text-sm text-muted">Pick colors from your screen</Text>
                </View>
                <IconSymbol name="chevron.right" size={20} color={colors.muted} />
              </View>
            </TouchableOpacity>

            {/* Photo Picker Card */}
            <TouchableOpacity
              onPress={navigateToPhotoPicker}
              activeOpacity={0.7}
              className="bg-surface rounded-2xl p-6 border border-border"
            >
              <View className="flex-row items-center gap-4">
                <View className="w-12 h-12 rounded-full bg-primary/20 items-center justify-center">
                  <IconSymbol name="photo.fill" size={24} color={colors.primary} />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-foreground">Photo Picker</Text>
                  <Text className="text-sm text-muted">Extract colors from photos</Text>
                </View>
                <IconSymbol name="chevron.right" size={20} color={colors.muted} />
              </View>
            </TouchableOpacity>

            {/* Gradient Generator Card */}
            <TouchableOpacity
              onPress={navigateToGradientGenerator}
              activeOpacity={0.7}
              className="bg-surface rounded-2xl p-6 border border-border"
            >
              <View className="flex-row items-center gap-4">
                <View className="w-12 h-12 rounded-full bg-primary/20 items-center justify-center">
                  <IconSymbol name="paintbrush.fill" size={24} color={colors.primary} />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-foreground">Gradient Generator</Text>
                  <Text className="text-sm text-muted">Create beautiful gradients</Text>
                </View>
                <IconSymbol name="chevron.right" size={20} color={colors.muted} />
              </View>
            </TouchableOpacity>

            {/* Color Harmony Card */}
            <TouchableOpacity
              onPress={navigateToColorHarmony}
              activeOpacity={0.7}
              className="bg-surface rounded-2xl p-6 border border-border"
            >
              <View className="flex-row items-center gap-4">
                <View className="w-12 h-12 rounded-full bg-primary/20 items-center justify-center">
                  <IconSymbol name="wand.and.stars" size={24} color={colors.primary} />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-foreground">Color Harmony</Text>
                  <Text className="text-sm text-muted">Generate color schemes</Text>
                </View>
                <IconSymbol name="chevron.right" size={20} color={colors.muted} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Recent Colors */}
          <View className="gap-3">
            <Text className="text-base font-semibold text-foreground">Recent Colors</Text>
            {loading ? (
              <Text className="text-sm text-muted">Loading...</Text>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-3">
                  {recentColors.map((color, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => selectRecentColor(color)}
                      onLongPress={() => handleCopyToClipboard(color, "HEX")}
                      activeOpacity={0.7}
                      className="items-center gap-2"
                    >
                      <View
                        className={`w-16 h-16 rounded-2xl shadow-sm ${
                          selectedColor === color ? "border-2 border-primary" : ""
                        }`}
                        style={{ backgroundColor: color }}
                      />
                      <Text className="text-xs text-muted">{color}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            )}
            <Text className="text-xs text-muted text-center">
              Tap to preview - Long press to copy
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

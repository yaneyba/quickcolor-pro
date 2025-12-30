import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  TextInput,
  Modal,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import * as Clipboard from "expo-clipboard";
import { ScreenContainer } from "@/ui-components/screen-container";
import { IconSymbol } from "@/ui-components/ui/icon-symbol";
import { ComingSoonModal } from "@/ui-components/coming-soon-modal";
import { ToastModal } from "@/ui-components/toast-modal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColors } from "@/ui-hooks/use-colors";

const PALETTES_KEY = "@quickcolor_palettes";

type GradientType = "linear" | "radial" | "angular";

// Preset colors for color picker
const PRESET_COLORS = [
  "#FF6B35", "#4ADE80", "#F87171", "#FBBF24", "#0a7ea4",
  "#E879F9", "#38BDF8", "#A78BFA", "#FB923C", "#34D399",
  "#F472B6", "#60A5FA", "#FACC15", "#2DD4BF", "#C084FC",
  "#EF4444", "#22C55E", "#3B82F6", "#8B5CF6", "#EC4899",
];

export default function GradientGeneratorScreen() {
  const colors = useColors();
  const router = useRouter();
  const [gradientType, setGradientType] = useState<GradientType>("linear");
  const [colorStops, setColorStops] = useState(["#FF6B35", "#4ADE80"]);
  const [angle, setAngle] = useState(90);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [colorInput, setColorInput] = useState("");
  const [comingSoon, setComingSoon] = useState<{
    visible: boolean;
    feature: string;
    description: string;
    icon: string;
  }>({ visible: false, feature: "", description: "", icon: "sparkles" });

  // Toast state
  const [toast, setToast] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "info";
  }>({ visible: false, title: "", message: "", type: "success" });

  const showToast = (title: string, message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ visible: true, title, message, type });
  };

  const handlePress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const addColorStop = () => {
    if (colorStops.length >= 5) {
      showToast("Limit Reached", "Maximum 5 color stops allowed", "info");
      return;
    }
    handlePress();
    setColorStops([...colorStops, "#FFFFFF"]);
  };

  const removeColorStop = (index: number) => {
    if (colorStops.length <= 2) {
      showToast("Minimum Required", "At least 2 color stops required", "info");
      return;
    }
    handlePress();
    setColorStops(colorStops.filter((_, i) => i !== index));
  };

  const showComingSoon = (feature: string, description: string, icon: string = "sparkles") => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setComingSoon({ visible: true, feature, description, icon });
  };

  const exportGradient = () => {
    showComingSoon(
      "PNG Export",
      "Export your gradients as high-quality PNG images. Perfect for wallpapers and design assets.",
      "square.and.arrow.up"
    );
  };

  const saveTopalette = async () => {
    try {
      const stored = await AsyncStorage.getItem(PALETTES_KEY);
      const palettes = stored ? JSON.parse(stored) : [];

      const newPalette = {
        id: Date.now(),
        name: "Gradient Palette",
        colors: colorStops.slice(0, 5), // Max 5 colors
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      };

      await AsyncStorage.setItem(PALETTES_KEY, JSON.stringify([newPalette, ...palettes]));

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      showToast("Saved!", "Gradient colors saved to palettes");
    } catch (error) {
      showToast("Error", "Failed to save palette", "error");
    }
  };

  const openColorEditor = (index: number) => {
    handlePress();
    setEditingIndex(index);
    setColorInput(colorStops[index]);
  };

  const updateColor = (newColor: string) => {
    if (editingIndex === null) return;
    // Validate hex color
    const hexRegex = /^#[0-9A-Fa-f]{6}$/;
    if (!hexRegex.test(newColor)) {
      showToast("Invalid Color", "Please enter a valid HEX color (e.g., #FF6B35)", "error");
      return;
    }
    handlePress();
    const newStops = [...colorStops];
    newStops[editingIndex] = newColor.toUpperCase();
    setColorStops(newStops);
    setEditingIndex(null);
    setColorInput("");
  };

  const selectPresetColor = (color: string) => {
    if (editingIndex === null) return;
    handlePress();
    const newStops = [...colorStops];
    newStops[editingIndex] = color;
    setColorStops(newStops);
    setEditingIndex(null);
    setColorInput("");
  };

  const copyGradientCSS = async () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    const css = `background: linear-gradient(${angle}deg, ${colorStops.join(", ")});`;
    await Clipboard.setStringAsync(css);
    showToast("Copied!", "CSS gradient code copied to clipboard");
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Gradient Generator",
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
            {/* Gradient Preview */}
            <View className="w-full h-64 rounded-2xl overflow-hidden">
              <LinearGradient
                colors={colorStops as [string, string, ...string[]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ flex: 1 }}
              />
            </View>

            {/* Gradient Type Selector */}
            <View className="gap-3">
              <Text className="text-base font-semibold text-foreground">Gradient Type</Text>
              <View className="flex-row gap-3">
                {(["linear", "radial", "angular"] as GradientType[]).map((type) => (
                  <TouchableOpacity
                    key={type}
                    onPress={() => {
                      handlePress();
                      setGradientType(type);
                    }}
                    activeOpacity={0.7}
                    className={`flex-1 px-4 py-3 rounded-full border ${
                      gradientType === type
                        ? "bg-primary border-primary"
                        : "bg-surface border-border"
                    }`}
                  >
                    <Text
                      className={`text-center font-semibold capitalize ${
                        gradientType === type ? "text-background" : "text-foreground"
                      }`}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Color Stops */}
            <View className="gap-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-base font-semibold text-foreground">Color Stops</Text>
                <TouchableOpacity
                  onPress={addColorStop}
                  activeOpacity={0.7}
                  className="w-8 h-8 rounded-full bg-primary items-center justify-center"
                >
                  <Text className="text-background font-bold">+</Text>
                </TouchableOpacity>
              </View>
              <View className="gap-3">
                {colorStops.map((color, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => openColorEditor(index)}
                    activeOpacity={0.7}
                    className="flex-row items-center gap-3 bg-surface rounded-2xl p-4 border border-border"
                  >
                    <View
                      className="w-12 h-12 rounded-xl"
                      style={{ backgroundColor: color }}
                    />
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-foreground">{color}</Text>
                      <Text className="text-sm text-muted">Stop {index + 1} - Tap to edit</Text>
                    </View>
                    {colorStops.length > 2 && (
                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation();
                          removeColorStop(index);
                        }}
                        activeOpacity={0.7}
                        className="w-8 h-8 rounded-full bg-error/20 items-center justify-center"
                      >
                        <Text className="text-error font-bold">x</Text>
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Angle Control (Linear only) */}
            {gradientType === "linear" && (
              <View className="gap-3">
                <Text className="text-base font-semibold text-foreground">
                  Angle: {angle}deg
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                    <TouchableOpacity
                      key={deg}
                      onPress={() => {
                        handlePress();
                        setAngle(deg);
                      }}
                      activeOpacity={0.7}
                      className={`px-4 py-2 rounded-full border ${
                        angle === deg
                          ? "bg-primary border-primary"
                          : "bg-surface border-border"
                      }`}
                    >
                      <Text
                        className={`text-sm font-medium ${
                          angle === deg ? "text-background" : "text-foreground"
                        }`}
                      >
                        {deg}deg
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Action Buttons */}
            <View className="gap-3">
              <TouchableOpacity
                onPress={exportGradient}
                activeOpacity={0.7}
                className="bg-primary px-6 py-4 rounded-full"
              >
                <Text className="text-background font-semibold text-center text-base">
                  Export as PNG
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={saveTopalette}
                activeOpacity={0.7}
                className="bg-surface border border-border px-6 py-4 rounded-full"
              >
                <Text className="text-foreground font-semibold text-center text-base">
                  Save to Palette
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={copyGradientCSS}
                activeOpacity={0.7}
                className="bg-surface border border-primary px-6 py-4 rounded-full"
              >
                <Text className="text-primary font-semibold text-center text-base">
                  Copy CSS Code
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </ScreenContainer>

      {/* Color Editor Modal */}
      <Modal
        visible={editingIndex !== null}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setEditingIndex(null)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-background rounded-t-3xl p-6 gap-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-xl font-bold text-foreground">Edit Color</Text>
              <TouchableOpacity
                onPress={() => setEditingIndex(null)}
                activeOpacity={0.7}
                className="w-8 h-8 rounded-full bg-surface items-center justify-center"
              >
                <Text className="text-foreground font-bold">X</Text>
              </TouchableOpacity>
            </View>

            {/* Color Preview */}
            <View className="flex-row items-center gap-4">
              <View
                className="w-16 h-16 rounded-2xl"
                style={{ backgroundColor: colorInput || "#FFFFFF" }}
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
                onPress={() => updateColor(colorInput)}
                activeOpacity={0.7}
                className="bg-primary px-4 py-3 rounded-xl"
              >
                <Text className="text-background font-semibold">Apply</Text>
              </TouchableOpacity>
            </View>

            {/* Preset Colors */}
            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">Preset Colors</Text>
              <View className="flex-row flex-wrap gap-2">
                {PRESET_COLORS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    onPress={() => selectPresetColor(color)}
                    activeOpacity={0.7}
                    className="w-10 h-10 rounded-xl"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Coming Soon Modal */}
      <ComingSoonModal
        visible={comingSoon.visible}
        onClose={() => setComingSoon({ ...comingSoon, visible: false })}
        featureName={comingSoon.feature}
        description={comingSoon.description}
        icon={comingSoon.icon}
      />

      {/* Toast Modal */}
      <ToastModal
        visible={toast.visible}
        onClose={() => setToast({ ...toast, visible: false })}
        title={toast.title}
        message={toast.message}
        type={toast.type}
      />
    </>
  );
}

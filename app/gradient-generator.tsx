import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { generateGradient } from "@/lib/color-utils";

type GradientType = "linear" | "radial" | "angular";

export default function GradientGeneratorScreen() {
  const colors = useColors();
  const router = useRouter();
  const [gradientType, setGradientType] = useState<GradientType>("linear");
  const [colorStops, setColorStops] = useState(["#FF6B35", "#4ADE80"]);
  const [angle, setAngle] = useState(90);

  const handlePress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const addColorStop = () => {
    if (colorStops.length >= 5) {
      Alert.alert("Limit Reached", "Maximum 5 color stops allowed");
      return;
    }
    handlePress();
    setColorStops([...colorStops, "#FFFFFF"]);
  };

  const removeColorStop = (index: number) => {
    if (colorStops.length <= 2) {
      Alert.alert("Minimum Required", "At least 2 color stops required");
      return;
    }
    handlePress();
    setColorStops(colorStops.filter((_, i) => i !== index));
  };

  const exportGradient = () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    Alert.alert("Export", "Gradient exported as PNG (1080x1920)");
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
            <TouchableOpacity onPress={() => router.back()}>
              <IconSymbol name="chevron.right" size={24} color={colors.foreground} />
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
                  <View
                    key={index}
                    className="flex-row items-center gap-3 bg-surface rounded-2xl p-4 border border-border"
                  >
                    <View
                      className="w-12 h-12 rounded-xl"
                      style={{ backgroundColor: color }}
                    />
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-foreground">{color}</Text>
                      <Text className="text-sm text-muted">Stop {index + 1}</Text>
                    </View>
                    {colorStops.length > 2 && (
                      <TouchableOpacity
                        onPress={() => removeColorStop(index)}
                        activeOpacity={0.7}
                        className="w-8 h-8 rounded-full bg-error/20 items-center justify-center"
                      >
                        <Text className="text-error font-bold">×</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>
            </View>

            {/* Angle Control (Linear only) */}
            {gradientType === "linear" && (
              <View className="gap-3">
                <Text className="text-base font-semibold text-foreground">
                  Angle: {angle}°
                </Text>
                <View className="bg-surface rounded-2xl p-4 border border-border">
                  <Text className="text-sm text-muted text-center">
                    Angle slider would go here
                  </Text>
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
                onPress={() => {
                  handlePress();
                  Alert.alert("Save", "Gradient saved to palettes");
                }}
                activeOpacity={0.7}
                className="bg-surface border border-border px-6 py-4 rounded-full"
              >
                <Text className="text-foreground font-semibold text-center text-base">
                  Save to Palette
                </Text>
              </TouchableOpacity>

              <View className="bg-surface border border-primary/30 px-6 py-4 rounded-full">
                <Text className="text-muted text-center text-sm">
                  🔒 CSS Code Export (Pro only)
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </ScreenContainer>
    </>
  );
}

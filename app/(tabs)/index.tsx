import { ScrollView, Text, View, TouchableOpacity, Platform } from "react-native";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();

  const handlePress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const navigateToPhotoPicker = () => {
    handlePress();
    router.push("/photo-picker" as any);
  };

  const navigateToGradientGenerator = () => {
    handlePress();
    router.push("/gradient-generator" as any);
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
            <View className="w-32 h-32 rounded-full bg-primary shadow-lg" />
            <View className="mt-4 items-center gap-1">
              <Text className="text-xl font-bold text-foreground">#FF6B35</Text>
              <Text className="text-sm text-muted">rgb(255, 107, 53)</Text>
              <Text className="text-sm text-muted">hsv(19°, 79%, 100%)</Text>
            </View>
          </View>

          {/* Action Cards */}
          <View className="gap-4">
            {/* Screen Picker Card */}
            <TouchableOpacity
              onPress={handlePress}
              activeOpacity={0.7}
              className="bg-surface rounded-2xl p-6 border border-border"
            >
              <View className="flex-row items-center gap-4">
                <View className="w-12 h-12 rounded-full bg-primary/20 items-center justify-center">
                  <IconSymbol name="house.fill" size={24} color={colors.primary} />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-foreground">Screen Picker</Text>
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
                  <IconSymbol name="house.fill" size={24} color={colors.primary} />
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
                  <IconSymbol name="house.fill" size={24} color={colors.primary} />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-foreground">Gradient Generator</Text>
                  <Text className="text-sm text-muted">Create beautiful gradients</Text>
                </View>
                <IconSymbol name="chevron.right" size={20} color={colors.muted} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Recent Colors */}
          <View className="gap-3">
            <Text className="text-base font-semibold text-foreground">Recent Colors</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-3">
                {["#FF6B35", "#4ADE80", "#F87171", "#FBBF24", "#0a7ea4"].map((color, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={handlePress}
                    activeOpacity={0.7}
                    className="items-center gap-2"
                  >
                    <View
                      className="w-16 h-16 rounded-2xl shadow-sm"
                      style={{ backgroundColor: color }}
                    />
                    <Text className="text-xs text-muted">{color}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

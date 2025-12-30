import { ScrollView, Text, View, TouchableOpacity, Platform } from "react-native";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

export default function PalettesScreen() {
  const colors = useColors();

  const handlePress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  // Mock palette data
  const palettes = [
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

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-6">
          {/* Header */}
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-3xl font-bold text-foreground">Palettes</Text>
              <Text className="text-sm text-muted mt-1">{palettes.length} of 5 saved</Text>
            </View>
            <TouchableOpacity
              onPress={handlePress}
              activeOpacity={0.7}
              className="w-12 h-12 rounded-full bg-primary items-center justify-center"
            >
              <Text className="text-2xl text-background font-bold">+</Text>
            </TouchableOpacity>
          </View>

          {/* Palettes Grid */}
          <View className="gap-4">
            {palettes.map((palette) => (
              <TouchableOpacity
                key={palette.id}
                onPress={handlePress}
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
                  <Text className="text-xs text-muted">{palette.date}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Free Tier Notice */}
          <View className="bg-surface rounded-2xl p-4 border border-border">
            <Text className="text-sm text-muted text-center">
              Free tier: 5 palettes max • Upgrade to Pro for unlimited
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
  );
}

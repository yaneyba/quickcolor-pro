import { ScrollView, Text, View, TouchableOpacity, Switch, Platform } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/ui-components/screen-container";
import { IconSymbol } from "@/ui-components/ui/icon-symbol";
import { useColors } from "@/ui-hooks/use-colors";
import { useSettings } from "@/ui-hooks";
import { ComingSoonModal } from "@/ui-components/coming-soon-modal";

export default function SettingsScreen() {
  const colors = useColors();
  const router = useRouter();

  // Use settings service hook instead of local state
  const { settings, toggleHaptic, toggleAutoSave, loading } = useSettings();

  const [comingSoon, setComingSoon] = useState<{
    visible: boolean;
    feature: string;
    description: string;
    icon: string;
  }>({ visible: false, feature: "", description: "", icon: "sparkles" });

  const showComingSoon = (feature: string, description: string, icon: string = "sparkles") => {
    if (Platform.OS !== "web" && settings.hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setComingSoon({ visible: true, feature, description, icon });
  };

  const handlePress = () => {
    if (Platform.OS !== "web" && settings.hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleHapticToggle = async (value: boolean) => {
    if (Platform.OS !== "web" && value) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    await toggleHaptic();
  };

  const handleAutoSaveToggle = async (value: boolean) => {
    if (Platform.OS !== "web" && settings.hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    await toggleAutoSave();
  };

  if (loading) {
    return (
      <ScreenContainer className="p-6">
        <View className="flex-1 items-center justify-center">
          <Text className="text-muted">Loading settings...</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-6">
          {/* Header */}
          <View>
            <Text className="text-3xl font-bold text-foreground">Settings</Text>
            <Text className="text-sm text-muted mt-1">Customize your experience</Text>
          </View>

          {/* App Settings Section */}
          <View className="gap-3">
            <Text className="text-base font-semibold text-foreground">App Settings</Text>

            {/* Default Color Format */}
            <View className="bg-surface rounded-2xl p-4 border border-border">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-base text-foreground">Default Color Format</Text>
                  <Text className="text-sm text-muted mt-1">
                    {settings.defaultColorFormat.toUpperCase()}
                  </Text>
                </View>
                <IconSymbol name="chevron.right" size={20} color={colors.muted} />
              </View>
            </View>

            {/* Haptic Feedback */}
            <View className="bg-surface rounded-2xl p-4 border border-border">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-base text-foreground">Haptic Feedback</Text>
                  <Text className="text-sm text-muted mt-1">Vibrate on interactions</Text>
                </View>
                <Switch
                  value={settings.hapticEnabled}
                  onValueChange={handleHapticToggle}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.background}
                />
              </View>
            </View>

            {/* Auto-save Colors */}
            <View className="bg-surface rounded-2xl p-4 border border-border">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-base text-foreground">Auto-save Colors</Text>
                  <Text className="text-sm text-muted mt-1">Save picked colors automatically</Text>
                </View>
                <Switch
                  value={settings.autoSave}
                  onValueChange={handleAutoSaveToggle}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.background}
                />
              </View>
            </View>
          </View>

          {/* Pro Upgrade Section */}
          <View className="gap-3">
            <Text className="text-base font-semibold text-foreground">Upgrade</Text>
            <View className="bg-primary/10 rounded-2xl p-6 border border-primary/30">
              <Text className="text-xl font-bold text-primary mb-2">QuickColor Pro</Text>
              <Text className="text-sm text-foreground mb-4">
                Unlock all features for a one-time payment of $2.99
              </Text>
              <View className="gap-2 mb-4">
                <View className="flex-row items-center gap-2">
                  <Text className="text-success">✓</Text>
                  <Text className="text-sm text-foreground">Ad-free experience</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Text className="text-success">✓</Text>
                  <Text className="text-sm text-foreground">Unlimited palettes</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Text className="text-success">✓</Text>
                  <Text className="text-sm text-foreground">SVG export</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Text className="text-success">✓</Text>
                  <Text className="text-sm text-foreground">CSS gradient code</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() =>
                  showComingSoon(
                    "Pro Upgrade",
                    "Unlock unlimited palettes, remove ads, and get premium export features. One-time payment of $2.99.",
                    "star"
                  )
                }
                activeOpacity={0.7}
                className="bg-primary px-6 py-3 rounded-full"
              >
                <Text className="text-background font-semibold text-center">Upgrade Now</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* About Section */}
          <View className="gap-3">
            <Text className="text-base font-semibold text-foreground">About</Text>

            <TouchableOpacity
              onPress={handlePress}
              activeOpacity={0.7}
              className="bg-surface rounded-2xl p-4 border border-border"
            >
              <View className="flex-row items-center justify-between">
                <Text className="text-base text-foreground">App Version</Text>
                <Text className="text-sm text-muted">1.0.0</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handlePress}
              activeOpacity={0.7}
              className="bg-surface rounded-2xl p-4 border border-border"
            >
              <View className="flex-row items-center justify-between">
                <Text className="text-base text-foreground">Rate App</Text>
                <IconSymbol name="chevron.right" size={20} color={colors.muted} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                handlePress();
                router.push("/privacy-policy");
              }}
              activeOpacity={0.7}
              className="bg-surface rounded-2xl p-4 border border-border"
            >
              <View className="flex-row items-center justify-between">
                <Text className="text-base text-foreground">Privacy Policy</Text>
                <IconSymbol name="chevron.right" size={20} color={colors.muted} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Ad Banner Placeholder (Free Tier) */}
          <View className="bg-surface rounded-2xl p-4 border border-border items-center">
            <Text className="text-xs text-muted">Advertisement</Text>
            <Text className="text-sm text-muted mt-2">Banner Ad Placeholder</Text>
          </View>
        </View>
      </ScrollView>

      {/* Coming Soon Modal */}
      <ComingSoonModal
        visible={comingSoon.visible}
        onClose={() => setComingSoon({ ...comingSoon, visible: false })}
        featureName={comingSoon.feature}
        description={comingSoon.description}
        icon={comingSoon.icon}
      />
    </ScreenContainer>
  );
}

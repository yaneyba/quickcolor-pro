import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/ui-components/screen-container";
import { IconSymbol } from "@/ui-components/ui/icon-symbol";
import { useColors } from "@/ui-hooks/use-colors";

export default function PrivacyPolicyScreen() {
  const colors = useColors();
  const router = useRouter();

  return (
    <ScreenContainer className="p-6">
      {/* Header with Back Button */}
      <View className="flex-row items-center gap-3 mb-6">
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.7}
          className="w-10 h-10 bg-surface rounded-full items-center justify-center border border-border"
        >
          <IconSymbol name="chevron.left" size={20} color={colors.foreground} />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-foreground">Privacy Policy</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="gap-6">
          {/* Last Updated */}
          <Text className="text-sm text-muted">Last updated: December 30, 2025</Text>

          {/* Introduction */}
          <View className="gap-2">
            <Text className="text-lg font-semibold text-foreground">Introduction</Text>
            <Text className="text-sm text-muted leading-5">
              QuickColor Pro ("we", "our", or "us") is committed to protecting your privacy.
              This Privacy Policy explains how we collect, use, and safeguard your information
              when you use our mobile application.
            </Text>
          </View>

          {/* Information We Collect */}
          <View className="gap-2">
            <Text className="text-lg font-semibold text-foreground">Information We Collect</Text>
            <Text className="text-sm text-muted leading-5">
              QuickColor Pro is designed with privacy in mind. We collect minimal data:
            </Text>
            <View className="gap-2 mt-2">
              <View className="flex-row gap-2">
                <Text className="text-primary">•</Text>
                <Text className="text-sm text-muted leading-5 flex-1">
                  <Text className="text-foreground font-medium">Local Storage:</Text> Your color
                  palettes, preferences, and settings are stored locally on your device using
                  AsyncStorage. This data never leaves your device.
                </Text>
              </View>
              <View className="flex-row gap-2">
                <Text className="text-primary">•</Text>
                <Text className="text-sm text-muted leading-5 flex-1">
                  <Text className="text-foreground font-medium">Photos:</Text> When you use the
                  photo color picker feature, images are processed entirely on your device. We
                  do not upload, store, or transmit your photos to any server.
                </Text>
              </View>
              <View className="flex-row gap-2">
                <Text className="text-primary">•</Text>
                <Text className="text-sm text-muted leading-5 flex-1">
                  <Text className="text-foreground font-medium">Analytics:</Text> We may collect
                  anonymous usage analytics to improve app performance. This data cannot be used
                  to identify you personally.
                </Text>
              </View>
            </View>
          </View>

          {/* How We Use Your Information */}
          <View className="gap-2">
            <Text className="text-lg font-semibold text-foreground">How We Use Your Information</Text>
            <Text className="text-sm text-muted leading-5">
              The limited information we collect is used to:
            </Text>
            <View className="gap-2 mt-2">
              <View className="flex-row gap-2">
                <Text className="text-primary">•</Text>
                <Text className="text-sm text-muted leading-5 flex-1">
                  Provide and maintain the app's functionality
                </Text>
              </View>
              <View className="flex-row gap-2">
                <Text className="text-primary">•</Text>
                <Text className="text-sm text-muted leading-5 flex-1">
                  Improve user experience and app performance
                </Text>
              </View>
              <View className="flex-row gap-2">
                <Text className="text-primary">•</Text>
                <Text className="text-sm text-muted leading-5 flex-1">
                  Process in-app purchases (handled securely by Google Play)
                </Text>
              </View>
            </View>
          </View>

          {/* Third-Party Services */}
          <View className="gap-2">
            <Text className="text-lg font-semibold text-foreground">Third-Party Services</Text>
            <Text className="text-sm text-muted leading-5">
              Our app may use the following third-party services:
            </Text>
            <View className="gap-2 mt-2">
              <View className="flex-row gap-2">
                <Text className="text-primary">•</Text>
                <Text className="text-sm text-muted leading-5 flex-1">
                  <Text className="text-foreground font-medium">Google Play Services:</Text> For
                  app distribution and in-app purchases
                </Text>
              </View>
              <View className="flex-row gap-2">
                <Text className="text-primary">•</Text>
                <Text className="text-sm text-muted leading-5 flex-1">
                  <Text className="text-foreground font-medium">Google AdMob:</Text> For displaying
                  advertisements in the free version. AdMob may collect device information for
                  personalized ads. You can opt out of personalized advertising in your device settings.
                </Text>
              </View>
              <View className="flex-row gap-2">
                <Text className="text-primary">•</Text>
                <Text className="text-sm text-muted leading-5 flex-1">
                  <Text className="text-foreground font-medium">Expo:</Text> For app updates and
                  crash reporting
                </Text>
              </View>
            </View>
          </View>

          {/* Data Security */}
          <View className="gap-2">
            <Text className="text-lg font-semibold text-foreground">Data Security</Text>
            <Text className="text-sm text-muted leading-5">
              We prioritize the security of your data. Since most data is stored locally on your
              device, you have full control over it. We recommend keeping your device secure with
              a screen lock and keeping your operating system updated.
            </Text>
          </View>

          {/* Children's Privacy */}
          <View className="gap-2">
            <Text className="text-lg font-semibold text-foreground">Children's Privacy</Text>
            <Text className="text-sm text-muted leading-5">
              Our app is suitable for all ages. We do not knowingly collect personal information
              from children under 13. If you believe we have collected such information, please
              contact us immediately.
            </Text>
          </View>

          {/* Your Rights */}
          <View className="gap-2">
            <Text className="text-lg font-semibold text-foreground">Your Rights</Text>
            <Text className="text-sm text-muted leading-5">
              You have the right to:
            </Text>
            <View className="gap-2 mt-2">
              <View className="flex-row gap-2">
                <Text className="text-primary">•</Text>
                <Text className="text-sm text-muted leading-5 flex-1">
                  Delete all your local data by uninstalling the app
                </Text>
              </View>
              <View className="flex-row gap-2">
                <Text className="text-primary">•</Text>
                <Text className="text-sm text-muted leading-5 flex-1">
                  Opt out of personalized advertising through device settings
                </Text>
              </View>
              <View className="flex-row gap-2">
                <Text className="text-primary">•</Text>
                <Text className="text-sm text-muted leading-5 flex-1">
                  Request information about data we may have collected
                </Text>
              </View>
            </View>
          </View>

          {/* Changes to This Policy */}
          <View className="gap-2">
            <Text className="text-lg font-semibold text-foreground">Changes to This Policy</Text>
            <Text className="text-sm text-muted leading-5">
              We may update this Privacy Policy from time to time. We will notify you of any
              changes by posting the new Privacy Policy in the app. You are advised to review
              this Privacy Policy periodically for any changes.
            </Text>
          </View>

          {/* Contact Us */}
          <View className="gap-2">
            <Text className="text-lg font-semibold text-foreground">Contact Us</Text>
            <Text className="text-sm text-muted leading-5">
              If you have any questions about this Privacy Policy, please contact us at:
            </Text>
            <View className="bg-surface rounded-xl p-4 border border-border mt-2">
              <Text className="text-sm text-foreground">support@quickcolor.pro</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

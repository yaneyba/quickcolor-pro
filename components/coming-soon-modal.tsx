import { Modal, View, Text, TouchableOpacity, Platform } from "react-native";
import * as Haptics from "expo-haptics";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

interface ComingSoonModalProps {
  visible: boolean;
  onClose: () => void;
  featureName: string;
  description?: string;
  icon?: string;
}

export function ComingSoonModal({
  visible,
  onClose,
  featureName,
  description,
  icon = "sparkles",
}: ComingSoonModalProps) {
  const colors = useColors();

  const handleClose = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View className="flex-1 justify-center items-center bg-black/60 px-6">
        <View className="bg-background rounded-3xl p-8 w-full max-w-sm items-center border border-border">
          {/* Icon */}
          <View className="w-20 h-20 rounded-full bg-primary/15 items-center justify-center mb-6">
            <IconSymbol
              name={icon as any}
              size={40}
              color={colors.primary}
            />
          </View>

          {/* Title */}
          <Text className="text-2xl font-bold text-foreground text-center mb-2">
            Coming Soon
          </Text>

          {/* Feature Name */}
          <Text className="text-lg font-semibold text-primary text-center mb-3">
            {featureName}
          </Text>

          {/* Description */}
          <Text className="text-base text-muted text-center mb-8 leading-6">
            {description ||
              "We're working hard to bring you this feature. Stay tuned for updates!"}
          </Text>

          {/* Dismiss Button */}
          <TouchableOpacity
            onPress={handleClose}
            activeOpacity={0.7}
            className="bg-primary px-8 py-4 rounded-full w-full"
          >
            <Text className="text-background font-semibold text-center text-base">
              Got it
            </Text>
          </TouchableOpacity>

          {/* Pro Badge (optional) */}
          <View className="flex-row items-center gap-2 mt-4">
            <View className="w-2 h-2 rounded-full bg-primary" />
            <Text className="text-xs text-muted">
              This feature is on our roadmap
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

import { Modal, View, Text, TouchableOpacity, Platform } from "react-native";
import * as Haptics from "expo-haptics";
import { IconSymbol } from "@/ui-components/ui/icon-symbol";
import { useColors } from "@/ui-hooks/use-colors";

interface ToastModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  icon?: string;
  type?: "success" | "error" | "info";
}

export function ToastModal({
  visible,
  onClose,
  title,
  message,
  icon,
  type = "success",
}: ToastModalProps) {
  const colors = useColors();

  const handleClose = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onClose();
  };

  const getIconName = () => {
    if (icon) return icon;
    switch (type) {
      case "success":
        return "checkmark.circle.fill";
      case "error":
        return "xmark.circle.fill";
      case "info":
      default:
        return "info.circle.fill";
    }
  };

  const getIconColor = () => {
    switch (type) {
      case "success":
        return "#4ADE80"; // green
      case "error":
        return "#EF4444"; // red
      case "info":
      default:
        return colors.primary;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={handleClose}
        className="flex-1 justify-center items-center bg-black/50 px-6"
      >
        <View
          className="bg-background rounded-2xl p-6 w-full items-center border border-border"
          style={{ maxWidth: 320 }}
        >
          {/* Icon */}
          <View
            className="w-16 h-16 rounded-full items-center justify-center mb-4"
            style={{ backgroundColor: `${getIconColor()}20` }}
          >
            <IconSymbol
              name={getIconName() as any}
              size={32}
              color={getIconColor()}
            />
          </View>

          {/* Title */}
          <Text className="text-xl font-bold text-foreground text-center mb-2">
            {title}
          </Text>

          {/* Message */}
          <Text className="text-sm text-muted text-center mb-6">
            {message}
          </Text>

          {/* OK Button */}
          <TouchableOpacity
            onPress={handleClose}
            activeOpacity={0.7}
            className="bg-primary px-8 py-3 rounded-full w-full"
          >
            <Text className="text-background font-semibold text-center">
              OK
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

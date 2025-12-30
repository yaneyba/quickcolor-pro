import { useState, useRef } from "react";
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
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { getColorFormats } from "@/lib/color-utils";

const SCREEN_WIDTH = Dimensions.get("window").width;
const PICKER_SIZE = 150;

export default function PhotoPickerScreen() {
  const colors = useColors();
  const router = useRouter();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [pickedColor, setPickedColor] = useState("#FF6B35");
  const [colorFormats, setColorFormats] = useState(getColorFormats("#FF6B35"));

  const translateX = useSharedValue(SCREEN_WIDTH / 2 - PICKER_SIZE / 2);
  const translateY = useSharedValue(200);

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

  const handleColorPick = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    // In a real implementation, this would sample the pixel at the picker position
    // For now, we'll use a mock color
    const formats = getColorFormats(pickedColor);
    setColorFormats(formats);
  };

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = Math.max(
        0,
        Math.min(SCREEN_WIDTH - PICKER_SIZE, event.translationX + translateX.value)
      );
      translateY.value = Math.max(0, Math.min(600, event.translationY + translateY.value));
    })
    .onEnd(() => {
      handleColorPick();
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
            <TouchableOpacity onPress={() => router.back()}>
              <IconSymbol name="chevron.right" size={24} color={colors.foreground} />
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
            {/* Color Preview */}
            <View className="flex-row items-center gap-4">
              <View
                className="w-16 h-16 rounded-2xl"
                style={{ backgroundColor: pickedColor }}
              />
              <View className="flex-1">
                <Text className="text-lg font-bold text-foreground">{colorFormats.hex}</Text>
                <Text className="text-sm text-muted">{colorFormats.rgbString}</Text>
                <Text className="text-sm text-muted">{colorFormats.hsvString}</Text>
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
                  onPress={handleColorPick}
                  activeOpacity={0.7}
                  className="flex-1 bg-surface border border-border px-4 py-3 rounded-full"
                >
                  <Text className="text-foreground font-semibold text-center">Save Color</Text>
                </TouchableOpacity>
              )}
            </View>

            {imageUri && (
              <TouchableOpacity
                onPress={() => {
                  if (Platform.OS !== "web") {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  Alert.alert("Extract Palette", "This will generate a 5-color palette from the photo.");
                }}
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

import { useRouter, useSegments } from "expo-router";
import { useRef } from "react";
import { PanResponder } from "react-native";

const TAB_ORDER = ["index", "transactions", "budget", "insights"] as const;
const SWIPE_THRESHOLD = 50;
const SWIPE_VELOCITY = 0.3;

/**
 * Returns a PanResponder that performs left/right swipe to navigate between tabs.
 * Attach `panHandlers` to the outermost scrollable or View wrapper.
 */
export function useSwipeTabs() {
  const router = useRouter();
  const segments = useSegments();

  // Current tab is the second segment: (tabs)/index → "index"
  const currentTab = segments[1] || "index";
  const currentIndex = TAB_ORDER.indexOf(currentTab as any);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only capture horizontal gestures
        return (
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.5 &&
          Math.abs(gestureState.dx) > 15
        );
      },
      onPanResponderRelease: (_, gestureState) => {
        const { dx, vx } = gestureState;
        const swipedLeft = dx < -SWIPE_THRESHOLD || vx < -SWIPE_VELOCITY;
        const swipedRight = dx > SWIPE_THRESHOLD || vx > SWIPE_VELOCITY;

        if (swipedLeft && currentIndex < TAB_ORDER.length - 1) {
          const nextTab = TAB_ORDER[currentIndex + 1];
          router.replace(`/(tabs)/${nextTab}` as any);
        } else if (swipedRight && currentIndex > 0) {
          const prevTab = TAB_ORDER[currentIndex - 1];
          router.replace(`/(tabs)/${prevTab}` as any);
        }
      },
    }),
  ).current;

  return panResponder.panHandlers;
}

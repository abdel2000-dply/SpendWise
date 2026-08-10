import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, TextStyle } from "react-native";

interface AnimatedNumberProps {
  value: number;
  formatter?: (value: number) => string;
  style?: TextStyle;
  duration?: number;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  formatter,
  style,
  duration = 600,
}) => {
  const animValue = useRef(new Animated.Value(0)).current;
  const prevValue = useRef(0);
  const displayRef = useRef<string>(formatter ? formatter(0) : "0");

  useEffect(() => {
    const from = prevValue.current;
    const to = value;
    prevValue.current = to;

    animValue.setValue(0);
    Animated.timing(animValue, {
      toValue: 1,
      duration,
      useNativeDriver: false,
    }).start();
  }, [value, animValue, duration]);

  const display = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [prevValue.current === value ? value : 0, value],
  });

  // For non-native driver, we use a listener approach
  const [text, setText] = React.useState(
    formatter ? formatter(value) : value.toString(),
  );

  useEffect(() => {
    const from = prevValue.current === value ? value : 0;
    // Immediately apply the formatter so currency/locale changes show at once
    setText(formatter ? formatter(value) : value.toString());
    const listener = animValue.addListener(({ value: progress }) => {
      const current = from + (value - from) * progress;
      setText(formatter ? formatter(current) : Math.round(current).toString());
    });

    return () => animValue.removeListener(listener);
  }, [value, formatter, animValue]);

  return <Animated.Text style={[styles.text, style]}>{text}</Animated.Text>;
};

const styles = StyleSheet.create({
  text: {
    fontVariant: ["tabular-nums"],
  },
});

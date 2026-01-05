import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Colors } from '../../constants/colors';

interface IconProps {
  name: keyof typeof Ionicons.glyphMap;
  size?: number;
  color?: string;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  color = Colors.text,
}) => {
  return <Ionicons name={name} size={size} color={color} />;
};

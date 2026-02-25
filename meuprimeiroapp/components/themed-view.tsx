import { View, type ViewProps } from 'react-native';
import { useTheme } from '../src/context/ThemeContext';
import { Colors } from '../constants/theme';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  const { theme } = useTheme();
  const backgroundColor = (theme === 'light' ? lightColor : darkColor) ?? Colors[theme].background;

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}

/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

const palette = {
  text: '#8B735B', // Softer Brown
  background: '#FFFBF7',
  tint: '#FF8C42',
  icon: '#8B735B',
  tabIconDefault: '#C8B6A6',
  tabIconSelected: '#FF8C42',
  primary: '#FF8C42',
  secondary: '#F9D423',
  accent: '#FFB347',
  success: '#82C91E',
  warning: '#FAB005',
  danger: '#FA5252',
  card: '#FFF5EB',
  border: '#F3E9DC',
};

const darkPalette = {
  text: '#ECE0D1', // Light Cream
  background: '#1A1614', // Rich Dark Cocoa
  tint: '#FF8C42',
  icon: '#ECE0D1',
  tabIconDefault: '#5D5041',
  tabIconSelected: '#FF8C42',
  primary: '#FF8C42',
  secondary: '#F9D423',
  accent: '#FFB347',
  success: '#82C91E',
  warning: '#FAB005',
  danger: '#FA5252',
  card: '#2A2420', // Dark Warm Wood/Brown
  border: '#3D342D',
};

export const Colors = {
  light: palette,
  dark: darkPalette,
};

export const LightGradients = {
  main: ['#FFF9F2', '#FFF0E6'],
  warm: ['#FFB347', '#FF8C42'],
  sunny: ['#F9D423', '#FFB347'],
  sunset: ['#FF8C42', '#F06292'],
};

export const DarkGradients = {
  main: ['#1A1614', '#2A2420'],
  warm: ['#3D342D', '#FF8C42'], // Darker start to warm accent
  sunny: ['#2A2420', '#F9D423'],
  sunset: ['#2A2420', '#F06292'],
};

export const ThemeGradients = {
  light: LightGradients,
  dark: DarkGradients,
};

// Default Gradients object for backward compatibility
export const Gradients = LightGradients;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

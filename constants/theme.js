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
  primary: '#FF8C42', // Warm Orange
  secondary: '#F9D423', // Sunny Yellow
  accent: '#FFB347', // Soft Peach
  success: '#82C91E',
  warning: '#FAB005',
  danger: '#FA5252',
  card: '#FFF5EB', // Soft Peach instead of White
  border: '#F3E9DC',
  pastelPeach: '#FFF5EB',
  pastelYellow: '#FFFBEB',
  pastelOrange: '#FFF0E6',
};

export const Colors = {
  light: palette,
  dark: palette,
};

export const Gradients = {
  main: ['#FFF9F2', '#FFF0E6'], // Warm Cream to Soft Peach
  warm: ['#FFB347', '#FF8C42'],
  sunny: ['#F9D423', '#FFB347'],
  sunset: ['#FF8C42', '#F06292'],
};

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

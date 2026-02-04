import { useTheme } from '../context/ThemeContext';

export const useColorScheme = () => {
    const { theme } = useTheme();
    return theme;
};

import { useTheme } from '../context/ThemeContext';

// Mantemos a assinatura `useColorScheme()` para compatibilidade com o restante do código.
export function useColorScheme() {
	try {
		const { theme } = useTheme();
		return theme;
	} catch (e) {
		// Se não estiver dentro do ThemeProvider, fallback para o hook nativo
		const { useColorScheme: nativeUseColorScheme } = require('react-native');
		return nativeUseColorScheme();
	}
}

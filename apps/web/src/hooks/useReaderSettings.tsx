import { useColorScheme, useLocalStorage } from '@mantine/hooks';
import { useMemo } from 'react';

import {
	READER_DEFAULT_SETTINGS,
	ReaderContentSettings,
	ReaderTheme,
	ReaderThemeName,
	ReaderThemeTokens,
} from '@inboxt/common';

function mapFontFamily(font: ReaderContentSettings['font']) {
	if (font === 'Serif') {
		return 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif, "Apple Color Emoji", "Segoe UI Emoji"';
	}

	if (font === 'Monospace') {
		return 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace, "Apple Color Emoji", "Segoe UI Emoji"';
	}

	return 'var(--mantine-font-family)';
}

function mapFontWeight(weight: ReaderContentSettings['fontWeight']) {
	if (weight === 'Light') {
		return 300;
	}
	if (weight === 'Bold') {
		return 700;
	}

	return 400; // Regular
}

export function makeReaderResolver(
	themeTokens: ReaderThemeTokens,
	settings: ReaderContentSettings,
) {
	return () => ({
		variables: {
			'--mantine-color-body': themeTokens.background,
			'--mantine-color-text': themeTokens.text,
			'--reader-border-color': themeTokens.border,
			'--reader-link-color': themeTokens.link || 'var(--mantine-color-anchor)',
			'--reader-highlight-color': themeTokens.highlight,
			'--reader-font-size': `${settings.textSize}px`,
			'--reader-line-height': String(settings.lineHeight),
			'--reader-letter-spacing': `${settings.letterSpacing}em`,
			'--reader-word-spacing': `${settings.wordSpacing}em`,
			'--reader-text-align': settings.alignment.toLowerCase(),
			'--reader-font-family': mapFontFamily(settings.font),
			'--reader-font-weight': String(mapFontWeight(settings.fontWeight)),
			'--reader-content-width': `${settings.contentWidth}em`,
		},
		light: {},
		dark: {},
	});
}

export function useReaderSettings() {
	const systemScheme = useColorScheme('light', { getInitialValueInEffect: true });

	const [theme, setTheme] = useLocalStorage<ReaderTheme>({
		key: 'reader-theme',
		defaultValue: 'auto',
		getInitialValueInEffect: true,
	});

	const [contentSettings, setContentSettings] = useLocalStorage<ReaderContentSettings>({
		key: 'reading-settings',
		defaultValue: READER_DEFAULT_SETTINGS,
	});

	const effectiveTheme: ReaderThemeName = useMemo(
		() => (theme === 'auto' ? (systemScheme === 'dark' ? 'dark' : 'light') : theme),
		[theme, systemScheme],
	);

	const setReaderTheme = (value: ReaderTheme) => setTheme(value);
	return { theme, setReaderTheme, effectiveTheme, contentSettings, setContentSettings };
}

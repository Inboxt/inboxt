import { readFileSync } from 'fs';
import { join } from 'path';

const readContent = (filename: string) => readFileSync(join(__dirname, filename), 'utf-8');

export const getDefaultItems = () =>
	({
		gettingStarted: {
			html: readContent('getting-started.html'),
			metadata: {
				title: 'Welcome to Inboxt',
				author: 'Inboxt Guides',
				description:
					'Welcome to Inboxt! This guide introduces the core features, support channels, and ways to contribute or self-host.',
				leadImage: `${process.env.APP_URL || process.env.API_URL}/lead-image.png`,
			},
		},
		tipsAndTricks: {
			html: readContent('tips-and-tricks.html'),
			metadata: {
				title: 'Tips & Tricks',
				author: 'Inboxt Guides',
				description:
					'Discover handy shortcuts, expert tips, and clever ways to organize and save content in Inboxt. Learn what’s possible (and what’s coming soon) to boost your productivity and reading experience.',
				leadImage: `${process.env.APP_URL || process.env.API_URL}/lead-image.png`,
			},
		},
	}) as const;

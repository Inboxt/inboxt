import { defineConfig, HeadConfig } from 'vitepress';

const baseHeaders: HeadConfig[] = [];
const statsConfig: HeadConfig = [
	'script',
	{
		defer: 'true',
		src: 'https://stats.duckybox.mytymon.com/script.js',
		'data-website-id': '967a0bcd-de9c-4e0b-9f78-b0782da18998',
	},
];

const headers = process.env.NODE_ENV === 'production' ? [...baseHeaders, statsConfig] : baseHeaders;

export default defineConfig({
	srcDir: 'content',
	title: 'Inboxt Docs',
	description: 'Documentation for Inboxt - read-later app.',
	cleanUrls: true,
	lastUpdated: true,
	head: headers,
	ignoreDeadLinks: [/^https?:\/\/localhost/],
	themeConfig: {
		logo: '/favicon.ico',
		darkModeSwitchLabel: 'Theme',

		editLink: {
			pattern: 'https://github.com/Inboxt/inboxt/edit/master/docs/content/:path',
			text: 'Edit this page on GitHub',
		},

		nav: [
			{
				text: 'Sponsor',
				link: 'https://github.com/sponsors/inboxt',
			},
		],

		sidebar: [
			{
				text: 'About',
				items: [
					{ text: 'Getting Started', link: '/' },
					{ text: 'Self-hosting', link: '/self-hosting' },
					{ text: 'Built in the Open', link: '/built-in-the-open' },
					{ text: 'Limitations', link: '/limitations' },
				],
			},
			{
				text: 'Using Inboxt',
				collapsed: false,
				items: [
					{ text: 'Installation', link: '/installation' },
					{ text: 'Saving Articles', link: '/saving-articles' },
					{ text: 'Newsletters & Email', link: '/newsletters-and-emails' },
					{ text: 'Reading', link: '/reading' },
					{ text: 'Organizing', link: '/organizing' },
					{ text: 'Search', link: '/search' },
					{ text: 'Importing Data', link: '/importing' },
					{ text: 'Exporting Data', link: '/exporting' },
					{ text: 'Your Account', link: '/your-account' },
					{ text: 'API', link: '/api' },
					{ text: 'Getting Help', link: '/help' },
				],
			},
			{
				text: 'Development',
				collapsed: false,
				items: [
					{ text: 'Contributing', link: '/contributing' },
					{ text: 'Local Environment', link: '/local-development' },
				],
			},
		],

		socialLinks: [{ icon: 'github', link: 'https://github.com/Inboxt/inboxt' }],

		notFound: {
			code: '404',
			title: 'Page not found',
			quote: 'The documentation page you’re looking for doesn’t exist or may have been moved.',
			linkLabel: 'Go to documentation home',
			linkText: 'Back to docs',
		},
	},
});

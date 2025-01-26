import { Alert, Button, Group, Stack, Text } from '@mantine/core';
import { useEffect } from 'react';
import { useSearch } from '@tanstack/react-router';
import classes from './ItemsList.module.css';

import { useReaderContext } from '../../context/ReaderContext.tsx';
import { ReaderItem } from '../../components/ReaderItem';
import { Route } from '../../routes';
import { AppViews } from '../../constants';
import { AppLayout } from '../../layouts/AppLayout.tsx';

const BACKEND_ARTICLES = [
	{
		id: 1,
		title: 'Understanding React Hooks',
		receivedAt: '2024-11-15T08:30:00Z',
		description:
			'An introduction to React Hooks and how they simplify state management in functional components.',
		labels: [
			{ id: 1, label: 'React', color: 'blue' },
			{ id: 2, label: 'Hooks', color: 'cyan' },
			{ id: 3, label: 'State Management', color: 'grape' },
			{ id: 4, label: 'JavaScript', color: 'yellow' },
		],
		author: 'John Doe',
	},
	{
		id: 2,
		title: 'JavaScript Async Patterns',
		receivedAt: '2024-01-01T10:15:00Z',
		description:
			'Explore various asynchronous patterns in JavaScript including callbacks, promises, and async/await.',
		labels: [
			{ id: 5, label: 'JavaScript', color: 'orange' },
			{ id: 6, label: 'Asynchronous', color: 'lime' },
			{ id: 7, label: 'Promises', color: 'pink' },
		],
		author: 'developer.com',
	},
	{
		id: 3,
		title: 'CSS Grid Layouts',
		receivedAt: '2023-11-13T14:45:00Z',
		description:
			'A comprehensive guide to building responsive layouts with CSS Grid.',
		labels: [
			{ id: 8, label: 'CSS', color: 'cyan' },
			{ id: 9, label: 'Grid', color: 'red' },
			{ id: 10, label: 'Responsive Design', color: 'yellow' },
		],
		author: 'Alice Smith',
	},
	{
		id: 4,
		title: 'REST vs GraphQL',
		receivedAt: '2023-11-12T09:00:00Z',
		description: 'Comparing REST and GraphQL as APIs.',
		labels: [
			{ id: 11, label: 'APIs', color: 'blue' },
			{ id: 12, label: 'REST', color: 'grape' },
			{ id: 13, label: 'GraphQL', color: 'orange' },
		],
		author: 'techguide.io',
	},
	{
		id: 5,
		title: 'Node.js Event Loop Explained',
		receivedAt: '2023-11-11T16:30:00Z',
		description:
			'An in-depth explanation of how the event loop works in Node.js.',
		labels: [
			{ id: 14, label: 'Node.js', color: 'lime' },
			{ id: 15, label: 'Event Loop', color: 'cyan' },
		],
		author: 'Emily Johnson',
	},
	{
		id: 6,
		title: 'Building Accessible Websites',
		receivedAt: '2023-11-10T11:20:00Z',
		description:
			'Tips and guidelines for making your website accessible to all users.',
		labels: [
			{ id: 16, label: 'Accessibility', color: 'pink' },
			{ id: 17, label: 'Web Development', color: 'yellow' },
		],
		author: 'inclusiveweb.org',
	},
	{
		id: 7,
		title: 'Introduction to TypeScript',
		receivedAt: '2023-11-09T12:00:00Z',
		description:
			'Learn the basics of TypeScript and how it improves the development experience in JavaScript.',
		labels: [
			{ id: 18, label: 'TypeScript', color: 'blue' },
			{ id: 19, label: 'JavaScript', color: 'red' },
			{ id: 20, label: 'Development', color: 'lime' },
		],
		author: 'Michael Brown',
	},
	{
		id: 8,
		title: 'Deploying Apps with Docker',
		receivedAt: '2023-11-08T17:45:00Z',
		labels: [
			{ id: 21, label: 'Docker', color: 'cyan' },
			{ id: 22, label: 'DevOps', color: 'grape' },
		],
		author: 'devopsdaily.net',
	},
	{
		id: 9,
		title: 'An Extremely Long Title for Testing Purposes to See How the Layout Handles Very Long Titles in the User Interface and Ensure It Wraps Correctly Across Multiple Lines Without Causing Any Overflow Issues',
		receivedAt: '2023-11-07T15:15:00Z',
		description:
			'An overview of microservices architecture and its benefits over monolithic applications.',
		labels: [],
		author: 'Sophia Lee',
	},
	{
		id: 10,
		title: 'Understanding Redux',
		receivedAt: '2023-11-06T09:45:00Z',
		description:
			'A complete guide to state management with Redux in modern JavaScript applications.',
		labels: [
			{ id: 23, label: 'Redux', color: 'pink' },
			{ id: 24, label: 'State Management', color: 'cyan' },
		],
		author: 'stateflow.dev',
	},
	{
		id: 11,
		title: 'Deep Dive into Machine Learning Models',
		receivedAt: '2023-11-05T10:30:00Z',
		description:
			'Machine learning models are complex representations that enable systems to make predictions or classifications based on data. This article explores supervised and unsupervised learning models, discussing key concepts like training data, feature extraction, and model evaluation metrics. We cover neural networks, decision trees, support vector machines, and clustering algorithms, among others. Additionally, the article discusses hyperparameter tuning, cross-validation techniques, and common pitfalls in model development, offering insights into how to improve model accuracy and interpretability.',
		labels: [
			{ id: 25, label: 'Machine Learning', color: 'blue' },
			{ id: 26, label: 'AI', color: 'red' },
			{ id: 27, label: 'Algorithms', color: 'orange' },
			{ id: 28, label: 'Data Science', color: 'grape' },
		],
		author: 'James Williams',
	},
];

export const ItemsList = () => {
	const { view } = useSearch({ from: Route.fullPath });

	const { setVisibleItemIds } = useReaderContext();
	// TODO: Handle data from backend
	// TODO: This also probably doesn't handle well or at all infinite scrolling
	useEffect(() => {
		if (BACKEND_ARTICLES) {
			const visibleIds = BACKEND_ARTICLES.map((item) => item.id);
			setVisibleItemIds(visibleIds);
		}
	}, [BACKEND_ARTICLES]);

	return (
		<AppLayout>
			<Stack gap={0} className={classes.items}>
				{view === AppViews.TRASH && (
					<Alert
						variant="light"
						color="blue"
						fz="xxs"
						radius={0}
						className={classes.trashAlert}
					>
						<Group gap={0} justify="center">
							<Text ta="center">
								Items in Trash will be automatically deleted
								after 30 days.
							</Text>

							<Button variant="transparent" size="compact-sm">
								Empty Trash Now
							</Button>
						</Group>
					</Alert>
				)}

				{BACKEND_ARTICLES.map((article) => (
					<ReaderItem
						id={article.id}
						title={article.title}
						receivedAt={article.receivedAt}
						description={article?.description}
						labels={article?.labels}
						author={article.author}
					/>
				))}
			</Stack>
		</AppLayout>
	);
};

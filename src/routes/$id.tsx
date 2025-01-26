import { createFileRoute } from '@tanstack/react-router';
import { ReaderView } from '../pages/ReaderView';

export const Route = createFileRoute('/$id')({
	component: ReaderView,
});

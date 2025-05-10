import { Button, Group, Stack, TextInput } from '@mantine/core';
import { ContextModalProps } from '@mantine/modals';
import { useForm, zodResolver } from '@mantine/form';

import { addItemFromUrlSchema } from '@inbox-reader/schemas';

import { Form } from '../../components/Form';

export const AddContentModal = ({ id, context }: ContextModalProps) => {
	const form = useForm({
		initialValues: {
			url: '',
		},
		validate: zodResolver(addItemFromUrlSchema),
	});

	const handleAddContent = async () => {
		await fetch(`${process.env.API_URL}/items/from-url`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				url: form.values.url,
			}),
			credentials: 'include',
		});

		return context.closeModal(id);
	};

	return (
		<Form onSubmit={form.onSubmit(handleAddContent)}>
			{({ error }) => (
				<Stack>
					<TextInput placeholder="https://example.com/" {...form.getInputProps('url')} />

					{error}

					<Group justify="flex-end" mt="md">
						<Button variant="default" onClick={() => context.closeModal(id)}>
							Cancel
						</Button>

						<Button type="submit">Add</Button>
					</Group>
				</Stack>
			)}
		</Form>
	);
};

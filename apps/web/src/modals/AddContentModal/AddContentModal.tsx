import { Button, Group, Stack, TextInput } from '@mantine/core';
import { ContextModalProps } from '@mantine/modals';
import { useForm, zodResolver } from '@mantine/form';

import { useState } from 'react';
import { addItemFromUrlSchema } from '@inbox-reader/schemas';

import { Form } from '../../components/Form';
import { client } from '../../lib/apolloClient.ts';
import { SAVED_ITEMS } from '../../lib/graphql.ts';
import { LabelsMultiSelect } from '../../components/LabelsMultiSelect';

export const AddContentModal = ({ id, context }: ContextModalProps) => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | undefined>();

	const form = useForm({
		initialValues: {
			url: '',
			labels: [],
		},
		validate: zodResolver(addItemFromUrlSchema),
	});

	const handleAddContent = async (values: typeof form.values) => {
		setLoading(true);
		try {
			const respone = await fetch(`${process.env.API_URL}/inbox/items/from-url`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					url: values.url,
					labelIds: values.labels,
				}),
				credentials: 'include',
			});

			if (!respone.ok) {
				const error = await respone.json();
				setError(error.message);
				return;
			}

			client.refetchQueries({ include: [SAVED_ITEMS] });
			return context.closeModal(id);
		} catch (err) {
			console.error(err, '???');
		} finally {
			setLoading(false);
		}
	};

	return (
		<Form onSubmit={form.onSubmit(handleAddContent)} error={error} setErrors={form.setErrors}>
			{({ error }) => (
				<Stack>
					<TextInput
						placeholder="https://example.com/"
						{...form.getInputProps('url')}
						label="	Page URL"
					/>

					<LabelsMultiSelect
						key={form.key('labels')}
						{...form!.getInputProps('labels')}
					/>

					{error}

					<Group justify="flex-end" mt="md">
						<Button
							variant="default"
							loading={loading}
							onClick={() => context.closeModal(id)}
						>
							Cancel
						</Button>

						<Button type="submit" loading={loading}>
							Add
						</Button>
					</Group>
				</Stack>
			)}
		</Form>
	);
};

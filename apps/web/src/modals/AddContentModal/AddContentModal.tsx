import { Button, Stack, TextInput } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { ContextModalProps } from '@mantine/modals';
import { useState } from 'react';

import { addItemFromUrlSchema } from '@inboxt/common';

import { ButtonContainer } from '~components/ButtonContainer';
import { Form } from '~components/Form';
import { LabelsMultiSelect } from '~components/LabelsMultiSelect';
import { toastInfo } from '~components/Toast';
import { ENTRIES } from '~lib/graphql';
import { client } from '~lib/graphql/client';

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
			const response = await fetch(`${process.env.API_URL}/inbox/items/from-url`, {
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

			if (!response.ok) {
				const error = (await response.json()) as { message?: string };
				setError(error.message || 'Internal server error');
				return;
			}

			toastInfo({
				title: 'Link added for processing',
				description: 'We’re fetching and analyzing it in the background.',
			});

			await client.refetchQueries({ include: [ENTRIES] });
			context.closeModal(id);
		} catch (err) {
			console.error('Network error:', err);
			setError('Internal server error');
		} finally {
			setLoading(false);
		}
	};

	return (
		<Form onSubmit={form.onSubmit(handleAddContent)} error={error} setErrors={form.setErrors}>
			{({ error }) => (
				<Stack gap="xl">
					<TextInput
						placeholder="https://example.com/"
						{...form.getInputProps('url')}
						label="	Page URL"
					/>

					<LabelsMultiSelect key={form.key('labels')} {...form.getInputProps('labels')} />

					{error}

					<ButtonContainer>
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
					</ButtonContainer>
				</Stack>
			)}
		</Form>
	);
};

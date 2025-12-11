import { useMutation } from '@apollo/client';
import { Button, Card, Stack, TextInput, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { ContextModalProps } from '@mantine/modals';
import { zod4Resolver } from 'mantine-form-zod-resolver';

import { addItemFromUrlSchema } from '@inboxt/common';
import { ADD_ARTICLE_FROM_URL, ENTRIES } from '@inboxt/graphql';
import { LabelsMultiSelect } from '@inboxt/ui';

import { ButtonContainer } from '~components/ButtonContainer';
import { Form } from '~components/Form';
import { toastInfo } from '~components/Toast';

export const AddContentModal = ({ id, context }: ContextModalProps) => {
	const [addItemFromUrlMutation, { loading, error }] = useMutation(ADD_ARTICLE_FROM_URL);

	const form = useForm({
		initialValues: {
			url: '',
			labels: [],
		},
		validate: zod4Resolver(addItemFromUrlSchema),
	});

	const handleAddContent = async (values: typeof form.values) => {
		await addItemFromUrlMutation({
			variables: {
				data: {
					url: values.url,
					labelIds: values.labels,
				},
			},
			refetchQueries: [ENTRIES],
		});

		toastInfo({
			title: 'Link added for processing',
			description: 'We’re fetching and analyzing it in the background.',
		});

		context.closeModal(id);
	};

	return (
		<Form onSubmit={form.onSubmit(handleAddContent)} error={error} setErrors={form.setErrors}>
			{({ error }) => (
				<Stack gap="xl">
					<Card>
						<Stack gap="md">
							<TextInput
								placeholder="https://example.com/"
								{...form.getInputProps('url')}
								label="Page URL"
							/>

							<Stack gap={2}>
								<Text fz="sm" fw={500}>
									Labels:
								</Text>

								<LabelsMultiSelect
									key={form.key('labels')}
									{...form.getInputProps('labels')}
								/>
							</Stack>

							{error}
						</Stack>
					</Card>

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

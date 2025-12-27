import { useMutation, useQuery } from '@apollo/client';
import { Button, Card, Stack, TextInput, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { ContextModalProps } from '@mantine/modals';
import { zod4Resolver } from 'mantine-form-zod-resolver';

import { addItemFromUrlSchema } from '@inboxt/common';
import { LabelsMultiSelect } from '@inboxt/ui';

import { ButtonContainer } from '~components/ButtonContainer';
import { Form } from '~components/Form';
import { toastInfo } from '~components/Toast';
import { ADD_ARTICLE_FROM_URL, ENTRIES, Label, LABELS } from '~lib/graphql';

export const AddContentModal = ({ id, context }: ContextModalProps) => {
	const [addItemFromUrlMutation, { loading, error }] = useMutation(ADD_ARTICLE_FROM_URL);
	const { data: labelsData, loading: labelsLoading } = useQuery(LABELS);

	const form = useForm({
		mode: 'uncontrolled',
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
								key={form.key('url')}
								{...form.getInputProps('url')}
								label="Page URL"
							/>

							<Stack gap={2}>
								<Text fz="sm" fw={500}>
									Labels:
								</Text>

								<LabelsMultiSelect
									labels={labelsData?.labels as Label[]}
									loading={labelsLoading}
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

import { useMutation } from '@apollo/client';
import { Button, Card, Stack, Textarea, TextInput } from '@mantine/core';
import { useForm, schemaResolver } from '@mantine/form';
import { ContextModalProps } from '@mantine/modals';

import { updateSavedItemMetadataSchema } from '@inboxt/common';

import { ButtonContainer } from '~components/ButtonContainer';
import { Form } from '~components/Form';
import { toastSuccess } from '~components/Toast';
import { ENTRIES, SAVED_ITEM, UPDATE_SAVED_ITEM_METADATA } from '~lib/graphql';
import { SavedItem } from '~lib/graphql';

type EditInfoModalInnerProps = {
	item: SavedItem;
};

export const EditInfoModal = ({
	id,
	context,
	innerProps,
}: ContextModalProps<EditInfoModalInnerProps>) => {
	const { item } = innerProps;

	const [updateSavedItemMetadata, { loading, error }] = useMutation(UPDATE_SAVED_ITEM_METADATA, {
		refetchQueries: [ENTRIES, SAVED_ITEM],
		awaitRefetchQueries: true,
	});

	const form = useForm({
		mode: 'uncontrolled',
		initialValues: {
			title: item.title ?? '',
			description: item.description ?? '',
			author: item.author ?? '',
		},
		validate: schemaResolver(updateSavedItemMetadataSchema),
	});

	const handleSave = async (values: typeof form.values) => {
		await updateSavedItemMetadata({
			variables: {
				data: {
					id: item.id,
					title: values.title || null,
					description: values.description || null,
					author: values.author || null,
				},
			},
		});

		toastSuccess({ title: 'Item updated.' });

		context.closeModal(id);
	};

	return (
		<Form onSubmit={form.onSubmit(handleSave)} error={error} setErrors={form.setErrors}>
			{({ error: formError }) => (
				<Stack gap="xl">
					<Card>
						<Stack gap="md">
							<TextInput
								label="Title"
								placeholder="Item title"
								data-autofocus
								key={form.key('title')}
								{...form.getInputProps('title')}
							/>

							<Textarea
								label="Description"
								placeholder="Item description"
								autosize
								minRows={2}
								maxRows={6}
								key={form.key('description')}
								{...form.getInputProps('description')}
							/>

							<TextInput
								label="Author"
								placeholder="Item author"
								key={form.key('author')}
								{...form.getInputProps('author')}
							/>

							{formError}
						</Stack>
					</Card>

					<ButtonContainer>
						<Button
							variant="default"
							onClick={() => context.closeModal(id)}
							loading={loading}
						>
							Cancel
						</Button>

						<Button type="submit" loading={loading}>
							Save
						</Button>
					</ButtonContainer>
				</Stack>
			)}
		</Form>
	);
};

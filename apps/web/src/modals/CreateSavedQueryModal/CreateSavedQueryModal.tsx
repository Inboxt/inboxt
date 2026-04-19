import { useMutation } from '@apollo/client';
import { Stack, TextInput, Button, Card } from '@mantine/core';
import { useForm } from '@mantine/form';
import { ContextModalProps } from '@mantine/modals';
import { zod4Resolver } from 'mantine-form-zod-resolver';

import { createSavedQuerySchema } from '@inboxt/common';

import { ButtonContainer } from '~components/ButtonContainer';
import { Form } from '~components/Form';
import { CREATE_SAVED_QUERY } from '~lib/graphql';

export const CreateSavedQueryModal = ({
	id,
	context,
	innerProps,
}: ContextModalProps<{ query: string }>) => {
	const [createSavedQuery, { loading, error }] = useMutation(CREATE_SAVED_QUERY, {
		refetchQueries: ['savedQueries'],
		awaitRefetchQueries: true,
	});

	const form = useForm({
		mode: 'uncontrolled',
		initialValues: { name: '', query: innerProps?.query ?? '' },
		validate: zod4Resolver(createSavedQuerySchema),
	});

	const handleCreateSavedQuery = async (values: typeof form.values) => {
		await createSavedQuery({
			variables: { data: values },
		});
		context.closeModal(id);
	};

	return (
		<Form
			onSubmit={form.onSubmit(handleCreateSavedQuery)}
			error={error}
			setErrors={form.setErrors}
		>
			{({ error }) => (
				<Stack gap="xl">
					<Card>
						<Stack gap="md">
							<TextInput
								label="Name"
								placeholder="e.g. My Newsletters"
								maxLength={30}
								{...form.getInputProps('name')}
							/>
							<TextInput
								label="Query"
								placeholder="e.g. type:newsletter"
								maxLength={500}
								{...form.getInputProps('query')}
							/>
						</Stack>

						{error}
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

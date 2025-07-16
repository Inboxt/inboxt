import { ContextModalProps } from '@mantine/modals';
import { Button, Group, Stack, TextInput } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { useMutation } from '@apollo/client';

import { createLabelSchema } from '@inbox-reader/schemas';

import { LabelsColorInput } from '../../components/LabelsColorInput';
import { Form } from '../../components/Form';
import { CREATE_LABEL, LABELS } from '../../lib/graphql.ts';

export const CreateLabelModal = ({ id, context }: ContextModalProps) => {
	const [createLabel, { loading, error }] = useMutation(CREATE_LABEL);

	const form = useForm({
		mode: 'uncontrolled',
		initialValues: {
			name: '',
			color: '#fa5252',
		},
		validate: zodResolver(createLabelSchema),
	});

	const handleCreateLabel = async (values: typeof form.values) => {
		await createLabel({
			variables: {
				data: values,
			},
			refetchQueries: [LABELS],
		});

		context.closeModal(id);
	};

	return (
		<Form onSubmit={form.onSubmit(handleCreateLabel)} error={error} setErrors={form.setErrors}>
			{({ error }) => (
				<Stack>
					<Group align="flex-start">
						<TextInput label="Name" flex={1} {...form.getInputProps('name')} />
						<LabelsColorInput
							label="Color"
							{...form.getInputProps('color')}
							key={form.key('color')}
						/>
					</Group>

					{error}

					<Group justify="flex-end">
						<Button
							variant="light"
							color="text"
							onClick={() => context.closeModal(id)}
							loading={loading}
						>
							Cancel
						</Button>

						<Button loading={loading} type="submit">
							Save
						</Button>
					</Group>
				</Stack>
			)}
		</Form>
	);
};

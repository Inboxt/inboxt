import { useMutation } from '@apollo/client';
import { Stack, TextInput, Button, Flex, Card } from '@mantine/core';
import { useForm } from '@mantine/form';
import { ContextModalProps } from '@mantine/modals';
import { zod4Resolver } from 'mantine-form-zod-resolver';

import { createLabelSchema } from '@inboxt/common';
import { CREATE_LABEL, LABELS } from '@inboxt/graphql';
import { labelColors } from '@inboxt/ui';

import { ButtonContainer } from '~components/ButtonContainer';
import { Form } from '~components/Form';
import { LabelsColorInput } from '~components/LabelsColorInput';
import { getRandomArrayItem } from '~utils/getRandomArrayItem';

export const CreateLabelModal = ({ id, context }: ContextModalProps) => {
	const [createLabel, { loading, error }] = useMutation(CREATE_LABEL);
	const form = useForm({
		mode: 'uncontrolled',
		initialValues: { name: '', color: getRandomArrayItem(labelColors) as string },
		validate: zod4Resolver(createLabelSchema),
	});

	const handleCreateLabel = async (values: typeof form.values) => {
		await createLabel({
			variables: { data: values },
			refetchQueries: [LABELS],
		});
		context.closeModal(id);
	};

	return (
		<Form onSubmit={form.onSubmit(handleCreateLabel)} error={error} setErrors={form.setErrors}>
			{({ error }) => (
				<Stack gap="xl">
					<Card>
						<Flex gap="md" direction={{ base: 'column', xs: 'row' }}>
							<TextInput label="Name" flex={1} {...form.getInputProps('name')} />
							<LabelsColorInput
								label="Color"
								{...form.getInputProps('color')}
								key={form.key('color')}
							/>
						</Flex>

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

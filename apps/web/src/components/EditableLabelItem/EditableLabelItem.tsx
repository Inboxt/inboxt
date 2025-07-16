import { useEffect } from 'react';
import { Group, Text, TextInput, ActionIcon, Flex, Stack } from '@mantine/core';
import {
	IconLabelImportantFilled,
	IconEdit,
	IconTrash,
	IconCheck,
	IconX,
} from '@tabler/icons-react';
import { useMutation } from '@apollo/client';
import { useForm, zodResolver } from '@mantine/form';

import { updateLabelSchema } from '@inbox-reader/schemas';

import { LabelsColorInput } from '../LabelsColorInput';
import { useScreenQuery } from '../../hooks/useScreenQuery.tsx';
import { Form } from '../Form';
import { DELETE_LABEL, LABELS, UPDATE_LABEL } from '../../lib/graphql.ts';

type EditableLabelItemProps = {
	label: { id: number; name: string; color: string };
	isEditing: boolean;
	setIsEditing: (isEditing: boolean) => void;
};

export const EditableLabelItem = ({ label, isEditing, setIsEditing }: EditableLabelItemProps) => {
	const isAboveLgScreen = useScreenQuery('lg', 'above');

	const [updateLabel, { loading: updateLabelLoading, error: updateLabelError }] = useMutation(
		UPDATE_LABEL,
		{
			refetchQueries: [{ query: LABELS }],
		},
	);

	const [deleteLabel, { loading: deleteLabelLoading }] = useMutation(DELETE_LABEL, {
		refetchQueries: [LABELS],
	});

	const form = useForm({
		mode: 'uncontrolled',
		initialValues: {
			name: '',
			color: '#fff',
		},
		validate: zodResolver(updateLabelSchema),
	});

	useEffect(() => {
		if (isEditing) {
			form.setValues({
				name: label.name,
				color: label.color,
			});
			form.clearErrors();
		}
	}, [isEditing, label.name, label.color]);

	const handleSave = async (values: typeof form.values) => {
		await updateLabel({
			variables: { data: { id: label.id, ...values } },
		});
		setIsEditing(false);
	};

	return (
		<Group>
			{isEditing ? (
				<Form onSubmit={form.onSubmit(handleSave)} error={updateLabelError}>
					{({ error }) => (
						<Stack gap="xs">
							<Flex
								gap="xs"
								flex={1}
								direction={{ base: 'column', lg: 'row' }}
								align="flex-start"
							>
								<TextInput
									{...form.getInputProps('name')}
									key={form.key('name')}
									placeholder="Label name"
									flex={1}
								/>
								<LabelsColorInput
									{...form.getInputProps('color')}
									key={form.key('color')}
								/>

								<Group
									ml={isAboveLgScreen ? 'auto' : 0}
									gap="xs"
									grow={!isAboveLgScreen}
								>
									<ActionIcon
										type="submit"
										size={36}
										loading={updateLabelLoading}
									>
										<IconCheck size={18} />
									</ActionIcon>

									<ActionIcon
										variant="default"
										onClick={() => setIsEditing(false)}
										size={36}
										loading={updateLabelLoading}
									>
										<IconX size={18} />
									</ActionIcon>
								</Group>
							</Flex>

							{error}
						</Stack>
					)}
				</Form>
			) : (
				<>
					<IconLabelImportantFilled
						size={21}
						style={{
							color: label.color,
						}}
					/>

					<Text flex={1} size="lg">
						{label.name}
					</Text>
					<Group ml="auto" gap="xs">
						<ActionIcon variant="light" onClick={() => setIsEditing(true)} size={36}>
							<IconEdit size={18} />
						</ActionIcon>

						<ActionIcon
							variant="light"
							color="red"
							loading={deleteLabelLoading}
							onClick={() => deleteLabel({ variables: { data: { id: label.id } } })}
							size={36}
						>
							<IconTrash size={18} />
						</ActionIcon>
					</Group>
				</>
			)}
		</Group>
	);
};

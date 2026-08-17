import { useMutation } from '@apollo/client/react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Group, Text, TextInput, ActionIcon, Stack, Box, Paper } from '@mantine/core';
import { useForm, schemaResolver } from '@mantine/form';
import {
	IconLabelImportantFilled,
	IconEdit,
	IconTrash,
	IconCheck,
	IconX,
	IconGripVertical,
} from '@tabler/icons-react';
import { useEffect } from 'react';

import { updateLabelSchema } from '@inboxt/common';

import { DELETE_LABEL, UPDATE_LABEL, SavedItemLabelFragmentFragment as Label } from '~lib/graphql';

import { Form } from '../Form';
import { LabelsColorInput } from '../LabelsColorInput';

type EditableLabelItemProps = {
	label: Label;
	isEditing: boolean;
	setIsEditing: (isEditing: boolean) => void;
};

export const EditableLabelItem = ({ label, isEditing, setIsEditing }: EditableLabelItemProps) => {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id: label.id,
		disabled: isEditing,
	});

	const style = {
		transform: CSS.Translate.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
		position: 'relative' as const,
		zIndex: isDragging ? 1 : 0,
	};

	const [updateLabel, { loading: updateLabelLoading, error: updateLabelError }] = useMutation(
		UPDATE_LABEL,
		{
			refetchQueries: ['labels', 'entries'],
		},
	);

	const [deleteLabel, { loading: deleteLabelLoading }] = useMutation(DELETE_LABEL, {
		refetchQueries: ['labels', 'entries'],
	});

	const form = useForm({
		mode: 'uncontrolled',
		initialValues: {
			name: '',
			color: '#fff',
		},
		validate: schemaResolver(updateLabelSchema),
	});

	useEffect(() => {
		if (isEditing) {
			form.setValues({
				name: label.name,
				color: label.color,
			});
			form.clearErrors();
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isEditing, label.name, label.color]);

	const handleSave = async (values: typeof form.values) => {
		await updateLabel({
			variables: { data: { id: label.id, ...values } },
		});
		setIsEditing(false);
	};

	return (
		<Paper
			withBorder
			p="sm"
			radius="md"
			ref={setNodeRef}
			style={style}
			shadow={isDragging ? 'md' : 'none'}
		>
			<Group wrap="nowrap" align="center" gap="sm">
				{!isEditing && (
					<Box
						{...attributes}
						{...listeners}
						style={{ cursor: 'grab', display: 'flex', alignItems: 'center' }}
						c="dimmed"
					>
						<IconGripVertical size={18} />
					</Box>
				)}

				{isEditing ? (
					<Form
						onSubmit={form.onSubmit(handleSave)}
						error={updateLabelError}
						flex={1}
						miw={0}
					>
						{({ error }) => (
							<Stack gap="xs">
								<TextInput
									{...form.getInputProps('name')}
									key={form.key('name')}
									placeholder="Label name"
									label="Name"
									maxLength={30}
								/>

								<LabelsColorInput
									{...form.getInputProps('color')}
									key={form.key('color')}
									label="Color"
								/>

								<Group justify="flex-end" gap="xs">
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

								{error}
							</Stack>
						)}
					</Form>
				) : (
					<>
						<Box>
							<IconLabelImportantFilled
								size={18}
								style={{
									color: label.color,
								}}
							/>
						</Box>

						<Stack gap={0} flex={1} miw={0}>
							<Text size="sm" fw={600} style={{ wordBreak: 'break-word' }}>
								{label.name}
							</Text>
						</Stack>

						<Group gap={4} wrap="nowrap" style={{ flexShrink: 0 }}>
							<ActionIcon
								variant="subtle"
								onClick={() => setIsEditing(true)}
								size={32}
								c="dimmed"
							>
								<IconEdit size={16} />
							</ActionIcon>

							<ActionIcon
								variant="subtle"
								color="red"
								loading={deleteLabelLoading}
								onClick={() =>
									void deleteLabel({ variables: { data: { id: label.id } } })
								}
								size={32}
							>
								<IconTrash size={16} />
							</ActionIcon>
						</Group>
					</>
				)}
			</Group>
		</Paper>
	);
};

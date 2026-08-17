import { useMutation } from '@apollo/client/react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Group, Text, TextInput, ActionIcon, Stack, Box, Paper } from '@mantine/core';
import { useForm, schemaResolver } from '@mantine/form';
import {
	IconSearch,
	IconEdit,
	IconTrash,
	IconCheck,
	IconX,
	IconGripVertical,
} from '@tabler/icons-react';
import { useEffect } from 'react';

import { updateSavedQuerySchema } from '@inboxt/common';

import { DELETE_SAVED_QUERY, UPDATE_SAVED_QUERY } from '~lib/graphql';
import { SavedQueryFragmentFragment as SavedQuery } from '~lib/graphql';

import { Form } from '../Form';

type EditableSavedQueryItemProps = {
	query: SavedQuery;
	isEditing: boolean;
	setIsEditing: (isEditing: boolean) => void;
};

export const EditableSavedQueryItem = ({
	query,
	isEditing,
	setIsEditing,
}: EditableSavedQueryItemProps) => {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id: query.id,
		disabled: isEditing,
	});

	const style = {
		transform: CSS.Translate.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
		position: 'relative' as const,
		zIndex: isDragging ? 1 : 0,
	};

	const [updateSavedQuery, { loading: updateLoading, error: updateError }] = useMutation(
		UPDATE_SAVED_QUERY,
		{
			refetchQueries: ['savedQueries'],
		},
	);

	const [deleteSavedQuery, { loading: deleteLoading }] = useMutation(DELETE_SAVED_QUERY, {
		refetchQueries: ['savedQueries'],
	});

	const form = useForm({
		mode: 'uncontrolled',
		initialValues: {
			name: '',
			query: '',
		},
		validate: schemaResolver(updateSavedQuerySchema),
	});

	useEffect(() => {
		if (isEditing) {
			form.setValues({
				name: query.name,
				query: query.query,
			});
			form.clearErrors();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isEditing, query.name, query.query]);

	const handleSave = async (values: typeof form.values) => {
		await updateSavedQuery({
			variables: { data: { id: query.id, ...values } },
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
					<Form onSubmit={form.onSubmit(handleSave)} error={updateError} flex={1} miw={0}>
						{({ error }) => (
							<Stack gap="xs">
								<TextInput
									{...form.getInputProps('name')}
									key={form.key('name')}
									placeholder="Query name"
									label="Name"
									maxLength={30}
								/>
								<TextInput
									{...form.getInputProps('query')}
									key={form.key('query')}
									placeholder="Query"
									label="Query"
									maxLength={500}
								/>

								<Group justify="flex-end" gap="xs">
									<ActionIcon type="submit" size={36} loading={updateLoading}>
										<IconCheck size={18} />
									</ActionIcon>

									<ActionIcon
										variant="default"
										onClick={() => setIsEditing(false)}
										size={36}
										loading={updateLoading}
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
						<Box c="dimmed">
							<IconSearch size={18} />
						</Box>

						<Stack gap={0} flex={1} miw={0}>
							<Text size="sm" fw={600} style={{ wordBreak: 'break-word' }}>
								{query.name}
							</Text>
							<Text size="xs" c="dimmed" style={{ wordBreak: 'break-all' }}>
								{query.query}
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
								loading={deleteLoading}
								onClick={() =>
									void deleteSavedQuery({ variables: { data: { id: query.id } } })
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

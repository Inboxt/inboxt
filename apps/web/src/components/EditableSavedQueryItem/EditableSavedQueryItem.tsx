import { useMutation } from '@apollo/client';
import { Group, Text, TextInput, ActionIcon, Stack, Box } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconSearch, IconEdit, IconTrash, IconCheck, IconX } from '@tabler/icons-react';
import { zod4Resolver } from 'mantine-form-zod-resolver';
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
		validate: zod4Resolver(updateSavedQuerySchema),
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
		<Group wrap="nowrap" align="flex-start">
			{isEditing ? (
				<Form onSubmit={form.onSubmit(handleSave)} error={updateError} w="100%">
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
					<Box mt={4}>
						<IconSearch size={18} />
					</Box>

					<Stack gap={0} flex={1} miw={0}>
						<Text size="lg" truncate>
							{query.name}
						</Text>
						<Text size="xs" c="dimmed" truncate>
							{query.query}
						</Text>
					</Stack>

					<Group gap="xs" wrap="nowrap">
						<ActionIcon variant="light" onClick={() => setIsEditing(true)} size={36}>
							<IconEdit size={18} />
						</ActionIcon>

						<ActionIcon
							variant="light"
							color="red"
							loading={deleteLoading}
							onClick={() =>
								void deleteSavedQuery({ variables: { data: { id: query.id } } })
							}
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

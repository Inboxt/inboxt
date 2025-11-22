import { useMutation } from '@apollo/client';
import { Group, Text, TextInput, ActionIcon, Flex, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import {
	IconLabelImportantFilled,
	IconEdit,
	IconTrash,
	IconCheck,
	IconX,
} from '@tabler/icons-react';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { useEffect } from 'react';

import { updateLabelSchema } from '@inboxt/common';

import { useScreenQuery } from '~hooks/useScreenQuery';
import { DELETE_LABEL, ENTRIES, LABELS, UPDATE_LABEL } from '~lib/graphql';
import { Label } from '~lib/graphql/generated/graphql';

import { Form } from '../Form';
import { LabelsColorInput } from '../LabelsColorInput';

import classes from './EditableLabelItem.module.css';

type EditableLabelItemProps = {
	label: Label;
	isEditing: boolean;
	setIsEditing: (isEditing: boolean) => void;
};

export const EditableLabelItem = ({ label, isEditing, setIsEditing }: EditableLabelItemProps) => {
	const isAboveSmScreen = useScreenQuery('sm', 'above');

	const [updateLabel, { loading: updateLabelLoading, error: updateLabelError }] = useMutation(
		UPDATE_LABEL,
		{
			refetchQueries: [LABELS, ENTRIES],
		},
	);

	const [deleteLabel, { loading: deleteLabelLoading }] = useMutation(DELETE_LABEL, {
		refetchQueries: [LABELS, ENTRIES],
	});

	const form = useForm({
		mode: 'uncontrolled',
		initialValues: {
			name: '',
			color: '#fff',
		},
		validate: zod4Resolver(updateLabelSchema),
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
		<Group wrap="nowrap">
			{isEditing ? (
				<Form onSubmit={form.onSubmit(handleSave)} error={updateLabelError}>
					{({ error }) => (
						<Stack gap="xs">
							<Flex
								gap="xs"
								flex={1}
								direction={{ base: 'column', sm: 'row' }}
								align="flex-start"
							>
								<TextInput
									{...form.getInputProps('name')}
									key={form.key('name')}
									placeholder="Label name"
									flex={1}
									w="100%"
								/>

								<Group wrap="nowrap" w={isAboveSmScreen ? undefined : '100%'}>
									<LabelsColorInput
										{...form.getInputProps('color')}
										key={form.key('color')}
										className={classes.editableLabelColorInput}
									/>

									<Group ml={isAboveSmScreen ? 'auto' : 0} gap="xs" wrap="nowrap">
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

					<Text flex={1} size="lg" className={classes.editableLabelText}>
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
							onClick={() =>
								void deleteLabel({ variables: { data: { id: label.id } } })
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

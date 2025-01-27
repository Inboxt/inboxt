import { ContextModalProps } from '@mantine/modals';
import { Button, Group, Stack, TextInput } from '@mantine/core';
import { LabelsColorInput } from '../../components/LabelsColorInput';

export const CreateLabelModal = ({ id, context }: ContextModalProps) => {
	const handleCreateLabel = () => {
		// todo: save
		context.closeModal(id);
	};

	return (
		<Stack>
			<Group>
				<TextInput label="Name" flex={1} />
				<LabelsColorInput label="Color" />
			</Group>

			<Group justify="flex-end">
				<Button
					variant="light"
					color="text"
					onClick={() => context.closeModal(id)}
				>
					Cancel
				</Button>

				<Button onClick={handleCreateLabel}>Save</Button>
			</Group>
		</Stack>
	);
};

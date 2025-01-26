import { useState } from 'react';
import {
	Group,
	Text,
	TextInput,
	Button,
	ActionIcon,
	Flex,
} from '@mantine/core';
import {
	IconLabelImportantFilled,
	IconEdit,
	IconTrash,
} from '@tabler/icons-react';
import { LabelsColorInput } from '../LabelsColorInput';
import { useScreenQuery } from '../../hooks/useScreenQuery.tsx';

type EditableLabelItemProps = {
	label: { id: number; name: string; color: string };
	isEditing: boolean;
	onEditStart: () => void;
	onEditSave: (
		id: number,
		editedLabel: { name: string; color: string },
	) => void;
	onEditCancel: () => void;
};

export const EditableLabelItem = ({
	label,
	isEditing,
	onEditStart,
	onEditSave,
	onEditCancel,
}: EditableLabelItemProps) => {
	const isAboveLgScreen = useScreenQuery('lg', 'above');
	const [editedLabel, setEditedLabel] = useState({
		name: label.name,
		color: label.color,
	});

	const handleSave = () => {
		onEditSave(label.id, editedLabel);
	};

	return (
		<Group py={isEditing ? 0 : 'xxxs'}>
			{!isEditing && (
				<IconLabelImportantFilled
					size={21}
					style={{
						color: `var(--mantine-color-${label.color})`,
					}}
				/>
			)}

			{isEditing ? (
				<Flex
					gap="xs"
					flex={1}
					direction={{ base: 'column', lg: 'row' }}
				>
					<TextInput
						value={editedLabel.name}
						onChange={(e) =>
							setEditedLabel((prev) => ({
								...prev,
								name: e.target.value,
							}))
						}
						placeholder="Label name"
						flex={1}
					/>
					<LabelsColorInput
						value={editedLabel.color}
						onChange={(color) =>
							setEditedLabel((prev) => ({ ...prev, color }))
						}
					/>
					<Group
						ml={isAboveLgScreen ? 'auto' : 0}
						gap="xs"
						grow={!isAboveLgScreen}
					>
						<Button onClick={onEditCancel} variant="default">
							Cancel
						</Button>
						<Button onClick={handleSave}>Save</Button>
					</Group>
				</Flex>
			) : (
				<>
					<Text flex={1}>{label.name}</Text>
					<Group ml="auto" gap="xs">
						<ActionIcon variant="light" onClick={onEditStart}>
							<IconEdit size={16} />
						</ActionIcon>
						<ActionIcon variant="light" color="red">
							<IconTrash size={16} />
						</ActionIcon>
					</Group>
				</>
			)}
		</Group>
	);
};

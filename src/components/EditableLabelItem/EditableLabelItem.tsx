import { useState } from 'react';
import {
	Group,
	Text,
	TextInput,
	ColorInput,
	Button,
	ActionIcon,
	Flex,
} from '@mantine/core';
import {
	IconLabelImportantFilled,
	IconEdit,
	IconTrash,
} from '@tabler/icons-react';
import { useLargeScreen } from '../../hooks/useLargeScreen.tsx';

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
	const isLargeScreen = useLargeScreen();
	const [editedLabel, setEditedLabel] = useState({
		name: label.name,
		color: label.color,
	});

	const handleSave = () => {
		onEditSave(label.id, editedLabel);
	};

	return (
		<Group py={isEditing ? 0 : 4}>
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
					<ColorInput
						value={editedLabel.color}
						onChange={(color) =>
							setEditedLabel((prev) => ({ ...prev, color }))
						}
						defaultValue="#868e96"
						maw={isLargeScreen ? 110 : undefined}
						swatches={[
							'#2e2e2e',
							'#868e96',
							'#fa5252',
							'#e64980',
							'#be4bdb',
							'#7950f2',
							'#4c6ef5',
							'#228be6',
							'#15aabf',
							'#12b886',
							'#40c057',
							'#82c91e',
							'#fab005',
							'#fd7e14',
						]}
						withPicker={false}
						disallowInput
					/>
					<Group
						ml={isLargeScreen ? 'auto' : 0}
						gap="xs"
						grow={!isLargeScreen}
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

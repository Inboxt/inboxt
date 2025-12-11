import { useQuery } from '@apollo/client';
import { Combobox, useCombobox, Pill, PillsInput, Group, Stack, Checkbox } from '@mantine/core';
import { IconLabelImportantFilled } from '@tabler/icons-react';
import { useState } from 'react';

import { MAX_VISIBLE_SELECTED_LABELS } from '@inboxt/common';
import { LABELS } from '@inboxt/graphql';

type LabelValue = {
	value: string;
	label: string;
	color: string;
};

type LabelsMultiSelectProps = {
	value?: string[];
	onChange?: (value: string[]) => void;
};

export const LabelsMultiSelect = ({ value = [], onChange = () => {} }: LabelsMultiSelectProps) => {
	const [search, setSearch] = useState('');
	const { data, loading: labelsLoading } = useQuery(LABELS);

	const combobox = useCombobox({
		onDropdownClose: () => combobox.resetSelectedOption(),
		onDropdownOpen: () => combobox.updateSelectedOptionIndex('active'),
	});

	if (labelsLoading) {
		return null;
	}

	const labelsData: LabelValue[] =
		data?.labels?.map((label) => ({
			value: label.id,
			label: label.name,
			color: label.color,
		})) ?? [];

	const handleValueSelect = (val: string) =>
		onChange(value.includes(val) ? value.filter((v) => v !== val) : [...value, val]);

	const handleValueRemove = (val: string) => onChange(value.filter((v) => v !== val));

	const values = value
		.slice(
			0,
			MAX_VISIBLE_SELECTED_LABELS === value.length
				? MAX_VISIBLE_SELECTED_LABELS
				: MAX_VISIBLE_SELECTED_LABELS - 1,
		)

		.map((id) => {
			const item = labelsData.find((l) => l.value === id);
			if (!item) {
				return null;
			}

			return (
				<Pill
					key={item.value}
					bg={item.color}
					c="white"
					withRemoveButton
					onRemove={() => handleValueRemove(item.value)}
				>
					{item.label}
				</Pill>
			);
		});

	const options = labelsData
		.filter((item) => item.label.toLowerCase().includes(search.trim().toLowerCase()))
		.map((item) => (
			<Combobox.Option
				value={item.value}
				key={item.value}
				active={value.includes(item.value)}
			>
				<Group gap="sm" justify="space-between">
					<Group gap={7}>
						<IconLabelImportantFilled size={18} style={{ color: item.color }} />
						<span>{item.label}</span>
					</Group>

					<Checkbox
						checked={value.includes(item.value)}
						onChange={() => {}}
						aria-hidden
						tabIndex={-1}
						style={{ pointerEvents: 'none' }}
					/>
				</Group>
			</Combobox.Option>
		));

	return (
		<Stack gap={2}>
			<Combobox store={combobox} onOptionSubmit={handleValueSelect}>
				<Combobox.DropdownTarget>
					<PillsInput onClick={() => combobox.openDropdown()}>
						<Pill.Group>
							{value.length > 0 && (
								<>
									{values}
									{value.length > MAX_VISIBLE_SELECTED_LABELS && (
										<Pill>
											+{value.length - (MAX_VISIBLE_SELECTED_LABELS - 1)} more
										</Pill>
									)}
								</>
							)}

							<Combobox.EventsTarget>
								<PillsInput.Field
									onFocus={() => combobox.openDropdown()}
									onBlur={() => combobox.closeDropdown()}
									value={search}
									onChange={(event) => {
										combobox.updateSelectedOptionIndex();
										setSearch(event.currentTarget.value);
									}}
									onKeyDown={(event) => {
										if (
											event.key === 'Backspace' &&
											search.length === 0 &&
											value.length > 0
										) {
											event.preventDefault();
											const lastVal = value[value.length - 1];
											if (lastVal) {
												handleValueRemove(lastVal);
											}
										}
									}}
									placeholder={value.length === 0 ? 'Search labels...' : ''}
								/>
							</Combobox.EventsTarget>
						</Pill.Group>
					</PillsInput>
				</Combobox.DropdownTarget>

				<Combobox.Dropdown>
					<Combobox.Options mah={200} style={{ overflowY: 'auto' }}>
						{options.length > 0 ? (
							options
						) : (
							<Combobox.Empty>Nothing found...</Combobox.Empty>
						)}
					</Combobox.Options>
				</Combobox.Dropdown>
			</Combobox>
		</Stack>
	);
};

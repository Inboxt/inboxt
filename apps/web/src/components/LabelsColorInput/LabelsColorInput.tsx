import { ColorInput, DEFAULT_THEME, MantineColor } from '@mantine/core';
import { useUncontrolled } from '@mantine/hooks';

import { useScreenQuery } from '../../hooks/useScreenQuery.tsx';

const colorNames: MantineColor[] = [
	'red',
	'pink',
	'grape',
	'violet',
	'indigo',
	'blue',
	'cyan',
	'teal',
	'green',
	'lime',
	'yellow',
	'orange',
];

const swatches = colorNames
	.map((name) => DEFAULT_THEME.colors[name]?.[7])
	.filter((color): color is string => Boolean(color));

type LabelsColorInputProps = {
	value?: string;
	defaultValue?: string;
	onChange?: (value: string) => void;
	label?: string;
};

export const LabelsColorInput = ({
	value,
	defaultValue,
	onChange,
	label,
}: LabelsColorInputProps) => {
	const [_value, handleChange] = useUncontrolled({
		value,
		defaultValue,
		onChange,
	});

	const isAboveLgScreen = useScreenQuery('lg', 'above');
	return (
		<ColorInput
			value={_value}
			onChange={(fieldValue) => handleChange(fieldValue)}
			maw={isAboveLgScreen ? 110 : undefined}
			swatches={[DEFAULT_THEME.colors.dark[9], DEFAULT_THEME.colors.gray[9], ...swatches]}
			withPicker={false}
			disallowInput
			label={label}
			closeOnColorSwatchClick
		/>
	);
};

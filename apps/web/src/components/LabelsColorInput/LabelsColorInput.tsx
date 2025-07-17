import { ColorInput, DEFAULT_THEME, MantineColor } from '@mantine/core';
import { useUncontrolled } from '@mantine/hooks';

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
	className?: string;
};

export const LabelsColorInput = ({
	value,
	defaultValue,
	onChange,
	label,
	className,
}: LabelsColorInputProps) => {
	const [_value, handleChange] = useUncontrolled({
		value,
		defaultValue,
		onChange,
	});

	return (
		<ColorInput
			value={_value}
			onChange={(fieldValue) => handleChange(fieldValue)}
			maw={110}
			swatches={[DEFAULT_THEME.colors.dark[9], DEFAULT_THEME.colors.gray[9], ...swatches]}
			withPicker={false}
			disallowInput
			label={label}
			closeOnColorSwatchClick
			className={className}
		/>
	);
};

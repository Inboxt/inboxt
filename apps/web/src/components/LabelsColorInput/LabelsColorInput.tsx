import { ColorInput } from '@mantine/core';
import { useUncontrolled } from '@mantine/hooks';

import { useScreenQuery } from '~hooks/useScreenQuery.tsx';

import { labelColors } from '../../theme/labelColors.ts';

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
	const isBelowSmScreen = useScreenQuery('sm', 'below');
	const [_value, handleChange] = useUncontrolled({
		value,
		defaultValue,
		onChange,
	});

	return (
		<ColorInput
			value={_value}
			onChange={(fieldValue) => handleChange(fieldValue)}
			maw={isBelowSmScreen ? undefined : 120}
			swatches={labelColors}
			withPicker={false}
			disallowInput
			label={label}
			closeOnColorSwatchClick
			className={className}
		/>
	);
};

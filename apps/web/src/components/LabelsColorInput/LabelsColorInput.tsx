import { ColorInput } from '@mantine/core';
import { useScreenQuery } from '../../hooks/useScreenQuery.tsx';

type LabelsColorInputProps = {
	value: string;
	onChange: (value: string) => void;
	label?: string;
};

export const LabelsColorInput = ({ value, onChange, label }: LabelsColorInputProps) => {
	const isAboveLgScreen = useScreenQuery('lg', 'above');
	return (
		<ColorInput
			value={value}
			onChange={onChange}
			defaultValue="#868e96"
			maw={isAboveLgScreen ? 110 : undefined}
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
			]} // todo: adjust swatches for values from theme
			withPicker={false}
			disallowInput
			label={label}
		/>
	);
};

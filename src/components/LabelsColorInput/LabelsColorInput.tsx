import { ColorInput } from '@mantine/core';
import { useLargeScreen } from '../../hooks/useLargeScreen.tsx';

type LabelsColorInputProps = {
	value: string;
	onChange: (value: string) => void;
};

export const LabelsColorInput = ({
	value,
	onChange,
}: LabelsColorInputProps) => {
	const isLargeScreen = useLargeScreen();

	return (
		<ColorInput
			value={value}
			onChange={onChange}
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
			]} // todo: adjust swatches for values from theme
			withPicker={false}
			disallowInput
		/>
	);
};

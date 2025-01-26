import {
	Accordion,
	ActionIcon,
	Button,
	Divider,
	Group,
	NativeSelect,
	SegmentedControl,
	Slider,
	Stack,
	Text,
	Title,
	VisuallyHidden,
} from '@mantine/core';
import {
	IconAlignCenter,
	IconAlignLeft,
	IconAlignRight,
	IconLetterSpacing,
	IconLineHeight,
	IconMinus,
	IconPlus,
	IconSpacingHorizontal,
	IconViewportWide,
} from '@tabler/icons-react';

import classes from './FormReadingSettings.module.css';

export const FormReadingSettings = () => {
	return (
		<Stack>
			<Title order={4}>Text</Title>
			<Group justify="space-between">
				<Text>Text size</Text>
				<Group gap={4}>
					<ActionIcon variant="light" color="black" size="lg">
						<IconMinus size={16} />
					</ActionIcon>

					<ActionIcon variant="light" color="black" size="lg">
						<IconPlus size={16} />
					</ActionIcon>
				</Group>
			</Group>

			<Group w="100%">
				<NativeSelect
					label="Font"
					data={['React', 'Angular', 'Vue']}
					flex={1}
				/>
				<NativeSelect
					label="Font weight"
					data={['Regular', 'Light', 'Bold']}
					flex={1}
				/>
			</Group>

			<Divider w="100%" />

			<Title order={4}>Layout</Title>

			<Group gap="xs">
				<IconViewportWide size={18} />
				<Text>Content width</Text>
			</Group>
			<Slider
				color="blue"
				defaultValue={37}
				restrictToMarks
				min={20}
				max={60}
				label={null}
				marks={[
					{ value: 20 },
					{ value: 25 },
					{ value: 30 },
					{ value: 37 },
					{ value: 45 },
					{ value: 50 },
					{ value: 55 },
					{ value: 60 },
				]}
			/>

			<Group gap="xs">
				<IconLineHeight size={18} />
				<Text>Line spacing</Text>
			</Group>
			<Slider
				color="blue"
				defaultValue={1.6}
				restrictToMarks
				min={1}
				max={2.6}
				step={0.2}
				label={null}
				marks={[
					{ value: 1 },
					{ value: 1.2 },
					{ value: 1.4 },
					{ value: 1.6 },
					{ value: 1.8 },
					{ value: 2 },
					{ value: 2.2 },
					{ value: 2.4 },
					{ value: 2.6 },
				]}
			/>

			<Accordion
				variant="unstyled"
				classNames={{
					control: classes.accordionControl,
					content: classes.accordionContent,
				}}
			>
				<Accordion.Item key="Advanced" value="Advanced">
					<Accordion.Control>
						<Title order={4}>Advanced</Title>
					</Accordion.Control>
					<Accordion.Panel>
						<Stack>
							<Group gap="xs">
								<IconSpacingHorizontal size={18} />
								<Text>Character spacing</Text>
							</Group>
							<Slider
								color="blue"
								defaultValue={0}
								restrictToMarks
								min={0}
								max={0.24}
								label={null}
								marks={[
									{ value: 0 },
									{ value: 0.03 },
									{ value: 0.06 },
									{ value: 0.09 },
									{ value: 0.12 },
									{ value: 0.15 },
									{ value: 0.18 },
									{ value: 0.21 },
									{ value: 0.24 },
								]}
								step={0.03}
								mb="md"
							/>

							<Group gap="xs">
								<IconLetterSpacing size={18} />
								<Text>Word spacing</Text>
							</Group>
							<Slider
								color="blue"
								defaultValue={0}
								restrictToMarks
								min={0}
								max={0.24}
								label={null}
								marks={[
									{ value: 0 },
									{ value: 0.03 },
									{ value: 0.06 },
									{ value: 0.09 },
									{ value: 0.12 },
									{ value: 0.15 },
									{ value: 0.18 },
									{ value: 0.21 },
									{ value: 0.24 },
								]}
								step={0.03}
								mb="md"
							/>

							<Text>Text alignment</Text>
							<SegmentedControl
								color="blue"
								data={[
									{
										value: 'preview',
										label: (
											<>
												<IconAlignLeft />
												<VisuallyHidden>
													Preview
												</VisuallyHidden>
											</>
										),
									},
									{
										value: 'code',
										label: (
											<>
												<IconAlignCenter />
												<VisuallyHidden>
													Code
												</VisuallyHidden>
											</>
										),
									},
									{
										value: 'export',
										label: (
											<>
												<IconAlignRight />
												<VisuallyHidden>
													Export
												</VisuallyHidden>
											</>
										),
									},
								]}
							/>

							<Button
								variant="transparent"
								color="blue"
								ml="auto"
							>
								Reset to defaults
							</Button>
						</Stack>
					</Accordion.Panel>
				</Accordion.Item>
			</Accordion>
		</Stack>
	);
};

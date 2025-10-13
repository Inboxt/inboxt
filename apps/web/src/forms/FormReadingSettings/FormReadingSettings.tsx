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

import {
	MAX_READER_CONTENT_WIDTH,
	MAX_READER_FONT_SIZE,
	MAX_READER_LETTER_SPACING,
	MAX_READER_LINE_HEIGHT,
	MAX_READER_WORD_SPACING,
	MIN_READER_CONTENT_WIDTH,
	MIN_READER_FONT_SIZE,
	MIN_READER_LETTER_SPACING,
	MIN_READER_LINE_HEIGHT,
	MIN_READER_WORD_SPACING,
	READER_CONTENT_WIDTHS,
	READER_DEFAULT_SETTINGS,
	READER_FONT_FAMILIES,
	READER_FONT_WEIGHTS,
	READER_LETTER_SPACING,
	READER_LINE_HEIGHTS,
	READER_WORD_SPACING,
	ReaderContentSettings,
} from '@inboxt/common';

import { useReaderSettings } from '~hooks/useReaderSettings.tsx';

import classes from './FormReadingSettings.module.css';

export const FormReadingSettings = () => {
	const { contentSettings, setContentSettings } = useReaderSettings();

	return (
		<Stack>
			<Title order={4} visibleFrom="xs">
				Text
			</Title>

			<Group justify="space-between">
				<Text>Text size ({contentSettings.textSize}px)</Text>
				<Group gap={4}>
					<ActionIcon
						variant="light"
						color="var(--mantine-color-text)"
						size="lg"
						onClick={() =>
							setContentSettings({
								...contentSettings,
								textSize: Math.max(
									MIN_READER_FONT_SIZE,
									contentSettings.textSize - 1,
								),
							})
						}
					>
						<IconMinus size={16} />
					</ActionIcon>

					<ActionIcon
						variant="light"
						color="var(--mantine-color-text)"
						size="lg"
						onClick={() =>
							setContentSettings({
								...contentSettings,
								textSize: Math.min(
									MAX_READER_FONT_SIZE,
									contentSettings.textSize + 1,
								),
							})
						}
					>
						<IconPlus size={16} />
					</ActionIcon>
				</Group>
			</Group>

			<Group w="100%">
				<NativeSelect
					label="Font"
					data={READER_FONT_FAMILIES}
					value={contentSettings.font}
					onChange={(e) =>
						setContentSettings({
							...contentSettings,
							font: e.currentTarget.value as (typeof READER_FONT_FAMILIES)[number],
						})
					}
					flex={1}
				/>
				<NativeSelect
					label="Font weight"
					data={READER_FONT_WEIGHTS}
					value={contentSettings.fontWeight}
					onChange={(e) =>
						setContentSettings({
							...contentSettings,
							fontWeight: e.currentTarget
								.value as (typeof READER_FONT_WEIGHTS)[number],
						})
					}
					flex={1}
				/>
			</Group>

			<Divider w="100%" />

			<Title order={4}>Layout</Title>

			<Group gap="xs" visibleFrom="xs">
				<IconViewportWide size={18} />
				<Text>Content width</Text>
			</Group>
			<Slider
				visibleFrom="xs"
				color="var(--mantine-color-text)"
				value={contentSettings.contentWidth}
				onChange={(value) =>
					setContentSettings({
						...contentSettings,
						contentWidth: value as (typeof READER_CONTENT_WIDTHS)[number],
					})
				}
				restrictToMarks
				min={MIN_READER_CONTENT_WIDTH}
				max={MAX_READER_CONTENT_WIDTH}
				marks={READER_CONTENT_WIDTHS.map((v) => ({ value: v }))}
			/>

			<Group gap="xs">
				<IconLineHeight size={18} />
				<Text>Line height</Text>
			</Group>
			<Slider
				color="var(--mantine-color-text)"
				value={contentSettings.lineHeight}
				onChange={(value) =>
					setContentSettings({
						...contentSettings,
						lineHeight: value as (typeof READER_LINE_HEIGHTS)[number],
					})
				}
				min={MIN_READER_LINE_HEIGHT}
				max={MAX_READER_LINE_HEIGHT}
				step={0.05}
				marks={[{ value: READER_DEFAULT_SETTINGS.lineHeight }]}
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
								color="var(--mantine-color-text)"
								value={contentSettings.letterSpacing}
								onChange={(value) =>
									setContentSettings({
										...contentSettings,
										letterSpacing:
											value as (typeof READER_LETTER_SPACING)[number],
									})
								}
								min={MIN_READER_LETTER_SPACING}
								max={MAX_READER_LETTER_SPACING}
								step={0.03}
								mb="md"
							/>

							<Group gap="xs">
								<IconLetterSpacing size={18} />
								<Text>Word spacing</Text>
							</Group>
							<Slider
								color="var(--mantine-color-text)"
								value={contentSettings.wordSpacing}
								onChange={(value) =>
									setContentSettings({
										...contentSettings,
										wordSpacing: value as (typeof READER_WORD_SPACING)[number],
									})
								}
								min={MIN_READER_WORD_SPACING}
								max={MAX_READER_WORD_SPACING}
								step={0.03}
								mb="md"
							/>

							<Text>Text alignment</Text>
							<SegmentedControl
								color="dark.5"
								value={contentSettings.alignment}
								onChange={(value) =>
									setContentSettings({
										...contentSettings,
										alignment: value as ReaderContentSettings['alignment'],
									})
								}
								data={[
									{
										value: 'Left',
										label: (
											<>
												<IconAlignLeft />
												<VisuallyHidden>Left</VisuallyHidden>
											</>
										),
									},
									{
										value: 'Center',
										label: (
											<>
												<IconAlignCenter />
												<VisuallyHidden>Center</VisuallyHidden>
											</>
										),
									},
									{
										value: 'Right',
										label: (
											<>
												<IconAlignRight />
												<VisuallyHidden>Right</VisuallyHidden>
											</>
										),
									},
								]}
							/>

							<Button
								variant="transparent"
								color="primary"
								ml="auto"
								onClick={() => setContentSettings(READER_DEFAULT_SETTINGS)}
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

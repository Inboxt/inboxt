import { Alert, Button, Card, Flex, FileInput, Stack, Text, Title } from '@mantine/core';
import { ContextModalProps } from '@mantine/modals';
import { IconCsv, IconZip } from '@tabler/icons-react';
import { ReactNode, useState } from 'react';

import { ButtonContainer } from '~components/ButtonContainer';
import { toastInfo } from '~components/Toast';

type ImportType = 'CSV' | 'ZIP_ARCHIVE';

export type ImportModalProps = {
	type?: ImportType;
};

const importOptions: {
	type: ImportType;
	label: string;
	icon: ReactNode;
	description: string;
	accept: string;
}[] = [
	{
		type: 'CSV',
		label: 'CSV File',
		icon: <IconCsv size={20} />,
		description:
			'Import a CSV file with the columns: name, url, description, date, and labels. Labels can be separated by commas (for example: home, reading, long label). This import might take some time to finish.',
		accept: '.csv,text/csv',
	},
	{
		type: 'ZIP_ARCHIVE',
		label: 'Inboxt / Other ZIP',
		icon: <IconZip size={20} />,
		description:
			'Import a ZIP file exported from Inboxt, or any ZIP that contains HTML files or folders. If you import regular HTML files, any file with “newsletter” or “email” in its name will be saved as a newsletter.',
		accept: '.zip,application/zip',
	},
];

export const ImportModal = ({ id, context }: ContextModalProps<ImportModalProps>) => {
	const [selectedType, setSelectedType] = useState<ImportType | null>(null);
	const [file, setFile] = useState<File | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string>();

	const selectedOption = importOptions.find((opt) => opt.type === selectedType);

	const handleImport = async () => {
		if (!selectedType) {
			setError('Please choose an import source.');
			return;
		}

		if (!file) {
			setError('Please select a file to import.');
			return;
		}

		setLoading(true);
		setError(undefined);

		try {
			const formData = new FormData();
			formData.append('file', file);
			formData.append('type', selectedType);

			const response = await fetch(`${process.env.API_URL}/import`, {
				method: 'POST',
				body: formData,
				credentials: 'include',
			});

			if (!response.ok) {
				const error = (await response.json()) as { message?: string };
				setError(error.message || 'Failed to upload file.');
				return;
			}

			toastInfo({
				title: 'Import started',
				description: 'You’ll receive an email when it’s finished.',
			});

			context.closeModal(id);
		} catch (err) {
			console.error(err);
			setError('Internal server error.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<Stack gap="xl">
			{!selectedType && (
				<Alert color="gray">
					You can import your saved items using a CSV file or a ZIP archive. CSV imports
					might take a bit longer to finish. When the import is complete, you’ll get an
					email with a summary of how many items and labels were added or skipped.
				</Alert>
			)}

			{!selectedType && (
				<Stack>
					{importOptions.map((opt) => (
						<Card
							key={opt.type}
							withBorder
							radius="md"
							onClick={() => setSelectedType(opt.type)}
							style={{ cursor: 'pointer' }}
						>
							<Flex gap="sm" align="flex-start">
								{opt.icon}
								<Stack gap={2}>
									<Text fw={500}>{opt.label}</Text>
									<Text size="xs" c="dimmed">
										{opt.description}
									</Text>
								</Stack>
							</Flex>
						</Card>
					))}
				</Stack>
			)}

			{selectedType && (
				<Card withBorder radius="md">
					<Stack gap="sm">
						<Flex justify="space-between" align="center">
							<Title order={5}>{selectedOption?.label}</Title>
							<Button
								variant="subtle"
								size="xs"
								onClick={() => setSelectedType(null)}
								disabled={loading}
							>
								Change
							</Button>
						</Flex>

						<Text size="sm">{selectedOption?.description}</Text>

						<FileInput
							label="Select File"
							placeholder="Choose the export file"
							value={file}
							onChange={setFile}
							accept={selectedOption?.accept}
						/>

						{error && (
							<Text c="red" size="sm">
								{error}
							</Text>
						)}
					</Stack>
				</Card>
			)}

			<ButtonContainer>
				<Button
					variant="default"
					onClick={() =>
						!!selectedType ? setSelectedType(null) : context.closeModal(id)
					}
					disabled={loading}
				>
					Cancel
				</Button>
				<Button onClick={handleImport} loading={loading} disabled={!selectedType}>
					Import
				</Button>
			</ButtonContainer>
		</Stack>
	);
};

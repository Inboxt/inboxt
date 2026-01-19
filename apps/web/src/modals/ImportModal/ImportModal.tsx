import { Alert, Button, Card, Flex, FileInput, Stack, Text, Title } from '@mantine/core';
import { ContextModalProps } from '@mantine/modals';
import { IconCsv, IconZip } from '@tabler/icons-react';
import { ReactNode, useState } from 'react';

import { ButtonContainer } from '~components/ButtonContainer';
import { Form } from '~components/Form';
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
	const [importError, setImportError] = useState<string>();

	const selectedOption = importOptions.find((opt) => opt.type === selectedType);

	const handleImport = async () => {
		if (!selectedType) {
			setImportError('Please choose an import source.');
			return;
		}

		if (!file) {
			setImportError('Please select a file to import.');
			return;
		}

		setLoading(true);
		setImportError(undefined);

		try {
			const formData = new FormData();
			formData.append('file', file);
			formData.append('type', selectedType);

			const response = await fetch('/api/import', {
				method: 'POST',
				body: formData,
				credentials: 'include',
			});

			if (!response.ok) {
				const error = (await response.json()) as { message?: string };
				setImportError(error.message || 'Failed to upload file.');
				return;
			}

			toastInfo({
				title: 'Import started',
				description: 'Your items will appear as they are processed.',
			});

			context.closeModal(id);
		} catch (err) {
			console.error(err);
			setImportError('Internal server error.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<Form
			onSubmit={(e) => {
				e.preventDefault();
				void handleImport();
			}}
			error={importError}
		>
			{({ error }) => (
				<Stack gap="xl" flex={1}>
					{!selectedType && (
						<Alert color="gray">
							You can import your saved items using a CSV file or a ZIP archive. CSV
							imports might take a bit longer to finish. Items will appear in your
							library as they are processed in the background.
						</Alert>
					)}

					{!selectedType && (
						<Stack>
							{importOptions.map((opt) => (
								<Card
									key={opt.type}
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
						<Card>
							<Stack gap="sm">
								<Flex justify="space-between" align="center">
									<Title order={5}>{selectedOption?.label}</Title>
									<Button
										variant="subtle"
										size="xs"
										onClick={() => {
											setSelectedType(null);
											setImportError(undefined);
										}}
										disabled={loading}
										type="button"
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

								{error}
							</Stack>
						</Card>
					)}

					<ButtonContainer mt="auto">
						<Button
							variant="default"
							onClick={() => {
								if (selectedType) {
									setSelectedType(null);
									setImportError(undefined);
								} else {
									context.closeModal(id);
								}
							}}
							disabled={loading}
						>
							Cancel
						</Button>
						<Button type="submit" loading={loading} disabled={!selectedType}>
							Import
						</Button>
					</ButtonContainer>
				</Stack>
			)}
		</Form>
	);
};

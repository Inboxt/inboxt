import {
	Button,
	Stack,
	Group,
	Box,
	Select,
	Text,
	Image,
	Divider,
	Title,
	Flex,
	SelectProps,
	ActionIcon,
} from '@mantine/core';
import { usePWAInstall } from 'react-use-pwa-install';
import { IconCheck, IconDeviceDesktopPlus, IconDownload } from '@tabler/icons-react';
import { ContextModalProps } from '@mantine/modals';

const icons = {
	firefox: '/firefox-icon.png',
	chrome: '/chrome-icon.png',
	edge: '/edge-icon.png',
	safari: '/safari-icon.png',
};

const BrowserIcon = ({ browser }: { browser: string }) => {
	return <Image src={icons[browser]} h={20} w="auto" />;
};

const renderSelectOption: SelectProps['renderOption'] = ({ option, checked }) => (
	<Group flex="1" gap="xs">
		<BrowserIcon browser={option.value} />
		{option.label}
		{checked && <IconCheck style={{ marginInlineStart: 'auto' }} size={18} opacity={0.6} />}
	</Group>
);

const InstallOption = ({
	imageSrc,
	altText,
	title,
	description,
	children,
}: {
	imageSrc: string;
	altText: string;
	title: string;
	description: string;
	children?: React.ReactNode;
}) => (
	<Flex
		align={{ base: 'flex-start', sm: 'center' }}
		gap={{ base: 'xs', sm: 'xl' }}
		wrap="nowrap"
		direction={{ base: 'column', sm: 'row' }}
	>
		<Image src={imageSrc} alt={altText} w="auto" h={116} radius="sm" />
		<Box>
			<Title order={5}>{title}</Title>
			<Text>{description}</Text>
			{children && <Group mt="sm">{children}</Group>}
		</Box>
	</Flex>
);

export const InstallModal = ({ id, context }: ContextModalProps) => {
	const installPWA = usePWAInstall();

	return (
		<Stack gap="lg">
			<InstallOption
				imageSrc="/app-screenshot.png"
				altText="Mobile app"
				title="Install App for iOS and Android"
				description="Use our mobile app to save any link, access your full library."
			>
				<a href="https://www.apple.com/app-store/" aria-label="Download on the App Store">
					<Image src="/app-store-badge.png" height={41} alt="App Store badge" />
				</a>
				<a href="https://play.google.com/store" aria-label="Get it on Google Play">
					<Image src="/play-store-badge.png" height={40} alt="Google Play badge" />
				</a>
			</InstallOption>

			<Divider />

			{installPWA && (
				<>
					<InstallOption
						imageSrc="/app-screenshot.png"
						altText="PWA app"
						title="Access Anywhere with PWA"
						description="Install our Progressive Web App on any device to save links and access your full library effortlessly."
					>
						<Button
							leftSection={<IconDeviceDesktopPlus size={16} />}
							onClick={installPWA}
						>
							Install PWA
						</Button>
					</InstallOption>

					<Divider />
				</>
			)}

			<InstallOption
				imageSrc="/app-screenshot.png"
				altText="Browser extension"
				title="Install Browser Extensions"
				description="Installing the browser extension is the best way to save pages directly from your computer to our platform."
			>
				<Flex gap="xs" align="center">
					<Select
						placeholder="Select your browser"
						data={[
							{ value: 'chrome', label: 'Google Chrome' },
							{ value: 'firefox', label: 'Firefox' },
							{ value: 'edge', label: 'Microsoft Edge' },
							{ value: 'safari', label: 'Safari' },
						]}
						renderOption={renderSelectOption}
						//value={selectedBrowser}
						//onChange={(value) => setSelectedBrowser(value!)}
						leftSection={<BrowserIcon browser="chrome" />} // todo: different icon based on selection
					/>
					<ActionIcon
						component="a"
						href="#"
						aria-label="Download extension for selected browser"
						size="lg"
					>
						<IconDownload size={16} />
					</ActionIcon>
				</Flex>
			</InstallOption>

			<Button onClick={() => context.closeModal(id)} ml="auto" variant="default">
				Close
			</Button>
		</Stack>
	);
};

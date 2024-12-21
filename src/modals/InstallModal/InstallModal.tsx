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
import {
	IconCheck,
	IconDeviceDesktopPlus,
	IconDownload,
} from '@tabler/icons-react';
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

const renderSelectOption: SelectProps['renderOption'] = ({
	option,
	checked,
}) => (
	<Group flex="1" gap="xs">
		<BrowserIcon browser={option.value} />
		{option.label}
		{checked && (
			<IconCheck
				style={{ marginInlineStart: 'auto' }}
				size={18}
				opacity={0.6}
			/>
		)}
	</Group>
);

export const InstallModal = ({ id, context }: ContextModalProps) => {
	const installPWA = usePWAInstall();

	return (
		<Stack gap="lg">
			<Flex
				align={{ base: 'flex-start', sm: 'center' }}
				gap={{ base: 'xs', sm: 'xl' }}
				wrap="nowrap"
				direction={{ base: 'column', sm: 'row' }}
			>
				<Image
					src="/app-screenshot.png"
					alt="mobile app"
					w="auto"
					h={116}
					radius="sm"
				/>
				<Box>
					<Title order={5}>Install App for iOS and Android</Title>
					<Text>
						Use our mobile app to save any link, access your full
						library.
					</Text>

					<Group mt="sm" gap="xs">
						<a href="https://www.apple.com/app-store/">
							<Image w="auto" h={41} src="/app-store-badge.png" />
						</a>

						<a href="https://play.google.com/store">
							<Image
								w="auto"
								h={40}
								src="/play-store-badge.png"
							/>
						</a>
					</Group>
				</Box>
			</Flex>

			<Divider />

			{installPWA && (
				<>
					<Flex
						align={{ base: 'flex-start', sm: 'center' }}
						gap={{ base: 'xs', sm: 'xl' }}
						wrap="nowrap"
						direction={{ base: 'column', sm: 'row' }}
					>
						<Image
							src="/app-screenshot.png"
							alt="pwa app"
							w="auto"
							h={116}
							radius="sm"
						/>
						<Stack align="flex-start">
							<Title order={5}>Access Anywhere with PWA</Title>
							<Text>
								Install our Progressive Web App on any device to
								save links and access your full library
								effortlessly.
							</Text>

							<Button
								leftSection={
									<IconDeviceDesktopPlus size={16} />
								}
								component="a"
								href="#"
								onClick={installPWA}
							>
								Install PWA
							</Button>
						</Stack>
					</Flex>

					<Divider />
				</>
			)}

			<Flex
				align={{ base: 'flex-start', sm: 'center' }}
				gap={{ base: 'xs', sm: 'xl' }}
				wrap="nowrap"
				direction={{ base: 'column', sm: 'row' }}
			>
				<Image
					src="/app-screenshot.png"
					alt="web extension"
					w="auto"
					h={116}
					radius="sm"
				/>
				<Box>
					<Title order={5}>Install Browser Extensions</Title>
					<Text>
						Installing the browser extension is the best way to save
						pages directly from your computer to our platform.
					</Text>

					<Flex mt="sm" wrap="nowrap" gap="xs">
						<Select
							placeholder="Select your browser"
							data={[
								{ value: 'chrome', label: 'Google Chrome' },
								{
									value: 'firefox',
									label: 'Firefox',
								},
								{ value: 'edge', label: 'Microsoft Edge' },
								{ value: 'safari', label: 'Safari' },
							]}
							renderOption={renderSelectOption}
							leftSection={<BrowserIcon browser="chrome" />} // todo: different icon based on selection
						/>

						<ActionIcon
							component="a"
							href="#"
							onClick={() => {}}
							size="lg"
						>
							<IconDownload size={16} />
						</ActionIcon>
					</Flex>
				</Box>
			</Flex>

			<Button
				onClick={() => context.closeModal(id)}
				ml="auto"
				variant="default"
			>
				Close
			</Button>
		</Stack>
	);
};

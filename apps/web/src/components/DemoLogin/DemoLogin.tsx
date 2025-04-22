import {
	Anchor,
	Button,
	Divider,
	Group,
	List,
	Switch,
	Text,
} from '@mantine/core';
import { LoginViewProps } from '../../pages/Login/Login.tsx';

// todo: disable "next" button unless switch is not checked
// todo: proper, behind the scenes "login" with demo account
export const DemoLogin = ({ handleLoginViewChange }: LoginViewProps) => {
	return (
		<>
			<Text>
				Explore the app with a fully accessible demo account! Please
				keep the following in mind:
			</Text>

			<List type="ordered">
				<List.Item>
					<b>Shared Access</b>: The demo account is public, meaning
					it’s accessible to other users. We strongly advise against
					sharing or saving any personal or sensitive information
					while using it.
				</List.Item>

				<List.Item>
					<b>Data Limitations</b>: The account is limited to storing a
					maximum of XX items. If the limit has already been reached,
					you may encounter restrictions on saving new items. In this
					case, feel free to check back later.
				</List.Item>

				<List.Item>
					<b>Daily Reset</b>: To ensure a fresh start for all users,
					the demo account is cleared daily at 1:00 AM. During this
					time, the account may be temporarily unavailable as we clean
					up old data and reload default content.
				</List.Item>

				<List.Item>
					<b>Unavailable Features</b>: Some features are disabled in
					the demo version to ensure the app remains accessible and
					usable for all users. These include:
					<List withPadding listStyleType="disc">
						<List.Item>
							<b>Newsletters</b>: Creating special email
							newsletters, retrieving email addresses from the
							app, or accessing them via the app.
						</List.Item>

						<List.Item>
							<b>Data Import/Export</b>: The ability to upload or
							download any data to/from the app.
						</List.Item>
					</List>
				</List.Item>
			</List>

			<Switch
				label="I understand and agree to the demo account limitations."
				size="md"
				mt="xxl"
			/>

			<Group justify="space-between">
				<Button
					variant="default"
					size="md"
					mt="md"
					onClick={() => handleLoginViewChange(null)}
				>
					Back
				</Button>

				<Button size="md">Next</Button>
			</Group>

			<Divider my="xxs" />

			<Text fz="sm">
				Have more questions? <Anchor fz="sm">Contact support</Anchor>
			</Text>
		</>
	);
};

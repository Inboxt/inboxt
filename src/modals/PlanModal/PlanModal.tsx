import {
	Stack,
	Group,
	Switch,
	Badge,
	Radio,
	Text,
	List,
	Button,
	CheckIcon,
	Flex,
} from '@mantine/core';
import { IconCircleCheck } from '@tabler/icons-react';
import { ContextModalProps } from '@mantine/modals';

// todo: separation of components and better styling
// todo: probably I need to re-think this component more (when it comes to style and how to handle pricing model for this app)
// todo: real list and prices
export const PlanModal = ({ id, context }: ContextModalProps) => {
	return (
		<Stack gap="lg">
			<Group gap="xs">
				<Switch label="Annual pricing" />
				<Badge variant="outline" radius="sm" size="sm">
					Save 20%
				</Badge>
			</Group>

			<Radio.Group>
				<Flex gap="lg" direction={{ base: 'column', lg: 'row' }}>
					<Radio.Card
						radius="md"
						p="lg"
						style={{
							position: 'relative',
						}}
						value="FREE"
					>
						<Radio.Indicator
							style={{ position: 'absolute', right: 20 }}
							icon={CheckIcon}
						/>

						<Text fw={600} size="xs" c="dimmed">
							FREE account
						</Text>
						<Text size="xl" fw={700}>
							$0/month
						</Text>
						<List
							spacing="xs"
							mt="sm"
							size="sm"
							icon={<IconCircleCheck size={20} />}
							styles={{
								itemIcon: {
									marginRight: 8,
								},
							}}
						>
							<List.Item>Up to 10 projects</List.Item>
							<List.Item>Up to 1,000 posts</List.Item>
						</List>
					</Radio.Card>

					<Radio.Card
						radius="md"
						p="lg"
						style={{
							position: 'relative',
						}}
						value="PRO"
					>
						<Radio.Indicator
							style={{ position: 'absolute', right: 20 }}
							icon={CheckIcon}
						/>

						<Text fw={600} size="xs" c="dimmed">
							PRO account
						</Text>
						<Text size="xl" fw={700}>
							$4/month
						</Text>
						<List
							spacing="xs"
							mt="sm"
							size="sm"
							icon={<IconCircleCheck size={20} />}
							styles={{
								itemIcon: {
									marginRight: 8,
								},
							}}
						>
							<List.Item>Unlimited projects</List.Item>
							<List.Item>Unlimited posts</List.Item>
						</List>
					</Radio.Card>

					<Radio.Card
						radius="md"
						p="lg"
						style={{
							position: 'relative',
						}} // todo: better styling, light blue background + blue border on active, some hover styling? or just also the same stuff used for active?
						value="LIFETIME"
					>
						<Radio.Indicator
							style={{ position: 'absolute', right: 20 }}
							icon={CheckIcon}
						/>
						<Text fw={600} size="xs" c="dimmed">
							LIFETIME account
						</Text>
						<Text size="xl" fw={700}>
							$250/one time
						</Text>
						<List
							spacing="xs"
							mt="sm"
							size="sm"
							icon={<IconCircleCheck size={20} />}
							styles={{
								itemIcon: {
									marginRight: 8,
								},
							}}
						>
							<List.Item>Everything from the PRO plan</List.Item>
							<List.Item>Forever as a one-time payment</List.Item>
						</List>
					</Radio.Card>
				</Flex>
			</Radio.Group>

			<Group ml="auto" gap="md">
				<Button
					variant="default"
					onClick={() => context.closeModal(id)}
				>
					Cancel
				</Button>
				<Button>Continue to payment</Button>
			</Group>
		</Stack>
	);
};

export const EMAIL_ACCOUNT_DELETED = {
	subject: 'Inbox Reader: Account deleted',
	description:
		'Your Inbox Reader account and data have been permanently deleted per your request.',
};

export const EMAIL_CHANGED_EMAIL = {
	subject: 'Your Inbox Reader email address has been changed',
	description: ({ oldEmail, newEmail }: { oldEmail: string; newEmail: string }) =>
		`Email changed from ${oldEmail} to ${newEmail}. Contact support if this wasn’t you.`,
};

export const EMAIL_FORWARDED = {
	subject: ({ originalSubject }: { originalSubject: string }) =>
		`Unable to process in Inbox Reader: ${originalSubject}`,
	description:
		"This newsletter couldn't be processed in Inbox Reader and has been forwarded to your email.",
};

export const EMAIL_CHANGED_PASSWORD = {
	subject: 'Your Inbox Reader password has been changed',
	description:
		'Password changed successfully. Contact support immediately if you didn’t make this change.',
};

export const EMAIL_RESET_PASSWORD = {
	subject: 'Inbox Reader: Reset your password',
	description: 'Use the code below to reset your password and access your account.',
};

export const EMAIL_VERIFY_REMINDER = {
	subject: 'Inbox Reader: Verify your email to keep your account',
	description: ({ daysRemaining }: { daysRemaining: string }) =>
		`Your Inbox Reader account will be deleted in ${daysRemaining} days if not verified. Verify now to unlock all features.`,
};

export const EMAIL_VERIFY = {
	subject: 'Inbox Reader: Verify your email',
	description: 'Use the code to verify your email and unlock all Inbox Reader features.',
};

export const EMAIL_WELCOME = {
	subject: 'Welcome to Inbox Reader!',
	description:
		'Explore your new account and see how Inbox Reader helps you save and read content distraction-free.',
};

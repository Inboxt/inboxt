import { gql } from '@apollo/client';

export const ACTIVE_USER = gql`
	query me {
		me {
			id
			emailAddress
			isEmailVerified
		}
	}
`;

export const SIGN_IN = gql`
	mutation signIn($data: SignInInput!) {
		signIn(data: $data) {
			success
		}
	}
`;

export const SIGN_OUT = gql`
	mutation {
		signOut {
			success
		}
	}
`;

export const CREATE_ACCOUNT = gql`
	mutation createAccount($data: CreateAccountInput!) {
		createAccount(data: $data) {
			success
		}
	}
`;

export const VERIFY_EMAIL = gql`
	mutation verifyEmail($data: VerifyEmailInput!) {
		verifyEmail(data: $data) {
			success
		}
	}
`;

export const RESEND_VERIFICATION_EMAIL = gql`
	mutation resendVerificationEmail {
		resendVerificationEmail {
			success
		}
	}
`;

export const REQUEST_PASSWORD_RECOVERY = gql`
	mutation requestPasswordRecovery($data: RequestPasswordRecoveryInput!) {
		requestPasswordRecovery(data: $data) {
			success
		}
	}
`;

export const RESET_PASSWORD = gql`
	mutation resetPassword($data: ResetPasswordInput!) {
		resetPassword(data: $data) {
			success
		}
	}
`;

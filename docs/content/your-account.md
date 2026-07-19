# Your account

This page covers account-related settings, security, and management in Inboxt.

[[toc]]

## Security

### Changing your password

If your Inboxt instance is configured with an SMTP server, you can reset your password via email from the login screen.

To reset your password:

1. Go to the login page of your instance
2. Click **Forgot password**
3. Enter your email address
4. Check your email for a reset code
5. Enter the code and choose a new password

If you haven't configured SMTP:
- Email content (including reset codes) will be visible in the application logs.
- You can reset your password directly via the database if you have access to the server.
- Contact your instance administrator if you do not have access to the logs or database.

## Account verification

Whether your account needs verification depends on the instance configuration.

If `REQUIRE_EMAIL_VERIFICATION` is set to `true` in the environment settings:

- New accounts must confirm their email address before accessing all features.
- Until verified, some actions may be restricted to prevent abuse.
- You can verify your account by entering the code sent to your email in the app's verification prompt.

If you are the instance administrator, you can toggle this requirement in your `.env` file.

### Changing your email address

You can change your email address from the **Profile** settings inside the app.

To update your email address:

1. Open the profile menu
2. Select **Profile**
3. Enter a new email address
4. Save your changes

A verification code is sent to the new email address. If email verification is enabled, the account is temporarily treated as unverified and some actions are restricted until the code is confirmed.

## Deleting your account

If you decide to delete your account, you can do so from the profile menu.

To delete your account:

1. Open the profile menu
2. Click **Delete Account**
3. Confirm your action

Account deletion is permanent.

Once confirmed:

- Your account is removed immediately
- All associated data (saved items, highlights, labels, newsletters, and settings) is deleted from Inboxt
- Deleted data cannot be recovered

Deletion typically completes within seconds.

Your instance may retain some operational logs temporarily for reliability and security purposes. These logs are not used to reconstruct deleted accounts and do not contain readable saved content unless specifically logged for debugging (e.g., SMTP failures).

If you need help with account-related issues, see [Getting Help](/help).

# Limitations

Inboxt aims to be predictable and transparent. This page summarizes known limitations and edge cases so you know what to expect.

[[toc]]

## Content parsing

Inboxt extracts readable content from web pages and emails. Results depend heavily on the source.

You may see issues with:

- JavaScript-heavy or highly interactive websites
- Pages that require authentication or special access
- Complex layouts or unusual markup
- Websites that actively restrict automated content fetching

Using the browser extension can improve parsing reliability. When saving content via the extension, Inboxt receives the page’s source directly from your browser instead of fetching the page by URL, which often results in better extraction on dynamic or complex websites. For details on installing and using the extension, see [Installation](/installation).

### Content length

To ensure stability and performance, Inboxt has default limits on the length of content it processes:

- **Articles**: Max 100,000 words
- **Newsletters**: Min 100 words, Max 100,000 words

If a document exceeds these limits, it may be truncated or marked as failed. These default limits can be adjusted via environment variables. See [Self-hosting](/self-hosting#content-limits) for more information.

## Newsletters and email

Email content varies widely between senders.

- Attachments are currently not supported
- Some newsletters may render differently than in email clients
- Very complex layouts may lose formatting

Unsubscribe support depends on information provided by the sender and is not guaranteed. For full details, see [Newsletters & Email](/newsletters-and-emails).

## Highlights

Highlights are anchored to extracted text.

- Changes in parsed content may affect positioning
- Very long documents may behave inconsistently
- Exported highlights may not preserve full surrounding context

## Performance and updates

As a self-hosted application, Inboxt's performance and availability depend on your infrastructure.

### Updates and compatibility

- Updating to the latest version may occasionally introduce breaking changes in the API or database schema.
- Always check the [Changelog](https://github.com/Inboxt/inboxt/releases) before upgrading.
- The GraphQL schema is the primary source of truth for integrations.

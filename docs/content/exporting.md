# Exporting data

Inboxt provides export options so you can access your data outside of the app at any time.

[[toc]]

## Self-hosting configuration

The way exports are handled depends on your instance configuration:

- **Storage:** Exports can be stored locally on your server or in an S3-compatible bucket.
- **Email:** If SMTP is configured, you can receive a download link for your export via email.

See [Self-hosting](/self-hosting) for configuration details.

## Export types

You can export either:

- **All account data**
- **Highlights only**

Exports are generated on demand and made available for download.

## Exporting all data

An all-data export contains a complete snapshot of your account.

The export is provided as a ZIP archive and includes:

- Account metadata
- Saved articles and newsletters
- Full article and newsletter content (HTML and text)
- Labels and label assignments
- Highlights (both per item and globally)
- Inbound email addresses
- Newsletter subscriptions
- Reading history and statistics (reading logs)

The archive is structured in a human-readable way, making it suitable for backups, migrations, or custom tooling.

## Exporting highlights

You can export your highlights independently from the rest of your data.

Highlights can be exported in the following formats:

- **HTML**: suitable for viewing in a browser
- **Markdown**: ideal for note-taking apps
- **Plain text**: simple and widely compatible

Each export includes:

- Highlighted text
- Source item title
- Source URL (when available)
- Creation date

## Export structure (overview)

An all-data export ZIP archive typically contains:

- `metadata.json`: export metadata and item counts
- `json/`: canonical JSON representations of your data
- `saved_items/`: per-item content and metadata
- `highlights/`: global highlight exports

This structure is stable and designed to be easy to consume programmatically.

If you run into issues while exporting data, you can report them on the [GitHub Repository](https://github.com/inboxt/inboxt/issues).

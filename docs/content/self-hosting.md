# Self-hosting

Inboxt is designed to be self-hosted, giving you full control over your data and infrastructure.

[[toc]]

## Quick Start with Docker Compose

The recommended way to run Inboxt is using Docker Compose. This setup includes the Inboxt application, a PostgreSQL database, and a Valkey (Redis-compatible) instance for background tasks.

### 1. Prepare your environment

Create a directory for your Inboxt instance and create two files: `docker-compose.yml` and `.env`.

It is **highly recommended** to run Inboxt behind a reverse proxy (like Caddy, Nginx, or Traefik) to handle SSL (HTTPS) and provide an extra layer of security for your inbound webhooks.

### 2. `docker-compose.yml`

```yaml
services:
  postgres:
    image: postgres:18
    container_name: inboxt-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${DATABASE_NAME:-inboxt}
      POSTGRES_USER: ${DATABASE_USER:-inboxt}
      POSTGRES_PASSWORD: ${DATABASE_PASSWORD}
      PGDATA: /var/lib/postgresql/data/pgdata
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - inboxt_network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DATABASE_USER:-inboxt} -d ${DATABASE_NAME:-inboxt}"]
      interval: 10s
      timeout: 5s
      retries: 5

  valkey:
    image: valkey/valkey:8-alpine
    container_name: inboxt-valkey
    restart: unless-stopped
    command: >
      valkey-server
      --port ${VALKEY_PORT:-6379}
      --save 60 1
      --loglevel warning
      --maxmemory 256mb
      --maxmemory-policy noeviction
    volumes:
      - valkey_data:/data
    networks:
      - inboxt_network
    healthcheck:
      test: ["CMD", "valkey-cli", "-p", "${VALKEY_PORT:-6379}", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  inboxt:
    image: ghcr.io/inboxt/inboxt:${IMAGE_TAG:-latest}
    container_name: inboxt
    restart: unless-stopped
    env_file:
      - .env
    environment:
      DATABASE_URL: postgresql://${DATABASE_USER:-inboxt}:${DATABASE_PASSWORD}@postgres:5432/${DATABASE_NAME:-inboxt}
      VALKEY_HOST: ${VALKEY_HOST:-valkey}
      VALKEY_PORT: ${VALKEY_PORT:-6379}
    volumes:
      - exports_data:/app/exports
    # Exposes the app on http://localhost:7000
    # If using a reverse proxy (Traefik, Caddy, Nginx Proxy Manager, etc.),
    # remove this section and attach the container to your proxy network instead.
    ports:
      - "7000:7000"
    depends_on:
      postgres:
        condition: service_healthy
      valkey:
        condition: service_healthy
    networks:
      - inboxt_network
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:7000/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

volumes:
  postgres_data:
  valkey_data:
  exports_data:

networks:
  inboxt_network:
    driver: bridge
```

### 3. `.env` file

Minimal working configuration to get started. See the [Environment variables reference](#environment-variables-reference) for a complete list of options.

```bash
# --- General ---
NODE_ENV=production
# The public-facing URL of your instance. Used for emails, exports, and integrations.
APP_URL=http://localhost:7000

# --- Security ---
# Secret for signing API JWTs. Use a long random string.
API_JWT_SECRET=replace-with-a-random-string

# If true, cookies will only be sent over HTTPS. Set to false if you are using HTTP only (e.g. over a private network like Netbird/Tailscale without SSL).
# Defaults to true in production.
SECURE_COOKIES=true

# Secret for securing the inbound email webhook. Use a long random string.
# This is recommended if you are not securing your webhook via a reverse proxy.
# WEBHOOK_SECRET=replace-with-another-random-string

# --- Database ---
# If you use the provided docker-compose.yml, you only need to set DATABASE_PASSWORD.
DATABASE_PASSWORD=replace-with-a-random-password
```

### 4. Deployment

Start Inboxt:

```bash
docker compose up -d
```

Your instance will be available at `http://localhost:7000` (or your configured `APP_URL`).

## Detailed Configuration

### Environment variables reference

#### General

| Variable | Description | Type | Default | Required |
| --- | --- | --- | --- | --- |
| `NODE_ENV` | Node environment (affects logging prettiness and GraphiQL availability). | string | `production` (recommended) | No |
| `APP_URL` | Public base URL of your instance. Used in emails, exports, and links. | url | `http://localhost:7000` | No |
| `INBOUND_EMAIL_ADDRESS_DOMAIN` | Domain used to generate inbound email addresses for newsletters. | string | — | No |

Notes:
- `APP_URL` must be a valid URL. When running behind HTTPS, set `APP_URL=https://your-domain.com`.
- While optional (defaults to `http://localhost:7000`), setting it is highly recommended so that the app can generate correct links and derive the proper "From" domain for emails.

#### Security

| Variable | Description | Type | Default | Required |
| --- | --- | --- | --- | --- |
| `API_JWT_SECRET` | Secret for signing API JWTs. Use a long random string. | string | — | Yes |
| `API_JWT_EXPIRES_IN` | JWT validity duration. Pattern: `<number><unit>` where unit is one of `s,m,h,d` (e.g., `30d`, `24h`, `60m`). | string | `30d` | No |
| `REQUIRE_EMAIL_VERIFICATION` | Require users to verify their email. | boolean (`true`/`false`) | `false` | No |
| `DISABLE_SIGNUP` | Disable self‑registration (recommended after creating the first admin/user). | boolean (`true`/`false`) | `false` | No |
| `SECURE_COOKIES` | If `true`, cookies will only be sent over HTTPS. Set to `false` if you are using HTTP only (e.g. over a private network like Netbird/Tailscale without SSL). | boolean (`true`/`false`) | `true` (in production) | No |
| `WEBHOOK_SECRET` | Secret to secure the inbound email webhook. Use a long random string. | string | — | No (recommended if not using proxy auth) |
| `WEBHOOK_SECRET_HEADER` | Header name to check for the secret. | string | `x-webhook-secret` | No |

Notes:
- If `REQUIRE_EMAIL_VERIFICATION` is enabled but SMTP is not configured, verification codes will be logged to the container output instead of sent via email.

#### Database

| Variable | Description | Type | Default | Required |
| --- | --- | --- | --- | --- |
| `DATABASE_URL` | Full PostgreSQL connection string. Use this if you manage Postgres yourself. | string/url | — | Yes (if you remove the bundled `postgres` service) |
| `DATABASE_NAME` | DB name used by bundled Postgres. | string | `inboxt` | No (with bundled Postgres) |
| `DATABASE_USER` | DB user used by bundled Postgres. | string | `inboxt` | No (with bundled Postgres) |
| `DATABASE_PASSWORD` | DB password used by bundled Postgres. | string | — | Yes (with bundled Postgres) |

Notes:
- With the provided `docker-compose.yml`, you typically set only `DATABASE_PASSWORD`; `DATABASE_URL` is composed automatically for the app.
- The app runs migrations on start. Ensure the DB user can create/alter tables.

#### Valkey (Redis‑compatible)

| Variable | Description | Type | Default | Required |
| --- | --- | --- | --- | --- |
| `VALKEY_HOST` | Valkey/Redis host. | string | `valkey` (via Compose) | Yes (if not using the provided Compose) |
| `VALKEY_PORT` | Valkey/Redis port. | number | `6379` (via Compose) | Yes (if not using the provided Compose) |

Notes:
- In the included Compose, `VALKEY_HOST`/`VALKEY_PORT` are set for the `inboxt` service, so you don’t need to define them in `.env` unless you customize networking.

#### Exports (local filesystem)

| Variable | Description | Type | Default | Required |
| --- | --- | --- | --- | --- |
| `EXPORTS_LOCAL_PATH` | Directory (inside the container) where generated exports are stored. | string | `exports` | No |

#### Storage (S3‑compatible; optional)

If provided (bucket set), exports will be uploaded to your S3‑compatible storage.

| Variable | Description | Type | Default | Required |
| --- | --- | --- | --- | --- |
| `STORAGE_S3_BUCKET` | Bucket name to upload exports to. | string | — | Required to enable S3 uploads |
| `STORAGE_S3_REGION` | Region (e.g., `us‑east‑1`). | string | — | No* |
| `STORAGE_S3_ENDPOINT` | Custom endpoint for S3‑compatible services (e.g., MinIO). | url/string | — | No* |
| `STORAGE_S3_ACCESS_KEY` | Access key ID. | string | — | No* |
| `STORAGE_S3_SECRET_KEY` | Secret key. | string | — | No* |

Notes:
- S3 upload support is enabled when `STORAGE_S3_BUCKET` is present. Other fields depend on your provider; most providers require credentials.

#### Mail (SMTP; optional but required for email features)

| Variable | Description | Type | Default | Required |
| --- | --- | --- | --- | --- |
| `MAIL_HOST` | SMTP server host. | string | — | Required to enable mail |
| `MAIL_PORT` | SMTP server port. | number | — | Required to enable mail |
| `MAIL_SECURE` | Use TLS (SMTPS). Set to `true` for 465 typically; leave unset/`false` for STARTTLS on 587. | boolean | — | No |
| `MAIL_USER` | SMTP username. | string | — | No (required if your server needs auth) |
| `MAIL_PASSWORD` | SMTP password. | string | — | No (required if your server needs auth) |

Notes:
- If SMTP is not configured, emails are not sent; instead, they are logged for debugging.
- The `From` is derived from `APP_URL`’s domain (e.g., `no-reply@your-domain`).

#### Error reporting (Sentry‑compatible; optional)

| Variable | Description | Type | Default | Required |
| --- | --- | --- | --- | --- |
| `API_ERRORS_DSN` | DSN for API (backend) error tracking. | url | — | No |
| `WEB_ERRORS_DSN` | DSN for Web (frontend) error tracking. | url | — | No |

#### Content Limits

| Variable | Description | Type | Default | Required |
| --- | --- | --- | --- | --- |
| `ARTICLE_MAX_WORD_COUNT` | Maximum word count for articles before they're considered too large. | number | `100000` | No |
| `NEWSLETTER_MIN_WORD_COUNT` | Minimum word count for newsletters to be considered valid content. | number | `100` | No |
| `NEWSLETTER_MAX_WORD_COUNT` | Maximum word count for newsletters before they're considered too large. | number | `100000` | No |

::: warning
It is recommended to leave the default values unless you know what you are doing. Increasing these limits can make the app less safe and if they are increased too much, it can use too many resources (CPU/Memory) and slow down the app or the whole system.
:::

### Reverse Proxy (Recommended)

Running Inboxt behind a reverse proxy is the recommended setup for several reasons:
- **SSL/TLS (HTTPS):** Essential for security and required for [PWA features](#progressive-web-app-pwa).
- **Webhook Security:** Allows you to handle authentication (e.g., Basic Auth) at the proxy level before it reaches the application.
- **Port Management:** Lets you serve the app on standard ports (80/443) while the container runs on port 7000.

#### Caddy Example
```bash
your-inboxt-domain.com {
    reverse_proxy localhost:7000
}
```

#### Nginx Example
```nginx
server {
    server_name your-inboxt-domain.com;
    location / {
        proxy_pass http://localhost:7000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Database & Migrations

Inboxt uses PostgreSQL for data storage. When the application starts, it automatically runs any pending database migrations.

**Using an existing PostgreSQL instance:**
If you already have a PostgreSQL server, you can remove the `postgres` service from `docker-compose.yml` and provide the full connection string in your `.env`:

```bash
DATABASE_URL=postgresql://user:password@your-db-host:5432/dbname
```

If you use an external database, ensure the user has sufficient permissions to create tables and run migrations.

### Inbound Newsletters (Webhook)

To receive newsletters directly in Inboxt, you need to configure an inbound email provider (like Maileroo, Mailgun, or Postmark) to forward incoming emails to Inboxt's webhook endpoint.

**Webhook URL:** `https://your-inboxt-domain.com/api/inbox/items/mail-webhook`

This endpoint must be publicly accessible so your email provider can send POST requests to it.

#### Authentication & Security

You should secure your inbound webhook to prevent unauthorized access. The recommended way to do this is at your **reverse proxy level** (like Caddy or Nginx).

##### 1. Reverse Proxy Authentication (Recommended)

If your email provider supports Basic Authentication, you can handle it directly in your proxy. This is the most secure method as the request is authenticated before it even reaches the application.

###### Caddy Example

```bash
your-inboxt-domain.com {

    # Secure the webhook endpoint with Basic Auth
    @webhook path /api/inbox/items/mail-webhook*
    basic_auth @webhook {
        inboxt $2a$14$yourbcryptgeneratedhashhere
    }

    reverse_proxy localhost:7000
}
```

###### Nginx Example

```nginx
server {
    server_name your-inboxt-domain.com;

    location /api/inbox/items/mail-webhook {
        auth_basic "Restricted Webhook";
        auth_basic_user_file /etc/nginx/.htpasswd;
        
        proxy_pass http://localhost:7000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        proxy_pass http://localhost:7000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

##### 2. Application-level Secret (Optional)

If you cannot or do not want to use proxy-level authentication, you can set `WEBHOOK_SECRET` in your environment. The provider must then authenticate using one of the following methods:

1.  **Custom Header:** Use the header name configured in `WEBHOOK_SECRET_HEADER` (default: `x-webhook-secret`) and set your secret as the value.
2.  **Query Parameter (Last Resort):** Add `?token=YOUR_SECRET` to the webhook URL. Note that query parameters may be logged by some proxy servers and should only be used if your provider supports no other method.

**Note:** If `WEBHOOK_SECRET` is NOT set in your environment, the application will assume that you are handling authentication at the proxy level and will allow all requests to the webhook endpoint. **Always ensure your webhook is secured by one of these methods.**

#### Reliability & Resource Management

Inboxt is designed to run safely even on small VPS instances:
- **Background Processing:** Heavy HTML parsing is handled by background workers via BullMQ (Valkey), preventing the API from becoming unresponsive.
- **Payload Limits:** The webhook has a default body size limit of `30MB` to prevent memory exhaustion from massive requests.
- **Complexity Guard:** Any HTML payload exceeding 5,000,000 characters is automatically skipped for heavy parsing to protect your server's CPU.
- **Safety First:** If an email cannot be safely parsed (or if parsing fails), it is automatically **sanitized** (stripping dangerous scripts/IFrames) and forwarded to your account's primary email address so you don't lose the content.

#### Payload Schema (Flexible JSON)

Inboxt automatically extracts data from most popular email providers. While fields vary by service, the following are the primary ones used:

*   **Recipient**: `recipient`, `rcpt_to`, `Recipient`, `OriginalRecipient`, `ToFull[0].Email`, `msys.relay_message.rcpt_to`, `items[0].Recipients[0]`, `Recipients[0]`, `recipients` (array), `headers.To[0]`, `To`, or `to`.
*   **Subject**: `subject`, `Subject`, `items[0].Subject`, `msys.relay_message.content.subject`, `headers.Subject[0]`, or `Subject[0]`.
*   **Message ID**: `messageId`, `message_id`, `MessageID`, `MessageId`, `items[0].MessageId`, `msys.relay_message.content['Message-ID']`, `headers['Message-ID'][0]`, `eventId`, or `_id`.
*   **HTML Content**: `html`, `HtmlBody`, `RawHtmlBody`, `html_body`, `Html-part`, `items[0].RawHtmlBody`, `msys.relay_message.content.html`, `body.stripped_html`, or `body.html`.
*   **Text Content**: `text`, `TextBody`, `RawTextBody`, `plain_body`, `Text-part`, `items[0].RawTextBody`, `msys.relay_message.content.text`, `body.stripped_plaintext`, or `body.plaintext`.
*   **Author/Sender**: `from`, `FromName`, `FromFull.Name`, `FromFull.Email`, `Sender`, `msg_from`, `items[0].From` (object), `msys.relay_message.friendly_from`, `msys.relay_message.msg_from`, `headers.From[0]`, `From[0]`, or `From`.
*   **Date**: `headers.Date[0]`, `Date`, `SentAtDate`, `items[0].SentAtDate`, `date`, `timestamp` (unix), or `msys.relay_message.content.headers.Date`.
*   **References**: `headers.References[0]`, `references`, `InReplyTo`, `items[0].InReplyTo`, `in_reply_to`, or `msys.relay_message.content.headers.References`.
*   **Unsubscribe URL**: `unsubscribeUrl`, `headers['List-Unsubscribe'][0]`, or automatically extracted from the HTML content.

If your email provider uses a different schema or isn't being parsed correctly, please [open an issue on GitHub](https://github.com/inboxt/inboxt/issues) so we can add support for it.

### Security & Signup

- **`DISABLE_SIGNUP=true`**: Highly recommended after you have created your initial account to prevent unauthorized users from registering on your instance. If registrations are disabled, you can still add users manually via the database if needed.
- **`REQUIRE_EMAIL_VERIFICATION=true`**: Adds an extra layer of security by requiring users to confirm their email address. If SMTP (Mail) is not configured, users will not receive the verification code via email, but it will be visible in the app logs for the administrator to provide manually.

### Account Verification

If `REQUIRE_EMAIL_VERIFICATION` is set to `true`:
- New accounts must confirm their email address before accessing all features.
- Until verified, some actions may be restricted to prevent abuse.
- You can verify your account by entering the code sent to your email in the app's verification prompt.

If you are the instance administrator, you can toggle this requirement in your `.env` file.

### Progressive Web App (PWA)

Inboxt supports installation as a PWA, allowing you to "install" it on your phone or desktop for an app-like experience.

#### Requirements for PWA
For the PWA installation prompt to appear, your Inboxt instance **must** meet the following security requirements:

1.  **HTTPS is mandatory:** Browsers will only allow PWA installation if the site is served over a secure connection (HTTPS). This applies even if you are accessing it via an internal domain or a private IP address.
2.  **Valid SSL Certificate:** Your browser must trust the connection. If you use a self-signed certificate, you may need to manually trust it on your device before the PWA can be installed.
3.  **Localhost Exception:** If you are accessing Inboxt via `http://localhost`, browsers typically treat it as a "secure context" and will allow PWA installation even without HTTPS.

If you are self-hosting for multiple devices, using a reverse proxy with Let's Encrypt (like Caddy or Nginx Proxy Manager) is the easiest way to satisfy these requirements.

### Links & Resources

- [GitHub Repository](https://github.com/inboxt/inboxt)
- [Example docker-compose.yml](https://github.com/inboxt/inboxt/blob/master/docker-compose.yml)
- [Example .env file](https://github.com/inboxt/inboxt/blob/master/self-hosting.env.example)

### Updating Inboxt

To update Inboxt to the latest version, run the following commands in the directory where your `docker-compose.yml` is located:

```bash
docker compose pull
docker compose up -d
```

- `docker compose pull` downloads the latest images from GitHub Container Registry.
- `docker compose up -d` restarts the containers using the new images. Only containers that have changed will be recreated.

::: warning
**Never** use the `-v` flag (e.g., `docker compose down -v`) unless you want to permanently delete all your data, including your articles and configuration.
:::

### Troubleshooting

- **Logs**: Check logs with `docker compose logs -f inboxt`.
- **Database**: Ensure the database is healthy. The `inboxt` container will wait for the database to be reachable before starting.
- **Email**: If you aren't receiving emails, check the container logs; if SMTP is not configured or fails, Inboxt logs the email content there for debugging.
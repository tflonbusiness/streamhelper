# Mock data (this slice)

Replace with live values later. Implementers seed Postgres and the contact-to-pay page from this table.

## Pay contact (CAP-2)

| Channel | Mock value |
| --- | --- |
| Telegram | `@caz_agent_mock` |
| Email | `pay@caz-agent.example` |

Both must be visible on the contact-to-pay page.

## Users (CAP-5 / CAP-1 / CAP-2)

Passwords are plaintext in this companion for seeding only; store hashed in Postgres.

| Email | Password | `isActive` | After login |
| --- | --- | --- | --- |
| `active@caz-agent.example` | `password-active` | true | Dashboard **Caz Agent** |
| `inactive@caz-agent.example` | `password-inactive` | false | Contact-to-pay (Telegram + email above) |

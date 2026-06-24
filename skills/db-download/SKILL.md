---
name: db-download
argument-hint: "<site-name>  e.g. mayo  stanford  musc"
description: "Download a site's main database into the local Docker environment. Trigger phrases: 'download mayo db', 'import stanford database', 'fetch musc site data', 'get prod db for [site]', 'sync [site] to local', 'db download [site]'. Given a site name (e.g. mayo, stanford, musc), runs db-download.php inside the mh-php-fpm Docker container and imports only the main DB (not reports)."
---

# DB Download

Download a site's main database into your local Docker environment.

## Instructions

Parse the user input to extract the **site name** (e.g. `mayo`, `stanford`, `musc`).

If no site name is given, ask:

> Which site do you want to download? (e.g. `mayo`, `stanford`, `musc`)

### Step 1 — Verify Docker is Running

```sh
docker ps --filter name=mh-php-fpm --format "{{.Names}}"
```

If the container is not listed, tell the user to start Docker and the MedHub dev environment
before continuing.

### Step 2 — Download the Main DB

Run the download script inside the container. Pipe `n` to automatically answer **N** to the
"Also fetch reports DB?" prompt, so only the **main DB** is downloaded:

```sh
echo n | docker exec -i mh-php-fpm php /var/www/html/tools/db-download.php {SITE}
```

- This downloads, decrypts, decompresses, and imports `medhub_{SITE}` into local MySQL.
- After import, dev settings are automatically applied (`docker.medhub.com` URLs,
  `Local Dev` school name, local support user, etc.).
- The `--reports-only` and `--with-reports` flags are intentionally **not** used here.

### Step 3 — Confirm Success

After the command exits, report:

```
✅ medhub_{SITE} downloaded and imported into local Docker MySQL.
   Dev settings applied — ready at docker.medhub.com
```

If the command fails (non-zero exit or error output), surface the error message and suggest:
- Check that `config/dbreload.yaml` has a valid server entry and SSH key
- Verify the GPG passphrase file exists at the configured path
- Confirm the site abbreviation is correct (try alternate spellings if it errors on SFTP lookup)

### Options Reference

| Scenario | Command |
|---|---|
| Main DB only (default) | `echo n \| docker exec -i mh-php-fpm php /var/www/html/tools/db-download.php {SITE}` |
| Main DB + reports | `docker exec mh-php-fpm php /var/www/html/tools/db-download.php {SITE} --with-reports` |
| Reports DB only | `docker exec mh-php-fpm php /var/www/html/tools/db-download.php {SITE} --reports-only` |
| Download only, no import | `echo n \| docker exec -i mh-php-fpm php /var/www/html/tools/db-download.php {SITE} --no-import` |
| Specific backup server | `echo n \| docker exec -i mh-php-fpm php /var/www/html/tools/db-download.php {SITE} --server bu1` |

See `tools/db-download.md` for full documentation.

# Upload to Supabase Storage

Github Action to upload files to Supabase Storage.

## Inputs

### `file_path`

Path name of the file or folder to be uploaded.

eg: "public/screenshots.png", "assets"

### `bucket`

Name of the bucket to upload to

eg: "screenshot"

### `content_type`

[Supabase Storage](https://supabase.com/docs/reference/javascript/storage-from-upload#parameters) `from.upload` fileOptions parameter, the `Content-Type` header value.

eg: "image/png"

### `cache_control`

[Supabase Storage](https://supabase.com/docs/reference/javascript/storage-from-upload#parameters) `from.upload` fileOptions parameter, the `Content-Control` value.

eg: "3600"

### `upsert`

[Supabase Storage](https://supabase.com/docs/reference/javascript/storage-from-upload#parameters) `from.upload` fileOptions parameter, the `Upsert` value.

eg: "true"

## Env

### `SUPABASE_URL`

Go to [Dashboard Settings](https://app.supabase.com/project/<your-project-ref>/settings/api), copy and paste the **URL** into GitHub Repo's secret.

### `SUPABASE_ANON_KEY`

Go to [Dashboard Settings](https://app.supabase.com/project/<your-project-ref>/settings/api), copy and paste the **Anon Key** into GitHub Repo's secret.

## Usage/Example

In `.github/workflows/screenshot.yml`

```yml
name: Screenshot Action
on:
  push:
    branches: -master

env:
  SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
  SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}

jobs:
  screenshots:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Upload image to Storage
        uses: datapods/upload-file-to-supabase-storage@v1.0.2
        with:
          file_path: ${{ PATH_TO_YOUR_FILE }}
          bucket: assets
          content_type: ${{ YOUR_CONTENT_TYPE }}
          upsert: true
```

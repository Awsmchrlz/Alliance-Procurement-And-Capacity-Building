# Alliance-Procurement-And-Capacity-Building
Alliance and procurment website
 
## Development

1. Install dependencies:

```bash
npm i
```

2. Start the dev server:

```bash
npm run dev
```

## Supabase setup

Create a `.env.local` file in the project root with:

```bash
VITE_SUPABASE_URL=https://db.huwkexajyeacooznhadq.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
# Provided DB string (for server-side/drizzle if used)
VITE_DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.huwkexajyeacooznhadq.supabase.co:5432/postgres
```

Then run the app and test Register/Login.
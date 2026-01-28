To develop locally:

```
npm install
vc dev
```

```
open http://localhost:3000
```

To build locally:

```
npm install
vc build
```

## Database Setup (Supabase Auth)

To automatically sync Supabase Auth users to our `public.users` table, run the following SQL query in the **Supabase SQL Editor**:

```sql
-- 1. Create the public users table
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text,
  role text check (role in ('USER', 'ADMIN')) default 'USER',
  last_sync_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Create the trigger function to sync new auth users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, name)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name'
  );
  return new;
end;
$$ language plpgsql security definer;

-- 3. Bind the trigger to auth.users
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

To deploy:

```
npm install
vc deploy
```
cmpstg.volatas
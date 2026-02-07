-- Create the user_readings table
create table user_readings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  device_name text,
  device_id text,
  timestamp timestamptz default now(),
  ph numeric,
  turbidity numeric,
  contaminant_level numeric,
  temperature numeric,
  conductivity numeric,
  water_source text,
  risk_level text,
  confidence numeric,
  analysis_result jsonb
);

-- Set up Row Level Security (RLS)
alter table user_readings enable row level security;

-- Policy to allow users to insert their own readings
create policy "Users can insert their own readings"
on user_readings for insert
with check (auth.uid() = user_id);

-- Policy to allow users to view their own readings
create policy "Users can view their own readings"
on user_readings for select
using (auth.uid() = user_id);

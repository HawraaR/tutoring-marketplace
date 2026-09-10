create table public."User" (
  id text not null,
  email text not null,
  password text not null,
  "createdAt" timestamp without time zone not null default CURRENT_TIMESTAMP,
  "updatedAt" timestamp without time zone not null default CURRENT_TIMESTAMP,
  "firstName" text null,
  "isAdmin" boolean not null default false,
  "isStudent" boolean not null default true,
  "isTutor" boolean not null default false,
  "lastName" text null,
  constraint User_pkey primary key (id)
) TABLESPACE pg_default;

create unique INDEX IF not exists "User_email_key" on public."User" using btree (email) TABLESPACE pg_default;

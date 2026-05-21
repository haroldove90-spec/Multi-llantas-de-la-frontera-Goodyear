-- SQL para la base de datos de Supabase de Multillantas de la Frontera
-- Corrige errores de políticas duplicadas al usar DROP POLICY IF EXISTS

-- 1. Extensión para UUIDs si no está habilitada
create extension if not exists "uuid-ossp";

-- 2. Asegurar que la tabla user_profiles exista y soporte fotos de perfil y teléfono
create table if not exists public.user_profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  phone text,
  email text unique not null,
  role text not null check (role in ('superadmin', 'contador', 'vendedor', 'secretaria_facturista', 'credito_cobranza')),
  branch_id text not null default 'matriz',
  avatar_url text, -- Guarda base64 o URL directa de almacenamiento
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar Row Level Security (RLS)
alter table public.user_profiles enable row level security;

-- ELIMINAR POLÍTICAS SI EXISTEN PARA EVITAR ERRORES DE DUPLICIDAD
drop policy if exists "Cualquier usuario autenticado puede ver perfiles" on public.user_profiles;
drop policy if exists "Los usuarios pueden actualizar su propio perfil" on public.user_profiles;
drop policy if exists "El Administrador puede insertar nuevos perfiles" on public.user_profiles;
drop policy if exists "El Administrador puede eliminar perfiles" on public.user_profiles;

-- Políticas de Seguridad (RLS) para user_profiles
create policy "Cualquier usuario autenticado puede ver perfiles" 
  on public.user_profiles for select 
  using (true);

create policy "Los usuarios pueden actualizar su propio perfil" 
  on public.user_profiles for update 
  using (auth.uid() = id);

create policy "El Administrador puede insertar nuevos perfiles" 
  on public.user_profiles for insert 
  with check (
    exists (
      select 1 from public.user_profiles 
      where id = auth.uid() and role = 'superadmin'
    )
  );

create policy "El Administrador puede eliminar perfiles" 
  on public.user_profiles for delete 
  using (
    exists (
      select 1 from public.user_profiles 
      where id = auth.uid() and role = 'superadmin'
    )
  );

-- OPCIONAL: Para políticas de almacenamiento (Storage Rules) si usas la tabla storage.objects:
-- Si te da error "policy already exists" para storage.objects, ejecuta esta línea antes de crearla:
drop policy if exists "Permitir subida a usuarios autenticados" on storage.objects;
drop policy if exists "Dar acceso público a fotos de perfil" on storage.objects;

-- 3. Función para actualizar la marca de tiempo updated_at automáticamente
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Evitar error si el trigger ya existe
drop trigger if exists trigger_update_user_profiles_timestamp on public.user_profiles;
create trigger trigger_update_user_profiles_timestamp
  before update on public.user_profiles
  for each row execute procedure public.handle_updated_at();


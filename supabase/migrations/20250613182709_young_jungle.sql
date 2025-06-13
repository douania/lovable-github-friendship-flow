-- Update handle_new_user function with explicit search_path and 'user' as default role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Définir explicitement le search_path
  perform set_config('search_path', 'public', true);

  insert into public.user_roles (user_id, role)
  values (
    new.id,
    case
      when new.email = 'sodatrasn@gmail.com' then 'admin'
      else 'user'
    end
  )
  ON CONFLICT (user_id) DO UPDATE SET
    role = CASE 
      WHEN new.email = 'sodatrasn@gmail.com' THEN 'admin'
      ELSE user_roles.role
    END;

  return new;
END;
$$ language plpgsql security definer;

-- Update the default role in user_roles table
ALTER TABLE user_roles ALTER COLUMN role SET DEFAULT 'user';

-- Update role constraint to include 'user' role
ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;
ALTER TABLE user_roles ADD CONSTRAINT user_roles_role_check 
CHECK (role = ANY (ARRAY['admin'::text, 'praticien'::text, 'staff'::text, 'user'::text]));
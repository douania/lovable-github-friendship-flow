@@ .. @@
-- Function to handle new user signup and assign roles automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
-  INSERT INTO public.user_roles (user_id, role)
+  -- Définir explicitement le search_path
+  perform set_config('search_path', 'public', true);
+
+  insert into public.user_roles (user_id, role)
   VALUES (
     NEW.id,
     CASE 
       WHEN NEW.email = 'sodatrasn@gmail.com' THEN 'admin'
-      ELSE 'praticien'
+      ELSE 'user'
     END
   )
   ON CONFLICT (user_id) DO UPDATE SET
     role = CASE 
       WHEN NEW.email = 'sodatrasn@gmail.com' THEN 'admin'
       ELSE user_roles.role
     END;
   
   RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
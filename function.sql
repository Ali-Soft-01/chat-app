DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Inserts a row into public.profiles
CREATE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'name',       
    NEW.raw_user_meta_data ->> 'email',      
    NEW.raw_user_meta_data ->> 'avatar_url'
    -- NEW.raw_user_meta_data ->> 'user_name'  -- Handle later 
  );
  RETURN NEW;
END;
$$;

-- Create new trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

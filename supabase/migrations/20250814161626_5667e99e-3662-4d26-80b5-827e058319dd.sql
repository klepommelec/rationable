-- Corriger les politiques RLS pour renforcer la sécurité

-- 1. Corriger la politique des profiles pour empêcher l'exposition des données
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id AND auth.uid() IS NOT NULL);

-- 2. Corriger la politique des commentaires pour restreindre l'accès
DROP POLICY IF EXISTS "Authenticated users can read comments" ON public.decision_comments;
CREATE POLICY "Users can read comments from their own decisions" 
ON public.decision_comments 
FOR SELECT 
USING (
  -- L'utilisateur peut lire ses propres commentaires
  auth.uid() = user_id 
  OR 
  -- Ou les commentaires sur des décisions qu'il a créées (à implémenter selon votre logique métier)
  -- Pour l'instant, on restreint aux commentaires de l'utilisateur uniquement
  false
);

-- 3. Renforcer la sécurité des décisions partagées
-- Ajouter une politique plus restrictive pour les mises à jour
DROP POLICY IF EXISTS "System can update view count" ON public.shared_decisions;
CREATE POLICY "System can update view count only" 
ON public.shared_decisions 
FOR UPDATE 
USING (
  ((expires_at IS NULL) OR (expires_at > now()))
  AND 
  -- Ne permettre que la mise à jour du view_count
  OLD.decision_data = NEW.decision_data
  AND OLD.title = NEW.title
  AND OLD.public_id = NEW.public_id
);

-- 4. Ajouter une fonction sécurisée pour vérifier l'accès aux commentaires
CREATE OR REPLACE FUNCTION public.can_read_comment(comment_decision_id text, comment_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- Pour l'instant, seul le propriétaire du commentaire peut le lire
  -- Vous pouvez étendre cette logique selon vos besoins métier
  SELECT auth.uid() = comment_user_id;
$$;

-- 5. Mettre à jour la politique des commentaires pour utiliser la fonction sécurisée
DROP POLICY IF EXISTS "Users can read comments from their own decisions" ON public.decision_comments;
CREATE POLICY "Secure comment access" 
ON public.decision_comments 
FOR SELECT 
USING (public.can_read_comment(decision_id, user_id));

-- 6. Ajouter une validation pour les données sensibles des profiles
CREATE OR REPLACE FUNCTION public.validate_profile_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Valider que l'utilisateur ne peut modifier que son propre profil
  IF auth.uid() != NEW.id THEN
    RAISE EXCEPTION 'Unauthorized profile modification';
  END IF;
  
  -- Validation basique des données
  IF NEW.email IS NOT NULL AND LENGTH(NEW.email) > 255 THEN
    RAISE EXCEPTION 'Email too long';
  END IF;
  
  IF NEW.full_name IS NOT NULL AND LENGTH(NEW.full_name) > 100 THEN
    RAISE EXCEPTION 'Full name too long';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Créer le trigger pour valider les données des profiles
DROP TRIGGER IF EXISTS validate_profile_trigger ON public.profiles;
CREATE TRIGGER validate_profile_trigger
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_profile_data();
# Instructions pour corriger les problèmes RLS dans Supabase

## Problème

Les erreurs 406 (Not Acceptable) indiquent que les politiques RLS (Row Level Security) dans Supabase sont trop restrictives. Les utilisateurs ne peuvent pas accéder à leurs propres votes, commentaires et décisions partagées.

## Solution

Vous devez exécuter le script SQL `fix_voting_rls_complete.sql` dans votre Dashboard Supabase.

## Étapes à suivre

1. **Ouvrir le Dashboard Supabase**
   - Allez sur https://supabase.com/dashboard
   - Connectez-vous à votre compte
   - Sélectionnez votre projet (dzrlrfkidaahceryoajc)

2. **Ouvrir le SQL Editor**
   - Dans le menu de gauche, cliquez sur "SQL Editor"
   - Cliquez sur "New query"

3. **Copier et exécuter le script**
   - Ouvrez le fichier `fix_voting_rls_complete.sql` dans votre éditeur
   - Copiez tout le contenu du fichier
   - Collez-le dans le SQL Editor de Supabase
   - Cliquez sur "Run" (ou appuyez sur Ctrl+Enter / Cmd+Enter)

4. **Vérifier l'exécution**
   - Le script devrait s'exécuter sans erreur
   - Vous devriez voir des messages de confirmation en vert
   - Si des erreurs apparaissent, elles indiquent généralement que certaines politiques n'existent pas encore (c'est normal, le script les supprime d'abord)

5. **Tester l'application**
   - Rechargez votre application locale
   - Créez une nouvelle analyse IA
   - Vérifiez que les votes, commentaires et partage fonctionnent

## Ce que fait le script

Le script corrige les politiques RLS pour :

- **decision_votes** : Permet aux utilisateurs de voir et voter sur leurs propres décisions
- **decision_participants** : Permet aux utilisateurs de gérer les participants de leurs propres décisions
- **decision_comments** : Permet aux utilisateurs de voir et créer des commentaires sur leurs propres décisions
- **Fonctions RPC** : Vérifie que les fonctions `get_decision_vote_counts` et `has_user_voted` existent et fonctionnent

## Alternative : Exécuter via Supabase CLI

Si vous avez Supabase CLI installé localement :

```bash
cd /Users/klepommelec/rationable
supabase db push
```

Cela appliquera toutes les migrations, y compris la nouvelle migration `20250130000000_fix_comments_rls_for_decision_owners.sql`.

## Vérification

Après avoir exécuté le script, vous pouvez vérifier que les politiques sont correctes :

1. Dans Supabase Dashboard → Authentication → Policies
2. Vérifiez que les tables suivantes ont les bonnes politiques :
   - `decision_votes` : devrait avoir 3 politiques (SELECT, INSERT, DELETE)
   - `decision_participants` : devrait avoir 4 politiques (SELECT, INSERT, UPDATE, DELETE)
   - `decision_comments` : devrait avoir 4 politiques (SELECT, INSERT, UPDATE, DELETE)






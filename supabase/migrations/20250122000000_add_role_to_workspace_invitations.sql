-- Add role column to workspace_invitations table
ALTER TABLE workspace_invitations 
ADD COLUMN role TEXT DEFAULT 'contributor';

-- Update existing invitations to have contributor role
UPDATE workspace_invitations 
SET role = 'contributor' 
WHERE role IS NULL;

-- Add constraint to ensure role is one of the valid values
ALTER TABLE workspace_invitations 
ADD CONSTRAINT workspace_invitations_role_check 
CHECK (role IN ('contributor', 'viewer'));

-- Add comment to explain the role field
COMMENT ON COLUMN workspace_invitations.role IS 'Role assigned to the invited user: contributor (can create/edit) or viewer (read-only)';



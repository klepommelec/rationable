
import React from 'react';
import { FileText, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface WorkspaceDocumentIndicatorProps {
  workspaceData?: {
    documentsUsed: number;
    documentSources: string[];
  };
}

export const WorkspaceDocumentIndicator: React.FC<WorkspaceDocumentIndicatorProps> = ({ 
  workspaceData 
}) => {
  if (!workspaceData || workspaceData.documentsUsed === 0) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="secondary" className="gap-2 bg-blue-50 text-blue-700 border-blue-200">
            <FileText className="h-3 w-3" />
            {workspaceData.documentsUsed} document{workspaceData.documentsUsed > 1 ? 's' : ''} utilisé{workspaceData.documentsUsed > 1 ? 's' : ''}
            <Users className="h-3 w-3" />
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-medium">Documents de votre workspace utilisés :</p>
            <ul className="text-xs space-y-0.5">
              {workspaceData.documentSources.map((source, index) => (
                <li key={index} className="truncate">• {source}</li>
              ))}
            </ul>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

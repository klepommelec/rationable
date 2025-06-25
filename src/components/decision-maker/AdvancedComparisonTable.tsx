
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronDown, ChevronUp, BarChart3, List, Grid } from 'lucide-react';
import { IBreakdownItem } from '@/types/decision';

interface AdvancedComparisonTableProps {
  breakdown: IBreakdownItem[];
  dilemma?: string;
}

export const AdvancedComparisonTable: React.FC<AdvancedComparisonTableProps> = ({
  breakdown,
  dilemma
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'cards' | 'detailed'>('table');
  const [sortBy, setSortBy] = useState<'score' | 'pros' | 'cons'>('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const sortedBreakdown = [...breakdown].sort((a, b) => {
    let valueA: number, valueB: number;
    
    switch (sortBy) {
      case 'pros':
        valueA = a.pros.length;
        valueB = b.pros.length;
        break;
      case 'cons':
        valueA = a.cons.length;
        valueB = b.cons.length;
        break;
      default:
        valueA = a.score;
        valueB = b.score;
    }
    
    return sortOrder === 'desc' ? valueB - valueA : valueA - valueB;
  });

  const getScoreBadgeColor = (score: number) => {
    if (score >= 85) return "bg-emerald-100 text-emerald-800 border-emerald-200";
    if (score >= 70) return "bg-green-100 text-green-800 border-green-200";
    if (score >= 55) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    if (score >= 40) return "bg-orange-100 text-orange-800 border-orange-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  const toggleRowExpansion = (index: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRows(newExpanded);
  };

  const handleSort = (newSortBy: 'score' | 'pros' | 'cons') => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  const TableView = () => (
    <div className="rounded-lg border overflow-hidden bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">Option</TableHead>
            <TableHead className="font-semibold">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort('score')}
                className="p-0 h-auto font-semibold hover:bg-transparent"
              >
                Score
                {sortBy === 'score' && (
                  sortOrder === 'desc' ? <ChevronDown className="ml-1 h-3 w-3" /> : <ChevronUp className="ml-1 h-3 w-3" />
                )}
              </Button>
            </TableHead>
            <TableHead className="font-semibold">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort('pros')}
                className="p-0 h-auto font-semibold hover:bg-transparent"
              >
                Points forts
                {sortBy === 'pros' && (
                  sortOrder === 'desc' ? <ChevronDown className="ml-1 h-3 w-3" /> : <ChevronUp className="ml-1 h-3 w-3" />
                )}
              </Button>
            </TableHead>
            <TableHead className="font-semibold">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort('cons')}
                className="p-0 h-auto font-semibold hover:bg-transparent"
              >
                Points faibles
                {sortBy === 'cons' && (
                  sortOrder === 'desc' ? <ChevronDown className="ml-1 h-3 w-3" /> : <ChevronUp className="ml-1 h-3 w-3" />
                )}
              </Button>
            </TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedBreakdown.map((item, index) => (
            <React.Fragment key={index}>
              <TableRow className="border-b hover:bg-muted/30 transition-colors">
                <TableCell className="font-medium max-w-xs">
                  <div className="break-words">
                    {item.option.replace(/^Option\s+\d+:\s*/i, '').trim()}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getScoreBadgeColor(item.score)} variant="outline">
                    {item.score}/100
                  </Badge>
                </TableCell>
                <TableCell className="max-w-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-green-50 text-green-700">
                      {item.pros.length}
                    </Badge>
                    <div className="text-sm text-muted-foreground">
                      {item.pros.slice(0, 2).join(', ')}
                      {item.pros.length > 2 && '...'}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="max-w-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-red-50 text-red-700">
                      {item.cons.length}
                    </Badge>
                    <div className="text-sm text-muted-foreground">
                      {item.cons.slice(0, 2).join(', ')}
                      {item.cons.length > 2 && '...'}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleRowExpansion(index)}
                    className="h-8 w-8 p-0"
                  >
                    {expandedRows.has(index) ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </TableCell>
              </TableRow>
              {expandedRows.has(index) && (
                <TableRow>
                  <TableCell colSpan={5} className="bg-muted/20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                      <div>
                        <h4 className="font-semibold text-green-700 mb-2">
                          Points forts détaillés ({item.pros.length})
                        </h4>
                        <ul className="space-y-1">
                          {item.pros.map((pro, i) => (
                            <li key={i} className="text-sm flex items-start gap-2">
                              <span className="text-green-600">•</span>
                              <span>{pro}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-red-700 mb-2">
                          Points faibles détaillés ({item.cons.length})
                        </h4>
                        <ul className="space-y-1">
                          {item.cons.map((con, i) => (
                            <li key={i} className="text-sm flex items-start gap-2">
                              <span className="text-red-600">•</span>
                              <span>{con}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  const CardsView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sortedBreakdown.map((item, index) => (
        <Card key={index} className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg line-clamp-2">
                {item.option.replace(/^Option\s+\d+:\s*/i, '').trim()}
              </CardTitle>
              <Badge className={getScoreBadgeColor(item.score)} variant="outline">
                {item.score}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-green-700 mb-2 text-sm">
                Points forts ({item.pros.length})
              </h4>
              <ul className="space-y-1">
                {item.pros.slice(0, 3).map((pro, i) => (
                  <li key={i} className="text-xs flex items-start gap-1">
                    <span className="text-green-600 flex-shrink-0">•</span>
                    <span>{pro}</span>
                  </li>
                ))}
                {item.pros.length > 3 && (
                  <li className="text-xs text-muted-foreground">
                    +{item.pros.length - 3} autre(s)
                  </li>
                )}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-red-700 mb-2 text-sm">
                Points faibles ({item.cons.length})
              </h4>
              <ul className="space-y-1">
                {item.cons.slice(0, 3).map((con, i) => (
                  <li key={i} className="text-xs flex items-start gap-1">
                    <span className="text-red-600 flex-shrink-0">•</span>
                    <span>{con}</span>
                  </li>
                ))}
                {item.cons.length > 3 && (
                  <li className="text-xs text-muted-foreground">
                    +{item.cons.length - 3} autre(s)
                  </li>
                )}
              </ul>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="text-xl">Comparaison Détaillée</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('table')}
            >
              <List className="h-4 w-4 mr-1" />
              Tableau
            </Button>
            <Button
              variant={viewMode === 'cards' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('cards')}
            >
              <Grid className="h-4 w-4 mr-1" />
              Cartes
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {viewMode === 'table' ? <TableView /> : <CardsView />}
      </CardContent>
    </Card>
  );
};

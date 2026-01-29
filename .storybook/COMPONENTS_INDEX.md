# Index des Composants Rationable

Ce document liste tous les composants de Rationable et leur statut dans Storybook.

**Légende :**
- ✅ = Story Storybook créée
- ⏳ = Story Storybook à créer
- 📊 = Usage analysé (sera mis à jour après exécution du script)

---

## Composants UI (src/components/ui/)

Composants primitifs basés sur shadcn/ui.

| Composant | Storybook | Usage | Priorité | Notes |
|-----------|-----------|-------|----------|-------|
| accordion | ⏳ | 📊 | Moyenne | |
| alert | ✅ | 📊 | Basse | [UI/Alert](./src/components/ui/alert.stories.tsx) |
| alert-dialog | ✅ | 📊 | **Haute** | [UI/AlertDialog](./src/components/ui/alert-dialog.stories.tsx) |
| aspect-ratio | ⏳ | 📊 | Basse | |
| avatar | ✅ | 📊 | **Haute** | [UI/Avatar](./src/components/ui/avatar.stories.tsx) |
| badge | ✅ | 📊 | - | [UI/Badge](./src/components/ui/badge.stories.tsx) |
| breadcrumb | ⏳ | 📊 | Basse | |
| button | ✅ | 📊 | - | [UI/Button](./src/components/ui/button.stories.tsx) |
| calendar | ⏳ | 📊 | Basse | |
| card | ✅ | 📊 | - | [UI/Card](./src/components/ui/card.stories.tsx) |
| carousel | ⏳ | 📊 | Basse | |
| chart | ⏳ | 📊 | Basse | |
| checkbox | ✅ | 📊 | Moyenne | [UI/Checkbox](./src/components/ui/checkbox.stories.tsx) |
| collapsible | ✅ | 📊 | Basse | [UI/Collapsible](./src/components/ui/collapsible.stories.tsx) |
| command | ✅ | 📊 | Moyenne | [UI/Command](./src/components/ui/command.stories.tsx) |
| context-menu | ⏳ | 📊 | Basse | |
| dialog | ✅ | 📊 | **Haute** | [UI/Dialog](./src/components/ui/dialog.stories.tsx) |
| drawer | ⏳ | 📊 | Basse | |
| dropdown-menu | ✅ | 📊 | **Haute** | [UI/DropdownMenu](./src/components/ui/dropdown-menu.stories.tsx) |
| form | ✅ | 📊 | Moyenne | [UI/Form](./src/components/ui/form.stories.tsx) |
| hover-card | ⏳ | 📊 | Basse | |
| input | ✅ | 📊 | - | [UI/Input](./src/components/ui/input.stories.tsx) |
| input-otp | ⏳ | 📊 | Basse | |
| label | ✅ | 📊 | Moyenne | [UI/Label](./src/components/ui/label.stories.tsx) |
| menubar | ⏳ | 📊 | Basse | |
| navigation-menu | ⏳ | 📊 | Basse | |
| pagination | ⏳ | 📊 | Basse | |
| popover | ✅ | 📊 | **Haute** | [UI/Popover](./src/components/ui/popover.stories.tsx) |
| progress | ✅ | 📊 | Moyenne | [UI/Progress](./src/components/ui/progress.stories.tsx) |
| radio-group | ⏳ | 📊 | Basse | |
| resizable | ⏳ | 📊 | Basse | |
| scroll-area | ✅ | 📊 | Basse | [UI/ScrollArea](./src/components/ui/scroll-area.stories.tsx) |
| select | ✅ | 📊 | **Haute** | [UI/Select](./src/components/ui/select.stories.tsx) |
| separator | ✅ | 📊 | Basse | [UI/Separator](./src/components/ui/separator.stories.tsx) |
| sheet | ✅ | 📊 | **Haute** | [UI/Sheet](./src/components/ui/sheet.stories.tsx) |
| sidebar | ⏳ | 📊 | Basse | |
| skeleton | ✅ | 📊 | Moyenne | [UI/Skeleton](./src/components/ui/skeleton.stories.tsx) |
| slider | ⏳ | 📊 | Basse | |
| sonner | ⏳ | 📊 | Basse | |
| switch | ✅ | 📊 | Moyenne | [UI/Switch](./src/components/ui/switch.stories.tsx) |
| table | ✅ | 📊 | **Haute** | [UI/Table](./src/components/ui/table.stories.tsx) |
| tabs | ✅ | 📊 | **Haute** | [UI/Tabs](./src/components/ui/tabs.stories.tsx) |
| textarea | ✅ | 📊 | - | [UI/Textarea](./src/components/ui/textarea.stories.tsx) |
| toast | ⏳ | 📊 | Basse | |
| toaster | ⏳ | 📊 | Basse | |
| toggle | ⏳ | 📊 | Basse | |
| toggle-group | ⏳ | 📊 | Basse | |
| tooltip | ✅ | 📊 | **Haute** | [UI/Tooltip](./src/components/ui/tooltip.stories.tsx) |
| use-toast | ⏳ | 📊 | Basse | Hook, pas de story |

**Total UI :** 54 composants | **Stories créées :** 26 | **Stories à créer :** 28

---

## Composants DecisionMaker (src/components/decision-maker/)

Composants spécifiques à la prise de décision.

| Composant | Storybook | Usage | Priorité | Notes |
|-----------|-----------|-------|----------|-------|
| AIProviderDashboard | ⏳ | 📊 | Moyenne | |
| AIProviderIndicator | ⏳ | 📊 | Basse | |
| AIProviderMonitor | ⏳ | 📊 | Basse | |
| AnalysisCharts | ⏳ | 📊 | Moyenne | |
| AnalysisInsights | ⏳ | 📊 | Basse | |
| AnalysisNavigation | ✅ | 📊 | Moyenne | [DecisionMaker/AnalysisNavigation](./src/components/decision-maker/AnalysisNavigation.stories.tsx) |
| AnalysisResult | ✅ | 📊 | Moyenne | [DecisionMaker/AnalysisResult](./src/components/decision-maker/AnalysisResult.stories.tsx) |
| ComparisonTable | ✅ | 📊 | **Haute** | [DecisionMaker/ComparisonTable](./src/components/decision-maker/ComparisonTable.stories.tsx) |
| ConfidenceIndicator | ⏳ | 📊 | Moyenne | |
| DataAccuracyIndicator | ✅ | 📊 | Basse | [DecisionMaker/DataAccuracyIndicator](./src/components/decision-maker/DataAccuracyIndicator.stories.tsx) |
| DecisionImage | ⏳ | 📊 | Basse | |
| DilemmaSetup | ✅ | 📊 | Moyenne | [DecisionMaker/DilemmaSetup](./src/components/decision-maker/DilemmaSetup.stories.tsx) |
| EnhancedRadarChart | ⏳ | 📊 | Basse | |
| ExpandOptionsButton | ⏳ | 📊 | Basse | |
| FollowUpQuestions | ✅ | 📊 | Moyenne | [DecisionMaker/FollowUpQuestions](./src/components/decision-maker/FollowUpQuestions.stories.tsx) |
| MainActionButton | ⏳ | 📊 | Basse | |
| MetricsVisual | ⏳ | 📊 | Basse | |
| ParticipantManager | ⏳ | 📊 | Moyenne | |
| PerplexityCounter | ⏳ | 📊 | Basse | |
| PieChart | ⏳ | 📊 | Basse | |
| RecommendationCard | ✅ | 📊 | **Haute** | [DecisionMaker/RecommendationCard](./src/components/decision-maker/RecommendationCard.stories.tsx) |
| ScoreChart | ⏳ | 📊 | Basse | |
| SourcesList | ⏳ | 📊 | Basse | |
| UsefulLinks | ⏳ | 📊 | Basse | |
| VisualIndicators | ⏳ | 📊 | Basse | |
| VoteButton | ✅ | 📊 | Moyenne | [DecisionMaker/VoteButton](./src/components/decision-maker/VoteButton.stories.tsx) |
| WorkspaceDocumentIndicator | ⏳ | 📊 | Basse | |

**Total DecisionMaker :** 27 composants | **Stories créées :** 8 | **Stories à créer :** 19

---

## Composants Comments (src/components/comments/)

Système de commentaires et mentions.

| Composant | Storybook | Usage | Priorité | Notes |
|-----------|-----------|-------|----------|-------|
| CommentableSection | ⏳ | 📊 | Moyenne | |
| CommentItem | ✅ | 📊 | **Haute** | [Comments/CommentItem](./src/components/comments/CommentItem.stories.tsx) |
| CommentReactions | ⏳ | 📊 | Basse | |
| CommentReplies | ⏳ | 📊 | Moyenne | |
| CommentSection | ⏳ | 📊 | Moyenne | |
| CommentsPanel | ✅ | 📊 | **Haute** | [Comments/CommentsPanel](./src/components/comments/CommentsPanel.stories.tsx) |
| MentionRenderer | ⏳ | 📊 | Basse | |
| MentionsInput | ⏳ | 📊 | Moyenne | |

**Total Comments :** 8 composants | **Stories créées :** 2 | **Stories à créer :** 6

---

## Composants Settings (src/components/settings/)

Composants de paramètres et configuration.

| Composant | Storybook | Usage | Priorité | Notes |
|-----------|-----------|-------|----------|-------|
| AccountsSettings | ⏳ | 📊 | Basse | |
| AdminSettings | ⏳ | 📊 | Basse | |
| AppearanceSettings | ⏳ | 📊 | Basse | |
| DocumentsSettings | ⏳ | 📊 | Basse | |
| GoogleAccountSettings | ⏳ | 📊 | Basse | |
| MembersSettings | ⏳ | 📊 | Basse | |
| MonthlyTemplatesSettings | ⏳ | 📊 | Basse | |
| ProfileSettings | ⏳ | 📊 | Basse | |
| RealTimeSearchSettings | ⏳ | 📊 | Basse | |
| SettingsSidebar | ⏳ | 📊 | Basse | |
| WorkspacesSettings | ⏳ | 📊 | Basse | |

**Total Settings :** 11 composants | **Stories créées :** 0 | **Stories à créer :** 11

---

## Composants Workspace (src/components/workspace/)

Gestion des workspaces et collaboration.

| Composant | Storybook | Usage | Priorité | Notes |
|-----------|-----------|-------|----------|-------|
| CreateWorkspaceDialog | ⏳ | 📊 | Moyenne | |
| DocumentsSettings | ⏳ | 📊 | Basse | |
| WorkspaceMembersManager | ⏳ | 📊 | Moyenne | |
| WorkspaceSelector | ⏳ | 📊 | Moyenne | |

**Total Workspace :** 4 composants | **Stories créées :** 0 | **Stories à créer :** 4

---

## Composants Templates (src/components/templates/)

Gestion des templates de décision.

| Composant | Storybook | Usage | Priorité | Notes |
|-----------|-----------|-------|----------|-------|
| CustomTemplateManager | ⏳ | 📊 | Moyenne | |
| TemplateCard | ✅ | 📊 | Moyenne | [Templates/TemplateCard](./src/components/templates/TemplateCard.stories.tsx) |
| TemplateFilters | ⏳ | 📊 | Basse | |
| TemplateGrid | ⏳ | 📊 | Moyenne | |

**Total Templates :** 4 composants | **Stories créées :** 1 | **Stories à créer :** 3

---

## Composants History (src/components/history/)

Historique des décisions.

| Composant | Storybook | Usage | Priorité | Notes |
|-----------|-----------|-------|----------|-------|
| EmptyHistoryState | ⏳ | 📊 | Basse | |
| HistoryActions | ⏳ | 📊 | Basse | |
| HistoryItem | ✅ | 📊 | Moyenne | [History/HistoryItem](./src/components/history/HistoryItem.stories.tsx) |
| HistorySearchBar | ⏳ | 📊 | Moyenne | |

**Total History :** 4 composants | **Stories créées :** 1 | **Stories à créer :** 3

---

## Composants Core (src/components/)

Composants principaux de l'application.

| Composant | Storybook | Usage | Priorité | Notes |
|-----------|-----------|-------|----------|-------|
| DecisionMaker | ⏳ | 📊 | Basse | Composant principal, complexe |
| Layout | ⏳ | 📊 | Basse | Layout principal |
| Navbar | ⏳ | 📊 | Basse | Navigation principale |
| Footer | ⏳ | 📊 | Basse | |
| EditableTitle | ✅ | 📊 | Moyenne | [Core/EditableTitle](./src/components/EditableTitle.stories.tsx) |
| CriteriaManager | ✅ | 📊 | Moyenne | [Core/CriteriaManager](./src/components/CriteriaManager.stories.tsx) |
| ExpandableText | ⏳ | 📊 | Basse | |
| ExportMenu | ⏳ | 📊 | Moyenne | |
| ShareButton | ⏳ | 📊 | Basse | |
| ShareAsTemplateDialog | ⏳ | 📊 | Basse | |
| SharedDecisionView | ⏳ | 📊 | Basse | |
| AuthModal | ⏳ | 📊 | Basse | |
| AuthForm | ⏳ | 📊 | Basse | |
| LanguageSelector | ⏳ | 📊 | Basse | |
| ThemeToggle | ⏳ | 📊 | Basse | |
| FileUpload | ⏳ | 📊 | Moyenne | |
| CategorySelector | ⏳ | 📊 | Basse | |
| CollaborationDialog | ⏳ | 📊 | Basse | |
| EnhancedDecisionHistory | ⏳ | 📊 | Moyenne | |
| DecisionHistory | ⏳ | 📊 | Basse | |
| MonthlyTrendingTemplates | ⏳ | 📊 | Basse | |
| ManualOptionsCreator | ⏳ | 📊 | Moyenne | |
| ManualOptionsGenerator | ⏳ | 📊 | Moyenne | |
| OptionsLoadingSkeleton | ⏳ | 📊 | Basse | |
| CriteriaSkeleton | ⏳ | 📊 | Basse | |
| CriterionRow | ⏳ | 📊 | Basse | |
| EmojiPicker | ⏳ | 📊 | Moyenne | |
| OptimizedImage | ⏳ | 📊 | Basse | |
| AvatarUpload | ⏳ | 📊 | Basse | |
| WorkspaceImageUpload | ⏳ | 📊 | Basse | |
| Onboarding | ⏳ | 📊 | Basse | |
| ProtectedRoute | ⏳ | 📊 | Basse | Route wrapper |
| RealTimeSearchToggle | ⏳ | 📊 | Basse | |
| SecurityNotice | ⏳ | 📊 | Basse | |
| YouTubeVideoCard | ⏳ | 📊 | Basse | |
| MerchantLogo | ⏳ | 📊 | Basse | |
| ValidatedLink | ⏳ | 📊 | Basse | |
| LazyComponent | ⏳ | 📊 | Basse | Utilitaires |
| LazyLoadingDemo | ⏳ | 📊 | Basse | |
| SimpleDashboard | ⏳ | 📊 | Basse | |
| AdvancedFeaturesDashboard | ⏳ | 📊 | Basse | |
| PerformanceDashboard | ⏳ | 📊 | Basse | |
| PerformanceMonitor | ⏳ | 📊 | Basse | |
| SentryDashboard | ⏳ | 📊 | Basse | |
| AccessibilityAudit | ⏳ | 📊 | Basse | |
| AnimatedBackground | ⏳ | 📊 | Basse | |
| BackgroundGradientAnimation | ⏳ | 📊 | Basse | |
| AnimatedPlaceholder | ⏳ | 📊 | Basse | |
| PageTransition | ⏳ | 📊 | Basse | (animations/) |
| AppErrorBoundary | ⏳ | 📊 | Basse | (core/) |

**Total Core :** 46 composants | **Stories créées :** 2 | **Stories à créer :** 44

---

## Résumé Global

| Catégorie | Total | Stories | À créer |
|-----------|-------|---------|---------|
| UI | 54 | 26 | 28 |
| DecisionMaker | 27 | 8 | 19 |
| Comments | 8 | 2 | 6 |
| Settings | 11 | 0 | 11 |
| Workspace | 4 | 0 | 4 |
| Templates | 4 | 1 | 3 |
| History | 4 | 1 | 3 |
| Core | 46 | 2 | 44 |
| **TOTAL** | **158** | **40** | **118** |

---

## Priorités pour les Stories

### Phase 1 - Composants UI prioritaires (10 stories)
1. ✅ Avatar
2. ✅ Dialog
3. ✅ Select
4. ✅ Sheet
5. ✅ DropdownMenu
6. ✅ Tabs
7. ✅ Table
8. ✅ Popover
9. ✅ AlertDialog
10. ✅ Tooltip

### Phase 2 - Composants métier clés (4 stories) ✅
1. ✅ ComparisonTable
2. ✅ RecommendationCard
3. ✅ CommentsPanel
4. ✅ CommentItem

### Phase 3 - Autres composants UI (11 stories créées) ✅
1. ✅ Alert
2. ✅ Label
3. ✅ Switch
4. ✅ Progress
5. ✅ Skeleton
6. ✅ Separator
7. ✅ Checkbox
8. ✅ ScrollArea
9. ✅ Collapsible
10. ✅ Command
11. ✅ Form

### Phase 4 - Autres composants métier (10 stories créées) ✅
1. ✅ DilemmaSetup
2. ✅ AnalysisResult
3. ✅ VoteButton
4. ✅ FollowUpQuestions
5. ✅ AnalysisNavigation
6. ✅ DataAccuracyIndicator
7. ✅ HistoryItem
8. ✅ TemplateCard
9. ✅ EditableTitle
10. ✅ CriteriaManager

---

## Notes

- Les composants marqués "📊" auront leur usage mis à jour après exécution du script d'analyse
- Les composants non utilisés seront identifiés par le script
- Les stories existantes sont accessibles via les liens dans la colonne Storybook
- Ce document sera mis à jour régulièrement au fur et à mesure de la création des stories

---

*Dernière mise à jour : 27/01/2026 - Phase 4 complétée (40 stories au total)*

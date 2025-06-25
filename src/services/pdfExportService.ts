
import { IDecision } from '@/types/decision';

export interface PDFExportOptions {
  includeCharts?: boolean;
  includeLinks?: boolean;
  includeBreakdown?: boolean;
  format?: 'A4' | 'Letter';
  orientation?: 'portrait' | 'landscape';
}

export const generatePDFContent = (
  decision: IDecision,
  options: PDFExportOptions = {}
): string => {
  const {
    includeCharts = true,
    includeLinks = true,
    includeBreakdown = true,
    format = 'A4',
    orientation = 'portrait'
  } = options;

  const date = new Date(decision.timestamp).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  let html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Analyse de Décision - ${decision.dilemma}</title>
        <style>
            @page {
                size: ${format} ${orientation};
                margin: 2cm;
            }
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
            }
            .header {
                text-align: center;
                border-bottom: 3px solid #3b82f6;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            .emoji {
                font-size: 3em;
                margin-bottom: 10px;
            }
            .title {
                font-size: 2em;
                font-weight: bold;
                color: #1f2937;
                margin-bottom: 10px;
            }
            .date {
                color: #6b7280;
                font-size: 0.9em;
            }
            .recommendation {
                background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
                border-left: 5px solid #3b82f6;
                padding: 20px;
                margin: 20px 0;
                border-radius: 8px;
            }
            .recommendation-title {
                font-size: 1.3em;
                font-weight: bold;
                color: #1e40af;
                margin-bottom: 10px;
            }
            .recommendation-text {
                font-size: 1.1em;
                color: #1f2937;
            }
            .section {
                margin: 30px 0;
            }
            .section-title {
                font-size: 1.2em;
                font-weight: bold;
                color: #1f2937;
                border-bottom: 2px solid #e5e7eb;
                padding-bottom: 5px;
                margin-bottom: 15px;
            }
            .breakdown-table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
            }
            .breakdown-table th,
            .breakdown-table td {
                border: 1px solid #d1d5db;
                padding: 12px;
                text-align: left;
            }
            .breakdown-table th {
                background-color: #f9fafb;
                font-weight: bold;
                color: #374151;
            }
            .score-badge {
                display: inline-block;
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 0.8em;
                font-weight: bold;
            }
            .score-high { background-color: #dcfce7; color: #166534; }
            .score-medium { background-color: #fef3c7; color: #92400e; }
            .score-low { background-color: #fee2e2; color: #991b1b; }
            .pros-cons {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin: 20px 0;
            }
            .pros, .cons {
                padding: 15px;
                border-radius: 8px;
            }
            .pros {
                background-color: #f0fdf4;
                border-left: 4px solid #22c55e;
            }
            .cons {
                background-color: #fef2f2;
                border-left: 4px solid #ef4444;
            }
            .pros h4 { color: #166534; }
            .cons h4 { color: #dc2626; }
            .list-item {
                margin-bottom: 8px;
                padding-left: 15px;
                position: relative;
            }
            .list-item:before {
                content: "•";
                position: absolute;
                left: 0;
                font-weight: bold;
            }
            .pros .list-item:before { color: #22c55e; }
            .cons .list-item:before { color: #ef4444; }
            .links-section {
                margin: 20px 0;
            }
            .link-item {
                background-color: #f8fafc;
                border: 1px solid #e2e8f0;
                padding: 10px;
                margin-bottom: 8px;
                border-radius: 6px;
            }
            .link-title {
                font-weight: bold;
                color: #3b82f6;
                margin-bottom: 5px;
            }
            .link-url {
                font-size: 0.9em;
                color: #6b7280;
                word-break: break-all;
            }
            .criteria-list {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                margin: 15px 0;
            }
            .criteria-item {
                background-color: #f1f5f9;
                border: 1px solid #cbd5e1;
                padding: 5px 12px;
                border-radius: 20px;
                font-size: 0.9em;
                color: #475569;
            }
            @media print {
                .page-break {
                    page-break-before: always;
                }
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="emoji">${decision.emoji}</div>
            <div class="title">${decision.dilemma}</div>
            <div class="date">Analyse générée le ${date}</div>
        </div>

        <div class="recommendation">
            <div class="recommendation-title">🎯 Recommandation</div>
            <div class="recommendation-text">${decision.result.recommendation}</div>
        </div>

        <div class="section">
            <div class="section-title">📋 Description</div>
            <p>${decision.result.description}</p>
        </div>

        <div class="section">
            <div class="section-title">🎯 Critères d'évaluation</div>
            <div class="criteria-list">
                ${decision.criteria.map(criterion => 
                    `<span class="criteria-item">${criterion.name}</span>`
                ).join('')}
            </div>
        </div>
  `;

  if (includeBreakdown && decision.result.breakdown) {
    html += `
        <div class="section page-break">
            <div class="section-title">📊 Analyse Détaillée des Options</div>
            <table class="breakdown-table">
                <thead>
                    <tr>
                        <th>Option</th>
                        <th>Score</th>
                        <th>Points Forts</th>
                        <th>Points Faibles</th>
                    </tr>
                </thead>
                <tbody>
                    ${decision.result.breakdown.map(item => {
                      const scoreClass = item.score >= 80 ? 'score-high' : 
                                       item.score >= 60 ? 'score-medium' : 'score-low';
                      return `
                        <tr>
                            <td><strong>${item.option.replace(/^Option\s+\d+:\s*/i, '').trim()}</strong></td>
                            <td><span class="score-badge ${scoreClass}">${item.score}/100</span></td>
                            <td>${item.pros.length} points</td>
                            <td>${item.cons.length} points</td>
                        </tr>
                      `;
                    }).join('')}
                </tbody>
            </table>

            ${decision.result.breakdown.map(item => `
                <div class="pros-cons">
                    <div class="pros">
                        <h4>✅ ${item.option.replace(/^Option\s+\d+:\s*/i, '').trim()} - Points Forts</h4>
                        ${item.pros.map(pro => `<div class="list-item">${pro}</div>`).join('')}
                    </div>
                    <div class="cons">
                        <h4>❌ Points Faibles</h4>
                        ${item.cons.map(con => `<div class="list-item">${con}</div>`).join('')}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
  }

  if (includeLinks && (decision.result.infoLinks?.length || decision.result.shoppingLinks?.length)) {
    html += `
        <div class="section">
            <div class="section-title">🔗 Liens Utiles</div>
    `;
    
    if (decision.result.infoLinks?.length) {
      html += `
            <h4>📚 Informations complémentaires</h4>
            <div class="links-section">
                ${decision.result.infoLinks.map(link => `
                    <div class="link-item">
                        <div class="link-title">${link.title}</div>
                        ${link.description ? `<div>${link.description}</div>` : ''}
                        <div class="link-url">${link.url}</div>
                    </div>
                `).join('')}
            </div>
      `;
    }

    if (decision.result.shoppingLinks?.length) {
      html += `
            <h4>🛒 Liens d'achat</h4>
            <div class="links-section">
                ${decision.result.shoppingLinks.map(link => `
                    <div class="link-item">
                        <div class="link-title">${link.title}</div>
                        ${link.description ? `<div>${link.description}</div>` : ''}
                        <div class="link-url">${link.url}</div>
                    </div>
                `).join('')}
            </div>
      `;
    }

    html += `</div>`;
  }

  html += `
    </body>
    </html>
  `;

  return html;
};

export const exportToPDF = async (
  decision: IDecision,
  options: PDFExportOptions = {}
): Promise<void> => {
  try {
    const htmlContent = generatePDFContent(decision, options);
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Unable to open print window');
    }
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load then trigger print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        // Close the window after printing (user can cancel)
        printWindow.onafterprint = () => printWindow.close();
      }, 250);
    };
    
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw new Error('Failed to export PDF');
  }
};

export const generateImageExport = async (elementId: string): Promise<string> => {
  // This would typically use html2canvas or similar library
  // For now, we'll return a placeholder
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve('data:image/png;base64,placeholder');
    }, 1000);
  });
};

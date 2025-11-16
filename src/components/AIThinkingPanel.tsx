'use client';

import type { ThinkingData } from '@/lib/ai/thinking';
import { formatThinkingData } from '@/lib/ai/thinking';

interface AIThinkingPanelProps {
  thinkingData: ThinkingData | null;
  gridSize?: number;
}

function formatTextWithMarkdown(text: string): React.ReactNode[] {
  const lines = text.split('\n');
  return lines.map((line, index) => {
    // Detect indentation level (count leading spaces, 2 spaces = 1 level)
    const leadingSpaces = line.match(/^(\s*)/)?.[1].length || 0;
    const indentLevel = Math.floor(leadingSpaces / 2);
    const indentClass = indentLevel > 0 ? `thinking-indent-${indentLevel}` : '';
    
    // Handle bold text (**text**)
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    const boldRegex = /\*\*(.+?)\*\*/g;
    let match;
    
    while ((match = boldRegex.exec(line)) !== null) {
      // Add text before bold
      if (match.index > lastIndex) {
        parts.push(line.substring(lastIndex, match.index));
      }
      // Add bold text
      parts.push(<strong key={`bold-${index}-${match.index}`}>{match[1]}</strong>);
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < line.length) {
      parts.push(line.substring(lastIndex));
    }
    
    if (parts.length === 0) {
      parts.push(line);
    }
    
    const className = line.trim() === '' 
      ? 'thinking-line-empty' 
      : `thinking-line ${indentClass}`.trim();
    
    return (
      <div key={index} className={className} style={indentLevel > 0 ? { paddingLeft: `${indentLevel * 20}px` } : undefined}>
        {parts}
      </div>
    );
  });
}

export default function AIThinkingPanel({ thinkingData, gridSize = 3 }: AIThinkingPanelProps) {
  if (!thinkingData) {
    return (
      <div className="ai-thinking-panel">
        <h3>🧠 AI Thinking</h3>
        <p className="no-data" title="The AI will analyze the board after you make your move">
          💭 No analysis available yet.<br />
          Make a move to see how I think!
        </p>
      </div>
    );
  }

  const formattedText = formatThinkingData(thinkingData, gridSize);
  const formattedContent = formatTextWithMarkdown(formattedText);
  const pruningEfficiency = ((thinkingData.branchesPruned / (thinkingData.nodesEvaluated + thinkingData.branchesPruned)) * 100);

  return (
    <div className="ai-thinking-panel">
      <h3 title="Detailed analysis of the AI's decision-making process">🧠 AI Thinking</h3>
      <div className="thinking-content">
        <div className="thinking-text" title={`Analysis completed in ${thinkingData.searchTime?.toFixed(2) || 'N/A'}ms`}>
          {formattedContent}
        </div>
      </div>
    </div>
  );
}


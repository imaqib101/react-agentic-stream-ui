import { useMemo } from 'react';

export interface StreamArtifact {
  id: string;
  type: string;
  title: string;
  language?: string;
  content: string;
  isComplete: boolean;
}

/**
 * Parses streaming content and extracts artifacts enclosed in:
 * <artifact id="..." type="..." title="..." language="...">...</artifact>
 * or <antArtifact identifier="..." type="..." title="...">...</antArtifact>
 * Even during active streaming before the closing tag arrives.
 */
export function extractArtifacts(rawText: string, isStreaming: boolean = false): StreamArtifact[] {
  if (!rawText) return [];

  const artifacts: StreamArtifact[] = [];
  const tagRegex = /<(?:antA|a)rtifact\s+([^>]*?)>([\s\S]*?)(?:<\/(?:antA|a)rtifact>|$)/gi;

  let match: RegExpExecArray | null;
  while ((match = tagRegex.exec(rawText)) !== null) {
    const attrString = match[1];
    const content = match[2];
    const fullMatch = match[0];
    const isClosed = fullMatch.endsWith('</artifact>') || fullMatch.endsWith('</antArtifact>');

    const id = getAttribute(attrString, 'id') || getAttribute(attrString, 'identifier') || `art_${artifacts.length + 1}`;
    const type = getAttribute(attrString, 'type') || 'code';
    const title = getAttribute(attrString, 'title') || 'Untitled Artifact';
    const language = getAttribute(attrString, 'language') || undefined;

    artifacts.push({
      id,
      type,
      title,
      language,
      content: content.trim(),
      isComplete: isClosed || !isStreaming,
    });
  }

  return artifacts;
}

function getAttribute(attrs: string, name: string): string | null {
  const regex = new RegExp(`${name}=["']([^"']*)["']`, 'i');
  const match = regex.exec(attrs);
  return match ? match[1] : null;
}

export interface UseStreamArtifactsResult {
  artifacts: StreamArtifact[];
  latestArtifact: StreamArtifact | null;
  hasArtifacts: boolean;
}

export function useStreamArtifacts(
  content: string,
  isStreaming: boolean = false
): UseStreamArtifactsResult {
  const artifacts = useMemo(
    () => extractArtifacts(content, isStreaming),
    [content, isStreaming]
  );

  const latestArtifact = artifacts.length > 0 ? artifacts[artifacts.length - 1] : null;

  return {
    artifacts,
    latestArtifact,
    hasArtifacts: artifacts.length > 0,
  };
}

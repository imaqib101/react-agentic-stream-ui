import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { extractArtifacts, useStreamArtifacts } from '../src/hooks/useStreamArtifacts';

describe('extractArtifacts & useStreamArtifacts', () => {
  it('returns empty array when content has no artifacts', () => {
    const text = 'Here is some plain chat response without any artifact tags.';
    expect(extractArtifacts(text)).toEqual([]);
    const { result } = renderHook(() => useStreamArtifacts(text));
    expect(result.current.hasArtifacts).toBe(false);
    expect(result.current.artifacts).toEqual([]);
    expect(result.current.latestArtifact).toBeNull();
  });

  it('extracts complete artifacts correctly', () => {
    const text = `
Here is your requested code:
<artifact id="server-api" type="code" title="Express API Server" language="typescript">
import express from 'express';
const app = express();
app.listen(3000);
</artifact>
Enjoy your server!
    `;

    const artifacts = extractArtifacts(text);
    expect(artifacts).toHaveLength(1);
    expect(artifacts[0]).toEqual({
      id: 'server-api',
      type: 'code',
      title: 'Express API Server',
      language: 'typescript',
      content: "import express from 'express';\nconst app = express();\napp.listen(3000);",
      isComplete: true,
    });
  });

  it('handles antArtifact syntax and in-progress streaming without closing tag', () => {
    const streamingText = `
Creating the React dashboard component:
<antArtifact identifier="dashboard" type="application/react" title="Analytics Dashboard" language="tsx">
export function Dashboard() {
  return <div>Metrics</div>;
`;

    const artifacts = extractArtifacts(streamingText, true);
    expect(artifacts).toHaveLength(1);
    expect(artifacts[0].id).toBe('dashboard');
    expect(artifacts[0].title).toBe('Analytics Dashboard');
    expect(artifacts[0].language).toBe('tsx');
    expect(artifacts[0].isComplete).toBe(false);
    expect(artifacts[0].content).toContain('<div>Metrics</div>');

    const { result } = renderHook(() => useStreamArtifacts(streamingText, true));
    expect(result.current.hasArtifacts).toBe(true);
    expect(result.current.latestArtifact?.isComplete).toBe(false);
  });

  it('handles multiple artifacts and tracks latestArtifact', () => {
    const multiText = `
<artifact id="doc1" type="markdown" title="Architecture Overview">
# Architecture
</artifact>

<artifact id="doc2" type="code" title="Worker Queue" language="python">
def worker(): pass
</artifact>
    `;

    const { result } = renderHook(() => useStreamArtifacts(multiText));
    expect(result.current.artifacts).toHaveLength(2);
    expect(result.current.latestArtifact?.id).toBe('doc2');
    expect(result.current.latestArtifact?.language).toBe('python');
  });
});

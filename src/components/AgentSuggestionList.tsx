import React from 'react';

export interface AgentSuggestionItem {
  id?: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  category?: string;
}

export interface AgentSuggestionListProps {
  suggestions: Array<string | AgentSuggestionItem>;
  onSelect: (suggestion: string | AgentSuggestionItem, index: number) => void;
  title?: string;
  description?: string;
  disabled?: boolean;
  variant?: 'chips' | 'cards' | 'list';
  chipPrefix?: string;
  className?: string;
  testId?: string;
}

export const AgentSuggestionList: React.FC<AgentSuggestionListProps> = ({
  suggestions,
  onSelect,
  title,
  description,
  disabled = false,
  variant = 'chips',
  chipPrefix = '✨',
  className = '',
  testId = 'agent-suggestion-list',
}) => {
  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  const getItemLabel = (item: string | AgentSuggestionItem): string => {
    return typeof item === 'string' ? item : item.label;
  };

  const getItemKey = (item: string | AgentSuggestionItem, index: number): string => {
    if (typeof item === 'string') return `suggestion-${index}-${item}`;
    return item.id || `suggestion-${index}-${item.label}`;
  };

  const handleKeyDown = (
    e: React.KeyboardEvent,
    item: string | AgentSuggestionItem,
    index: number
  ) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(item, index);
    }
  };

  return (
    <div
      data-testid={testId}
      className={`agent-suggestion-list ${className}`}
      role="region"
      aria-label={title || 'Suggested Actions'}
      style={{
        margin: '12px 0',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {(title || description) && (
        <div style={{ marginBottom: '8px' }}>
          {title && (
            <h4
              data-testid="suggestion-list-title"
              style={{
                margin: 0,
                fontSize: '13px',
                fontWeight: 600,
                color: '#4b5563',
                letterSpacing: '0.025em',
                textTransform: 'uppercase',
              }}
            >
              {title}
            </h4>
          )}
          {description && (
            <p
              style={{
                margin: '2px 0 0 0',
                fontSize: '12px',
                color: '#6b7280',
              }}
            >
              {description}
            </p>
          )}
        </div>
      )}

      {variant === 'chips' && (
        <div
          role="group"
          aria-label="Suggested prompt chips"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          {suggestions.map((item, index) => {
            const label = getItemLabel(item);
            const icon = typeof item !== 'string' ? item.icon : null;
            return (
              <button
                key={getItemKey(item, index)}
                type="button"
                data-testid={`suggestion-chip-${index}`}
                disabled={disabled}
                onClick={() => onSelect(item, index)}
                onKeyDown={(e) => handleKeyDown(e, item, index)}
                aria-label={`Suggestion: ${label}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '9999px',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: disabled ? '#9ca3af' : '#1d4ed8',
                  backgroundColor: disabled ? '#f3f4f6' : '#eff6ff',
                  border: `1px solid ${disabled ? '#e5e7eb' : '#bfdbfe'}`,
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  opacity: disabled ? 0.65 : 1,
                  transition: 'background-color 0.15s ease, border-color 0.15s ease, transform 0.1s ease',
                  outline: 'none',
                  textAlign: 'left',
                }}
              >
                {icon ? (
                  <span style={{ display: 'inline-flex', fontSize: '13px' }}>{icon}</span>
                ) : chipPrefix ? (
                  <span style={{ fontSize: '12px' }}>{chipPrefix}</span>
                ) : null}
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      )}

      {variant === 'cards' && (
        <div
          role="group"
          aria-label="Suggested action cards"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '10px',
          }}
        >
          {suggestions.map((item, index) => {
            const label = getItemLabel(item);
            const descriptionText = typeof item !== 'string' ? item.description : undefined;
            const icon = typeof item !== 'string' ? item.icon : null;
            const category = typeof item !== 'string' ? item.category : undefined;

            return (
              <button
                key={getItemKey(item, index)}
                type="button"
                data-testid={`suggestion-card-${index}`}
                disabled={disabled}
                onClick={() => onSelect(item, index)}
                onKeyDown={(e) => handleKeyDown(e, item, index)}
                aria-label={`Suggestion card: ${label}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  backgroundColor: disabled ? '#f9fafb' : '#ffffff',
                  border: `1px solid ${disabled ? '#e5e7eb' : '#e2e8f0'}`,
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  opacity: disabled ? 0.65 : 1,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                  textAlign: 'left',
                  transition: 'box-shadow 0.15s ease, border-color 0.15s ease',
                  width: '100%',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    marginBottom: '4px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {icon && <span style={{ fontSize: '16px' }}>{icon}</span>}
                    <span
                      style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        color: disabled ? '#9ca3af' : '#1e293b',
                      }}
                    >
                      {label}
                    </span>
                  </div>
                  {category && (
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        backgroundColor: '#f1f5f9',
                        color: '#64748b',
                      }}
                    >
                      {category}
                    </span>
                  )}
                </div>
                {descriptionText && (
                  <p
                    style={{
                      margin: '2px 0 0 0',
                      fontSize: '12px',
                      color: '#64748b',
                      lineHeight: 1.4,
                    }}
                  >
                    {descriptionText}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      )}

      {variant === 'list' && (
        <ul
          role="list"
          style={{
            margin: 0,
            padding: 0,
            listStyle: 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          {suggestions.map((item, index) => {
            const label = getItemLabel(item);
            const icon = typeof item !== 'string' ? item.icon : null;
            return (
              <li key={getItemKey(item, index)}>
                <button
                  type="button"
                  data-testid={`suggestion-list-item-${index}`}
                  disabled={disabled}
                  onClick={() => onSelect(item, index)}
                  onKeyDown={(e) => handleKeyDown(e, item, index)}
                  aria-label={`Suggestion item: ${label}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    color: disabled ? '#9ca3af' : '#334155',
                    backgroundColor: disabled ? '#f8fafc' : '#f8fafc',
                    border: `1px solid ${disabled ? '#e2e8f0' : '#e2e8f0'}`,
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    opacity: disabled ? 0.65 : 1,
                    textAlign: 'left',
                  }}
                >
                  <span style={{ color: disabled ? '#9ca3af' : '#64748b', fontSize: '12px' }}>
                    {icon || '→'}
                  </span>
                  <span style={{ fontWeight: 500 }}>{label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

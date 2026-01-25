import * as React from "react";
import { SuggestionCard } from "./SuggestionCard";
import type { Suggestion } from "../services/analysisService";
import { makeStyles, shorthands } from "@fluentui/react-components";

const useStyles = makeStyles({
    list: {
        display: "flex",
        flexDirection: "column",
        ...shorthands.padding("0"),
    },
    emptyState: {
        textAlign: "center",
        ...shorthands.padding("20px"),
        color: "#605e5c",
    }
});

interface SuggestionListProps {
    suggestions: Suggestion[];
    onApply: (suggestion: Suggestion, replacement: string) => void;
    onDismiss: (id: string) => void;
    onIgnore: (word: string) => void;
    onDisableRule?: (ruleId: string) => void;
}

export const SuggestionList: React.FC<SuggestionListProps> = ({ suggestions, onApply, onDismiss, onIgnore, onDisableRule }) => {
    const styles = useStyles();
    const [expandedId, setExpandedId] = React.useState<string | null>(
        suggestions.length === 1 ? suggestions[0].id : null
    );

    // Update expanded state if suggestions change (e.g. navigation)
    React.useEffect(() => {
        if (suggestions.length === 1) {
            setExpandedId(suggestions[0].id);
        }
    }, [suggestions]);

    if (suggestions.length === 0) {
        return (
            <div className={styles.emptyState}>
                <p>No issues found. Good job!</p>
            </div>
        );
    }

    return (
        <div className={styles.list}>
            {suggestions.map((suggestion) => {
                const isExpanded = expandedId === suggestion.id;
                return (
                    <div key={suggestion.id} style={{ marginBottom: '8px' }}>
                        {!isExpanded ? (
                            <div
                                onClick={() => setExpandedId(suggestion.id)}
                                style={{
                                    padding: '12px',
                                    backgroundColor: 'white',
                                    border: '1px solid #e0e0e0',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                            >
                                <span style={{ fontWeight: 600, color: '#d13438' }}>{suggestion.originalText}</span>
                                <span style={{ fontSize: '12px', color: '#666' }}>Click to view</span>
                            </div>
                        ) : (
                            <div style={{ position: 'relative' }}>
                                <div
                                    onClick={() => setExpandedId(null)}
                                    style={{
                                        position: 'absolute',
                                        top: '0',
                                        right: '0',
                                        padding: '4px 8px',
                                        cursor: 'pointer',
                                        zIndex: 1,
                                        fontSize: '10px',
                                        color: '#666'
                                    }}
                                >
                                    Collapse
                                </div>
                                <SuggestionCard
                                    suggestion={suggestion}
                                    onApply={onApply}
                                    onDismiss={onDismiss}
                                    onIgnore={onIgnore}
                                    onDisableRule={onDisableRule}
                                />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

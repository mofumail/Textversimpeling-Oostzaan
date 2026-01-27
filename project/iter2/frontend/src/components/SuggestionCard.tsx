import * as React from "react";
import {
    Card,
    Text,
    Button,
    Body1,
    Caption1,
    makeStyles,
    shorthands,
} from "@fluentui/react-components";
import { Checkmark24Regular, DismissCircle24Regular, Prohibited24Regular } from "@fluentui/react-icons";
import type { Suggestion } from "../services/analysisService";

const useStyles = makeStyles({
    card: {
        ...shorthands.margin("8px"),
        width: "auto",
        maxWidth: "100%",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    },
    category: {
        color: "#d13438", // Warning red
        fontWeight: "bold",
    },
    explanation: {
        ...shorthands.margin("8px", "0"),
    },
    actions: {
        display: "flex",
        flexDirection: "column", // Stack vertically
        gap: "12px",
        marginTop: "12px",
        paddingTop: "12px",
        borderTop: "1px solid #eee",
    },
    ignoreButton: {
        justifyContent: "flex-start",
        color: "#605e5c",
        ":hover": {
            color: "#323130",
            backgroundColor: "#f3f2f1"
        }
    }
});

interface SuggestionCardProps {
    suggestion: Suggestion;
    onApply: (suggestion: Suggestion, replacement: string) => void;
    onDismiss: (id: string) => void; // Ignore once
    onIgnore: (word: string) => void; // Stop checking
}

export const SuggestionCard: React.FC<SuggestionCardProps> = ({ suggestion, onApply, onDismiss, onIgnore }) => {
    const styles = useStyles();

    return (
        <Card className={styles.card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', padding: '12px', background: '#f0f6ff', borderRadius: '4px', border: '1px solid #c7e0f4' }}>
                <Caption1 style={{ fontWeight: 600, fontSize: '14px', color: '#0078d4' }}>{suggestion.originalText}</Caption1>
            </div>

            <Body1 className={styles.explanation}>
                Consider:
            </Body1>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                {suggestion.replacements.map((replacement) => (
                    <Button
                        key={replacement}
                        appearance="outline"
                        icon={<Checkmark24Regular />}
                        onClick={() => onApply(suggestion, replacement)}
                        aria-label={`Change to: ${replacement}`}
                        style={{ justifyContent: 'flex-start', padding: '12px', fontSize: '14px' }}
                    >
                        {replacement}
                    </Button>
                ))}
                {suggestion.replacements.length === 0 && (
                    <Text italic>No specific replacement suggestions.</Text>
                )}
            </div>

            <div className={styles.actions}>
                <Button
                    className={styles.ignoreButton}
                    appearance="transparent"
                    icon={<DismissCircle24Regular />}
                    onClick={() => onDismiss(suggestion.id)}
                    aria-label="Ignore once"
                >
                    Ignore once
                </Button>
                <Button
                    className={styles.ignoreButton}
                    appearance="transparent"
                    icon={<Prohibited24Regular />}
                    onClick={() => onIgnore(suggestion.originalText)}
                    aria-label="Stop checking for this"
                >
                    Stop checking for this
                </Button>
                <Button
                    appearance="transparent"
                    size="small"
                    style={{ justifyContent: 'flex-start', color: '#0078d4', textDecoration: 'underline' }}
                >
                    Show learning tips
                </Button>
            </div>
        </Card>
    );
};

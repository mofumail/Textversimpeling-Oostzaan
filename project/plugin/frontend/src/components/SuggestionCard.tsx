import * as React from "react";
import {
    Card,
    CardHeader,
    CardFooter,
    Text,
    Button,
    Body1,
    Caption1,
    makeStyles,
    shorthands,
} from "@fluentui/react-components";
import { Checkmark24Regular, Dismiss24Regular } from "@fluentui/react-icons";
import type { Suggestion } from "../services/analysisService";

const useStyles = makeStyles({
    card: {
        ...shorthands.margin("8px"),
        width: "auto",
        maxWidth: "100%",
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
        justifyContent: "flex-end",
        gap: "8px",
    },
});

interface SuggestionCardProps {
    suggestion: Suggestion;
    onApply: (suggestion: Suggestion, replacement: string) => void;
    onDismiss: (id: string) => void;
}

export const SuggestionCard: React.FC<SuggestionCardProps> = ({ suggestion, onApply, onDismiss }) => {
    const styles = useStyles();

    return (
        <Card className={styles.card}>
            <CardHeader
                header={<Text className={styles.category}>{suggestion.issueCategory}</Text>}
                description={<Caption1>Original: "{suggestion.originalText}"</Caption1>}
            />

            <Body1 className={styles.explanation}>
                {suggestion.explanation}
            </Body1>

            <CardFooter className={styles.actions}>
                <Button
                    appearance="secondary"
                    icon={<Dismiss24Regular />}
                    onClick={() => onDismiss(suggestion.id)}
                    aria-label="Reject suggestion"
                >
                    Reject
                </Button>
                {suggestion.replacements.map((replacement) => (
                    <Button
                        key={replacement}
                        appearance="primary"
                        icon={<Checkmark24Regular />}
                        onClick={() => onApply(suggestion, replacement)}
                        aria-label={`Accept replacement: ${replacement}`}
                    >
                        Apply "{replacement}"
                    </Button>
                ))}
            </CardFooter>
        </Card>
    );
};

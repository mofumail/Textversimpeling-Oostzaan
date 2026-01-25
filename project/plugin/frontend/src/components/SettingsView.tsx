import * as React from "react";
import {
    Title2,
    Button,
    Body1,
    makeStyles
} from "@fluentui/react-components";
import { Delete24Regular, ArrowLeft24Regular } from "@fluentui/react-icons";

const useStyles = makeStyles({
    container: {
        display: "flex",
        flexDirection: "column",
        gap: "16px",
    },
    list: {
        display: "flex",
        flexDirection: "column",
        gap: "8px",
    },
    item: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px",
        backgroundColor: "white",
        border: "1px solid #e0e0e0",
        borderRadius: "4px",
    }
});

interface SettingsViewProps {
    ignoredWords: string[];
    onUnignore: (word: string) => void;
    disabledRules: string[];
    onEnableRule: (ruleId: string) => void;
    onBack: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ ignoredWords, onUnignore, disabledRules, onEnableRule, onBack }) => {
    const styles = useStyles();

    return (
        <div className={styles.container}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Button
                    appearance="subtle"
                    icon={<ArrowLeft24Regular />}
                    onClick={onBack}
                    aria-label="Back to dashboard"
                />
                <Title2>Settings</Title2>
            </div>

            <div style={{ marginTop: '16px' }}>
                <Body1 style={{ fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>
                    Ignored Words
                </Body1>
                <Body1 style={{ color: '#666', marginBottom: '16px', display: 'block' }}>
                    These words are currently ignored in the analysis. Remove them to start checking for them again.
                </Body1>

                {ignoredWords.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#888', fontStyle: 'italic' }}>
                        No words ignored yet.
                    </div>
                ) : (
                    <div className={styles.list}>
                        {ignoredWords.map(word => (
                            <div key={word} className={styles.item}>
                                <Body1>{word}</Body1>
                                <Button
                                    icon={<Delete24Regular />}
                                    appearance="subtle"
                                    onClick={() => onUnignore(word)}
                                    aria-label={`Remove ${word} from ignore list`}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div style={{ marginTop: '32px' }}>
                <Body1 style={{ fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>
                    Disabled Rules
                </Body1>
                <Body1 style={{ color: '#666', marginBottom: '16px', display: 'block' }}>
                    These rules are currently disabled. Remove them to start checking for them again.
                </Body1>

                {disabledRules.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#888', fontStyle: 'italic' }}>
                        No rules disabled.
                    </div>
                ) : (
                    <div className={styles.list}>
                        {disabledRules.map(ruleId => (
                            <div key={ruleId} className={styles.item}>
                                <Body1>{ruleId}</Body1>
                                <Button
                                    icon={<Delete24Regular />}
                                    appearance="subtle"
                                    onClick={() => onEnableRule(ruleId)}
                                    aria-label={`Enable rule ${ruleId}`}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

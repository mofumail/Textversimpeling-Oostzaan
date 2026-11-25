# Textversimpeling Oostzaan

**Dutch municipal text simplification: a fine-tuned LLM behind a Microsoft Word add-in.**

Dutch municipalities must write to residents at language level **B1**, which about 80% of the population can read comfortably. Rewriting formal government letters by hand takes time and the results vary from writer to writer. This project, built for **Gemeente Oostzaan**, gives municipal writers a Word add-in. It flags jargon and breaches of the house style, and rewrites selected text to B1 with a small language model that runs entirely on-premises.

> Client project for Gemeente Oostzaan, MSc Applied Artificial Intelligence, Amsterdam University of Applied Sciences (2025–2026). Built by a team of four.

---

## Highlights

- **Fine-tuned LLM.** We QLoRA fine-tuned [`UWV/leesplank-noot-eurollm-1.7b`](https://huggingface.co/UWV/leesplank-noot-eurollm-1.7b), a Dutch simplification model built on EuroLLM-1.7B, on **1,310 anonymised complex → simple sentence pairs** of municipal text.
- **Results:** on the held-out test set, SARI rose from **29.92** (base model) to **59.26**, with a **BERTScore of 0.95** for meaning preservation. The model is published on Hugging Face as [`uaebn/leesplank-municipal`](https://huggingface.co/uaebn/leesplank-municipal).
- **Human evaluation.** In a blind study, **12 annotators** made 480 judgements of fluency, adequacy and simplicity. The fine-tuned model scored highest on all three and beat the human-written simplifications on fluency (4.02 vs 3.77) and simplicity (4.12 vs 3.93). Inter-rater agreement was measured with Krippendorff's α.
- **On-premises by design.** The model is served locally (GGUF through LM Studio's OpenAI-compatible server), so no municipal text leaves the organisation's infrastructure (GDPR).
- **Word add-in.** An Office.js task pane (React + Fluent UI) combines rule-based checks against the municipality's style guide with one-click B1 rewrites.

## Repository layout

```
project/
├── notebooks/        # Data analysis, fine-tuning, and evaluation
│   ├── analysis.ipynb                         # Dataset exploration: length reduction, semantic similarity, simplification types
│   ├── jargon_exploration*.ipynb              # Building the municipal jargon → plain-language list
│   ├── lexical_evaluation.ipynb               # Rule/lexicon-only baseline (custom SARI)
│   ├── finetune_and_eval.ipynb                # Iteration 1: QLoRA fine-tune + automatic evaluation
│   ├── finetune_and_eval_iteration_2.ipynb    # Iteration 2: tuned LoRA config, model card, Hub export
│   └── irr_evaluation.py                      # Human study: Krippendorff's α + aggregated ratings
├── src/              # Iteration 1 prototype: web app
│   ├── backend/      # FastAPI service: style-rule analysis, jargon detection, rewrite endpoint
│   └── frontend/     # React + TipTap editor with inline suggestions sidebar
├── iter2/frontend/   # Iteration 2 prototype: first Word add-in (complexity & passive-voice analysis)
└── plugin/           # Final Word add-in: style-guide rules + LLM rewrites via local model
    └── frontend/
```

## Evaluation

The 1,310 pairs were split into 1,000 train, 150 validation and 160 held-out test pairs. All approaches were scored on the test set with these metrics:

| Metric | What it measures |
| --- | --- |
| **SARI** | Simplification quality (n-gram add / keep / delete against references) |
| **BERTScore** | Meaning preservation relative to the source |
| **Flesch-Douma**, **LiNT-II** | Dutch readability |
| Avg. word length, words / sentence | Surface-level complexity |

Results on the held-out test set (N = 160). For LiNT-II, lower means easier to read.

| | SARI ↑ | BERTScore ↑ | Flesch-Douma ↑ | LiNT-II level ↓ | Avg. length |
| --- | --- | --- | --- | --- | --- |
| Source (input) | – | – | 54.89 | 2.85 | 17.29 |
| Human reference | – | 0.92 | 58.42 | 2.61 | 16.24 |
| Lexical substitution only | 24.98 | 0.87 | 53.39 | 2.93 | 16.14 |
| Base model | 29.92 | 0.78 | 74.53 | 1.55 | 25.35 |
| Fine-tuned (iteration 1) | 30.81 | 0.80 | 72.57 | 1.68 | 23.49 |
| **Fine-tuned (iteration 2)** | **59.26** | **0.95** | 56.60 | 2.69 | **15.62** |

The base model and iteration 1 "simplify" by expanding sentences (high Flesch-Douma, but long outputs and low meaning preservation). Iteration 2 used a much larger LoRA capacity (r = 64, α = 128, all attention and MLP projections), which removed that expansion bias and brought every metric close to the human reference.

Human evaluation, as mean opinion scores on a 1–5 scale:

| | Fluency | Adequacy | Simplicity |
| --- | --- | --- | --- |
| Base model | 3.83 | 4.53 | 4.07 |
| Fine-tuned (iteration 1) | 3.93 | 4.53 | 4.01 |
| **Fine-tuned (iteration 2)** | **4.02** | **4.67** | **4.12** |
| Human reference | 3.77 | 4.63 | 3.93 |

In the human evaluation, 12 annotators each rated 20 sentences from the baseline, the fine-tuned model and the human reference on **fluency**, **adequacy** and **simplicity**, across both model iterations.

## Running the Word add-in

**Requirements:** Node.js 18+, Microsoft Word (desktop or web), and [LM Studio](https://lmstudio.ai).

1. **Serve the model locally.** In LM Studio, download `uaebn/leesplank-municipal-GGUF`, load it with the identifier **`leesplank-municipal`**, and start the local server on `http://localhost:1234`.
2. **Start the add-in dev server:**
   ```bash
   cd project/plugin/frontend
   npm install
   npm run dev -- --port 3000
   ```
   Vite proxies `/lm-studio` to `http://127.0.0.1:1234/v1`.
3. **Sideload** `project/plugin/frontend/manifest.xml` into Word ([Microsoft guide](https://learn.microsoft.com/en-us/office/dev/add-ins/testing/sideload-office-add-ins-for-testing)), open the task pane, select some text and press *Simplify*.

See [`project/plugin/README.md`](project/plugin/README.md) for more detail.

### Iteration 1 web app (optional)

```bash
# backend
cd project/src/backend
pip install -r requirements.txt
uvicorn main:app --reload

# frontend
cd project/src/frontend
npm install
npm run dev
```

## Tech stack

**ML:** PyTorch, Hugging Face Transformers, PEFT (QLoRA), TRL, `evaluate` (SARI, BERTScore), sentence-transformers
**Serving:** GGUF, LM Studio (OpenAI-compatible API), FastAPI
**Frontend:** React, TypeScript, Vite, Office.js, Fluent UI, TipTap

## Data

The training data (an anonymised set of complex/simple sentence pairs from municipal communication) and the client's source documents are **not included** in this repository.

## Team

- Wang Di Wang
- Beau Min
- Freek Tindemans
- Auke Steenman

Built with UWV's [Leesplank](https://huggingface.co/UWV) models as a starting point.

# Textversimpeling Oostzaan

**Dutch municipal text simplification: a fine-tuned LLM behind a Microsoft Word add-in.**

Dutch municipalities must write to residents at language level **B1**, which about 80% of the population can read comfortably. Rewriting formal government letters by hand takes time and the results vary from writer to writer. This project, built for **Gemeente Oostzaan**, gives municipal writers a Word add-in. It flags jargon and breaches of the house style, and rewrites selected text to B1 with a small language model that runs entirely on-premises.

> Client project for Gemeente Oostzaan, MSc Applied Artificial Intelligence, Amsterdam University of Applied Sciences (2025–2026). Built by a team of four.

---

## Highlights

- **Fine-tuned LLM.** We QLoRA fine-tuned [`UWV/leesplank-noot-eurollm-1.7b`](https://huggingface.co/UWV/leesplank-noot-eurollm-1.7b), a Dutch simplification model built on EuroLLM-1.7B, on **1,310 anonymised complex → simple sentence pairs** of municipal text.
- **Results:** SARI rose from **29.82** (base model) to **56.18** while keeping meaning, with a **BERTScore of 0.95**. The model is published on Hugging Face as [`uaebn/leesplank-municipal`](https://huggingface.co/uaebn/leesplank-municipal).
- **Human evaluation.** In a blind study, **12 annotators** rated outputs for fluency, adequacy and simplicity. The fine-tuned model scored above the human-written simplifications on fluency and simplicity. Inter-rater agreement was measured with Krippendorff's α.
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

Automatic metrics were computed on a held-out split (1,000 train / 150 eval / 160 test) and compared against three references: the unchanged source (identity), the human reference simplification, and the un-tuned base model:

| Metric | What it measures |
| --- | --- |
| **SARI** | Simplification quality (n-gram add / keep / delete against references) |
| **BERTScore** | Meaning preservation relative to the source |
| **Flesch-Douma**, **LiNT-II** | Dutch readability |
| Avg. word length, words / sentence | Surface-level complexity |

Results of the fine-tuned model ([model card](https://huggingface.co/uaebn/leesplank-municipal)):

| Metric | Score |
| --- | --- |
| SARI | **56.18** |
| BERTScore | **0.95** |
| LiNT-II (score – level) | **48.76 – 2.69** |
| Flesch-Douma | **52.68** |

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

# NovaBite Insights

A small conversational BI tool for a fictional CPG company (NovaBite Consumer Goods), built as part of a take-home assignment. A sales manager can open a dashboard to see key revenue/profit numbers, and ask plain-English questions about the sales data in a chat screen.

## Tech Stack

- **Backend**: Python, FastAPI, SQLite
- **Frontend**: React (Vite), Recharts, Axios
- **LLM**: Groq (Llama 3.3 70B), via their OpenAI-compatible API

## Running Locally

### Prerequisites
- Python 3.10+
- Node.js 18+
- A free Groq API key (sign up at console.groq.com — no card needed)

### Backend
```bash
cd backend
python -m venv venv
source venv/Scripts/activate   # Windows (Git Bash)
# source venv/bin/activate      # macOS/Linux
pip install -r requirements.txt
cp .env.example .env
# Open .env and paste in your GROQ_API_KEY
uvicorn app.main:app --reload
```
This starts the API on `http://localhost:8000`. The first time it runs, it seeds `novabite.db` from `data/novabite_sales_data.csv` automatically — you don't need to run anything separately for that.

### Frontend
In a second terminal:
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
Then open `http://localhost:5173`.

## LLM choice — and why it changed

I originally built `/api/chat` against Anthropic Claude, and that's actually still the cleanest version of the prompt design conceptually. But my Anthropic account had a $0 credit balance, and OpenAI wasn't an option either — same story, quota error on the first real test. Rather than burn more time on billing pages, I switched to **Groq**, which has a genuinely free tier (no card required) and happens to be OpenAI-SDK-compatible. So the switch was mostly just changing the `base_url`, the API key, and the model name — the actual prompt logic didn't need to change.

I'm using **Llama 3.3 70B**, which turned out to be more than capable for both generating SQL and writing a short, readable answer from the results.

## How `/api/chat` works (two-step text-to-SQL)

1. **Generate SQL** — I send the user's question along with a description of the `sales` table (column names, types, and the valid values for things like `region`, `channel`, and `category`) to the LLM, and ask it to respond with *only* a SQLite `SELECT` query.
2. **Validate** — before running anything, I check that the query actually starts with `SELECT` and doesn't contain anything destructive (`INSERT`, `DROP`, `DELETE`, etc.).
3. **Execute** — the query runs against the SQLite database that gets seeded from the CSV on startup.
4. **Generate the answer** — I send the original question plus the query results (as JSON) back to the LLM and ask it to phrase a normal-sounding answer using those numbers.

I went with this two-step approach because asking an LLM to do math over a pile of raw rows is asking for trouble, and dumping all 1000 rows into a prompt felt wasteful. Letting SQLite handle the actual aggregation and having the LLM just translate the question into SQL and the result into English felt like the more reliable split.

## What I'd improve with more time

- Right now, a non-data message like "hi" can get a weirdly formal response, since the prompt assumes every question is about the sales data. A quick intent check before generating SQL would fix this.
- I'd add a few unit tests, especially around the SQL-safety check and the aggregation queries — those are the parts I'd most want to know didn't break if I changed something later.
- A second chart (revenue by category, probably) would round out the dashboard.
- Streaming the chat response so it feels more like a typewriter rather than a single block appearing after a wait.
- Caching identical questions so repeat queries don't re-hit the LLM.

## Tradeoffs and shortcuts

- No auth — felt out of scope for what this assignment is testing.
- Went with SQLite as suggested, which is fine at 1000 rows but obviously wouldn't be the choice at real scale.
- Chat history only lives in the frontend's state, so it resets on refresh. No backend storage of past conversations.
- As mentioned above, I bounced between Claude → OpenAI → Groq during development purely because of free-tier billing limits, not because of any technical issue with the first two. The architecture would work unchanged with either.
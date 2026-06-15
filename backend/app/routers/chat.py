import os
import json
import re
from fastapi import APIRouter
from pydantic import BaseModel
from openai import OpenAI
from dotenv import load_dotenv
from ..database import query_all

load_dotenv()

router = APIRouter()

client = OpenAI(
    api_key=os.environ.get("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1",
)

MODEL = "llama-3.3-70b-versatile"

SCHEMA_DESCRIPTION = """
Table: sales
Columns:
- transaction_id (text)
- date (text, format YYYY-MM-DD)
- month (text, format YYYY-MM)
- quarter (text, e.g. 'Q1-2024')
- sku (text)
- product_name (text)
- category (text) - one of: 'Personal Care', 'Snacks', 'Beverages', 'Home Care'
- subcategory (text)
- region (text) - one of: 'North', 'South', 'East', 'West', 'Central'
- channel (text) - one of: 'Modern Trade', 'General Trade', 'E-Commerce', 'Direct to Consumer'
- sales_rep (text)
- units_sold (integer)
- unit_price_usd (float)
- gross_revenue_usd (float)
- discount_pct (integer, percentage)
- net_revenue_usd (float)
- cogs_usd (float)
- gross_profit_usd (float)

Data covers transactions from 2024-01-02 to 2025-12-31.
"""


class ChatRequest(BaseModel):
    question: str


def generate_sql(question: str) -> str:
    system_prompt = f"""You are a SQL expert working with a SQLite database.

{SCHEMA_DESCRIPTION}

Given the user's question, write a single SQLite SELECT query that answers it.

Rules:
- Output ONLY the raw SQL query - no explanation, no markdown, no backticks.
- Only SELECT statements are allowed.
- Use SUM, AVG, COUNT, GROUP BY, ORDER BY, LIMIT as appropriate.
- For gross profit margin, calculate as (SUM(gross_profit_usd) / SUM(net_revenue_usd)) * 100.
"""

    response = client.chat.completions.create(
        model=MODEL,
        max_tokens=500,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": question},
        ],
    )

    sql = response.choices[0].message.content.strip()
    sql = re.sub(r"^```sql\s*|^```\s*|```$", "", sql, flags=re.MULTILINE).strip()
    return sql


def is_safe_select(sql: str) -> bool:
    normalized = sql.strip().lower()
    if not normalized.startswith("select"):
        return False
    forbidden = ["insert", "update", "delete", "drop", "alter", "create", "attach", "pragma", ";"]
    return not any(word in normalized for word in forbidden)


def generate_answer(question: str, results: list) -> str:
    system_prompt = """You are a business analyst assistant for NovaBite Consumer Goods.
Given a user's question and the underlying query results, write a clear, concise
natural-language answer. Reference specific numbers from the results. Do not mention
SQL, queries, or databases - just answer like an analyst reporting findings."""

    user_message = f"""Question: {question}

Query results (JSON): {json.dumps(results, default=str)}

Answer the question based on these results."""

    response = client.chat.completions.create(
        model=MODEL,
        max_tokens=500,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message},
        ],
    )

    return response.choices[0].message.content.strip()


@router.post("/api/chat")
def chat(request: ChatRequest):
    question = request.question

    try:
        sql = generate_sql(question)

        if not is_safe_select(sql):
            return {"answer": "I couldn't generate a safe query for that question. Try rephrasing it."}

        results = query_all(sql)
        answer = generate_answer(question, results)
        return {"answer": answer}

    except Exception as e:
        return {"answer": f"Sorry, something went wrong answering that question: {str(e)}"}
from fastapi import APIRouter
from ..database import query_all

router = APIRouter()


@router.get("/api/trends")
def get_trends():
    rows = query_all("""
        SELECT
            month,
            SUM(net_revenue_usd) AS net_revenue
        FROM sales
        GROUP BY month
        ORDER BY month ASC
    """)

    return [
        {
            "month": row["month"],
            "net_revenue": round(row["net_revenue"], 2),
        }
        for row in rows
    ]
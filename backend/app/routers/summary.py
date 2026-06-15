from fastapi import APIRouter
from ..database import query_one

router = APIRouter()


@router.get("/api/summary")
def get_summary():
    totals = query_one("""
        SELECT
            SUM(net_revenue_usd) AS total_net_revenue,
            SUM(units_sold) AS total_units,
            SUM(gross_profit_usd) AS total_gross_profit
        FROM sales
    """)

    total_net_revenue = totals["total_net_revenue"]
    total_units = totals["total_units"]
    total_gross_profit = totals["total_gross_profit"]

    gross_profit_margin_pct = (
        (total_gross_profit / total_net_revenue) * 100
        if total_net_revenue else 0
    )

    top_region = query_one("""
        SELECT region, SUM(net_revenue_usd) AS revenue
        FROM sales
        GROUP BY region
        ORDER BY revenue DESC
        LIMIT 1
    """)

    top_channel = query_one("""
        SELECT channel, SUM(net_revenue_usd) AS revenue
        FROM sales
        GROUP BY channel
        ORDER BY revenue DESC
        LIMIT 1
    """)

    top_product = query_one("""
        SELECT product_name, SUM(net_revenue_usd) AS revenue
        FROM sales
        GROUP BY product_name
        ORDER BY revenue DESC
        LIMIT 1
    """)

    return {
        "total_net_revenue": round(total_net_revenue, 2),
        "total_units": int(total_units),
        "gross_profit_margin_pct": round(gross_profit_margin_pct, 2),
        "top_region": top_region["region"],
        "top_channel": top_channel["channel"],
        "top_product": top_product["product_name"],
    }
from fastapi import APIRouter
from ..database import query_all

router = APIRouter()


@router.get("/api/products")
def get_products():
    rows = query_all("""
        SELECT
            product_name,
            SUM(net_revenue_usd) AS total_net_revenue,
            SUM(units_sold) AS total_units_sold
        FROM sales
        GROUP BY product_name
        ORDER BY total_net_revenue DESC
    """)

    return [
        {
            "product_name": row["product_name"],
            "total_net_revenue": round(row["total_net_revenue"], 2),
            "total_units_sold": int(row["total_units_sold"]),
        }
        for row in rows
    ]
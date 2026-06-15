import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getSummary, getTrends } from "../api";

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([getSummary(), getTrends()])
      .then(([summaryData, trendsData]) => {
        setSummary(summaryData);
        setTrends(trendsData);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load dashboard data. Is the backend running?");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading dashboard...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  const formatCurrency = (value) =>
    `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

  return (
    <div>
      <h1>Dashboard</h1>

      <div
        style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "2rem",
          flexWrap: "wrap",
        }}
      >
        <KpiCard
          label="Total Net Revenue"
          value={formatCurrency(summary.total_net_revenue)}
        />
        <KpiCard
          label="Gross Profit Margin"
          value={`${summary.gross_profit_margin_pct}%`}
        />
        <KpiCard label="Top Region" value={summary.top_region} />
      </div>

      <h2>Monthly Net Revenue Trend</h2>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={trends}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
          <Tooltip formatter={(value) => formatCurrency(value)} />
          <Line
            type="monotone"
            dataKey="net_revenue"
            stroke="#4f46e5"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function KpiCard({ label, value }) {
  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "1rem 1.5rem",
        minWidth: "180px",
      }}
    >
      <div style={{ fontSize: "0.85rem", color: "#666" }}>{label}</div>
      <div style={{ fontSize: "1.5rem", fontWeight: "bold", marginTop: "0.25rem" }}>
        {value}
      </div>
    </div>
  );
}

export default Dashboard;
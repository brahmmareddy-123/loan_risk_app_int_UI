import { useState } from "react";
import axios from "axios";

// ── Constants ─────────────────────────────────────────────────────
const GENDER_OPTIONS     = ["Male", "Female"];
const EDUCATION_OPTIONS  = ["High School", "Bachelors", "Masters", "PhD"];
const EMPLOYMENT_OPTIONS = ["Salaried", "Self-Employed", "Unemployed"];

const INITIAL_FORM = {
  age: 30,
  income: 55000,
  loan_amount: 20000,
  credit_score: 650,
  years_experience: 5,
  gender: "Male",
  education: "Bachelors",
  employment_type: "Salaried",
};

// ── Helpers ───────────────────────────────────────────────────────
function getRiskColor(label) {
  if (label === "Low Risk")    return { bg: "#052e16", border: "#22c55e", text: "#4ade80" };
  if (label === "Medium Risk") return { bg: "#1c1007", border: "#f97316", text: "#fb923c" };
  return                              { bg: "#2d0a0a", border: "#ef4444", text: "#f87171" };
}

function getRiskEmoji(label) {
  if (label === "Low Risk")    return "✅";
  if (label === "Medium Risk") return "⚠️";
  return "❌";
}

function CreditScoreLabel({ score }) {
  if (score >= 750) return <span style={{ color: "#4ade80", fontSize: 11 }}>Excellent</span>;
  if (score >= 650) return <span style={{ color: "#38bdf8", fontSize: 11 }}>Good</span>;
  if (score >= 500) return <span style={{ color: "#f97316", fontSize: 11 }}>Fair</span>;
  return <span style={{ color: "#f87171", fontSize: 11 }}>Poor</span>;
}

// ── Sub-components ────────────────────────────────────────────────
function ToggleGroup({ options, value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {options.map(opt => (
        <button key={opt} onClick={() => onChange(opt)}
          style={{
            padding: "7px 14px", borderRadius: 8, fontSize: 13, cursor: "pointer",
            transition: "all 0.2s", fontFamily: "inherit",
            border: value === opt ? "1.5px solid #38bdf8" : "1px solid #1e3a5f",
            background: value === opt ? "rgba(56,189,248,0.15)" : "#0c1829",
            color: value === opt ? "#38bdf8" : "#64748b",
            fontWeight: value === opt ? 600 : 400,
          }}>
          {opt}
        </button>
      ))}
    </div>
  );
}

function InputField({ label, sublabel, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500 }}>{label}</span>
        {sublabel}
      </label>
      {children}
    </div>
  );
}

function NumberInput({ value, onChange, min, max, placeholder }) {
  return (
    <input type="number" min={min} max={max}
      placeholder={placeholder} value={value}
      onChange={e => onChange(Number(e.target.value))}
      style={{
        background: "#0c1829", border: "1px solid #1e3a5f",
        borderRadius: 10, padding: "11px 14px",
        color: "#f1f5f9", fontSize: 14, outline: "none",
        width: "100%", fontFamily: "inherit",
        transition: "border 0.2s",
      }}
      onFocus={e => e.target.style.borderColor = "#38bdf8"}
      onBlur={e => e.target.style.borderColor = "#1e3a5f"}
    />
  );
}

function HistoryTable({ history }) {
  if (!history.length) return null;
  return (
    <div style={{ marginTop: "2rem" }}>
      <h3 style={{ fontSize: 15, color: "#94a3b8", fontWeight: 600, marginBottom: 12,
        borderBottom: "1px solid #1e293b", paddingBottom: 10 }}>
        📋 Prediction History ({history.length})
      </h3>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #1e293b" }}>
              {["#", "Age", "Income", "Loan Amt", "Credit", "Employment", "Result", "Approval%"].map(h => (
                <th key={h} style={{ padding: "8px 10px", color: "#64748b",
                  fontWeight: 500, textAlign: "left", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {history.map((row, i) => {
              const c = getRiskColor(row.result.risk_label);
              return (
                <tr key={i} style={{ borderBottom: "1px solid #0f1f38",
                  background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)" }}>
                  <td style={{ padding: "8px 10px", color: "#475569" }}>{i + 1}</td>
                  <td style={{ padding: "8px 10px", color: "#e2e8f0" }}>{row.input.age}</td>
                  <td style={{ padding: "8px 10px", color: "#e2e8f0" }}>${row.input.income.toLocaleString()}</td>
                  <td style={{ padding: "8px 10px", color: "#e2e8f0" }}>${row.input.loan_amount.toLocaleString()}</td>
                  <td style={{ padding: "8px 10px", color: "#e2e8f0" }}>{row.input.credit_score}</td>
                  <td style={{ padding: "8px 10px", color: "#e2e8f0" }}>{row.input.employment_type}</td>
                  <td style={{ padding: "8px 10px" }}>
                    <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 12,
                      background: c.bg, color: c.text, border: `1px solid ${c.border}` }}>
                      {row.result.risk_label}
                    </span>
                  </td>
                  <td style={{ padding: "8px 10px", color: "#38bdf8", fontWeight: 600 }}>
                    {row.result.approval_probability}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────
export default function App() {
  const [form, setForm]       = useState(INITIAL_FORM);
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [history, setHistory] = useState([]);
  const [tab, setTab]         = useState("form"); // "form" | "history"

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await axios.post("https://loan-risk-app-backend-main.onrender.com/predict", form);
      setResult(res.data);
      setHistory(prev => [{ input: form, result: res.data }, ...prev]);
    } catch {
      setError("❌ Cannot connect to backend. Make sure FastAPI is running on port 8000.");
    }
    setLoading(false);
  };

  const handleReset = () => {
    setForm(INITIAL_FORM);
    setResult(null);
    setError(null);
  };

  const riskColor = result ? getRiskColor(result.risk_label) : null;

  return (
    <div style={{ minHeight: "100vh", background: "#060b18",
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "2rem 1rem", fontFamily: "Inter, sans-serif" }}>

      {/* ── Page Header ── */}
      <div style={{ width: "100%", maxWidth: 780, marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 6 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12,
            background: "linear-gradient(135deg, #0ea5e9, #6366f1)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
            💳
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#f1f5f9", margin: 0 }}>
              Loan Risk Predictor
            </h1>
            <p style={{ fontSize: 13, color: "#475569", margin: 0 }}>
              AI-powered credit risk assessment system
            </p>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6,
            background: "#052e16", border: "1px solid #166534", borderRadius: 20,
            padding: "4px 12px", fontSize: 12, color: "#4ade80" }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%",
              background: "#4ade80", display: "inline-block",
              animation: "pulse 2s infinite" }}></span>
            API Live
          </div>
        </div>

        {/* ── Tabs ── */}
        <div style={{ display: "flex", gap: 4, borderBottom: "1px solid #1e293b",
          marginTop: "1.25rem" }}>
          {["form", "history"].map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{
                padding: "9px 20px", background: "transparent", border: "none",
                cursor: "pointer", fontSize: 14, fontFamily: "inherit",
                color: tab === t ? "#38bdf8" : "#475569",
                borderBottom: tab === t ? "2px solid #38bdf8" : "2px solid transparent",
                fontWeight: tab === t ? 600 : 400, transition: "all 0.2s",
                marginBottom: -1,
              }}>
              {t === "form" ? "🔍 Predict" : `📋 History (${history.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main Card ── */}
      <div style={{ width: "100%", maxWidth: 780,
        background: "#0d1526", borderRadius: 20,
        border: "1px solid #1e293b",
        boxShadow: "0 30px 80px rgba(0,0,0,0.6)", padding: "2rem" }}>

        {tab === "history" ? (
          <HistoryTable history={history} />
        ) : (
          <>
            {/* ── Section: Personal Info ── */}
            <p style={{ fontSize: 11, color: "#38bdf8", fontWeight: 600,
              letterSpacing: "0.1em", marginBottom: 14 }}>PERSONAL INFORMATION</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.75rem" }}>
              <InputField label="Age">
                <NumberInput value={form.age} min={18} max={69}
                  placeholder="18 – 69" onChange={v => set("age", v)} />
              </InputField>

              <InputField label="Gender">
                <ToggleGroup options={GENDER_OPTIONS}
                  value={form.gender} onChange={v => set("gender", v)} />
              </InputField>

              <InputField label="Education">
                <ToggleGroup options={EDUCATION_OPTIONS}
                  value={form.education} onChange={v => set("education", v)} />
              </InputField>

              <InputField label="Employment Type">
                <ToggleGroup options={EMPLOYMENT_OPTIONS}
                  value={form.employment_type} onChange={v => set("employment_type", v)} />
              </InputField>
            </div>

            {/* ── Section: Financial Info ── */}
            <p style={{ fontSize: 11, color: "#38bdf8", fontWeight: 600,
              letterSpacing: "0.1em", marginBottom: 14 }}>FINANCIAL INFORMATION</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.75rem" }}>
              <InputField label="Annual Income ($)">
                <NumberInput value={form.income} min={0} max={100000}
                  placeholder="e.g. 55000" onChange={v => set("income", v)} />
              </InputField>

              <InputField label="Loan Amount ($)">
                <NumberInput value={form.loan_amount} min={0} max={50000}
                  placeholder="e.g. 20000" onChange={v => set("loan_amount", v)} />
              </InputField>

              <InputField label="Work Experience (Years)">
                <NumberInput value={form.years_experience} min={0} max={39}
                  placeholder="0 – 39" onChange={v => set("years_experience", v)} />
              </InputField>

              <InputField
                label="Credit Score"
                sublabel={<CreditScoreLabel score={form.credit_score} />}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <input type="range" min={300} max={849}
                    value={form.credit_score}
                    onChange={e => set("credit_score", Number(e.target.value))}
                    style={{ flex: 1 }} />
                  <span style={{ fontSize: 15, fontWeight: 700, color: "#38bdf8",
                    minWidth: 38, textAlign: "right" }}>{form.credit_score}</span>
                </div>
              </InputField>
            </div>

            {/* ── Loan to Income Ratio Warning ── */}
            {form.loan_amount > form.income * 0.6 && (
              <div style={{ background: "#1c0f00", border: "1px solid #92400e",
                borderRadius: 10, padding: "10px 14px", marginBottom: "1.25rem",
                fontSize: 13, color: "#fdba74", display: "flex", gap: 8, alignItems: "center" }}>
                ⚠️ Loan amount is high relative to income — this may increase risk.
              </div>
            )}

            {/* ── Buttons ── */}
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={handleSubmit} disabled={loading}
                style={{
                  flex: 1, padding: "14px", borderRadius: 12, border: "none",
                  background: loading
                    ? "#1e3a5f"
                    : "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)",
                  color: loading ? "#64748b" : "#fff",
                  fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
                  fontFamily: "inherit", transition: "all 0.2s",
                  boxShadow: loading ? "none" : "0 4px 20px rgba(14,165,233,0.3)",
                }}>
                {loading ? "⏳ Analyzing..." : "🔍 Predict Loan Risk"}
              </button>

              <button onClick={handleReset}
                style={{
                  padding: "14px 20px", borderRadius: 12, cursor: "pointer",
                  background: "transparent", border: "1px solid #1e3a5f",
                  color: "#64748b", fontSize: 14, fontFamily: "inherit",
                }}>
                Reset
              </button>
            </div>

            {/* ── Error ── */}
            {error && (
              <div style={{ marginTop: "1.25rem", background: "#2d0a0a",
                border: "1px solid #ef4444", borderRadius: 10,
                padding: "12px 16px", fontSize: 13, color: "#f87171" }}>
                {error}
              </div>
            )}

            {/* ── Result Card ── */}
            {result && riskColor && (
              <div style={{ marginTop: "1.5rem", borderRadius: 16,
                border: `1.5px solid ${riskColor.border}`,
                background: riskColor.bg, padding: "1.5rem",
                animation: "fadeIn 0.4s ease" }}>

                {/* Result Header */}
                <div style={{ display: "flex", alignItems: "center",
                  justifyContent: "space-between", marginBottom: "1.25rem" }}>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: riskColor.text }}>
                      {getRiskEmoji(result.risk_label)} {result.risk_label}
                    </div>
                    <div style={{ fontSize: 13, color: "#64748b", marginTop: 3 }}>
                      {result.approved ? "Loan application likely to be approved" : "Loan application likely to be rejected"}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 32, fontWeight: 700, color: riskColor.text }}>
                      {result.approval_probability}%
                    </div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>approval chance</div>
                  </div>
                </div>

                {/* Probability Bar */}
                <div style={{ height: 8, background: "#1e293b",
                  borderRadius: 99, overflow: "hidden", marginBottom: "1.25rem" }}>
                  <div style={{
                    height: "100%", borderRadius: 99,
                    width: `${result.approval_probability}%`,
                    background: result.approved
                      ? "linear-gradient(90deg, #22c55e, #4ade80)"
                      : "linear-gradient(90deg, #ef4444, #f97316)",
                    transition: "width 1s ease",
                  }} />
                </div>

                {/* Approval vs Rejection Stats */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr",
                  gap: 12, marginBottom: "1.25rem" }}>
                  {[
                    { label: "Approval Probability", val: `${result.approval_probability}%`, color: "#4ade80" },
                    { label: "Rejection Probability", val: `${result.rejection_probability}%`, color: "#f87171" },
                  ].map(s => (
                    <div key={s.label} style={{ background: "rgba(255,255,255,0.03)",
                      borderRadius: 10, padding: "12px 16px",
                      border: "1px solid rgba(255,255,255,0.05)" }}>
                      <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.val}</div>
                      <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Risk Factors */}
                <div>
                  <p style={{ fontSize: 12, color: "#64748b", fontWeight: 600,
                    letterSpacing: "0.08em", marginBottom: 10 }}>RISK FACTORS DETECTED</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {result.risk_factors.map((f, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center",
                        gap: 8, fontSize: 13, color: "#cbd5e1" }}>
                        <span style={{ color: result.approved ? "#4ade80" : "#f97316",
                          fontSize: 10 }}>●</span>
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse  { 0%,100%{ opacity:1; } 50%{ opacity:0.3; } }
      `}</style>
    </div>
  );
}

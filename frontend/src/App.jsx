import { useState } from "react";
import axios from "axios";

const BACKEND_URL = "https://loan-risk-app-backend-main.onrender.com";

// ── Indian States & Districts ─────────────────────────────────────
const INDIA_STATES = {
  "Andhra Pradesh":   ["Visakhapatnam","Vijayawada","Guntur","Nellore","Kurnool","Kadapa","Tirupati","Anantapur","Eluru","Ongole","Srikakulam","Vizianagaram","Rajahmundry","Kakinada","Bhimavaram"],
  "Telangana":        ["Hyderabad","Warangal","Nizamabad","Karimnagar","Khammam","Mahbubnagar","Nalgonda","Adilabad","Suryapet","Siddipet","Mancherial","Jagtial","Vikarabad","Medak","Sangareddy"],
  "Karnataka":        ["Bangalore","Mysore","Hubli","Mangalore","Belgaum","Gulbarga","Davanagere","Bellary","Bijapur","Shimoga","Tumkur","Raichur","Bidar","Hassan","Udupi"],
  "Tamil Nadu":       ["Chennai","Coimbatore","Madurai","Tiruchirappalli","Salem","Tirunelveli","Tiruppur","Vellore","Erode","Thoothukkudi","Dindigul","Thanjavur","Ranipet","Sivakasi","Kanchipuram"],
  "Maharashtra":      ["Mumbai","Pune","Nagpur","Nashik","Aurangabad","Solapur","Amravati","Kolhapur","Sangli","Malegaon","Jalgaon","Akola","Latur","Dhule","Ahmednagar"],
  "Gujarat":          ["Ahmedabad","Surat","Vadodara","Rajkot","Bhavnagar","Jamnagar","Junagadh","Gandhinagar","Anand","Morbi","Nadiad","Mehsana","Bharuch","Valsad","Navsari"],
  "Rajasthan":        ["Jaipur","Jodhpur","Kota","Bikaner","Ajmer","Udaipur","Bhilwara","Alwar","Bharatpur","Sikar","Pali","Sri Ganganagar","Tonk","Chittorgarh","Barmer"],
  "Uttar Pradesh":    ["Lucknow","Kanpur","Agra","Varanasi","Meerut","Allahabad","Ghaziabad","Noida","Bareilly","Aligarh","Moradabad","Saharanpur","Gorakhpur","Firozabad","Jhansi"],
  "West Bengal":      ["Kolkata","Howrah","Durgapur","Asansol","Siliguri","Malda","Bardhaman","Kharagpur","Haldia","Jalpaiguri","Krishnanagar","Raiganj","Midnapore","Bankura","Purulia"],
  "Madhya Pradesh":   ["Bhopal","Indore","Jabalpur","Gwalior","Ujjain","Sagar","Dewas","Satna","Ratlam","Rewa","Murwara","Singrauli","Burhanpur","Khandwa","Bhind"],
  "Kerala":           ["Thiruvananthapuram","Kochi","Kozhikode","Thrissur","Kollam","Palakkad","Alappuzha","Malappuram","Kannur","Kasaragod","Kottayam","Idukki","Pathanamthitta","Wayanad","Ernakulam"],
  "Punjab":           ["Ludhiana","Amritsar","Jalandhar","Patiala","Bathinda","Mohali","Pathankot","Hoshiarpur","Batala","Moga","Firozpur","Muktsar","Sangrur","Fatehgarh Sahib","Rupnagar"],
  "Haryana":          ["Faridabad","Gurgaon","Panipat","Ambala","Yamunanagar","Rohtak","Hisar","Karnal","Sonipat","Panchkula","Bhiwani","Sirsa","Bahadurgarh","Jind","Thanesar"],
  "Bihar":            ["Patna","Gaya","Bhagalpur","Muzaffarpur","Purnia","Darbhanga","Bihar Sharif","Arrah","Begusarai","Katihar","Munger","Chapra","Hajipur","Siwan","Motihari"],
  "Odisha":           ["Bhubaneswar","Cuttack","Rourkela","Brahmapur","Sambalpur","Puri","Balasore","Bhadrak","Baripada","Jharsuguda","Jeypore","Bargarh","Rayagada","Koraput","Kendujhar"],
  "Jharkhand":        ["Ranchi","Jamshedpur","Dhanbad","Bokaro","Deoghar","Phusro","Hazaribag","Giridih","Ramgarh","Medininagar","Chirkunda","Chaibasa","Dumka","Gumla","Simdega"],
  "Assam":            ["Guwahati","Silchar","Dibrugarh","Jorhat","Nagaon","Tinsukia","Tezpur","Bongaigaon","Dhubri","North Lakhimpur","Karimganj","Sivasagar","Goalpara","Barpeta","Mangaldoi"],
  "Himachal Pradesh": ["Shimla","Dharamshala","Solan","Mandi","Palampur","Baddi","Nahan","Paonta Sahib","Sundernagar","Chamba","Una","Bilaspur","Hamirpur","Kullu","Kangra"],
  "Uttarakhand":      ["Dehradun","Haridwar","Roorkee","Haldwani","Rudrapur","Kashipur","Rishikesh","Kotdwar","Ramnagar","Pithoragarh","Almora","Nainital","Mussoorie","Tehri","Bageshwar"],
  "Goa":              ["Panaji","Margao","Vasco da Gama","Mapusa","Ponda","Bicholim","Curchorem","Sanquelim","Canacona","Quepem","Sanguem","Pernem","Tiswadi","Salcete","Bardez"],
  "Delhi":            ["New Delhi","North Delhi","South Delhi","East Delhi","West Delhi","Central Delhi","North East Delhi","North West Delhi","South East Delhi","South West Delhi","Shahdara","Dwarka","Rohini","Pitampura","Vasant Kunj"],
  "Chhattisgarh":     ["Raipur","Bhilai","Bilaspur","Korba","Durg","Rajnandgaon","Jagdalpur","Ambikapur","Chirmiri","Dhamtari","Mahasamund","Kanker","Kondagaon","Bastar","Raigarh"],
};

const LTV_RATIO = 0.70;

// ── Constants ─────────────────────────────────────────────────────
const GENDER_OPTIONS     = ["Male", "Female"];
const EDUCATION_OPTIONS  = ["High School", "Bachelors", "Masters", "PhD"];
const EMPLOYMENT_OPTIONS = ["Salaried", "Self-Employed", "Unemployed"];
const USD_TO_INR = 83;

const INITIAL_FORM = {
  age: "", income: "", loan_amount: "", credit_score: 650,
  years_experience: "", gender: "Male", education: "Bachelors",
  employment_type: "Salaried",
};

const INITIAL_LAND = {
  enabled: false,
  state: "", district: "",
  area_sqft: "", rate_per_sqft: 0,
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
function fmtINR(val) {
  if (!val && val !== 0) return "";
  return "₹" + Number(val).toLocaleString("en-IN");
}

// ── Sub-components ────────────────────────────────────────────────
function SectionLabel({ text }) {
  return <p style={{ fontSize: 11, color: "#38bdf8", fontWeight: 600, letterSpacing: "0.1em", marginBottom: 14 }}>{text}</p>;
}

function ToggleGroup({ options, value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {options.map(opt => (
        <button key={opt} onClick={() => onChange(opt)} style={{
          padding: "7px 14px", borderRadius: 8, fontSize: 13, cursor: "pointer",
          fontFamily: "inherit", transition: "all 0.2s",
          border: value === opt ? "1.5px solid #38bdf8" : "1px solid #1e3a5f",
          background: value === opt ? "rgba(56,189,248,0.15)" : "#0c1829",
          color: value === opt ? "#38bdf8" : "#64748b",
          fontWeight: value === opt ? 600 : 400,
        }}>{opt}</button>
      ))}
    </div>
  );
}

function Field({ label, sublabel, children }) {
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

function NumInput({ value, onChange, placeholder, prefix }) {
  return (
    <div style={{ position: "relative" }}>
      {prefix && <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#64748b", fontSize: 14, pointerEvents: "none" }}>{prefix}</span>}
      <input type="text" inputMode="numeric" placeholder={placeholder} value={value}
        onChange={e => {
          const raw = e.target.value.replace(/[^0-9]/g, "");
          onChange(raw === "" ? "" : Number(raw));
        }}
        style={{
          background: "#0c1829", border: "1px solid #1e3a5f", borderRadius: 10,
          padding: prefix ? "11px 14px 11px 28px" : "11px 14px",
          color: "#f1f5f9", fontSize: 14, outline: "none", width: "100%", fontFamily: "inherit",
        }}
        onFocus={e => e.target.style.borderColor = "#38bdf8"}
        onBlur={e => e.target.style.borderColor = "#1e3a5f"}
      />
    </div>
  );
}

function SelectInput({ value, onChange, options, placeholder }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{
        background: "#0c1829", border: "1px solid #1e3a5f", borderRadius: 10,
        padding: "11px 14px", color: value ? "#f1f5f9" : "#64748b",
        fontSize: 14, outline: "none", width: "100%", fontFamily: "inherit", cursor: "pointer",
      }}
      onFocus={e => e.target.style.borderColor = "#38bdf8"}
      onBlur={e => e.target.style.borderColor = "#1e3a5f"}>
      <option value="" disabled>{placeholder}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function HistoryTable({ history }) {
  if (!history.length) return <div style={{ textAlign: "center", color: "#475569", padding: "2rem", fontSize: 14 }}>No predictions yet.</div>;
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #1e293b" }}>
            {["#","Age","Income","Loan","Credit","Employment","Collateral","Result","Approval%"].map(h => (
              <th key={h} style={{ padding: "8px 10px", color: "#64748b", fontWeight: 500, textAlign: "left", whiteSpace: "nowrap" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {history.map((row, i) => {
            const c = getRiskColor(row.result.risk_label);
            return (
              <tr key={i} style={{ borderBottom: "1px solid #0f1f38", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)" }}>
                <td style={{ padding: "8px 10px", color: "#475569" }}>{i + 1}</td>
                <td style={{ padding: "8px 10px", color: "#e2e8f0" }}>{row.input.age}</td>
                <td style={{ padding: "8px 10px", color: "#e2e8f0" }}>{fmtINR(row.input.income)}</td>
                <td style={{ padding: "8px 10px", color: "#e2e8f0" }}>{fmtINR(row.input.loan_amount)}</td>
                <td style={{ padding: "8px 10px", color: "#e2e8f0" }}>{row.input.credit_score}</td>
                <td style={{ padding: "8px 10px", color: "#e2e8f0" }}>{row.input.employment_type}</td>
                <td style={{ padding: "8px 10px", color: "#e2e8f0" }}>{row.land ? row.land.district : "None"}</td>
                <td style={{ padding: "8px 10px" }}>
                  <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, background: c.bg, color: c.text, border: `1px solid ${c.border}` }}>
                    {row.result.risk_label}
                  </span>
                </td>
                <td style={{ padding: "8px 10px", color: "#38bdf8", fontWeight: 600 }}>{row.result.approval_probability}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Land Collateral Calculator ────────────────────────────────────
function LandCalculator({ land, setLand }) {
  const districts   = land.state ? INDIA_STATES[land.state] : [];
  const ratePerSqFt = land.rate_per_sqft || 0;
  const landValue   = land.area_sqft ? land.area_sqft * ratePerSqFt : 0;
  const maxLoan     = Math.round(landValue * LTV_RATIO);

  const fetchRate = async (district) => {
    if (!district) return;
    try {
      const res = await fetch(`${BACKEND_URL}/land-rate/${encodeURIComponent(district)}`);
      const data = await res.json();
      setLand(l => ({ ...l, rate_per_sqft: data.rate_per_sqft }));
    } catch { setLand(l => ({ ...l, rate_per_sqft: 2500 })); }
  };

  return (
    <div style={{ marginBottom: "1.75rem" }}>
      {/* Toggle */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <SectionLabel text="LAND COLLATERAL (OPTIONAL)" />
        <button onClick={() => setLand(l => ({ ...l, enabled: !l.enabled }))}
          style={{
            marginTop: -14, padding: "4px 14px", borderRadius: 20, fontSize: 12,
            cursor: "pointer", fontFamily: "inherit", fontWeight: 600,
            border: `1px solid ${land.enabled ? "#22c55e" : "#1e3a5f"}`,
            background: land.enabled ? "rgba(34,197,94,0.15)" : "#0c1829",
            color: land.enabled ? "#22c55e" : "#64748b",
          }}>
          {land.enabled ? "✅ Enabled" : "Enable"}
        </button>
      </div>

      {land.enabled && (
        <div style={{ background: "#0a1628", border: "1px solid #1e3a5f", borderRadius: 14, padding: "1.25rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1rem" }}>
            <Field label="State">
              <SelectInput value={land.state} placeholder="Select State"
                options={Object.keys(INDIA_STATES).sort()}
                onChange={v => setLand(l => ({ ...l, state: v, district: "" }))} />
            </Field>
            <Field label="District">
              <SelectInput value={land.district} placeholder={land.state ? "Select District" : "Select State first"}
                options={districts}
                onChange={v => { setLand(l => ({ ...l, district: v })); fetchRate(v); }} />
            </Field>
            <Field label="Land Area (sq ft)">
              <NumInput value={land.area_sqft} placeholder="e.g. 2400"
                onChange={v => setLand(l => ({ ...l, area_sqft: v }))} />
            </Field>
          </div>

          {/* Land Valuation Result */}
          {land.area_sqft > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 8 }}>
              {[
                { label: "Rate per sq ft", val: fmtINR(ratePerSqFt), color: "#38bdf8" },
                { label: "Land Market Value", val: fmtINR(landValue), color: "#f97316" },
                { label: "Max Eligible Loan (70% LTV)", val: fmtINR(maxLoan), color: "#22c55e" },
              ].map(item => (
                <div key={item.label} style={{ background: "#0c1829", borderRadius: 10, padding: "12px 14px", border: "1px solid #1e3a5f", textAlign: "center" }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: item.color }}>{item.val}</div>
                  <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>{item.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* LTV Warning */}
          {land.area_sqft > 0 && (
            <div style={{ marginTop: 10, fontSize: 12, color: "#94a3b8", background: "#0c1829", borderRadius: 8, padding: "8px 12px" }}>
              💡 <strong style={{ color: "#38bdf8" }}>How it works:</strong> Bank evaluates your land in{" "}
              <strong style={{ color: "#f97316" }}>{land.district}</strong> at{" "}
              <strong style={{ color: "#f97316" }}>{fmtINR(ratePerSqFt)}/sq ft</strong>.
              Maximum loan = Land Value × 70% LTV Ratio = <strong style={{ color: "#22c55e" }}>{fmtINR(maxLoan)}</strong>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────
export default function App() {
  const [form, setForm]       = useState(INITIAL_FORM);
  const [land, setLand]       = useState(INITIAL_LAND);
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [history, setHistory] = useState([]);
  const [tab, setTab]         = useState("form");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    if (!form.age || form.age < 18 || form.age > 69) return "Enter valid Age (18–69)";
    if (!form.income || form.income <= 0)             return "Enter valid Annual Income";
    if (!form.loan_amount || form.loan_amount <= 0)   return "Enter valid Loan Amount";
    if (form.years_experience === "")                  return "Enter Work Experience";
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setLoading(true); setResult(null); setError(null);

    // ✅ Convert INR to USD for model (dataset is in USD)
    const payload = {
      age:              Number(form.age),
      income:           Number(form.income) / USD_TO_INR,
      loan_amount:      Number(form.loan_amount) / USD_TO_INR,
      credit_score:     Number(form.credit_score),
      years_experience: Number(form.years_experience),
      gender:           form.gender,
      education:        form.education,
      employment_type:  form.employment_type,
    };

    try {
      const res = await axios.post(`${BACKEND_URL}/predict`, payload);
      setResult(res.data);
      setHistory(prev => [{ input: form, land: land.enabled ? land : null, result: res.data }, ...prev]);
    } catch {
      setError("❌ Cannot connect to backend. Check if Render service is live.");
    }
    setLoading(false);
  };

  const handleReset = () => { setForm(INITIAL_FORM); setLand(INITIAL_LAND); setResult(null); setError(null); };

  const riskColor  = result ? getRiskColor(result.risk_label) : null;
  const showWarning = form.income && form.loan_amount && Number(form.loan_amount) > Number(form.income) * 0.6;

  // Land LTV check
  const landValue  = land.enabled && land.area_sqft ? land.area_sqft * (land.rate_per_sqft || 0) : 0;
  const maxLoan    = Math.round(landValue * LTV_RATIO);
  const landAlert  = land.enabled && land.area_sqft && form.loan_amount && Number(form.loan_amount) > maxLoan;

  return (
    <div style={{ minHeight: "100vh", background: "#060b18", display: "flex", flexDirection: "column", alignItems: "center", padding: "2rem 1rem", fontFamily: "Inter, sans-serif" }}>

      {/* ── Header ── */}
      <div style={{ width: "100%", maxWidth: 820, marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 6 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg, #0ea5e9, #6366f1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>💳</div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#f1f5f9", margin: 0 }}>Loan Risk Predictor</h1>
            <p style={{ fontSize: 13, color: "#475569", margin: 0 }}>AI-powered credit risk assessment — India</p>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, background: "#052e16", border: "1px solid #166534", borderRadius: 20, padding: "4px 12px", fontSize: 12, color: "#4ade80" }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ade80", display: "inline-block", animation: "pulse 2s infinite" }}></span>
            API Live
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, borderBottom: "1px solid #1e293b", marginTop: "1.25rem" }}>
          {["form", "history"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: "9px 20px", background: "transparent", border: "none", cursor: "pointer",
              fontSize: 14, fontFamily: "inherit",
              color: tab === t ? "#38bdf8" : "#475569",
              borderBottom: tab === t ? "2px solid #38bdf8" : "2px solid transparent",
              fontWeight: tab === t ? 600 : 400, transition: "all 0.2s", marginBottom: -1,
            }}>
              {t === "form" ? "🔍 Predict" : `📋 History (${history.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main Card ── */}
      <div style={{ width: "100%", maxWidth: 820, background: "#0d1526", borderRadius: 20, border: "1px solid #1e293b", boxShadow: "0 30px 80px rgba(0,0,0,0.6)", padding: "2rem" }}>

        {tab === "history" ? <HistoryTable history={history} /> : (
          <>
            {/* Personal Info */}
            <SectionLabel text="PERSONAL INFORMATION" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.75rem" }}>
              <Field label="Age">
                <NumInput value={form.age} placeholder="Enter age (18–69)" onChange={v => set("age", v)} />
              </Field>
              <Field label="Gender">
                <ToggleGroup options={GENDER_OPTIONS} value={form.gender} onChange={v => set("gender", v)} />
              </Field>
              <Field label="Education">
                <ToggleGroup options={EDUCATION_OPTIONS} value={form.education} onChange={v => set("education", v)} />
              </Field>
              <Field label="Employment Type">
                <ToggleGroup options={EMPLOYMENT_OPTIONS} value={form.employment_type} onChange={v => set("employment_type", v)} />
              </Field>
            </div>

            {/* Financial Info */}
            <SectionLabel text="FINANCIAL INFORMATION (₹)" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.75rem" }}>
              <Field label="Annual Income (₹)">
                <NumInput value={form.income} placeholder="e.g. 600000" prefix="₹" onChange={v => set("income", v)} />
              </Field>
              <Field label="Loan Amount (₹)">
                <NumInput value={form.loan_amount} placeholder="e.g. 200000" prefix="₹" onChange={v => set("loan_amount", v)} />
              </Field>
              <Field label="Work Experience (Years)">
                <NumInput value={form.years_experience} placeholder="Enter years (0–39)" onChange={v => set("years_experience", v)} />
              </Field>
              <Field label="Credit Score" sublabel={<CreditScoreLabel score={form.credit_score} />}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <input type="range" min={300} max={849} value={form.credit_score}
                    onChange={e => set("credit_score", Number(e.target.value))} style={{ flex: 1 }} />
                  <span style={{ fontSize: 15, fontWeight: 700, color: "#38bdf8", minWidth: 38, textAlign: "right" }}>{form.credit_score}</span>
                </div>
              </Field>
            </div>

            {/* Land Collateral */}
            <LandCalculator land={land} setLand={setLand} />

            {/* Warnings */}
            {showWarning && (
              <div style={{ background: "#1c0f00", border: "1px solid #92400e", borderRadius: 10, padding: "10px 14px", marginBottom: "1.25rem", fontSize: 13, color: "#fdba74" }}>
                ⚠️ Loan amount is high relative to income — this may increase risk.
              </div>
            )}
            {landAlert && (
              <div style={{ background: "#2d0a0a", border: "1px solid #ef4444", borderRadius: 10, padding: "10px 14px", marginBottom: "1.25rem", fontSize: 13, color: "#f87171" }}>
                ❌ Loan amount <strong>{fmtINR(form.loan_amount)}</strong> exceeds maximum eligible loan of <strong>{fmtINR(maxLoan)}</strong> based on your land value. Bank may reject this.
              </div>
            )}

            {/* Buttons */}
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={handleSubmit} disabled={loading} style={{
                flex: 1, padding: "14px", borderRadius: 12, border: "none",
                background: loading ? "#1e3a5f" : "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)",
                color: loading ? "#64748b" : "#fff", fontSize: 15, fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit",
                boxShadow: loading ? "none" : "0 4px 20px rgba(14,165,233,0.3)",
              }}>
                {loading ? "⏳ Analyzing..." : "🔍 Predict Loan Risk"}
              </button>
              <button onClick={handleReset} style={{ padding: "14px 20px", borderRadius: 12, cursor: "pointer", background: "transparent", border: "1px solid #1e3a5f", color: "#64748b", fontSize: 14, fontFamily: "inherit" }}>
                Reset
              </button>
            </div>

            {/* Error */}
            {error && (
              <div style={{ marginTop: "1.25rem", background: "#2d0a0a", border: "1px solid #ef4444", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#f87171" }}>
                {error}
              </div>
            )}

            {/* Result */}
            {result && riskColor && (
              <div style={{ marginTop: "1.5rem", borderRadius: 16, border: `1.5px solid ${riskColor.border}`, background: riskColor.bg, padding: "1.5rem", animation: "fadeIn 0.4s ease" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: riskColor.text }}>
                      {getRiskEmoji(result.risk_label)} {result.risk_label}
                    </div>
                    <div style={{ fontSize: 13, color: "#64748b", marginTop: 3 }}>
                      {result.approved ? "Loan application likely to be approved" : "Loan application likely to be rejected"}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 32, fontWeight: 700, color: riskColor.text }}>{result.approval_probability}%</div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>approval chance</div>
                  </div>
                </div>

                <div style={{ height: 8, background: "#1e293b", borderRadius: 99, overflow: "hidden", marginBottom: "1.25rem" }}>
                  <div style={{ height: "100%", borderRadius: 99, width: `${result.approval_probability}%`, background: result.approved ? "linear-gradient(90deg,#22c55e,#4ade80)" : "linear-gradient(90deg,#ef4444,#f97316)", transition: "width 1s ease" }} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: "1.25rem" }}>
                  {[
                    { label: "Approval Probability", val: `${result.approval_probability}%`, color: "#4ade80" },
                    { label: "Rejection Probability", val: `${result.rejection_probability}%`, color: "#f87171" },
                  ].map(s => (
                    <div key={s.label} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "12px 16px", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.val}</div>
                      <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Land Summary in result */}
                {land.enabled && land.area_sqft > 0 && (
                  <div style={{ background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.2)", borderRadius: 10, padding: "12px 16px", marginBottom: "1rem" }}>
                    <div style={{ fontSize: 12, color: "#38bdf8", fontWeight: 600, marginBottom: 6 }}>🏠 COLLATERAL SUMMARY</div>
                    <div style={{ display: "flex", gap: "1.5rem", fontSize: 13, color: "#cbd5e1" }}>
                      <span>📍 {land.district}, {land.state}</span>
                      <span>📐 {Number(land.area_sqft).toLocaleString("en-IN")} sq ft</span>
                      <span>💰 Value: {fmtINR(landValue)}</span>
                      <span>🏦 Max Loan: {fmtINR(maxLoan)}</span>
                    </div>
                  </div>
                )}

                <div>
                  <p style={{ fontSize: 12, color: "#64748b", fontWeight: 600, letterSpacing: "0.08em", marginBottom: 10 }}>RISK FACTORS DETECTED</p>
                  {result.risk_factors.map((f, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#cbd5e1", marginBottom: 6 }}>
                      <span style={{ color: result.approved ? "#4ade80" : "#f97316", fontSize: 10 }}>●</span>{f}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse  { 0%,100%{ opacity:1; } 50%{ opacity:0.3; } }
        select option { background: #0c1829; color: #f1f5f9; }
      `}</style>
    </div>
  );
}

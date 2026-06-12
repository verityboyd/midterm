//submit file form and button (csv only)
// run analysis button
//dashboard is populated upon running

//upload a file to see analysis/dashboard message if !file

//file -> blob storage -> analysed thru sentiment analysis -> analysis displayed on dashboard

"use client";

import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const [results, setResults] = useState(null);

  const runAnalysis = async () => {
    if (!file) {
      alert("Please upload a CSV file first.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/analyze", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setResults(data);
    setLoading(false);
  };

  return (
    <div style={{ padding: 40, maxWidth: 800 }}>
      <h1>Customer Sentiment Analysis Dashboard</h1>

      {/* Upload CSV */}
      <input
        type="file"
        accept=".csv"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <button
        onClick={runAnalysis}
        style={{ marginLeft: 10, padding: "8px 16px" }}
      >
        Upload & Run Analysis
      </button>

      {loading && <p style={{ marginTop: 20 }}>Running analysis...</p>}

      {/* Dashboard */}
      {results && (
        <div style={{ marginTop: 40 }}>
          <h2>Sentiment Results</h2>

          <div style={{ display: "flex", gap: 20 }}>
            <div>
              <h3>Positive</h3>
              <p>{results.positive}</p>
            </div>

            <div>
              <h3>Neutral</h3>
              <p>{results.neutral}</p>
            </div>

            <div>
              <h3>Negative</h3>
              <p>{results.negative}</p>
            </div>

            <div>
              <h3>Mixed</h3>
              <p>{results.mixed}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

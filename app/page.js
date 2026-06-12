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
    <div
      style={{
        padding: 40,
        maxWidth: 900,
        margin: "0 auto",
        fontFamily: "Arial",
      }}
    >
      <h1 style={{ fontSize: 32, marginBottom: 20 }}>
        Customer Sentiment Analysis Dashboard
      </h1>

      {/* Upload Section */}
      <div
        style={{
          padding: 20,
          border: "1px solid #ddd",
          borderRadius: 8,
          background: "#fafafa",
          marginBottom: 30,
        }}
      >
        <input
          type="file"
          accept=".csv"
          onChange={(e) => setFile(e.target.files[0])}
          style={{
            padding: 10,
            border: "1px solid #ccc",
            borderRadius: 6,
            width: "100%",
            marginBottom: 15,
          }}
        />

        <button
          onClick={runAnalysis}
          style={{
            padding: "10px 20px",
            background: "#0078D4",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 16,
          }}
        >
          Upload & Run Analysis
        </button>

        {loading && (
          <p style={{ marginTop: 15, fontStyle: "italic" }}>
            Running analysis...
          </p>
        )}
      </div>

      {/* Dashboard */}
      {results && (
        <div>
          <h2 style={{ fontSize: 28, marginBottom: 20 }}>Sentiment Results</h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 20,
            }}
          >
            {/* Card */}
            <div
              style={{
                padding: 20,
                borderRadius: 10,
                background: "#e8f5e9",
                border: "1px solid #c8e6c9",
                textAlign: "center",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              <h3 style={{ fontSize: 22, marginBottom: 10 }}>Positive</h3>
              <p style={{ fontSize: 32, fontWeight: "bold" }}>
                {results.positive}
              </p>
            </div>

            <div
              style={{
                padding: 20,
                borderRadius: 10,
                background: "#f5f5f5",
                border: "1px solid #ddd",
                textAlign: "center",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              <h3 style={{ fontSize: 22, marginBottom: 10 }}>Neutral</h3>
              <p style={{ fontSize: 32, fontWeight: "bold" }}>
                {results.neutral}
              </p>
            </div>

            <div
              style={{
                padding: 20,
                borderRadius: 10,
                background: "#ffebee",
                border: "1px solid #ffcdd2",
                textAlign: "center",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              <h3 style={{ fontSize: 22, marginBottom: 10 }}>Negative</h3>
              <p style={{ fontSize: 32, fontWeight: "bold" }}>
                {results.negative}
              </p>
            </div>

            <div
              style={{
                padding: 20,
                borderRadius: 10,
                background: "#ede7f6",
                border: "1px solid #d1c4e9",
                textAlign: "center",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              <h3 style={{ fontSize: 22, marginBottom: 10 }}>Mixed</h3>
              <p style={{ fontSize: 32, fontWeight: "bold" }}>
                {results.mixed}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

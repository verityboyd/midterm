import { NextResponse } from "next/server";
import { BlobServiceClient } from "@azure/storage-blob";
import csv from "csv-parser";

export async function POST(req) {
  try {
    // 1. Read uploaded file
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // 2. Upload CSV to Blob Storage
    const blobService = BlobServiceClient.fromConnectionString(
      process.env.AZURE_STORAGE_CONNECTION_STRING,
    );

    const container = blobService.getContainerClient("customerfeedback");
    await container.createIfNotExists();

    const blobName = `feedback-${Date.now()}.csv`;
    const blockBlob = container.getBlockBlobClient(blobName);

    await blockBlob.uploadData(fileBuffer);

    // 3. Parse CSV into an array of comments (column: feedback)
    const comments = await new Promise((resolve, reject) => {
      const results = [];
      const stream = require("stream");
      const readStream = new stream.PassThrough();
      readStream.end(fileBuffer);

      readStream
        .pipe(csv())
        .on("data", (row) => {
          if (row.Feedback) results.push(row.Feedback);
        })
        .on("end", () => resolve(results))
        .on("error", reject);
    });

    if (comments.length === 0) {
      return NextResponse.json(
        { error: "CSV has no 'feedback' column or no rows" },
        { status: 400 },
      );
    }

    // 4. Call Foundry-compatible Language API
    const endpoint = process.env.AZURE_LANGUAGE_ENDPOINT;
    const key = process.env.AZURE_LANGUAGE_KEY;

    const sentimentResponse = await fetch(
      `${endpoint}/:analyze-text?api-version=2023-04-01`,
      {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": key,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          kind: "SentimentAnalysis",
          analysisInput: {
            documents: comments.map((text, i) => ({
              id: (i + 1).toString(),
              language: "en",
              text,
            })),
          },
        }),
      },
    );

    const sentimentData = await sentimentResponse.json();

    // 5. Count sentiment results
    let positive = 0;
    let neutral = 0;
    let negative = 0;
    let mixed = 0;

    if (sentimentData?.results?.documents) {
      sentimentData.results.documents.forEach((doc) => {
        if (doc.sentiment === "positive") positive++;
        if (doc.sentiment === "neutral") neutral++;
        if (doc.sentiment === "negative") negative++;
        if (doc.sentiment === "mixed") mixed++;
      });
    }

    // 6. Return dashboard data
    return NextResponse.json({
      positive,
      neutral,
      negative,
      mixed,
    });
  } catch (err) {
    console.error("Error:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 },
    );
  }
}

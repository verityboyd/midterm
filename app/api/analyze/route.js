import { NextResponse } from "next/server";
import { BlobServiceClient } from "@azure/storage-blob";
import {
  AzureKeyCredential,
  TextAnalyticsClient,
} from "@azure/ai-text-analytics";
import csv from "csv-parser";

// ----------------------
// ENV VARIABLES REQUIRED
// ----------------------
// AZURE_STORAGE_CONNECTION_STRING
// AZURE_LANGUAGE_ENDPOINT
// AZURE_LANGUAGE_KEY

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

    // 3. Parse CSV into an array of comments
    const comments = await new Promise((resolve, reject) => {
      const results = [];
      const stream = require("stream");
      const readStream = new stream.PassThrough();
      readStream.end(fileBuffer);

      readStream
        .pipe(csv())
        .on("data", (row) => {
          // Expecting a column named "comment"
          if (row.comment) results.push(row.comment);
        })
        .on("end", () => resolve(results))
        .on("error", reject);
    });

    if (comments.length === 0) {
      return NextResponse.json(
        { error: "CSV has no 'comment' column or no rows" },
        { status: 400 },
      );
    }

    // 4. Azure AI Language Client
    const client = new TextAnalyticsClient(
      process.env.AZURE_LANGUAGE_ENDPOINT,
      new AzureKeyCredential(process.env.AZURE_LANGUAGE_KEY),
    );

    // 5. Run sentiment analysis
    const sentimentResult = await client.analyzeSentiment(comments);

    let positive = 0;
    let neutral = 0;
    let negative = 0;
    let mixed = 0;

    sentimentResult.forEach((doc) => {
      if (doc.sentiment === "positive") positive++;
      if (doc.sentiment === "neutral") neutral++;
      if (doc.sentiment === "negative") negative++;
      if (doc.sentiment === "mixed") mixed++;
    });

    // 6. Extract key phrases
    const keyPhraseResult = await client.extractKeyPhrases(comments);

    const keyPhrases = [
      ...new Set(
        keyPhraseResult.flatMap((doc) => doc.keyPhrases).slice(0, 20), // limit for dashboard
      ),
    ];

    // 7. Return dashboard data
    return NextResponse.json({
      positive,
      neutral,
      negative,
      mixed,
      keyPhrases,
    });
  } catch (err) {
    console.error("Error:", err);
    return NextResponse.json(
      { error: "Server error", details: err.message },
      { status: 500 },
    );
  }
}

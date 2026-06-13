# Customer Feedback Sentiment Dashboard

> INTP302 – Emerging Trends in Software Development | Midterm Team Mini-Project

A deployed web application that lets businesses collect customer feedback, analyze sentiment using Azure AI Language, and visualize overall customer mood through a real-time dashboard.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Target Users](#target-users)
- [Azure Architecture](#azure-architecture)
- [AI Feature](#ai-feature)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Local Development](#local-development)
  - [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Known Limitations](#known-limitations)
- [Responsible AI Review](#responsible-ai-review)
- [Team](#team)

---

## Project Overview

Businesses often receive large volumes of customer comments and struggle to quickly understand overall customer mood. This application allows users to submit feedback through a simple form. Each submission is stored in Azure Blob Storage and analyzed by Azure AI Language for sentiment (positive, negative, neutral, or mixed) and key phrases. A dashboard displays aggregate counts and recent entries so teams can act on customer data quickly.

**Core features (midterm version):**

- Submit customer feedback via a web form
- Store each feedback record in Azure Blob Storage (JSON format)
- Analyze sentiment and extract key phrases using Azure AI Language
- Display a live dashboard with positive / negative / neutral / mixed counts
- View recent feedback entries with their sentiment labels

---

## Target Users

- Small to medium business owners monitoring customer satisfaction
- Customer support teams triaging complaints
- Instructors and evaluators reviewing the prototype

---

## Azure Architecture

```
User Browser
    │
    ▼
Azure App Service  (Next.js – frontend + API routes)
    │
    ├──► Azure Blob Storage       (stores feedback records as JSON blobs)
    │
    └──► Azure AI Language        (sentiment analysis + key phrase extraction)
```

| Layer   | Azure Service      | Purpose                                         |
| ------- | ------------------ | ----------------------------------------------- |
| Hosting | Azure App Service  | Runs the Next.js application                    |
| Storage | Azure Blob Storage | Persists feedback JSON records                  |
| AI      | Azure AI Language  | Sentiment analysis and key phrase extraction    |
| Secrets | Azure App Settings | Stores all keys and connection strings securely |

---

## AI Feature

**Service:** Azure AI Language – Sentiment Analysis  
**Input:** Plain-text customer feedback string submitted via the form  
**Output:** Sentiment label (`positive`, `negative`, `neutral`, or `mixed`), confidence scores for each label, and a list of extracted key phrases  
**Where results appear:** Immediately below the submission form and aggregated on the dashboard

The API call is made server-side through a Next.js API route. The client never receives or exposes the API key.

---

## Getting Started

### Prerequisites

- Node.js 18 or later
- An Azure subscription with the following resources provisioned:
  - Azure App Service (Node 18 LTS stack)
  - Azure Blob Storage account and container
  - Azure AI Language resource (endpoint + key)

### Local Development

```bash
# 1. Clone the repository
git clone https://github.com/<your-org>/<your-repo>.git
cd <your-repo>

# 2. Install dependencies
npm install

# 3. Copy the environment variable template and fill in your values
cp .env.local.example .env.local

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Create a `.env.local` file in the project root (never commit this file). All of the same keys must be added to **Azure App Settings** for the deployed environment.

| Variable                          | Description                                                |
| --------------------------------- | ---------------------------------------------------------- |
| `AZURE_LANGUAGE_ENDPOINT`         | Endpoint URL for your Azure AI Language resource           |
| `AZURE_LANGUAGE_KEY`              | API key for Azure AI Language                              |
| `AZURE_STORAGE_CONNECTION_STRING` | Full connection string for your Azure Blob Storage account |
| `AZURE_STORAGE_CONTAINER_NAME`    | Name of the Blob container used to store feedback records  |

> **Security note:** API keys and connection strings are stored only in `.env.local` locally and in Azure App Settings for production. They are never embedded in client-side code or committed to the repository. The `.gitignore` file excludes `.env.local` and all `.env*` files.

---

## Deployment

The application is deployed to Azure App Service.

**Live URL:** `https://<your-app-name>.azurewebsites.net`

### Deploy steps (CI / manual)

```bash
# Build the production bundle
npm run build

# Deploy using Azure CLI (or connect GitHub Actions for automatic deploys)
az webapp up --name <your-app-name> --resource-group <your-rg> --runtime "NODE:18-lts"
```

Set all environment variables listed above under **Configuration → Application Settings** in the Azure portal before the first deploy.

---

## Known Limitations

- **Language support:** Azure AI Language sentiment analysis performs best with English text. Results for other languages may be less accurate.
- **Storage read performance:** The dashboard re-reads all blobs on each page load. For large datasets this will be slow; a database (e.g., Azure SQL or Cosmos DB) would be a better long-term solution.
- **No authentication:** Any user with the URL can submit feedback and view the dashboard. A production version would require user authentication.
- **Rate limits:** The free tier of Azure AI Language has a limited number of transactions per minute. High-volume submissions may receive throttled responses.
- **AI confidence scores:** Sentiment labels are probabilistic. Low-confidence results should be flagged for human review rather than acted on automatically.
- **No input validation beyond basic checks:** Extremely short or non-sensical feedback strings may produce unreliable sentiment labels.

---

## Responsible AI Review

### Fairness

The sentiment model may perform differently across languages, regional dialects, writing styles, or informal text (e.g., slang, abbreviations). Users writing in languages other than English or with non-standard grammar may receive less accurate results. Teams should be aware of this bias before using sentiment scores to make decisions about individual customers.

### Reliability and Safety

Sentiment analysis is a statistical prediction, not a definitive judgment. Mixed or borderline feedback can be misclassified. Results should not be used to automatically resolve or dismiss a complaint without human review. Confidence scores are displayed alongside labels to help users gauge reliability.

### Privacy and Security

- Only the text of the submitted feedback is sent to Azure AI Language. No personally identifiable information (PII) is required or requested from the user.
- API keys and connection strings are stored in Azure App Settings and local `.env.local` files only — never in source code or client bundles.
- Feedback records stored in Blob Storage use synthetic or anonymized sample data for this prototype. In a production deployment, a data retention policy and access control list should be defined.

### Inclusiveness

The form UI uses semantic HTML and visible labels to support screen readers. Colour alone is not used to convey sentiment category — text labels are always displayed. Keyboard navigation is supported.

### Transparency

The application clearly communicates to users that their submitted feedback will be analyzed by an AI service. Sentiment labels and confidence scores are shown directly so users can see how the AI interpreted their input.

### Accountability

The dashboard is a decision-support tool. A human (e.g., a customer service manager) is responsible for reviewing flagged feedback and deciding on any follow-up action. Low-confidence results are visually highlighted to prompt human review. In the future agentic extension, any automated action (such as creating a support ticket) will require human approval before execution.

---

## Team

| Name       | Role                                                     |
| ---------- | -------------------------------------------------------- |
| [Member 1] | Frontend UI, form design, dashboard components           |
| [Member 2] | Azure AI Language integration, API routes                |
| [Member 3] | Azure Blob Storage integration, data layer               |
| [Member 4] | Azure deployment, App Settings, README and documentation |

---

## Future Extension (Unit 3 / Final Project)

This project is designed to be extended into an Agentic AI solution:

- An AI agent will monitor incoming feedback and automatically route urgent negative submissions to the support queue.
- The agent will use tools to create support tickets, suggest templated replies, and escalate high-priority complaints.
- Safe access patterns (scoped permissions, human-in-the-loop approval) will be applied before any automated action is taken.
- Optional IoT integration could allow feedback collection from kiosk devices (e.g., post-purchase terminals).

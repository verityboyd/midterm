# Customer Feedback Sentiment Dashboard

A web app where users submit customer feedback, get it analyzed for sentiment (positive, negative, neutral, mixed) using Azure AI Language, and see results on a simple dashboard.

Built with Next.js, deployed on Azure App Service, storing feedback in Azure Blob Storage.

---

## Setup

```bash
git clone https://github.com/<your-org>/<your-repo>.git
cd <your-repo>
npm install
cp .env.local.example .env.local
npm run dev
```

## Environment Variables

| Variable                          | Description                              |
| --------------------------------- | ---------------------------------------- |
| `AZURE_LANGUAGE_ENDPOINT`         | Azure AI Language endpoint URL           |
| `AZURE_LANGUAGE_KEY`              | Azure AI Language API key                |
| `AZURE_STORAGE_CONNECTION_STRING` | Azure Blob Storage connection string     |
| `AZURE_STORAGE_CONTAINER_NAME`    | Blob container name for feedback records |

Keys are stored in `.env.local` locally and Azure App Settings in production. Never committed to the repo.

## Azure Services

- **Azure App Service** — hosts the Next.js app
- **Azure Blob Storage** — stores feedback as JSON
- **Azure AI Language** — sentiment analysis and key phrase extraction

## Known Limitations

- Best accuracy with English text
- No user authentication on this prototype
- Dashboard reloads all blobs on each page load — will slow down at scale

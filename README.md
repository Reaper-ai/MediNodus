# 🩺 MediNodus: Your Personal AI Health Assistant

> **MediNodus** (Latin for *'Healing Knot'*) untangles the complexity of medical data. It is an intelligent mobile platform that translates complex lab reports into simple language and prevents dangerous drug interactions using real-time FDA data.

---

## 🚀 The Problem

Medical literacy is a massive barrier to healthcare in India:

1. **Complex Reports:** Patients struggle to understand lab results (e.g., *"What does high Lymphocytes mean?"*).
2. **Adverse Interactions:** Elderly patients often take multiple prescriptions without knowing if they conflict, leading to preventable hospitalizations.

## 💡 The Solution

**MediNodus** acts as a bridge between the doctor's data and the patient's understanding.

* **📄 Report Translator:** Upload a PDF/Image of a blood test. The AI extracts values, flags abnormalities, and explains them in plain English (or Hindi).
* **💊 Drug Safety Shield:** Scan a medicine strip. The app identifies the drug and cross-references it with your *current* health profile to warn of risks (e.g., *"Don't take Ibuprofen; your Kidney function is low"*).
* **🧠 MedGamma Intelligence:** Uses a fine-tuned local Transformer model to understand medical text and imagery without external APIs.
* **🛡️ Privacy First:** No data processing on third-party clouds (Google/OpenAI). All inference happens within your container.


---

## 🏗️ System Architecture

The system follows a microservices-ready architecture, containerized with Docker for instant scalability.

**(Insert your Mermaid Architecture Diagram here)**

---

## 🛠️ Tech Stack

| Component | Technology | Role |
| --- | --- | --- |
| **Mobile App** | React Native (Expo) | Cross-platform UI for scanning and history. |
| **Backend API** | FastAPI (Python 3.10) | Async API handling inference requests. |
| **AI Engine** | **Hugging Face Transformers** | Running the local **MedGamma** model. |
| **Database** | MongoDB Atlas (Beanie) | Storing user profiles and structured history. |
| **Media Storage**| Cloudinary | Hosting encrypted medical documents. |

---

# ✨ Key Features

### 1. 📊 Local Analysis
- **On-Device/On-Prem Inference:** Uses the `transformers` library to run MedGamma.
- **Abnormality Detection:** Parses lab values and flags "Critical" statuses.
- **Latency Optimized:** No network calls to LLM providers.

### 2. 🛡️ Context-Aware Safety
- **Interaction Checker:** Checks Drug-Drug interactions using local knowledge bases.
- **Personalized Warnings:** Detects conflicts between a new drug and your existing *Chronic Conditions*.

### 3. 🕒 Medical Timeline
- **History Tab:** View past scans with visual thumbnails.
- **Secure Archive:** Reports are indexed and retrievable.

---

### Prerequisites

* Node.js & npm
* Python 3.10+
* Docker & Docker Compose
* MongoDB Atlas URI

###  Clone the Repository

```bash
git clone https://github.com/yourusername/medinodus.git
cd medinodus

```
## ⚡ Deployment & Setup

### Environment Variables
Create a `.env` file in the `backend/` directory:

```env
MONGO_URL=mongodb+srv://<user>:<password>@cluster.mongodb.net/?retryWrites=true&w=majority
CLOUDINARY_KEY=<your_cloudinary_secret>
SECRET_KEY=<your_jwt_secret>
HF_TOKEN=<hf_auth_token>
# No External AI Keys Required!

```
Configure API URL: Create a new file named .env inside the mobile/ folder and add your backend URL:
```env
# For Local Testing (Replace with your actual PC IP, not localhost)
EXPO_PUBLIC_API_URL=[http://192.168.1.5:8000](http://192.168.1.5:8000)
```

### 1. Backend (Docker)

The Docker build will install PyTorch and Transformers for local inference.

```bash
cd backend
docker build -t medinodus-backend .
docker run -p 8000:8000 --env-file .env medinodus-backend

```

*Note: The first run may take time to download the MedGamma model weights to the container.*

### 2. Mobile App

```bash
cd mobile
npm install
npx expo start

```

*Scan the QR code with the **Expo Go** app on Android/iOS.*

---


## 🤝 Team

* **Gaurav Upreti:** Android/React Native Engineering
* **Juss PAtel:** Backend Systems & Database Architecture
* **Ashmeet Singh Sandhu:** AI/ML Pipelines & Research

---

### 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

# ☁️ Google Cloud Technical Summit 2026

A modern, high-performance, 1-day technical conference web application built with **Python & Flask** on the backend and **HTML5, CSS3, and JavaScript** on the frontend. 

The website showcases an interactive schedule of 8 in-depth technical talks on Google Cloud technologies, speaker profiles with LinkedIn integration, category & speaker search filtering, view layout toggles, and a 60-minute networking lunch break.

---

## 🌟 Key Features

1. **Interactive Conference Homepage**:
   - Live header clock and event banner.
   - Displays event date (**October 24, 2026**), location (**Google Cloud Tech Center, San Francisco & Virtual Stream**), and theme.
   - Quick event statistics (8 Technical Talks, 12 Speakers, 60-min Lunch Break).

2. **8 Google Cloud Technical Talks**:
   - Covering Vertex AI, BigQuery ML, GKE Autopilot, Cloud Run, Cloud Spanner, Cloud Security & IAM, Eventarc, and Anthos.
   - Each talk features an ID, Title, Category (1-2 max), Description, and Time slot.

3. **Speaker Profiles (1-2 Max per Talk)**:
   - Each talk features 1 or 2 speakers.
   - Complete speaker metadata: First Name, Last Name, Role, Company, Avatar Image, and **LinkedIn profile link**.

4. **Multi-Parameter Real-Time Search & Filtering**:
   - **Text Search**: Search by talk title, description, or speaker name.
   - **Category Filter**: Instant filtering by technical domain (e.g. *AI & Machine Learning*, *Serverless*, *Containers & Kubernetes*, *Database*, *Security & Governance*).
   - **Speaker Filter**: Dropdown selection to filter talks by specific speaker.
   - **Reset Filters**: One-click filter reset.

5. **60-Minute Networking & Lunch Break**:
   - Mid-day scheduled break (**12:30 PM - 01:30 PM**) with distinct visual highlight.

6. **View Layout Switcher & Bookmarking**:
   - Toggle between **Timeline View** (chronological vertical schedule) and **Grid View** (responsive multi-column layout).
   - Bookmark sessions to personal schedule (persisted via browser `localStorage`).

7. **Session Details Modal**:
   - Click any session card to open a full modal window with detailed overview, speaker bios, and LinkedIn connection links.

---

## 🛠️ Tech Stack

- **Backend**: Python 3.9+, Flask framework.
- **Frontend**: HTML5, Vanilla CSS3 (Custom Dark Mode Tech Theme, Glassmorphism, CSS Grid & Flexbox), Vanilla JavaScript (ES6+, Fetch API).
- **Icons & Fonts**: FontAwesome 6, Google Fonts (*Plus Jakarta Sans*, *JetBrains Mono*).
- **Testing**: Python `unittest` framework.

---

## 📁 Directory Structure

```
conference-website/
├── app.py                      # Main Flask web server & REST API
├── data/
│   └── conference_data.json    # Conference, talks, break, and speaker dataset
├── static/
│   ├── css/
│   │   └── styles.css          # Master stylesheet (dark theme & responsive design)
│   └── js/
│       └── app.js              # Real-time search, filtering, view toggle & modal logic
├── templates/
│   └── index.html              # HTML5 Jinja template for conference homepage
├── tests/
│   └── test_app.py             # Automated unit tests for all requirements
├── requirements.txt            # Python dependencies (flask, pytest)
└── README.md                   # Setup, execution, and development guide
```

---

## 🚀 Setup & Installation Guide

### Prerequisites
- Python 3.9 or higher installed on your system.
- `pip` (Python package manager).

### 1. Clone or Navigate to the Project Directory
```bash
cd /Users/pillasaipavan/Documents/PYprojects/GDG/agy2-pprojects/conference-website
```

### 2. Create and Activate a Virtual Environment
```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment (macOS/Linux)
source venv/bin/activate

# Activate virtual environment (Windows)
# venv\Scripts\activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

---

## 🏃 How to Run the Web Application

### Launch Server
Run the Flask app using Python:

```bash
python app.py
```

By default, the application will launch at:
👉 **[http://127.0.0.1:5000](http://127.0.0.1:5000)**

You can open this URL in any browser to review and interact with the website.

---

## 🧪 Running Automated Unit Tests

The project includes a comprehensive test suite in `tests/test_app.py` verifying all 10 conference functionality requirements.

To run the tests:

```bash
python -m unittest discover -s tests
```

### Test Coverage Summary:
- `test_homepage_loads`: Verifies homepage returns HTTP 200 and renders conference header.
- `test_total_talks_count`: Verifies exact count of 8 technical talks.
- `test_speakers_per_talk_limit`: Enforces max 1 or 2 speakers per talk.
- `test_talk_attributes`: Checks ID, Title, Speakers, Categories (1-2), Description, and Time attributes.
- `test_speaker_attributes`: Checks First Name, Last Name, and LinkedIn URL format for all speakers.
- `test_lunch_break_duration`: Verifies 60-minute lunch break inclusion.
- `test_search_by_category`: Tests category search API `/api/talks?category=...`.
- `test_search_by_speaker`: Tests speaker search API `/api/talks?q=...`.
- `test_search_by_title`: Tests title search API `/api/talks?q=...`.

---

## 📡 REST API Documentation

The application exposes JSON API endpoints for dynamic frontend interaction:

| Endpoint | Method | Description | Query Parameters |
| :--- | :--- | :--- | :--- |
| `/api/talks` | `GET` | Retrieve schedule items | `q` (search string), `category` (category name), `speaker` (speaker ID), `include_breaks` (boolean) |
| `/api/talks/<talk_id>` | `GET` | Get single talk detail payload | None |
| `/api/categories` | `GET` | Get list of all distinct categories & talk counts | None |
| `/api/speakers` | `GET` | Get list of all speakers | None |

#### Sample API Response (`GET /api/talks/talk-1`):
```json
{
  "status": "success",
  "data": {
    "id": "talk-1",
    "type": "talk",
    "time": "09:00 AM - 09:45 AM",
    "durationMinutes": 45,
    "title": "Keynote: Next-Gen GenAI Applications with Vertex AI & Gemini 1.5 Pro",
    "categories": ["AI & Machine Learning", "Cloud Architecture"],
    "description": "Explore how enterprise engineering teams leverage Google Vertex AI...",
    "speakers": [
      {
        "id": "speaker-1",
        "firstName": "Aris",
        "lastName": "Thorne",
        "role": "Distinguished AI Engineer",
        "company": "Google Cloud",
        "linkedin": "https://www.linkedin.com/in/aris-thorne-ai"
      }
    ]
  }
}
```

---

## 🔧 How to Make Further Changes & Extensions

### 1. Adding or Modifying Talks / Speakers
All schedule data is stored cleanly in `data/conference_data.json`.
To add a new talk or edit speaker details, edit `data/conference_data.json`:
- To change speaker LinkedIn URLs, update the `"linkedin"` string inside `"speakers"`.
- To update talk times or categories, update `"time"` and `"categories"`.

### 2. Customizing Frontend Styling
The UI styles are controlled by CSS custom properties (tokens) in `static/css/styles.css`:
- **Theme Colors**: Modify `:root` variables `--gcloud-blue`, `--bg-main`, `--bg-card`.
- **Break Card Styling**: Modify `.break-card` for lunch break color accents.

### 3. Customizing Frontend Behaviors
Modify `static/js/app.js`:
- To adjust real-time search debounce or animation timings.
- To add local storage synchronization or export schedule feature.

---

## 📜 License
Built for demonstration of Google Cloud Technical Conference event management.

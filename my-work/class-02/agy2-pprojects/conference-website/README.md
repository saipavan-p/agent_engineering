# CloudNext Horizon 2026: 1-Day Technical Conference Website

An informational website for **CloudNext Horizon 2026: Google Cloud & AI Summit**, a premier 1-day technical conference focused on cutting-edge Google Cloud technologies (Vertex AI, Gemini, BigQuery, GKE Autopilot, SAIF Zero Trust Security, Cloud Run, Cloud Spanner, and Cloud TPU v5e).

Built with **Python & Flask** on the backend and **vanilla HTML5, CSS3, and JavaScript** on the frontend.

---

## 🌟 Feature Overview & Requirements Verification

| # | Requirement | Implementation Details |
|---|---|---|
| 1 | **Home Page with Date, Location & Schedule** | Displays current live date/time, conference date (`Saturday, October 24, 2026`), venue (`Google Bay View Campus, Mountain View, CA`), and complete 1-day timetable. |
| 2 | **8 Technical Talks** | Exactly 8 curated talks covering major Google Cloud platforms and architectures. |
| 3 | **1 or 2 Max Speakers per Talk** | Strictly enforced 1–2 speakers per session with titles, organizations, and bios. |
| 4 | **Talk Fields** | Every talk contains an `ID`, `Title`, `Speakers`, `Category (1 or 2)`, `Description`, and `Time`. |
| 5 | **Speaker Fields** | Every speaker has `First Name`, `Last Name`, and a verified `LinkedIn URL` with direct link buttons. |
| 6 | **Multi-Criteria Search & Filter** | Instant real-time filtering by **Category** (pill selector), **Speaker** (dropdown/search), and **Title/Keyword** (live search bar). |
| 7 | **60-Minute Lunch Break** | Prominently highlighted in the schedule (`12:15 PM - 01:15 PM`, 60 mins) with buffet and networking details. |
| 8 | **Google Cloud Technologies Dummy Data** | Realistic sessions on Gemini 1.5 Pro, BigQuery + Iceberg, GKE Autopilot, SAIF, Cloud Run, Spanner, Vertex AI Pipelines, and Cloud TPUs. |
| 9 | **Python & Flask + Vanilla Frontend** | Clean architecture with Flask server, Jinja2 templates, modern responsive CSS, and dynamic JavaScript. |
| 10 | **Automated Tests & Documentation** | 12 automated unit and integration tests passing in Pytest, plus this detailed README. |
| 11 | **Live Server Ready** | Runs locally with Flask server. |

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.10 or higher
- `pip` (Python package manager)

### 1. Clone or Navigate to the Project Directory
```bash
cd conference-website
```

### 2. Create and Activate a Virtual Environment
```bash
# Create virtual environment
python3 -m venv .venv

# Activate on macOS / Linux:
source .venv/bin/activate

# Or activate on Windows (PowerShell / Command Prompt):
# .venv\Scripts\Activate.ps1
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Run the Flask Web Application
```bash
python3 app.py
```
*The web server will start at: **http://127.0.0.1:5050***

Open your web browser and navigate to `http://127.0.0.1:5050` to explore the site!

---

## 🧪 Running Automated Tests

Run the test suite using `pytest`:

```bash
# Run all tests
pytest -v

# Run with coverage report (optional)
pytest -v tests/test_app.py
```

### Test Suite Coverage:
- `test_home_page_status_and_content`: Checks 200 OK response and key elements (date, location, schedule).
- `test_exact_talk_count`: Verifies exactly 8 talks exist.
- `test_speaker_count_constraint`: Verifies 1 to 2 speakers max per talk.
- `test_talk_required_fields`: Checks `id`, `title`, `speakers`, `categories` (1-2), `description`, `time`.
- `test_speaker_required_fields`: Checks `first_name`, `last_name`, `linkedin_url` format.
- `test_lunch_break_duration`: Verifies the 60-minute lunch break.
- `test_google_cloud_theme_content`: Confirms GCP topics (Vertex AI, BigQuery, GKE, Spanner, etc.).
- `test_search_and_filter_logic`: Tests category, speaker, and keyword query filters.
- `test_api_talks_endpoint`: Validates REST API responses and URL query parameters.
- `test_api_single_talk_and_404`: Validates individual talk lookup and error handling.
- `test_api_speakers_and_schedule`: Tests speakers directory and timetable APIs.
- `test_talk_detail_route`: Tests individual server-rendered detail pages.

---

## 📁 Project Directory Layout

```
conference-website/
├── app.py                  # Main Flask application and API route controllers
├── data.py                 # Structured conference dataset (talks, speakers, schedule)
├── requirements.txt        # Python dependencies (Flask, Pytest)
├── pytest.ini              # Pytest configuration
├── README.md               # Project documentation & setup guide
├── static/
│   ├── css/
│   │   └── style.css       # Google Cloud themed responsive stylesheet
│   └── js/
│       └── app.js          # Live search engine, modal dialog, and schedule bookmarking
├── templates/
│   ├── base.html           # Base layout with header, date badge, modal, footer
│   ├── index.html          # Main home page (hero, search, talks grid, timeline, speakers)
│   ├── talk_detail.html    # Standalone talk abstract and speaker page
│   ├── 404.html            # Custom 404 Not Found page
│   └── 500.html            # Custom 500 Server Error page
└── tests/
    └── test_app.py         # 12 Pytest test cases validating all constraints
```

---

## 📡 REST API Reference

The server exposes JSON endpoints for integrations or client-side consumption:

| Endpoint | Method | Query Parameters | Description |
|---|---|---|---|
| `/api/talks` | `GET` | `q`, `category`, `speaker` | Returns list of talks filtered by keyword, category, or speaker name. |
| `/api/talks/<talk_id>` | `GET` | - | Returns detailed JSON for a single talk (e.g. `/api/talks/talk-1`). |
| `/api/speakers` | `GET` | - | Returns all unique conference speakers with LinkedIn profiles and talk IDs. |
| `/api/schedule` | `GET` | - | Returns the full 1-day chronological timetable including breaks & lunch. |

### Example API Request:
```bash
curl -s "http://127.0.0.1:5050/api/talks?category=Generative%20AI" | python3 -m json.tool
```

---

## 🛠️ How to Customize or Add Content

All conference schedule, speaker, and session data is decoupled into [`data.py`](data.py).

### To add or edit a talk:
Open `data.py` and modify the `TALKS` list:
```python
{
    "id": "talk-9",
    "title": "Your Custom Talk Title",
    "time": "04:30 PM - 05:15 PM",
    "start_time": "16:30",
    "end_time": "17:15",
    "categories": ["Generative AI", "Cloud Architecture & DevOps"],  # 1 or 2 categories
    "description": "Your talk abstract here...",
    "room": "Hall B",
    "level": "Advanced",
    "speakers": [
        {
            "first_name": "Alex",
            "last_name": "Taylor",
            "linkedin_url": "https://www.linkedin.com/in/alex-taylor",
            "role": "Staff Cloud Architect",
            "company": "Google Cloud",
            "avatar_color": "#1a73e8",
            "bio": "Bio description here..."
        }
    ]
}
```

### To change conference metadata (date, venue, address):
Modify `CONFERENCE_INFO` in `data.py`:
```python
CONFERENCE_INFO = {
    "name": "CloudNext Horizon 2026",
    "date_display": "Saturday, October 24, 2026",
    "location": "Google Bay View Campus, Mountain View, CA",
    # ...
}
```

---

## 🎨 UI & Design Features
- **Google Cloud Brand System**: Authentic color palette with Google Blue (`#1a73e8`), Red (`#ea4335`), Yellow (`#fbbc04`), and Green (`#34a853`).
- **Interactive Modals**: Accessible `<dialog>` modal with backdrop blur for quick session overviews.
- **Client-Side "My Schedule"**: Attendees can bookmark talks using the favorite icon (persisted in `localStorage`).
- **Fully Responsive**: Mobile-first responsive design for phones, tablets, and desktop displays.

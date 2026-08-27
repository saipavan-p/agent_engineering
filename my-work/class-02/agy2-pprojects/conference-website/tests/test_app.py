"""
Comprehensive test suite for CloudNext Horizon 2026 Conference Web Application.
"""
import pytest
from app import app
from data import TALKS, FULL_SCHEDULE, CONFERENCE_INFO, get_unique_speakers, filter_talks

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_home_page_status_and_content(client):
    """Test home page loads with status 200 and required meta elements."""
    response = client.get('/')
    assert response.status_code == 200
    html = response.get_data(as_text=True)
    
    # Requirement 1: Home page shows current date, location, schedule, and timetable
    assert CONFERENCE_INFO["name"] in html
    assert "Google Bay View" in html or CONFERENCE_INFO["location"] in html
    assert "1-Day Event Timetable" in html
    assert "8 Technical Talks" in html

def test_exact_talk_count():
    """Requirement 2: The 1-day event is a list of 8 talks in total."""
    assert len(TALKS) == 8, f"Expected exactly 8 talks, found {len(TALKS)}"

def test_speaker_count_constraint():
    """Requirement 3: Each talk has 1 or 2 max speakers."""
    for talk in TALKS:
        speakers = talk.get("speakers", [])
        num_speakers = len(speakers)
        assert 1 <= num_speakers <= 2, (
            f"Talk '{talk['id']}' ({talk['title']}) has {num_speakers} speakers. "
            f"Must have between 1 and 2 speakers."
        )

def test_talk_required_fields():
    """Requirement 4: A talk has an ID, Title, Speakers, Category (1 or 2), Description, and Time."""
    for talk in TALKS:
        assert "id" in talk and talk["id"], "Talk must have an ID"
        assert "title" in talk and talk["title"], "Talk must have a Title"
        assert "speakers" in talk and len(talk["speakers"]) > 0, "Talk must have Speakers"
        assert "categories" in talk, "Talk must have Categories"
        assert 1 <= len(talk["categories"]) <= 2, (
            f"Talk '{talk['id']}' has {len(talk['categories'])} categories. Must have 1 or 2 categories."
        )
        assert "description" in talk and len(talk["description"]) > 20, "Talk must have a detailed Description"
        assert "time" in talk and talk["time"], "Talk must have a Time of the talk"

def test_speaker_required_fields():
    """Requirement 5: Each speaker has a First Name, Last Name, and LinkedIn URL."""
    for talk in TALKS:
        for speaker in talk["speakers"]:
            assert "first_name" in speaker and speaker["first_name"], f"Speaker missing first name in talk {talk['id']}"
            assert "last_name" in speaker and speaker["last_name"], f"Speaker missing last name in talk {talk['id']}"
            assert "linkedin_url" in speaker and speaker["linkedin_url"], f"Speaker missing LinkedIn in talk {talk['id']}"
            assert speaker["linkedin_url"].startswith("https://www.linkedin.com/in/"), (
                f"Invalid LinkedIn URL format for {speaker['first_name']} {speaker['last_name']}: {speaker['linkedin_url']}"
            )

def test_lunch_break_duration():
    """Requirement 7: Give a lunch break of 60 minutes."""
    lunch_items = [item for item in FULL_SCHEDULE if item.get("type") == "lunch"]
    assert len(lunch_items) == 1, "Expected exactly 1 lunch item in schedule"
    lunch = lunch_items[0]
    assert lunch.get("duration_minutes") == 60, f"Expected 60 min lunch break, got {lunch.get('duration_minutes')}"
    assert "60" in lunch.get("title", "") or lunch.get("duration_minutes") == 60

def test_google_cloud_theme_content():
    """Requirement 8: Dummy data for events and speakers, about Google Cloud Technologies."""
    all_text = " ".join([t["title"] + " " + t["description"] for t in TALKS])
    gcp_keywords = ["Vertex AI", "BigQuery", "GKE", "Cloud Run", "Cloud Spanner", "TPU"]
    for kw in gcp_keywords:
        assert kw in all_text, f"Expected Google Cloud topic '{kw}' to be represented in talks"

def test_search_and_filter_logic():
    """Requirement 6: Allow users to search by category, speaker, title."""
    # Search by Category
    genai_talks = filter_talks(category="Generative AI")
    assert len(genai_talks) >= 1
    for t in genai_talks:
        assert "Generative AI" in t["categories"]

    data_talks = filter_talks(category="Data & Analytics")
    assert len(data_talks) >= 1
    for t in data_talks:
        assert "Data & Analytics" in t["categories"]

    # Search by Speaker
    sundar_talks = filter_talks(speaker="Sundar")
    assert len(sundar_talks) == 1
    assert sundar_talks[0]["id"] == "talk-1"

    kelsey_talks = filter_talks(speaker="Kelsey")
    assert len(kelsey_talks) == 1
    assert kelsey_talks[0]["id"] == "talk-3"

    # Search by Title keyword
    spanner_talks = filter_talks(query="Spanner")
    assert len(spanner_talks) == 1
    assert spanner_talks[0]["id"] == "talk-6"

    # Combined filter
    combined = filter_talks(query="Gemini", category="Generative AI", speaker="Sundar")
    assert len(combined) == 1
    assert combined[0]["id"] == "talk-1"

def test_api_talks_endpoint(client):
    """Test /api/talks endpoint."""
    response = client.get('/api/talks')
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True
    assert data["total"] == 8
    assert len(data["talks"]) == 8

    # Filtered via API query params
    res_cat = client.get('/api/talks?category=Data%20%26%20Analytics')
    assert res_cat.status_code == 200
    data_cat = res_cat.get_json()
    assert len(data_cat["talks"]) >= 1

    res_spk = client.get('/api/talks?speaker=Gerrit')
    assert res_spk.status_code == 200
    data_spk = res_spk.get_json()
    assert len(data_spk["talks"]) == 1

def test_api_single_talk_and_404(client):
    """Test /api/talks/<id> endpoint and not found behavior."""
    response = client.get('/api/talks/talk-1')
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True
    assert data["talk"]["id"] == "talk-1"

    response_404 = client.get('/api/talks/non-existent-talk')
    assert response_404.status_code == 404
    assert response_404.get_json()["success"] is False

def test_api_speakers_and_schedule(client):
    """Test /api/speakers and /api/schedule endpoints."""
    res_spk = client.get('/api/speakers')
    assert res_spk.status_code == 200
    spk_data = res_spk.get_json()
    assert spk_data["success"] is True
    assert spk_data["count"] >= 8

    res_sch = client.get('/api/schedule')
    assert res_sch.status_code == 200
    sch_data = res_sch.get_json()
    assert sch_data["success"] is True
    assert len(sch_data["schedule"]) > 8

def test_talk_detail_route(client):
    """Test /talk/<talk_id> route."""
    response = client.get('/talk/talk-1')
    assert response.status_code == 200
    html = response.get_data(as_text=True)
    assert "Building Agentic Applications" in html
    assert "Sundar Pichai" in html
    assert "https://www.linkedin.com/in/sundarpichai" in html

    # Invalid talk
    res_404 = client.get('/talk/invalid-talk-999')
    assert res_404.status_code == 404
    assert "404" in res_404.get_data(as_text=True)

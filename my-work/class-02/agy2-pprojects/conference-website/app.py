"""
Flask Application for CloudNext Horizon 2026 Technical Conference.
"""
from datetime import datetime
from flask import Flask, render_template, request, jsonify, abort
from data import (
    CONFERENCE_INFO,
    CATEGORIES,
    TALKS,
    FULL_SCHEDULE,
    get_unique_speakers,
    get_talk_by_id,
    filter_talks
)

app = Flask(__name__)

@app.context_processor
def inject_global_data():
    """Inject common template data like current date and conference metadata."""
    now = datetime.now()
    return {
        "current_date_formatted": now.strftime("%A, %B %d, %Y"),
        "current_time_formatted": now.strftime("%I:%M %p"),
        "current_year": now.year,
        "conference": CONFERENCE_INFO,
        "all_categories": CATEGORIES
    }

@app.route("/")
def index():
    """Main conference home page with schedule, talks, filters, and speakers."""
    query = request.args.get("q", "").strip()
    category = request.args.get("category", "").strip()
    speaker = request.args.get("speaker", "").strip()

    filtered_talks_list = filter_talks(query=query, category=category, speaker=speaker)
    unique_speakers = get_unique_speakers()

    return render_template(
        "index.html",
        talks=filtered_talks_list,
        total_talks_count=len(TALKS),
        all_talks=TALKS,
        schedule=FULL_SCHEDULE,
        speakers=unique_speakers,
        categories=CATEGORIES,
        selected_category=category,
        selected_speaker=speaker,
        search_query=query
    )

@app.route("/talk/<talk_id>")
def talk_detail(talk_id):
    """Detailed view for an individual talk."""
    talk = get_talk_by_id(talk_id)
    if not talk:
        abort(404, description=f"Talk with ID '{talk_id}' not found.")
    return render_template("talk_detail.html", talk=talk)

# ==========================================
# REST API Endpoints for dynamic client apps
# ==========================================

@app.route("/api/talks", methods=["GET"])
def api_get_talks():
    """API endpoint to get and filter talks."""
    query = request.args.get("q")
    category = request.args.get("category")
    speaker = request.args.get("speaker")
    
    results = filter_talks(query=query, category=category, speaker=speaker)
    return jsonify({
        "success": True,
        "count": len(results),
        "total": len(TALKS),
        "talks": results
    })

@app.route("/api/talks/<talk_id>", methods=["GET"])
def api_get_talk(talk_id):
    """API endpoint to retrieve a single talk by ID."""
    talk = get_talk_by_id(talk_id)
    if not talk:
        return jsonify({"success": False, "error": "Talk not found"}), 404
    return jsonify({"success": True, "talk": talk})

@app.route("/api/speakers", methods=["GET"])
def api_get_speakers():
    """API endpoint to get all conference speakers."""
    speakers = get_unique_speakers()
    return jsonify({
        "success": True,
        "count": len(speakers),
        "speakers": speakers
    })

@app.route("/api/schedule", methods=["GET"])
def api_get_schedule():
    """API endpoint to get the complete timetable."""
    return jsonify({
        "success": True,
        "conference": CONFERENCE_INFO,
        "schedule": FULL_SCHEDULE
    })

@app.errorhandler(404)
def not_found_error(error):
    return render_template("404.html", error=error), 404

@app.errorhandler(500)
def internal_error(error):
    return render_template("500.html", error=error), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5050, debug=True)

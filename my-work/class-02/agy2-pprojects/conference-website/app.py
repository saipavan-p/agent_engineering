import os
import json
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

DATA_FILE = os.path.join(app.root_path, 'data', 'conference_data.json')

def load_data():
    """Load and parse the conference dataset from JSON file."""
    if not os.path.exists(DATA_FILE):
        return {"conference": {}, "schedule": []}
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

@app.route('/')
def index():
    """Render main 1-day conference homepage."""
    data = load_data()
    conference = data.get('conference', {})
    schedule = data.get('schedule', [])
    
    # Extract unique categories
    categories = set()
    speakers = []
    talks_only = []
    
    for item in schedule:
        if item.get('type') == 'talk':
            talks_only.append(item)
            for cat in item.get('categories', []):
                categories.add(cat)
            for spk in item.get('speakers', []):
                if spk not in speakers:
                    speakers.append(spk)

    return render_template(
        'index.html',
        conference=conference,
        schedule=schedule,
        talks=talks_only,
        categories=sorted(list(categories)),
        speakers=speakers,
        total_talks=len(talks_only)
    )

@app.route('/api/talks', methods=['GET'])
def get_talks():
    """API endpoint for fetching and filtering talks."""
    data = load_data()
    schedule = data.get('schedule', [])
    
    query = request.args.get('q', '').strip().lower()
    category = request.args.get('category', '').strip()
    speaker_filter = request.args.get('speaker', '').strip().lower()
    include_breaks = request.args.get('include_breaks', 'true').lower() == 'true'

    filtered = []
    for item in schedule:
        if item.get('type') == 'break':
            if include_breaks and not category and not speaker_filter and not query:
                filtered.append(item)
            continue

        # Check category match
        if category and category not in item.get('categories', []):
            continue

        # Check speaker match
        if speaker_filter:
            speaker_match = False
            for spk in item.get('speakers', []):
                full_name = f"{spk.get('firstName', '')} {spk.get('lastName', '')}".lower()
                spk_id = spk.get('id', '').lower()
                if speaker_filter in full_name or speaker_filter == spk_id:
                    speaker_match = True
                    break
            if not speaker_match:
                continue

        # Check title / speaker / description text query
        if query:
            title_match = query in item.get('title', '').lower()
            desc_match = query in item.get('description', '').lower()
            spk_match = any(
                query in f"{s.get('firstName', '')} {s.get('lastName', '')}".lower()
                or query in s.get('role', '').lower()
                or query in s.get('company', '').lower()
                for s in item.get('speakers', [])
            )
            cat_match = any(query in c.lower() for c in item.get('categories', []))
            
            if not (title_match or desc_match or spk_match or cat_match):
                continue

        filtered.append(item)

    return jsonify({
        "status": "success",
        "count": len(filtered),
        "data": filtered
    })

@app.route('/api/talks/<talk_id>', methods=['GET'])
def get_talk_detail(talk_id):
    """API endpoint for fetching single talk details by ID."""
    data = load_data()
    schedule = data.get('schedule', [])
    for item in schedule:
        if item.get('id') == talk_id:
            return jsonify({"status": "success", "data": item})
    return jsonify({"status": "error", "message": "Talk not found"}), 404

@app.route('/api/categories', methods=['GET'])
def get_categories():
    """API endpoint to get available categories with talk counts."""
    data = load_data()
    schedule = data.get('schedule', [])
    cat_counts = {}
    for item in schedule:
        if item.get('type') == 'talk':
            for cat in item.get('categories', []):
                cat_counts[cat] = cat_counts.get(cat, 0) + 1
    
    categories_list = [{"name": cat, "count": count} for cat, count in cat_counts.items()]
    categories_list.sort(key=lambda x: x['name'])
    return jsonify({"status": "success", "data": categories_list})

@app.route('/api/speakers', methods=['GET'])
def get_speakers():
    """API endpoint to get list of all speakers."""
    data = load_data()
    schedule = data.get('schedule', [])
    speakers_dict = {}
    for item in schedule:
        if item.get('type') == 'talk':
            for spk in item.get('speakers', []):
                spk_id = spk.get('id')
                if spk_id and spk_id not in speakers_dict:
                    speakers_dict[spk_id] = spk

    return jsonify({"status": "success", "data": list(speakers_dict.values())})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5050))
    app.run(host='0.0.0.0', port=port, debug=True)


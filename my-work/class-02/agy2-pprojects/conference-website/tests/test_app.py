import os
import json
import unittest
from app import app

class ConferenceWebsiteTestCase(unittest.TestCase):
    """Test suite for Google Cloud Technical Summit 2026 application."""

    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True

    def test_homepage_loads(self):
        """Test homepage loads successfully (HTTP 200)."""
        response = self.app.get('/')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'Google Cloud Technical Summit 2026', response.data)
        self.assertIn(b'Timetable', response.data)

    def test_total_talks_count(self):
        """Requirement 2: Verify total talks count (now 10 talks)."""
        response = self.app.get('/api/talks?include_breaks=false')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        talks = [item for item in data['data'] if item.get('type') == 'talk']
        self.assertEqual(len(talks), 10, f"Expected 10 talks, found {len(talks)}")


    def test_speakers_per_talk_limit(self):
        """Requirement 3: Each talk must have 1 or 2 max speakers."""
        response = self.app.get('/api/talks?include_breaks=false')
        data = json.loads(response.data)
        for talk in data['data']:
            if talk.get('type') == 'talk':
                num_speakers = len(talk.get('speakers', []))
                self.assertTrue(
                    1 <= num_speakers <= 2,
                    f"Talk {talk.get('id')} has {num_speakers} speakers (allowed 1 or 2)."
                )

    def test_talk_attributes(self):
        """Requirement 4: Each talk has ID, Title, Speakers, Category (1 or 2), Description, and Time."""
        response = self.app.get('/api/talks?include_breaks=false')
        data = json.loads(response.data)
        for talk in data['data']:
            if talk.get('type') == 'talk':
                self.assertIn('id', talk)
                self.assertIn('title', talk)
                self.assertIn('speakers', talk)
                self.assertIn('categories', talk)
                self.assertIn('description', talk)
                self.assertIn('time', talk)
                
                # Check categories count (1 or 2 max)
                num_categories = len(talk.get('categories', []))
                self.assertTrue(
                    1 <= num_categories <= 2,
                    f"Talk {talk.get('id')} has {num_categories} categories (allowed 1 or 2)."
                )

    def test_speaker_attributes(self):
        """Requirement 5: Each speaker has First Name, Last Name, and LinkedIn url."""
        response = self.app.get('/api/speakers')
        data = json.loads(response.data)
        speakers = data['data']
        self.assertGreater(len(speakers), 0)
        for speaker in speakers:
            self.assertIn('firstName', speaker)
            self.assertIn('lastName', speaker)
            self.assertIn('linkedin', speaker)
            self.assertTrue(speaker['linkedin'].startswith('https://www.linkedin.com/'))

    def test_lunch_break_duration(self):
        """Requirement 7: Lunch break of 60 minutes."""
        response = self.app.get('/api/talks?include_breaks=true')
        data = json.loads(response.data)
        breaks = [item for item in data['data'] if item.get('type') == 'break']
        self.assertEqual(len(breaks), 1, "Expected 1 lunch break entry.")
        lunch = breaks[0]
        self.assertEqual(lunch.get('durationMinutes'), 60, "Lunch break must be 60 minutes.")

    def test_search_by_category(self):
        """Requirement 6: Search by category."""
        response = self.app.get('/api/talks?category=AI%20%26%20Machine%20Learning&include_breaks=false')
        data = json.loads(response.data)
        self.assertGreater(len(data['data']), 0)
        for talk in data['data']:
            self.assertIn('AI & Machine Learning', talk['categories'])

    def test_search_by_speaker(self):
        """Requirement 6: Search by speaker."""
        response = self.app.get('/api/talks?q=Marcus&include_breaks=false')
        data = json.loads(response.data)
        self.assertGreaterEqual(len(data['data']), 1)
        speaker_found = False
        for talk in data['data']:
            for s in talk['speakers']:
                if s['firstName'] == 'Marcus':
                    speaker_found = True
        self.assertTrue(speaker_found)

    def test_search_by_title(self):
        """Requirement 6: Search by talk title."""
        response = self.app.get('/api/talks?q=Vertex%20AI&include_breaks=false')
        data = json.loads(response.data)
        self.assertGreaterEqual(len(data['data']), 1)
        self.assertIn('Vertex AI', data['data'][0]['title'])


    def test_single_talk_detail(self):
        """Test API endpoint /api/talks/<id>."""
        response = self.app.get('/api/talks/talk-1')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['data']['id'], 'talk-1')

if __name__ == '__main__':
    unittest.main()

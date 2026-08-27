"""
Conference data for CloudNext Horizon 2026: Google Cloud & AI Summit.
Contains complete schedule, 8 technical talks, speakers, and metadata.
"""
from datetime import datetime

CONFERENCE_INFO = {
    "name": "CloudNext Horizon 2026",
    "tagline": "Google Cloud & AI Innovation Summit",
    "date_display": "Saturday, October 24, 2026",
    "date_iso": "2026-10-24",
    "location": "Google Bay View Campus, Mountain View, CA & Hybrid Livestream",
    "address": "2000 N Shoreline Blvd, Mountain View, CA 94043",
    "description": "A premier 1-day technical conference bringing together cloud architects, AI engineers, developers, and technology leaders to explore cutting-edge Google Cloud innovations, Gemini AI, GKE, BigQuery, and enterprise cloud architectures.",
    "stats": {
        "talks": 8,
        "tracks": 1,
        "speakers": 12,
        "attendees": "1,500+"
    }
}

CATEGORIES = [
    "Generative AI",
    "Data & Analytics",
    "Cloud Architecture & DevOps",
    "Kubernetes & Containers",
    "Security & Governance",
    "Serverless & App Modernization"
]

TALKS = [
    {
        "id": "talk-1",
        "title": "Building Agentic Applications with Gemini 1.5 Pro & Vertex AI",
        "time": "09:00 AM - 09:45 AM",
        "start_time": "09:00",
        "end_time": "09:45",
        "categories": ["Generative AI", "Cloud Architecture & DevOps"],
        "description": "Discover how to leverage Google's multimodal Gemini models on Vertex AI to design, build, and orchestrate autonomous AI agents. We will explore function calling, Grounding with Google Search, vector embeddings, and enterprise-grade prompt orchestration patterns.",
        "room": "Main Auditorium (Track Alpha)",
        "level": "Intermediate to Advanced",
        "speakers": [
            {
                "first_name": "Sundar",
                "last_name": "Pichai",
                "linkedin_url": "https://www.linkedin.com/in/sundarpichai",
                "role": "CEO",
                "company": "Alphabet & Google",
                "avatar_color": "#1a73e8",
                "bio": "Leading Google's AI-first mission, advancing frontier models, and guiding next-generation cloud infrastructure innovation."
            }
        ]
    },
    {
        "id": "talk-2",
        "title": "Modern Lakehouse Architectures with BigQuery and Apache Iceberg",
        "time": "09:45 AM - 10:30 AM",
        "start_time": "09:45",
        "end_time": "10:30",
        "categories": ["Data & Analytics"],
        "description": "Learn how BigLake and BigQuery's native Apache Iceberg support provide open, zero-copy analytics across multi-cloud storage. Explore performance tuning, partition clustering, federated governance, and real-time streaming ingestion at scale.",
        "room": "Main Auditorium (Track Alpha)",
        "level": "Intermediate",
        "speakers": [
            {
                "first_name": "Gerrit",
                "last_name": "Kazmaier",
                "linkedin_url": "https://www.linkedin.com/in/gerritkazmaier",
                "role": "VP & GM of Database & Data Analytics",
                "company": "Google Cloud",
                "avatar_color": "#34a853",
                "bio": "Pioneering unified open data ecosystems and cloud-scale analytical databases."
            },
            {
                "first_name": "Elena",
                "last_name": "Rostova",
                "linkedin_url": "https://www.linkedin.com/in/elena-rostova-data",
                "role": "Principal BigQuery Architect",
                "company": "DataScale Inc.",
                "avatar_color": "#fbbc04",
                "bio": "Specializes in multi-petabyte real-time data streaming architectures and Iceberg table optimization."
            }
        ]
    },
    {
        "id": "talk-3",
        "title": "Autopilot at Scale: Production GKE Microservices & Cloud Service Mesh",
        "time": "10:45 AM - 11:30 AM",
        "start_time": "10:45",
        "end_time": "11:30",
        "categories": ["Kubernetes & Containers", "Cloud Architecture & DevOps"],
        "description": "Dive deep into running mission-critical multi-cluster GKE Autopilot workloads in production. Learn how to configure automated autoscaling, cost optimization, Cloud Service Mesh (managed Istio), and zero-downtime rolling upgrades.",
        "room": "Main Auditorium (Track Alpha)",
        "level": "Advanced",
        "speakers": [
            {
                "first_name": "Kelsey",
                "last_name": "Hightower",
                "linkedin_url": "https://www.linkedin.com/in/kelseyhightower",
                "role": "Distinguished Engineer & Cloud Advocate",
                "company": "Independent",
                "avatar_color": "#ea4335",
                "bio": "Kubernetes pioneer, author, and open-source cloud native leader helping engineers build reliable systems."
            }
        ]
    },
    {
        "id": "talk-4",
        "title": "Zero Trust & SAIF: Securing Generative AI Systems on Google Cloud",
        "time": "11:30 AM - 12:15 PM",
        "start_time": "11:30",
        "end_time": "12:15",
        "categories": ["Security & Governance", "Generative AI"],
        "description": "Explore Google Cloud's Secure AI Framework (SAIF) and Zero Trust architecture with BeyondCorp Enterprise. Learn to protect AI models from prompt injections, secure data pipelines, and implement confidential computing enclaves.",
        "room": "Main Auditorium (Track Alpha)",
        "level": "Intermediate to Advanced",
        "speakers": [
            {
                "first_name": "Phil",
                "last_name": "Venables",
                "linkedin_url": "https://www.linkedin.com/in/philvenables",
                "role": "Chief Information Security Officer (CISO)",
                "company": "Google Cloud",
                "avatar_color": "#4285f4",
                "bio": "Thought leader on enterprise cybersecurity risk, operational resilience, and AI safety."
            },
            {
                "first_name": "Maya",
                "last_name": "Lin",
                "linkedin_url": "https://www.linkedin.com/in/maya-lin-sec",
                "role": "Senior Cloud Security Engineer",
                "company": "CyberShield Solutions",
                "avatar_color": "#9c27b0",
                "bio": "Expert in identity federation, workload identity pools, and cloud compliance architecture."
            }
        ]
    },
    {
        "id": "talk-5",
        "title": "Event-Driven Microservices with Cloud Run, Eventarc & Workflows",
        "time": "01:15 PM - 02:00 PM",
        "start_time": "13:15",
        "end_time": "14:00",
        "categories": ["Serverless & App Modernization"],
        "description": "Master asynchronous microservices orchestration on Cloud Run. We will demonstrate how Eventarc routes events from 130+ Google Cloud sources and how Cloud Workflows coordinates resilient, multi-step business transactions without managing servers.",
        "room": "Main Auditorium (Track Alpha)",
        "level": "All Levels",
        "speakers": [
            {
                "first_name": "Guillaume",
                "last_name": "Laforge",
                "linkedin_url": "https://www.linkedin.com/in/glaforge",
                "role": "Developer Advocate for Serverless",
                "company": "Google Cloud",
                "avatar_color": "#009688",
                "bio": "Passionate about simplifying developer experiences with serverless containers and event-driven patterns."
            }
        ]
    },
    {
        "id": "talk-6",
        "title": "Mastering Globally Distributed Relational Data with Cloud Spanner",
        "time": "02:00 PM - 02:45 PM",
        "start_time": "14:00",
        "end_time": "14:45",
        "categories": ["Data & Analytics", "Cloud Architecture & DevOps"],
        "description": "Unpack Cloud Spanner's TrueTime atomic clock synchronization and dual-engine architecture. Discover how to achieve 99.999% availability with strongly consistent transactions across multiple continents without downtime.",
        "room": "Main Auditorium (Track Alpha)",
        "level": "Advanced",
        "speakers": [
            {
                "first_name": "Andi",
                "last_name": "Gutmans",
                "linkedin_url": "https://www.linkedin.com/in/andigutmans",
                "role": "VP & GM of Databases",
                "company": "Google Cloud",
                "avatar_color": "#ff5722",
                "bio": "Database veteran driving globally distributed transactional engines and database migration tooling."
            },
            {
                "first_name": "David",
                "last_name": "Chen",
                "linkedin_url": "https://www.linkedin.com/in/david-chen-fintech",
                "role": "Lead Infrastructure Architect",
                "company": "Apex Global FinTech",
                "avatar_color": "#673ab7",
                "bio": "Architecting high-frequency global banking systems and mission-critical ledgers on Cloud Spanner."
            }
        ]
    },
    {
        "id": "talk-7",
        "title": "Enterprise MLOps: Automating Continuous Training on Vertex AI Pipelines",
        "time": "03:00 PM - 03:45 PM",
        "start_time": "15:00",
        "end_time": "15:45",
        "categories": ["Generative AI", "Cloud Architecture & DevOps"],
        "description": "Learn to build reproducible, production-grade Machine Learning pipelines using Vertex AI Pipelines and Kubeflow. Cover experiment tracking, Model Registry, automated drift detection, and CI/CD for LLM fine-tuning.",
        "room": "Main Auditorium (Track Alpha)",
        "level": "Intermediate",
        "speakers": [
            {
                "first_name": "Priya",
                "last_name": "Natarajan",
                "linkedin_url": "https://www.linkedin.com/in/priya-natarajan-ml",
                "role": "Staff ML Engineer & AI Tech Lead",
                "company": "Vertex Labs",
                "avatar_color": "#3f51b5",
                "bio": "Building automated Kubeflow pipelines and continuous model evaluation systems for large enterprises."
            }
        ]
    },
    {
        "id": "talk-8",
        "title": "High-Performance AI Compute: Scaling Training with Cloud TPU v5e & NVIDIA H100s",
        "time": "03:45 PM - 04:30 PM",
        "start_time": "15:45",
        "end_time": "16:30",
        "categories": ["Cloud Architecture & DevOps", "Generative AI"],
        "description": "Explore the cutting-edge supercomputing infrastructure powering frontier foundation models. Dive into Cloud TPU v5e pods, TPU v5p multi-slice training, NVIDIA H100 GPU clusters, and Google's Optical Circuit Switching (OCS) network topology.",
        "room": "Main Auditorium (Track Alpha)",
        "level": "Advanced",
        "speakers": [
            {
                "first_name": "Mark",
                "last_name": "Lohmeyer",
                "linkedin_url": "https://www.linkedin.com/in/marklohmeyer",
                "role": "VP & GM of Compute and ML Infrastructure",
                "company": "Google Cloud",
                "avatar_color": "#00897b",
                "bio": "Leading compute, storage, networking, and custom silicon infrastructure at Google Cloud."
            },
            {
                "first_name": "Sophia",
                "last_name": "Vargas",
                "linkedin_url": "https://www.linkedin.com/in/sophia-vargas-research",
                "role": "Principal Infrastructure Researcher",
                "company": "OpenAI Research Partner",
                "avatar_color": "#e91e63",
                "bio": "Researching large model distributed training topology, memory bandwidth, and thermal dissipation in hyper-scale clusters."
            }
        ]
    }
]

# Complete 1-day event timetable including breaks and 60-minute lunch
FULL_SCHEDULE = [
    {
        "type": "event",
        "time": "08:00 AM - 09:00 AM",
        "title": "Registration, Breakfast & Networking",
        "description": "Check-in at the registration desk, badge pickup, morning coffee, and light breakfast.",
        "location": "Grand Foyer & Innovation Hall"
    },
    {
        "type": "talk",
        "talk_id": "talk-1",
        "time": "09:00 AM - 09:45 AM",
        "title": TALKS[0]["title"],
        "categories": TALKS[0]["categories"],
        "speakers": TALKS[0]["speakers"],
        "location": TALKS[0]["room"]
    },
    {
        "type": "talk",
        "talk_id": "talk-2",
        "time": "09:45 AM - 10:30 AM",
        "title": TALKS[1]["title"],
        "categories": TALKS[1]["categories"],
        "speakers": TALKS[1]["speakers"],
        "location": TALKS[1]["room"]
    },
    {
        "type": "break",
        "time": "10:30 AM - 10:45 AM",
        "duration_minutes": 15,
        "title": "Morning Coffee & Sponsor Expo",
        "description": "Enjoy artisanal refreshments and visit sponsor demo booths in the technology showcase.",
        "location": "Grand Foyer & Demo Lounge"
    },
    {
        "type": "talk",
        "talk_id": "talk-3",
        "time": "10:45 AM - 11:30 AM",
        "title": TALKS[2]["title"],
        "categories": TALKS[2]["categories"],
        "speakers": TALKS[2]["speakers"],
        "location": TALKS[2]["room"]
    },
    {
        "type": "talk",
        "talk_id": "talk-4",
        "time": "11:30 AM - 12:15 PM",
        "title": TALKS[3]["title"],
        "categories": TALKS[3]["categories"],
        "speakers": TALKS[3]["speakers"],
        "location": TALKS[3]["room"]
    },
    {
        "type": "lunch",
        "time": "12:15 PM - 01:15 PM",
        "duration_minutes": 60,
        "title": "Lunch Break & Executive Networking (60 Mins)",
        "description": "Full catered buffet lunch with dietary accommodations, outdoor terrace seating, and informal roundtable discussions.",
        "location": "Dining Pavilion & Garden Terrace"
    },
    {
        "type": "talk",
        "talk_id": "talk-5",
        "time": "01:15 PM - 02:00 PM",
        "title": TALKS[4]["title"],
        "categories": TALKS[4]["categories"],
        "speakers": TALKS[4]["speakers"],
        "location": TALKS[4]["room"]
    },
    {
        "type": "talk",
        "talk_id": "talk-6",
        "time": "02:00 PM - 02:45 PM",
        "title": TALKS[5]["title"],
        "categories": TALKS[5]["categories"],
        "speakers": TALKS[5]["speakers"],
        "location": TALKS[5]["room"]
    },
    {
        "type": "break",
        "time": "02:45 PM - 03:00 PM",
        "duration_minutes": 15,
        "title": "Afternoon Refreshments & Hands-on Labs",
        "description": "Afternoon tea, espresso bar, and interactive codelabs at the Google Cloud developer station.",
        "location": "Grand Foyer & Sandbox Area"
    },
    {
        "type": "talk",
        "talk_id": "talk-7",
        "time": "03:00 PM - 03:45 PM",
        "title": TALKS[6]["title"],
        "categories": TALKS[6]["categories"],
        "speakers": TALKS[6]["speakers"],
        "location": TALKS[6]["room"]
    },
    {
        "type": "talk",
        "talk_id": "talk-8",
        "time": "03:45 PM - 04:30 PM",
        "title": TALKS[7]["title"],
        "categories": TALKS[7]["categories"],
        "speakers": TALKS[7]["speakers"],
        "location": TALKS[7]["room"]
    },
    {
        "type": "event",
        "time": "04:30 PM - 05:30 PM",
        "title": "Closing Keynote, Q&A & Evening Reception",
        "description": "Community wrap-up, prize giveaways, open speaker Q&A, and networking reception with refreshments.",
        "location": "Main Auditorium & Rooftop Terrace"
    }
]

def get_unique_speakers():
    """Extract unique list of speakers across all talks."""
    seen = set()
    unique = []
    for talk in TALKS:
        for sp in talk["speakers"]:
            key = f"{sp['first_name']} {sp['last_name']}".lower()
            if key not in seen:
                seen.add(key)
                # Attach associated talk info
                speaker_data = dict(sp)
                speaker_data["talk_id"] = talk["id"]
                speaker_data["talk_title"] = talk["title"]
                speaker_data["full_name"] = f"{sp['first_name']} {sp['last_name']}"
                unique.append(speaker_data)
    return unique

def get_talk_by_id(talk_id):
    """Retrieve talk by ID."""
    for talk in TALKS:
        if talk["id"] == talk_id:
            return talk
    return None

def filter_talks(query=None, category=None, speaker=None):
    """Filter talks based on text query, category, and speaker name."""
    results = TALKS
    
    if category and category.strip() and category.lower() != "all":
        cat_lower = category.strip().lower()
        results = [
            t for t in results
            if any(cat_lower == c.lower() for c in t.get("categories", []))
        ]
        
    if speaker and speaker.strip():
        spk_lower = speaker.strip().lower()
        results = [
            t for t in results
            if any(
                spk_lower in f"{s['first_name']} {s['last_name']}".lower()
                for s in t.get("speakers", [])
            )
        ]
        
    if query and query.strip():
        q_lower = query.strip().lower()
        results = [
            t for t in results
            if q_lower in t["title"].lower()
            or q_lower in t["description"].lower()
            or any(q_lower in c.lower() for c in t.get("categories", []))
            or any(
                q_lower in f"{s['first_name']} {s['last_name']}".lower()
                for s in t.get("speakers", [])
            )
        ]
        
    return results

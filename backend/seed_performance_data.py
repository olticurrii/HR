"""Seed performance data for testing"""
import sqlite3
from datetime import datetime, timedelta

db_path = "hr_app.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print("🌱 Seeding performance data...")

# Get first few users
cursor.execute("SELECT id, full_name FROM users LIMIT 5")
users = cursor.fetchall()

if not users:
    print("❌ No users found. Please run init_db.py first.")
    exit(1)

# Create some competencies
competencies = [
    ("Leadership", "Ability to lead and inspire teams"),
    ("Communication", "Clear and effective communication skills"),
    ("Technical Skills", "Technical knowledge and expertise"),
    ("Problem Solving", "Analytical and creative problem-solving"),
    ("Teamwork", "Collaboration and teamwork abilities")
]

print("Creating competencies...")
for name, desc in competencies:
    cursor.execute(
        "INSERT OR IGNORE INTO competencies (name, description) VALUES (?, ?)",
        (name, desc)
    )
conn.commit()

# Get competency IDs
cursor.execute("SELECT id, name FROM competencies")
comp_ids = cursor.fetchall()

# Create a review cycle
print("Creating review cycle...")
now = datetime.now()
start_date = (now - timedelta(days=30)).isoformat()
end_date = (now + timedelta(days=30)).isoformat()

cursor.execute(
    """INSERT INTO review_cycles (name, start_date, end_date, status)
       VALUES (?, ?, ?, 'active')""",
    ("Q1 2025 Performance Review", start_date, end_date)
)
cycle_id = cursor.lastrowid
conn.commit()

# Create review questions
print("Creating review questions...")
questions = [
    ("manager", "How would you rate this employee's overall performance?"),
    ("manager", "How effectively does this employee collaborate with the team?"),
    ("manager", "How well does this employee meet deadlines and deliverables?"),
    ("self", "How would you rate your own performance this quarter?"),
    ("self", "What are your biggest accomplishments this quarter?"),
    ("self", "What areas would you like to improve?"),
]

for section, prompt in questions:
    cursor.execute(
        """INSERT INTO review_questions (cycle_id, section, prompt, scale_min, scale_max)
           VALUES (?, ?, ?, 1, 5)""",
        (cycle_id, section, prompt)
    )
conn.commit()

# Create objectives and key results for first 3 users
print("Creating objectives and key results...")
for user_id, full_name in users[:3]:
    # Objective 1
    cursor.execute(
        """INSERT INTO performance_objectives 
           (user_id, title, description, status, start_date, due_date, progress)
           VALUES (?, ?, ?, 'active', ?, ?, ?)""",
        (
            user_id,
            "Improve Team Productivity",
            "Lead initiatives to increase team efficiency and output",
            (now - timedelta(days=60)).isoformat(),
            (now + timedelta(days=30)).isoformat(),
            65.0
        )
    )
    obj1_id = cursor.lastrowid
    
    # Key results for objective 1
    krs_obj1 = [
        ("Reduce average task completion time by 20%", 20.0, 15.0, "%", "in_progress", 75.0),
        ("Implement 2 new automation tools", 2.0, 2.0, "#", "done", 100.0),
        ("Achieve 90% team satisfaction score", 90.0, 80.0, "%", "in_progress", 89.0),
    ]
    
    for title, target, current, unit, status, progress in krs_obj1:
        cursor.execute(
            """INSERT INTO performance_key_results
               (objective_id, title, target_value, current_value, unit, weight, status, progress)
               VALUES (?, ?, ?, ?, ?, 1.0, ?, ?)""",
            (obj1_id, title, target, current, unit, status, progress)
        )
    
    # Objective 2
    cursor.execute(
        """INSERT INTO performance_objectives 
           (user_id, title, description, status, start_date, due_date, progress)
           VALUES (?, ?, ?, 'active', ?, ?, ?)""",
        (
            user_id,
            "Enhance Technical Skills",
            "Complete certifications and contribute to technical documentation",
            (now - timedelta(days=45)).isoformat(),
            (now + timedelta(days=45)).isoformat(),
            40.0
        )
    )
    obj2_id = cursor.lastrowid
    
    # Key results for objective 2
    krs_obj2 = [
        ("Complete 3 online courses", 3.0, 1.0, "#", "in_progress", 33.0),
        ("Write 5 technical blog posts", 5.0, 2.0, "#", "in_progress", 40.0),
        ("Mentor 2 junior developers", 2.0, 1.0, "#", "in_progress", 50.0),
    ]
    
    for title, target, current, unit, status, progress in krs_obj2:
        cursor.execute(
            """INSERT INTO performance_key_results
               (objective_id, title, target_value, current_value, unit, weight, status, progress)
               VALUES (?, ?, ?, ?, ?, 1.0, ?, ?)""",
            (obj2_id, title, target, current, unit, status, progress)
        )

conn.commit()

# Create competency scores for first 3 users
print("Creating competency scores...")
import random

for user_id, full_name in users[:3]:
    for comp_id, comp_name in comp_ids:
        # Self score
        cursor.execute(
            """INSERT INTO competency_scores (cycle_id, user_id, competency_id, source, score)
               VALUES (?, ?, ?, 'self', ?)""",
            (cycle_id, user_id, comp_id, random.uniform(3.0, 4.5))
        )
        
        # Manager score (slightly different)
        cursor.execute(
            """INSERT INTO competency_scores (cycle_id, user_id, competency_id, source, score)
               VALUES (?, ?, ?, 'manager', ?)""",
            (cycle_id, user_id, comp_id, random.uniform(3.5, 5.0))
        )
        
        # Peer score
        cursor.execute(
            """INSERT INTO competency_scores (cycle_id, user_id, competency_id, source, score)
               VALUES (?, ?, ?, 'peer', ?)""",
            (cycle_id, user_id, comp_id, random.uniform(3.0, 4.8))
        )

conn.commit()

# Create some review responses
print("Creating review responses...")
cursor.execute("SELECT id FROM review_questions WHERE section = 'self' LIMIT 2")
self_questions = [q[0] for q in cursor.fetchall()]

cursor.execute("SELECT id FROM review_questions WHERE section = 'manager' LIMIT 2")
manager_questions = [q[0] for q in cursor.fetchall()]

for user_id, full_name in users[:2]:
    # Self reviews
    for q_id in self_questions:
        cursor.execute(
            """INSERT INTO review_responses 
               (cycle_id, reviewee_id, reviewer_id, reviewer_type, question_id, rating, comment)
               VALUES (?, ?, ?, 'self', ?, ?, ?)""",
            (
                cycle_id,
                user_id,
                user_id,
                q_id,
                random.randint(3, 5),
                "This is a sample self-review comment."
            )
        )
    
    # Manager reviews (use user 1 as manager)
    for q_id in manager_questions:
        cursor.execute(
            """INSERT INTO review_responses 
               (cycle_id, reviewee_id, reviewer_id, reviewer_type, question_id, rating, comment)
               VALUES (?, ?, ?, 'manager', ?, ?, ?)""",
            (
                cycle_id,
                user_id,
                users[0][0],  # First user as manager
                q_id,
                random.randint(3, 5),
                "This is a sample manager review comment."
            )
        )

conn.commit()
conn.close()

print("✅ Performance data seeded successfully!")
print(f"   - Created {len(competencies)} competencies")
print(f"   - Created 1 review cycle with {len(questions)} questions")
print(f"   - Created objectives and KRs for {len(users[:3])} users")
print(f"   - Created competency scores for {len(users[:3])} users")
print("🎉 Ready to test the employee profile page!")


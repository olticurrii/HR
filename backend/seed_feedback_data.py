"""
Seed script to add sample feedback data for testing.
Creates diverse feedback examples with different sentiments, recipients, and anonymity settings.
"""

import sys
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.user import User
from app.models.feedback import Feedback, RecipientType, SentimentLabel
from app.services.insights_service import analyze_feedback
from datetime import datetime, timedelta
import random

def seed_feedback():
    db: Session = SessionLocal()
    
    try:
        # Get users from database
        users = db.query(User).all()
        
        if len(users) < 2:
            print("❌ Need at least 2 users in the database to create feedback.")
            print("   Please create users first.")
            return
        
        print(f"📊 Found {len(users)} users in database")
        
        # Clear existing feedback
        existing_count = db.query(Feedback).count()
        if existing_count > 0:
            response = input(f"⚠️  Found {existing_count} existing feedback items. Delete them? (y/n): ")
            if response.lower() == 'y':
                db.query(Feedback).delete()
                db.commit()
                print("✓ Cleared existing feedback")
        
        # Sample feedback content with different sentiments
        feedback_samples = [
            # Positive feedback
            {
                "content": "Amazing work on the project! The team collaboration was outstanding and the results exceeded expectations. Keep up the great work!",
                "recipient_type": RecipientType.EVERYONE,
                "is_anonymous": False
            },
            {
                "content": "Thank you for your excellent support during the launch. Your dedication and professionalism made all the difference!",
                "recipient_type": RecipientType.USER,
                "is_anonymous": False
            },
            {
                "content": "Great leadership and communication skills. The weekly meetings are very productive and well-organized.",
                "recipient_type": RecipientType.USER,
                "is_anonymous": True
            },
            {
                "content": "Fantastic presentation yesterday! Very clear and engaging. Learned a lot from your insights.",
                "recipient_type": RecipientType.USER,
                "is_anonymous": False
            },
            {
                "content": "The new onboarding process is excellent! Very smooth and welcoming. Great job to everyone involved.",
                "recipient_type": RecipientType.EVERYONE,
                "is_anonymous": False
            },
            
            # Neutral feedback
            {
                "content": "I think we could improve our communication tools. The current system works but could be more efficient.",
                "recipient_type": RecipientType.ADMIN,
                "is_anonymous": True
            },
            {
                "content": "Would like to see more training opportunities on new technologies and tools.",
                "recipient_type": RecipientType.ADMIN,
                "is_anonymous": False
            },
            {
                "content": "The office hours are reasonable. Perhaps we could explore some flexible working arrangements.",
                "recipient_type": RecipientType.ADMIN,
                "is_anonymous": True
            },
            {
                "content": "Team meetings could be shorter. We sometimes cover topics that could be emails.",
                "recipient_type": RecipientType.USER,
                "is_anonymous": True
            },
            {
                "content": "Documentation needs updating. Some guides reference old processes that no longer apply.",
                "recipient_type": RecipientType.EVERYONE,
                "is_anonymous": False
            },
            
            # Negative feedback
            {
                "content": "The project deadline was unrealistic and caused unnecessary stress. We need better planning.",
                "recipient_type": RecipientType.ADMIN,
                "is_anonymous": True
            },
            {
                "content": "Communication has been lacking on this project. Too many last-minute changes without proper notice.",
                "recipient_type": RecipientType.USER,
                "is_anonymous": True
            },
            {
                "content": "I'm concerned about the workload distribution. Some team members seem overwhelmed while others have capacity.",
                "recipient_type": RecipientType.ADMIN,
                "is_anonymous": True
            },
            {
                "content": "The new tool rollout was confusing. Would have benefited from better training and documentation.",
                "recipient_type": RecipientType.EVERYONE,
                "is_anonymous": False
            },
            
            # More positive to balance
            {
                "content": "Really appreciate the supportive team culture here. Everyone is willing to help and share knowledge.",
                "recipient_type": RecipientType.EVERYONE,
                "is_anonymous": False
            },
            {
                "content": "Your mentorship has been invaluable. Thank you for always making time to answer questions!",
                "recipient_type": RecipientType.USER,
                "is_anonymous": False
            },
            {
                "content": "Love the company values and how leadership demonstrates them. Very inspiring workplace!",
                "recipient_type": RecipientType.ADMIN,
                "is_anonymous": False
            },
            {
                "content": "The work-life balance here is wonderful. Management truly cares about employee wellbeing.",
                "recipient_type": RecipientType.EVERYONE,
                "is_anonymous": False
            },
            {
                "content": "Excellent problem-solving skills! You always find creative solutions to complex challenges.",
                "recipient_type": RecipientType.USER,
                "is_anonymous": False
            },
            {
                "content": "The recent team building event was fun and actually useful for building connections!",
                "recipient_type": RecipientType.EVERYONE,
                "is_anonymous": False
            },
        ]
        
        created_count = 0
        
        # Create feedback items
        for i, sample in enumerate(feedback_samples):
            # Select random author
            author = random.choice(users)
            
            # Select recipient if USER type
            recipient_id = None
            if sample["recipient_type"] == RecipientType.USER:
                # Pick a different user as recipient
                potential_recipients = [u for u in users if u.id != author.id]
                if potential_recipients:
                    recipient = random.choice(potential_recipients)
                    recipient_id = recipient.id
                else:
                    # If only one user, skip USER-type feedback
                    continue
            
            # Analyze feedback content
            analysis = analyze_feedback(sample["content"])
            
            # Create feedback with random timestamp in the past 30 days
            days_ago = random.randint(0, 30)
            created_at = datetime.utcnow() - timedelta(days=days_ago, hours=random.randint(0, 23))
            
            feedback = Feedback(
                author_id=author.id,
                recipient_type=sample["recipient_type"],
                recipient_id=recipient_id,
                content=sample["content"],
                is_anonymous=sample["is_anonymous"],
                sentiment_label=SentimentLabel(analysis['sentiment_label']),
                sentiment_score=analysis['sentiment_score'],
                keywords=analysis['keywords'],
                created_at=created_at
            )
            
            db.add(feedback)
            created_count += 1
            
            # Show progress
            sentiment_emoji = "😊" if analysis['sentiment_label'] == "positive" else "😐" if analysis['sentiment_label'] == "neutral" else "😟"
            anon_text = "🔒 Anonymous" if sample["is_anonymous"] else f"👤 {author.full_name}"
            print(f"  {sentiment_emoji} Created feedback #{created_count}: {anon_text} → {sample['recipient_type'].value}")
        
        db.commit()
        
        print(f"\n✅ Successfully created {created_count} feedback items!")
        print(f"\n📈 Sentiment Distribution:")
        
        # Show sentiment distribution
        positive = db.query(Feedback).filter(Feedback.sentiment_label == SentimentLabel.POSITIVE).count()
        neutral = db.query(Feedback).filter(Feedback.sentiment_label == SentimentLabel.NEUTRAL).count()
        negative = db.query(Feedback).filter(Feedback.sentiment_label == SentimentLabel.NEGATIVE).count()
        
        print(f"   😊 Positive: {positive}")
        print(f"   😐 Neutral: {neutral}")
        print(f"   😟 Negative: {negative}")
        
        print(f"\n🎯 Recipient Distribution:")
        user_feedback = db.query(Feedback).filter(Feedback.recipient_type == RecipientType.USER).count()
        admin_feedback = db.query(Feedback).filter(Feedback.recipient_type == RecipientType.ADMIN).count()
        everyone_feedback = db.query(Feedback).filter(Feedback.recipient_type == RecipientType.EVERYONE).count()
        
        print(f"   👤 To Specific Users: {user_feedback}")
        print(f"   🛡️  To Admin: {admin_feedback}")
        print(f"   🌍 To Everyone: {everyone_feedback}")
        
        print(f"\n🔒 Anonymous: {db.query(Feedback).filter(Feedback.is_anonymous == True).count()}")
        print(f"👁️  Public: {db.query(Feedback).filter(Feedback.is_anonymous == False).count()}")
        
        print("\n✓ Test data ready! Visit http://localhost:3000/feedback to see it.")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    print("=" * 60)
    print("🌱 Seeding Feedback Data")
    print("=" * 60)
    seed_feedback()


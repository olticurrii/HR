from sqlalchemy.orm import sessionmaker
from app.core.database import engine
from app.models.user import User

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

users = db.query(User).all()
if len(users) >= 6:
    users[1].manager_id = users[0].id  # John reports to Admin
    users[2].manager_id = users[1].id  # Jane reports to John
    users[3].manager_id = users[0].id  # Mike reports to Admin
    users[4].manager_id = users[2].id  # Sarah reports to Jane
    users[5].manager_id = users[1].id  # Alex reports to John

db.commit()
print('✅ Org chart relationships created!')
db.close()

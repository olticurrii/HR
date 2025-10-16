import sys
sys.path.append('.')
from sqlalchemy.orm import sessionmaker
from app.core.database import engine
from app.models.user import User

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

users = db.query(User).all()
print(f'Found {len(users)} users')

if len(users) >= 6:
    users[1].manager_id = users[0].id  # John reports to Admin
    users[2].manager_id = users[1].id  # Jane reports to John  
    users[3].manager_id = users[0].id  # Mike reports to Admin
    users[4].manager_id = users[2].id  # Sarah reports to Jane
    users[5].manager_id = users[1].id  # Alex reports to John
    
    db.commit()
    print('✅ Hierarchy created!')
    for user in users:
        manager = f' -> {users[user.manager_id].full_name}' if user.manager_id else ' (CEO)'
        print(f'{user.full_name} ({user.job_role}){manager}')
else:
    print('❌ Not enough users found')

db.close()

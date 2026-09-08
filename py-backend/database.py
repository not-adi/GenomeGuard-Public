import os
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

MONGO_URI = os.environ.get("MONGO_URI", "")

def get_db():
    try:
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        # Verify connection (optional but good for debugging)
        # client.admin.command('ismaster')
        
        # Get the database (should be 'genomeguard' from the URI)
        db = client.get_database()
        return db
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")
        return None

# Global DB instance
db = get_db()

def init_db():
    """
    Initialize MongoDB indexes.
    """
    if db is None:
        print("Warning: Database not connected.")
        return

    print("Initializing MongoDB indexes...")
    try:
        # Drop conflicting old indexes if they exist, then recreate
        existing = db.users.index_information()
        if "username_1" in existing:
            db.users.drop_index("username_1")
        if "wallet_address_1" in existing:
            db.users.drop_index("wallet_address_1")

        # Users: Unique email for email/password auth
        db.users.create_index("email", unique=True, sparse=True)
        
        # Profiles: Index for fast lookup
        db.profiles.create_index([("user_id", 1), ("gene", 1)])

        # Waitlist: Unique email to prevent duplicate signups
        db.waitlist.create_index("email", unique=True, sparse=True)
        
        # Jobs: Auto-delete jobs 24 hours after completion
        db.analysis_jobs.create_index("created_at", expireAfterSeconds=86400)
        
        print("MongoDB indexes created.")
    except Exception as e:
        print(f"Error creating indexes: {e}")

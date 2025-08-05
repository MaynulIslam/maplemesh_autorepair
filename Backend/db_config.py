import os
from pymongo import MongoClient
from datetime import datetime, timedelta
import logging

# Configuration
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb+srv://maynul2468islam:f3QnbTsj7TAY1ocf@maplemesh.hj9yzko.mongodb.net/?retryWrites=true&w=majority&appName=MapleMesh")
DATABASE_NAME = "maplemesh_auto_db"
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-jwt-secret-key")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# MongoDB Client
client = MongoClient(MONGODB_URI)
db = client[DATABASE_NAME]

# Collections
user_auth_collection = db.user_authentication
customer_profile_collection = db.customer_profile
technician_profile_collection = db.technician_profile
vehicles_collection = db.vehicles

# Test connection
try:
    client.admin.command('ping')
except Exception as e:
    logging.error(f"Failed to connect to MongoDB: {e}")

def create_indexes():
    """Create database indexes for better performance"""
    try:
        # User authentication indexes
        user_auth_collection.create_index("email", unique=True)
        
        # Profile collections indexes
        customer_profile_collection.create_index("user_id", unique=True)
        technician_profile_collection.create_index("user_id", unique=True)
        
        # Vehicle collection indexes (no unique constraint on vehicle_id since we don't use it)
        vehicles_collection.create_index("user_id")
        
    except Exception as e:
        logging.error(f"Error creating indexes: {e}")

# Create indexes on startup
create_indexes()
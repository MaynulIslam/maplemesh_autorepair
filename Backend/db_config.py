import os
from pymongo import MongoClient
from datetime import datetime, timedelta
import logging
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Configuration - Now using environment variables with working fallbacks
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb+srv://maynul2468islam:f3QnbTsj7TAY1ocf@maplemesh.hj9yzko.mongodb.net/?retryWrites=true&w=majority&appName=MapleMesh")
DATABASE_NAME = os.getenv("DATABASE_NAME", "maplemesh_auto_db")
SECRET_KEY = os.getenv("SECRET_KEY", "maple-mesh-auto-repair-secret-key-2025-production-ready")
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "maple-mesh-jwt-secret-key-super-secure-2025")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRATION_HOURS = int(os.getenv("JWT_EXPIRATION_HOURS", "24"))

# MongoDB Client
client = MongoClient(MONGODB_URI)
db = client[DATABASE_NAME]

# Collections
user_auth_collection = db.user_authentication
customer_profile_collection = db.customer_profile
technician_profile_collection = db.technician_profile
vehicles_collection = db.vehicles
# New: customer service requests
customer_service_list_collection = db.customer_service_list

# Test connection and log status
try:
    client.admin.command('ping')
    print("✅ MongoDB connection successful!")
    print(f"📊 Connected to database: {DATABASE_NAME}")
    print(f"🔗 Connection URI: {MONGODB_URI.split('@')[1].split('?')[0]}")  # Hide credentials in logs
except Exception as e:
    logging.error(f"❌ Failed to connect to MongoDB: {e}")
    print(f"❌ MongoDB connection failed: {e}")

def get_connection_info():
    """Get connection information for debugging"""
    try:
        # Test connection
        client.admin.command('ping')
        
        # Get database info
        db_info = {
            "status": "connected",
            "database_name": DATABASE_NAME,
            "collections": db.list_collection_names(),
            "server_info": client.server_info()["version"]
        }
        return db_info
    except Exception as e:
        return {
            "status": "failed",
            "error": str(e),
            "database_name": DATABASE_NAME
        }

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

        # New: Customer service list indexes
        customer_service_list_collection.create_index("user_id")
        customer_service_list_collection.create_index("vehicle_id")
        customer_service_list_collection.create_index("status")
        
    except Exception as e:
        logging.error(f"Error creating indexes: {e}")

# Create indexes on startup
create_indexes()
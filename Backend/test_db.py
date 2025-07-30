
import os
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
import sys

# Add the Backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from db_config import MONGODB_URI

def test_db_connection():
    """Tests the connection to the MongoDB database."""
    try:
        # It's a good practice to use a timeout when connecting
        client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
        # The ismaster command is cheap and does not require auth.
        client.admin.command('ismaster')
        print("MongoDB connection successful!")
    except ConnectionFailure as e:
        print(f"MongoDB connection failed: {e}")
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    test_db_connection()

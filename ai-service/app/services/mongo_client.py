
# app/services/mongo_client.py
import os
from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional
from urllib.parse import urlparse

# Global client instance
_mongo_client: Optional[AsyncIOMotorClient] = None
_database = None


async def connect_to_mongo():
    """Connect to MongoDB on startup"""
    global _mongo_client, _database
    
    mongo_uri = os.getenv("MONGODB_URI")
    if not mongo_uri:
        raise ValueError("MONGODB_URI environment variable not set")
    
    # Try to get DB name from env, or parse from URI
    db_name = os.getenv("MONGODB_DB_NAME")
    
    if not db_name:
        # Parse DB name from URI path
        parsed = urlparse(mongo_uri)
        db_name = parsed.path.lstrip("/").split("?")[0]
        if not db_name:
            db_name = "autocre8"  # fallback
    
    print(f"🔍 Connecting to MongoDB: {mongo_uri[:50]}...")
    
    _mongo_client = AsyncIOMotorClient(mongo_uri)
    _database = _mongo_client[db_name]
    
    # Test connection
    try:
        await _mongo_client.admin.command('ping')
        print(f"✅ Connected to database: {db_name}")
    except Exception as e:
        print(f"❌ Failed to connect to MongoDB: {e}")
        raise


async def close_mongo_connection():
    """Close MongoDB connection on shutdown"""
    global _mongo_client
    
    if _mongo_client:
        _mongo_client.close()
        print("👋 MongoDB connection closed")


def get_database():
    """Get the current database instance"""
    if _database is None:
        raise RuntimeError("Database not initialized. Call connect_to_mongo() first.")
    return _database


def get_client():
    """Get the current MongoDB client instance"""
    if _mongo_client is None:
        raise RuntimeError("MongoDB client not initialized. Call connect_to_mongo() first.")
    return _mongo_client

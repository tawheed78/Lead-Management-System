"""Mongo Database Configuration Module"""

import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pymongo.errors import PyMongoError

load_dotenv(dotenv_path="app/.env")

# Load environment variables
CONNECTION_STRING = os.getenv('CONNECTION_STRING')
CONNECTION_STRING_ATLAS = os.getenv('CONNECTION_STRING_ATLAS')

INTERACTION_AND_PERFORMANCE_DB = os.getenv('INTERACTION_AND_PERFORMANCE_DB')
INTERACTION_COLLECTION = os.getenv('INTERACTION_COLLECTION')


class MongoDbDatabase:
    _is_initialized = False
    """
    A class to interact with MongoDB for URL shortening service.
    """
    def __init__(self, database_name, connection_string=CONNECTION_STRING_ATLAS):
        """
        Initializes the MongoDbDatabase instance and establishes a connection to the MongoDB server.

        Args:
            database_name (str): The name of the database.
            collection_name (str): The name of the collection.
            connection_string (str): The connection string to MongoDB.
        """
        if MongoDbDatabase._is_initialized:
            raise RuntimeError("Use 'get_mongo_instance()' to get the singleton instance.")
        self.connection_string = connection_string
        try:
            self.client = AsyncIOMotorClient(connection_string)
            self.database_name = database_name
            self.db = self.client[self.database_name]
            self.collection = None  # No default collection; set dynamically
            MongoDbDatabase._is_initialized = True            
        except PyMongoError as e:
            raise e

    def get_db(self):
        """
        Returns the MongoDB database instance.
        """
        return self.db
    
    def set_collection(self, collection_name):
        """
        Sets the MongoDB collection instance to a new collection.

        Args:
            collection_name (str): The name of the new collection.
        """
        self.collection = self.db[collection_name]
        self.create_indexes()

    def get_collection(self):
        """
        Returns the MongoDB collection instance.
        """
        if self.collection is None:
            raise ValueError("Collection not set. Use 'set_collection()' first.")
        return self.collection

    def create_indexes(self):
        """
        Creates indexes on the current collection based on predefined configurations.
        """
        if self.collection is None:
            raise ValueError("Collection not set. Use 'set_collection()' first.")

        index_configs = [
            [('lead_id', 1)],
            [('interaction_date', 1)],
            [('order.price', 1), ('order.quantity', 1)]
        ]

        try:
            for index_config in index_configs:
                self.collection.create_index(index_config)
                print(f"Created index: {index_config}")
        except PyMongoError as e:
            print(f"Error creating indexes: {e}")

    

_instance = None

def get_mongo_instance(database_name):
    global _instance
    if _instance is None:
        _instance = MongoDbDatabase(database_name)
    return _instance

mongo_db = get_mongo_instance(INTERACTION_AND_PERFORMANCE_DB)

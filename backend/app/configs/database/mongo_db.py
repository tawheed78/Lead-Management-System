"""Mongo Database Configuration Module"""

import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pymongo.errors import PyMongoError

load_dotenv(dotenv_path="app/.env")

CONNECTION_STRING = os.getenv('CONNECTION_STRING')

INTERACTION_AND_PERFORMANCE_DB = os.getenv('INTERACTION_AND_PERFORMANCE_DB')
INTERACTION_COLLECTION = os.getenv('INTERACTION_COLLECTION')


class MongoDbDatabase:
    _is_initialized = False
    """
    A class to interact with MongoDB for URL shortening service.
    """
    def __init__(self, database_name, connection_string=CONNECTION_STRING):
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
    # def __init__(self, database_name, connection_string=CONNECTION_STRING):
    #     """
    #     Initializes the MongoDbDatabase instance and establishes a connection to the MongoDB server.

    #     Args:
    #         database_name (str): The name of the database.
    #         collection_name (str): The name of the collection.
    #         connection_string (str): The connection string to MongoDB.
    #     """
    #     self.connection_string = connection_string
    #     try:
    #         self.client = AsyncIOMotorClient(connection_string)
    #         self.database_name = database_name
    #         self.db = self.client[self.database_name]
    #         self.collection = self.db[collection_name]
    #     except PyMongoError as e:
    #         raise e

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

    def get_collection(self):
        """
        Returns the MongoDB collection instance.
        """
        if self.collection is None:
            raise ValueError("Collection not set. Use 'set_collection()' first.")
        return self.collection

    

_instance = None

def get_mongo_instance(database_name):
    global _instance
    if _instance is None:
        _instance = MongoDbDatabase(database_name)
    return _instance

# Initialize the db_instance with a default collection
# db_instance = MongoDbDatabase(
#     database_name="lead_management_database",
#     collection_name="default_collection"
#     )
mongo_db = get_mongo_instance(INTERACTION_AND_PERFORMANCE_DB)

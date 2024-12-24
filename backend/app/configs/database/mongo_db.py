"""Database Configuration Module"""

import os
import logging
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pymongo.errors import PyMongoError

load_dotenv(dotenv_path="app/.env")

CONNECTION_STRING = os.getenv('CONNECTION_STRING')


class MongoDbDatabase:
    """
    A class to interact with MongoDB for URL shortening service.
    """
    def __init__(self, databaseName, collectionName, connection_string=CONNECTION_STRING):
        """
        Initializes the MongoDbDatabase instance and establishes a connection to the MongoDB server.

        Args:
            database_name (str): The name of the database.
            collection_name (str): The name of the collection.
            connection_string (str): The connection string to MongoDB.
        """
        self.connection_string = connection_string
        try:
            self.client = AsyncIOMotorClient(connection_string)
            self.databaseName = databaseName
            self.db = self.client[self.databaseName]
            self.collection = self.db[collectionName]
        except PyMongoError as e:
            raise

    def get_db(self):
        """
        Returns the MongoDB database instance.
        """
        return self.db

    def get_collection(self):
        """
        Returns the MongoDB collection instance.
        """
        return self.collection

    def set_collection(self, collectionName):
        """
        Sets the MongoDB collection instance to a new collection.

        Args:
            collection_name (str): The name of the new collection.
        """
        self.collection = self.db[collectionName]


# Initialize the db_instance with a default collection
db_instance = MongoDbDatabase(databaseName="lead_management_database", collectionName="default_collection")
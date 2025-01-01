"""Pipelines for performance service."""

from datetime import datetime, timedelta
start_date = datetime.now() - timedelta(days=30)

well_performing_pipeline = [
    {
        "$match": {
            "interaction_date": {"$gte": start_date}
        }
    },
    {
        "$project": {
            "lead_id": 1,
            "order_values": {
                "$map": {
                    "input": "$order",
                    "as": "item",
                    "in": {
                        "$multiply": [
                            {"$toDouble": {"$ifNull": ["$$item.price", 0]}},
                            {"$toDouble": {"$ifNull": ["$$item.quantity", 0]}}
                        ]
                    }
                }
            },
            "interaction_date": 1
        }
    },
    {
        "$group": {
            "_id": "$lead_id",
            "order_count": {"$sum": {"$size": "$order_values"}},
            "total_order_value": {"$sum": {
                "$reduce": {
                    "input": "$order_values", "initialValue": 0, "in": {
                        "$add": ["$$value", "$$this"]
                        }
                    }
                }
            },  # Sum of order values
            "avg_order_value": {"$avg": {
                "$reduce": {
                    "input": "$order_values", "initialValue": 0, "in": {    # Average order value
                        "$add": ["$$value", "$$this"]
                        }
                    }
                }
            },
            "last_interaction_date": {"$max": "$interaction_date"}
        }
    },
    {
        "$sort": {"order_count": -1}
    }
]


under_performing_pipeline = [
    {
        "$match": {
            "interaction_date": {"$gte": start_date}
        }
    },
    {
        "$project": {
            "lead_id": 1,
            "order_values": {
                "$map": {
                    "input": "$order",
                    "as": "item",
                    "in": {
                        "$multiply": [
                            {"$toDouble": {"$ifNull": ["$$item.price", 0]}},
                            {"$toDouble": {"$ifNull": ["$$item.quantity", 0]}}
                        ]
                    }
                }
            },
            "interaction_date": 1
        }
    },
    {
        "$group": {
            "_id": "$lead_id",
            "order_count": {"$sum": {"$size": "$order_values"}},
            "total_order_value": {"$sum": {
                "$reduce": {
                    "input": "$order_values", "initialValue": 0, "in": {
                        "$add": ["$$value", "$$this"]
                        }
                    }
                }
            },  # Sum of order values
            "avg_order_value": {"$avg": {
                "$reduce": {
                    "input": "$order_values", "initialValue": 0, "in": {    # Average order value
                        "$add": ["$$value", "$$this"]
                        }
                    }
                }
            },
            "last_interaction_date": {"$max": "$interaction_date"}
        }
    },
    {
        "$match": {
            "order_count": {"$gt": 0} 
        }
    },
    {
        "$sort": {
            "order_count": 1,
            "total_order_value": 1,
            "last_interaction_date": 1 
        }
    }
]


total_data_pipeline = [
    {
        "$match": {
            "interaction_date": {"$gte": start_date}
        }
    },
    {
        "$project": {
            "lead_id": 1,
            "order_values": {
                "$map": {
                    "input": "$order",
                    "as": "item",
                    "in": {
                        "$multiply": [
                            {"$toDouble": {"$ifNull": ["$$item.price", 0]}},
                            {"$toDouble": {"$ifNull": ["$$item.quantity", 0]}}
                        ]
                    }
                }
            },
            "interaction_date": 1
        }
    },
    {
        "$match": {
            "order_values": {"$ne": []}
        }
    },
    {
        "$group": {
            "_id": "$lead_id",
            "order_count": {"$sum": {"$size": "$order_values"}},
            "total_order_value": {"$sum": {
                "$reduce": {
                    "input": "$order_values", "initialValue": 0, "in": {
                        "$add": ["$$value", "$$this"]
                        }
                    }
                }
            },
            "avg_order_value": {
                "$avg": {"$reduce": {
                    "input": "$order_values", "initialValue": 0, "in": {
                        "$add": ["$$value", "$$this"]
                        }
                    }
                }
            },
            "last_interaction_date": {"$max": "$interaction_date"}
        }
    }
]

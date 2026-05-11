# ML Service Configuration with CloudWatch Integration

import os
import json
import logging
import boto3
from datetime import datetime
from pythonjsonlogger import jsonlogger

# AWS CloudWatch configuration
ENVIRONMENT = os.getenv("ENVIRONMENT", "dev")
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
LOG_GROUP_NAME = os.getenv("LOG_GROUP_NAME", "/ecs/petclinic-ml-service")
LOG_STREAM_NAME = os.getenv("LOG_STREAM_NAME", f"ml-service-{datetime.now().isoformat()}")

# CloudWatch Logs Handler
class CloudWatchLogsHandler(logging.Handler):
    def __init__(self, log_group, log_stream, region):
        super().__init__()
        self.log_group = log_group
        self.log_stream = log_stream
        self.region = region
        self.client = boto3.client("logs", region_name=region)
        self.sequence_token = None
        
        # Create log stream
        try:
            self.client.create_log_stream(
                logGroupName=self.log_group,
                logStreamName=self.log_stream
            )
        except self.client.exceptions.ResourceAlreadyExistsException:
            pass
    
    def emit(self, record):
        try:
            message = self.format(record)
            response = self.client.put_log_events(
                logGroupName=self.log_group,
                logStreamName=self.log_stream,
                logEvents=[
                    {
                        "timestamp": int(datetime.now().timestamp() * 1000),
                        "message": message
                    }
                ],
                sequenceToken=self.sequence_token
            )
            self.sequence_token = response.get("nextSequenceToken")
        except Exception as e:
            self.handleError(record)

def setup_logging():
    """Configure logging with CloudWatch integration"""
    # Root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)
    
    # Console handler with JSON formatter
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    
    # JSON Log Formatter
    json_formatter = jsonlogger.JsonFormatter(
        fmt="%(timestamp)s %(level)s %(name)s %(message)s",
        timestamp=True
    )
    console_handler.setFormatter(json_formatter)
    root_logger.addHandler(console_handler)
    
    # CloudWatch handler (only in production)
    if ENVIRONMENT == "prod":
        try:
            cw_handler = CloudWatchLogsHandler(
                LOG_GROUP_NAME,
                LOG_STREAM_NAME,
                AWS_REGION
            )
            cw_handler.setLevel(logging.INFO)
            cw_handler.setFormatter(json_formatter)
            root_logger.addHandler(cw_handler)
        except Exception as e:
            root_logger.warning(f"Failed to setup CloudWatch logging: {e}")

# Setup logging on import
setup_logging()
logger = logging.getLogger(__name__)

# Configuration constants
class Config:
    """Configuration for ML Service"""
    ENVIRONMENT = ENVIRONMENT
    AWS_REGION = AWS_REGION
    LOG_GROUP = LOG_GROUP_NAME
    LOG_STREAM = LOG_STREAM_NAME
    
    # ML Model paths
    MODEL_PATH = os.getenv("MODEL_PATH", "/app/model.pkl")
    COLUMNS_PATH = os.getenv("COLUMNS_PATH", "/app/columns.pkl")
    
    # API Configuration
    API_TITLE = "PetClinic ML Service"
    API_VERSION = "1.0.0"
    API_DESCRIPTION = "Machine Learning predictions for Pet Clinic"

logger.info(f"ML Service Configuration loaded. Environment: {ENVIRONMENT}, Region: {AWS_REGION}")

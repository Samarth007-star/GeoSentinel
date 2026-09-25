import sys
import os

# Add ai-service to sys.path so 'app' can be imported anywhere in tests
ai_service_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ai_service_dir not in sys.path:
    sys.path.insert(0, ai_service_dir)

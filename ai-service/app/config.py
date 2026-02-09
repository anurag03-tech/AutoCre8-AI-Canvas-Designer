# import os
# from dotenv import load_dotenv

# load_dotenv()

# class Settings:
#     PROJECT_NAME: str = "AutoCre8 AI Backend"
    
#     # OpenAI
#     OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY")
#     OPENAI_MODEL: str = os.getenv("OPENAI_MODEL")

#     # Google
#     GOOGLE_API_KEY: str = os.getenv("GOOGLE_API_KEY")
#     GOOGLE_MODEL: str = os.getenv("GOOGLE_MODEL")

# settings = Settings()

import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "AutoCre8 AI Backend"
    
    # OpenAI
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4o")

    # Google Vertex AI (for gemini-2.5-pro, gemini-3-pro-preview)
    GOOGLE_CLOUD_PROJECT: str = os.getenv("GOOGLE_CLOUD_PROJECT")
    GOOGLE_APPLICATION_CREDENTIALS: str = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    GOOGLE_LOCATION: str = os.getenv("GOOGLE_LOCATION", "global")
    GOOGLE_MODEL: str = os.getenv("GOOGLE_MODEL","gemini-3-pro-preview")
    
    # LLM Settings
    LLM_TEMPERATURE: float = float(os.getenv("LLM_TEMPERATURE", "0.7"))
    LLM_MAX_TOKENS: int = int(os.getenv("LLM_MAX_TOKENS", "4096"))

settings = Settings()
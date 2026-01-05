import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "AutoCre8 AI Backend"
    
    # OpenAI
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL")

    # Google
    GOOGLE_API_KEY: str = os.getenv("GOOGLE_API_KEY")
    GOOGLE_MODEL: str = os.getenv("GOOGLE_MODEL")

settings = Settings()
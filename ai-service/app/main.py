# app/main.py

import os
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.services.mongo_client import connect_to_mongo, close_mongo_connection
from app.routes.ai import router as ai_router
from app.routes.brand import router as brand_router
from app.utils.logger import setup_logger
from app.services.llm_service import llm_service
from app.routes.images import router as images_router

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")


logger = setup_logger()

app = FastAPI(
    title="AutoCre8 AI Service",
    description="AI-powered design agent with multi-model LLM routing",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],  # Uses your .env value
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    await connect_to_mongo()
    
    logger.info("🚀 FastAPI server started")
    logger.info("="*60)
    logger.info("LLM CONFIGURATION:")
    
    # Check OpenAI
    if os.getenv("OPENAI_API_KEY"):
        logger.info("  ✅ OpenAI API Key configured")
    else:
        logger.error("  ❌ OpenAI API Key MISSING (required!)")
    
    # Check Claude options
    if os.getenv("ANTHROPIC_API_KEY"):
        logger.info("  ✅ Anthropic API Key configured (using direct API)")
    elif os.getenv("OPENROUTER_API_KEY"):
        logger.info("  ✅ OpenRouter API Key configured (using for Claude)")
    else:
        logger.warning("  ⚠️  No Claude API key (will use GPT-4o for complex tasks)")
    
    # Show available models
    models_info = llm_service.get_available_models()
    logger.info(f"  📊 Available models: {models_info['total_models']}")
    logger.info(f"     - OpenAI: {models_info['openai_available']}")
    logger.info(f"     - Claude: {models_info['claude_available']} (via {models_info['claude_provider']})")
    logger.info("="*60)

@app.on_event("shutdown")
async def shutdown_event():
    await close_mongo_connection()
    logger.info("👋 FastAPI server stopped")

@app.get("/")
async def root():
    return {
        "service": "AutoCre8 AI Service",
        "status": "running",
        "version": "2.0.0"
    }

@app.get("/health")
async def health_check():
    """Health check with detailed model availability"""
    models_info = llm_service.get_available_models()
    
    return {
        "status": "healthy",
        "models": {
            "openai": "configured" if models_info["openai_available"] else "missing",
            "claude": {
                "available": models_info["claude_available"],
                "provider": models_info["claude_provider"]
            },
            "total": models_info["total_models"]
        }
    }

app.include_router(ai_router, prefix="/ai", tags=["AI Design Agent"])
app.include_router(brand_router, prefix="/brand", tags=["Brand Guidelines"])
app.include_router(images_router, prefix="/images", tags=["Image Services"])  
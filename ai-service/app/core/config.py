from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    openai_api_key: str
    openai_model: str = "gpt-4-turbo-preview"
    redis_host: str = "localhost"
    redis_port: int = 6379
    
    class Config:
        env_file = ".env"

settings = Settings()

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # App
    APP_NAME: str = "realtime-service"
    DEBUG: bool = False

    # PostgreSQL
    SQL_URL_DATABASE: str
    DATABASE_URL_SYNC: str = "postgresql://user:pass@localhost:5432/db"  # para migraciones

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # WebSocket
    WS_HEARTBEAT_INTERVAL: int = 30          # segundos entre pings
    WS_MAX_QUEUE_SIZE: int = 100             # mensajes máximos en cola por cliente

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()

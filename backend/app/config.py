from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "sqlite:///./cityeye.db"
    openai_api_key: str = ""
    openai_vision_model: str = "gpt-4o"
    openai_embed_model: str = "text-embedding-3-small"
    # Секрет для подписи JWT-токенов. В проде замените на длинную случайную строку.
    jwt_secret: str = "cityeye-dev-secret-change-in-production"

    @property
    def has_openai(self) -> bool:
        return bool(self.openai_api_key.strip())


settings = Settings()

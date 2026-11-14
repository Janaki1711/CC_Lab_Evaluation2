import os
import io
import logging
from typing import Generator
from minio import Minio
from minio.error import S3Error
from app.config import settings

logger = logging.getLogger(__name__)

class StorageManager:
    def __init__(self):
        self.is_minio_connected = False
        self.client = None
        self.fallback_dir = os.path.abspath("./local_blob_storage")
        os.makedirs(self.fallback_dir, exist_ok=True)

        try:
            # Strip scheme if accidentally included
            clean_endpoint = settings.MINIO_ENDPOINT.replace("http://", "").replace("https://", "")
            self.client = Minio(
                endpoint=clean_endpoint,
                access_key=settings.MINIO_ROOT_USER,
                secret_key=settings.MINIO_ROOT_PASSWORD,
                secure=settings.MINIO_USE_SSL
            )
            # Check or create bucket
            if not self.client.bucket_exists(settings.MINIO_BUCKET_NAME):
                self.client.make_bucket(settings.MINIO_BUCKET_NAME)
                logger.info(f"Created MinIO bucket: {settings.MINIO_BUCKET_NAME}")
            else:
                logger.info(f"Found existing MinIO bucket: {settings.MINIO_BUCKET_NAME}")
            self.is_minio_connected = True
        except Exception as e:
            logger.warning(f"MinIO connection not active ({e}). Operating in filesystem fallback mode at {self.fallback_dir}.")

    def upload_stream(self, object_key: str, data_stream: io.BytesIO, length: int, content_type: str):
        if self.is_minio_connected and self.client:
            data_stream.seek(0)
            self.client.put_object(
                bucket_name=settings.MINIO_BUCKET_NAME,
                object_name=object_key,
                data=data_stream,
                length=length,
                content_type=content_type
            )
            logger.info(f"Streamed {length} bytes to MinIO object: {object_key}")
        else:
            # Fallback to disk
            local_path = os.path.join(self.fallback_dir, object_key.replace("/", "_"))
            data_stream.seek(0)
            with open(local_path, "wb") as f:
                f.write(data_stream.read())
            logger.info(f"Saved {length} bytes to fallback storage: {local_path}")

    def get_stream(self, object_key: str) -> Generator[bytes, None, None]:
        if self.is_minio_connected and self.client:
            response = None
            try:
                response = self.client.get_object(settings.MINIO_BUCKET_NAME, object_key)
                for chunk in response.stream(32 * 1024):
                    yield chunk
            finally:
                if response:
                    response.close()
                    response.release_conn()
        else:
            local_path = os.path.join(self.fallback_dir, object_key.replace("/", "_"))
            if not os.path.exists(local_path):
                raise FileNotFoundError(f"Blob object not found: {object_key}")
            with open(local_path, "rb") as f:
                while chunk := f.read(32 * 1024):
                    yield chunk

    def remove_object(self, object_key: str):
        if self.is_minio_connected and self.client:
            self.client.remove_object(settings.MINIO_BUCKET_NAME, object_key)
        else:
            local_path = os.path.join(self.fallback_dir, object_key.replace("/", "_"))
            if os.path.exists(local_path):
                os.remove(local_path)

storage = StorageManager()

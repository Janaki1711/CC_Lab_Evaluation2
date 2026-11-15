import os
import io
import socket
import logging
from typing import Generator
from minio import Minio
from minio.error import S3Error
from app.config import settings

logger = logging.getLogger(__name__)

def is_service_reachable(endpoint: str, timeout: float = 0.5) -> bool:
    try:
        clean = endpoint.replace("http://", "").replace("https://", "")
        parts = clean.split(":")
        host = parts[0]
        port = int(parts[1]) if len(parts) > 1 else 9000
        with socket.create_connection((host, port), timeout=timeout):
            return True
    except Exception:
        return False

class StorageManager:
    def __init__(self):
        self.is_minio_connected = False
        self.client = None
        self.fallback_dir = os.path.abspath("./local_blob_storage")
        os.makedirs(self.fallback_dir, exist_ok=True)
        self.connect_minio()

    def connect_minio(self) -> bool:
        if self.is_minio_connected and self.client:
            return True

        clean_endpoint = settings.MINIO_ENDPOINT.replace("http://", "").replace("https://", "")
        if not is_service_reachable(clean_endpoint, timeout=2.0):
            return False

        try:
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
            return True
        except Exception as e:
            logger.warning(f"MinIO initialization failed ({e}). Operating in filesystem fallback mode at {self.fallback_dir}.")
            self.is_minio_connected = False
            return False

    def upload_stream(self, object_key: str, data_stream: io.BytesIO, length: int, content_type: str):
        self.connect_minio()
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
        self.connect_minio()
        if self.is_minio_connected and self.client:
            response = None
            try:
                response = self.client.get_object(settings.MINIO_BUCKET_NAME, object_key)
                for chunk in response.stream(32 * 1024):
                    yield chunk
                return
            except Exception as e:
                logger.warning(f"MinIO get_object failed for {object_key}: {e}. Checking fallback storage.")
            finally:
                if response:
                    try:
                        response.close()
                        response.release_conn()
                    except Exception:
                        pass

        local_path = os.path.join(self.fallback_dir, object_key.replace("/", "_"))
        if not os.path.exists(local_path):
            raise FileNotFoundError(f"Blob object not found: {object_key}")
        with open(local_path, "rb") as f:
            while chunk := f.read(32 * 1024):
                yield chunk

    def remove_object(self, object_key: str):
        self.connect_minio()
        if self.is_minio_connected and self.client:
            self.client.remove_object(settings.MINIO_BUCKET_NAME, object_key)
        else:
            local_path = os.path.join(self.fallback_dir, object_key.replace("/", "_"))
            if os.path.exists(local_path):
                os.remove(local_path)

storage = StorageManager()

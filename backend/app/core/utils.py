import uuid


FILE_PREFIX = "FILE_"

def generate_file_name(length: int = 10) -> str:
    return FILE_PREFIX + str(uuid.uuid4())[:length]

import string
import uuid

alphabet = string.ascii_lowercase + string.digits


def truncated_uuid4():
    return str(uuid.uuid4())[:16]

import string
import uuid

alphabet = string.ascii_lowercase + string.digits


def truncated_uuid4():
    return str(uuid.uuid4())[:16]

UNKNOWN_RECORD_IMAGE = "https://upload.wikimedia.org/wikipedia/commons/b/b6/12in-Vinyl-LP-Record-Angle.jpg";

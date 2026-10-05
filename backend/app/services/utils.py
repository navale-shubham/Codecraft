import uuid


prefix: str = "ISSUE"


def generate_issue_number() -> str:
    return prefix + "-" + str(uuid.uuid4())

from .base import *

from .department import *
from .issue import *
from .organization import *
from .user import *
from .ward import *


WardResponse.model_rebuild()
IssueResponse.model_rebuild()

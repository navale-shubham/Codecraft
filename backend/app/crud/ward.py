from sqlmodel import select
from sqlalchemy import func

from app.models import Ward

from .base import CRUDBase


class CRUDWard(CRUDBase[Ward]):
    MODEL: type[Ward] = Ward

    def get_nearest_ward(self, location):
        location_geom = func.ST_SetSRID(
            func.ST_Point(location.longitude, location.latitude),
            4326
        )

        statement = select(Ward).where(
            func.ST_Contains(
                Ward.geo_boundary,
                location_geom
            )
        ).limit(1)

        return self.session.exec(statement).first()

from sqlmodel import SQLModel, Session


class CRUDBase[ModelType: SQLModel]:
    MODEL: type[ModelType]

    def __init__(self, session: Session):
        self.session = session
    
    def create(self, obj_in: ModelType) -> ModelType:
        self.session.add(obj_in)
        self.session.flush()
        self.session.refresh(obj_in)
        return obj_in

    def read(self, id: str) -> ModelType | None:
        return self.session.get(self.MODEL, id)

    def update(self, obj_in: ModelType) -> ModelType:
        self.session.add(obj_in)
        self.session.flush()
        self.session.refresh(obj_in)
        return obj_in

    def delete(self, id: str) -> ModelType | None:
        obj: ModelType | None = self.session.get(self.MODEL, id)
        if obj:
            self.session.delete(obj)
            self.session.flush()
        return obj

import uuid
from typing import Any, List

from fastapi import APIRouter, HTTPException
from sqlmodel import func, select

from app.api.deps import CurrentUser, SessionDep
from app.models import JobRole, JobRoleCreate, JobRolePublic, JobRolesPublic, JobRoleUpdate, Message

router = APIRouter()


@router.get("/", response_model=JobRolesPublic)
def read_job_roles(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve job roles.
    """

    if current_user.is_superuser:
        count_statement = select(func.count()).select_from(JobRole)
        count = session.exec(count_statement).one()
        statement = select(JobRole).offset(skip).limit(limit)
        job_roles = session.exec(statement).all()
    else:
        count_statement = (
            select(func.count())
            .select_from(JobRole)
            .where(JobRole.owner_id == current_user.id)
        )
        count = session.exec(count_statement).one()
        statement = (
            select(JobRole)
            .where(JobRole.owner_id == current_user.id)
            .offset(skip)
            .limit(limit)
        )
        job_roles = session.exec(statement).all()

    return JobRolesPublic(data=job_roles, count=count)


@router.post("/", response_model=JobRolePublic)
def create_job_role(
    *, session: SessionDep, current_user: CurrentUser, job_role_in: JobRoleCreate
) -> Any:
    """
    Create new job role.
    """
    job_role = JobRole(**job_role_in.dict())
    session.add(job_role)
    session.commit()
    session.refresh(job_role)
    return job_role
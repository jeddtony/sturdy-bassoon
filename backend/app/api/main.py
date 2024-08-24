from fastapi import APIRouter

from app.api.routes import items, login, users, utils, posts, job_roles

api_router = APIRouter()
api_router.include_router(login.router, tags=["login"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(utils.router, prefix="/utils", tags=["utils"])
api_router.include_router(items.router, prefix="/items", tags=["items"])
api_router.include_router(posts.router, prefix="/posts", tags=["posts"])
api_router.include_router(job_roles.router, prefix="/job-roles", tags=["job_roles"])

import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import func, select

from app.api.deps import CurrentUser, SessionDep
from app.models import Post, PostCreate, PostPublic, PostsPublic, PostUpdate, Message

router = APIRouter()


@router.get("/", response_model=PostsPublic)
def read_posts(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve posts.
    """
    
    if current_user.is_superuser:
        count_statement = select(func.count()).select_from(Post)
        count = session.exec(count_statement).one()
        statement = select(Post).offset(skip).limit(limit)
        posts = session.exec(statement).all()
    else:
        count_statement = (
            select(func.count())
            .select_from(Post)
            .where(Post.author_id == current_user.id)
        )
        count = session.exec(count_statement).one()
        statement = (
            select(Post)
            .where(Post.author_id == current_user.id)
            .offset(skip)
            .limit(limit)
        )
        posts = session.exec(statement).all()
        
    return PostsPublic(data=posts, count=count)

@router.get("/{id}", response_model=PostPublic)
def read_post(session: SessionDep, current_user: CurrentUser, id: uuid.UUID) -> Any:
    """
    Get post by ID.
    """
    post = session.get(Post, id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if not current_user.is_superuser and (post.author_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    return post

@router.post("/", response_model=PostPublic)
def create_post(
    *, session: SessionDep, current_user: CurrentUser, post_in: PostCreate
) -> Any:
    """
    Create new post.
    """
    post = Post(**post_in.dict(), author_id=current_user.id)
    session.add(post)
    session.commit()
    session.refresh(post)
    return post

@router.put("/{id}", response_model=PostPublic)
def update_post(
    *, session: SessionDep, current_user: CurrentUser, id: uuid.UUID, post_in: PostUpdate
) -> Any:
    """
    Update an post.
    """
    post = session.get(Post, id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if not current_user.is_superuser and (post.author_id != current_user.id):
        raise HTTPException(status_code=400, detail="Not enough permissions")
    post_data = post.dict()
    update_data = post_in.dict(exclude_unset=True)
    for field in post_data:
        if field in update_data:
            setattr(post, field, update_data[field])
    session.add(post)
    session.commit()
    session.refresh(post)
    return post
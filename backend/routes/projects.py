from fastapi import APIRouter, HTTPException, Depends
from pymongo.errors import DuplicateKeyError

from mongo.project_dao import projects_dao
from sessions.session_authorizer import authorize
from schema import Project

projects_router = APIRouter(prefix = "/projects")

@projects_router.post("", tags = ["projects"])
async def add_project(project: Project, uuid: str = Depends(authorize)):
    try:
        model = project.model_dump()

        if not model.get("project_name"):
            raise HTTPException(422, "Project requires a project name")

        model["uuid"] = uuid
        result = await projects_dao.add_project(model)
    except DuplicateKeyError:
        raise HTTPException(400, "Project already exists") # FIXME: redundant since keys are generated uniquely?
    except HTTPException as http:
        raise http
    except Exception as e:
        raise HTTPException(500, "Encountered internal service error")
    
    return {"detail": "Successfully added project", "project_id": result}

@projects_router.get("", tags = ["projects"])
async def get_project(project_id: str, uuid: str = Depends(authorize)):
    try:
        result = await projects_dao.get_project(project_id)
    except Exception as e:
        raise HTTPException(500, "Encountered internal service error")
    
    if result:
        result["_id"] = str(result["_id"])
        return result
    else:
        raise HTTPException(400, "Project not found")

@projects_router.get("/me", tags = ["projects"])
async def get_all_projects(uuid: str = Depends(authorize)):
    try:
        results = await projects_dao.get_all_projects(uuid)
        # NOTE: do not return http exception for empty projects, as it can lead to inconsistent behavior on the frontend
    except Exception as e:
        raise HTTPException(500, "Encountered internal service error")
    
    return results

# TODO: Media endpoints

@projects_router.put("", tags = ["projects"])
async def update_project(project_id: str, project: Project, uuid: str = Depends(authorize)):
    try:
        model = project.model_dump(exclude_unset = True)
        updated = await projects_dao.update_project(project_id, model)
    except Exception as e:
        raise HTTPException(500, "Encountered internal service error")
    
    if updated == 0:
        raise HTTPException(400, "Project not found")
    else:
        return {"detail": "Successfully updated project"}

@projects_router.delete("", tags = ["projects"])
async def delete_project(project_id: str, uuid: str = Depends(authorize)):
    try:
        deleted = await projects_dao.delete_project(project_id)
    except Exception as e:
        raise HTTPException(500, "Encountered internal service error")

    if deleted == 0:
        raise HTTPException(400, "Project not found")
    else:
        return {"detail": "Successfully deleted project"}
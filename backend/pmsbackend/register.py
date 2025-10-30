from fastapi import FastAPI, Query, HTTPException

app = FastAPI()

@app.get("/register")


async def register(key):
    if key !=
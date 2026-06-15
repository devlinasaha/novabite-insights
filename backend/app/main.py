import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .seed import seed, DB_PATH

app = FastAPI(title="NovaBite Insights API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event():
    if not os.path.exists(DB_PATH):
        seed()


@app.get("/")
def root():
    return {"status": "ok"}
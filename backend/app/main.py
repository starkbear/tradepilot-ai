from fastapi import FastAPI

from app.api.routes.auth import router as auth_router
from app.api.routes.providers import router as providers_router

app = FastAPI()


@app.get('/api/health')
def health() -> dict:
    return {
        'success': True,
        'message': 'ok',
        'data': {'status': 'ok'},
        'errors': [],
    }


app.include_router(auth_router)
app.include_router(providers_router)

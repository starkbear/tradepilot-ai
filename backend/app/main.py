from fastapi import FastAPI
from fastapi.responses import JSONResponse

from app.api.routes.auth import router as auth_router
from app.api.routes.chat import router as chat_router
from app.api.routes.files import router as files_router
from app.api.routes.providers import router as providers_router
from app.core.config import ProviderConfigurationError

app = FastAPI()


@app.get('/api/health')
def health() -> dict:
    return {
        'success': True,
        'message': 'ok',
        'data': {'status': 'ok'},
        'errors': [],
    }


@app.exception_handler(ProviderConfigurationError)
def handle_provider_configuration_error(_, exc: ProviderConfigurationError) -> JSONResponse:
    return JSONResponse(
        status_code=503,
        content={
            'success': False,
            'message': str(exc),
            'data': None,
            'errors': [str(exc)],
        },
    )


@app.exception_handler(ValueError)
def handle_value_error(_, exc: ValueError) -> JSONResponse:
    return JSONResponse(
        status_code=400,
        content={
            'success': False,
            'message': str(exc),
            'data': None,
            'errors': [str(exc)],
        },
    )


app.include_router(auth_router)
app.include_router(chat_router)
app.include_router(files_router)
app.include_router(providers_router)

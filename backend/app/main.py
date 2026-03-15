from fastapi import FastAPI

app = FastAPI()


@app.get('/api/health')
def health() -> dict:
    return {
        'success': True,
        'message': 'ok',
        'data': {'status': 'ok'},
        'errors': [],
    }

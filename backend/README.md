# **CivicPulse**
**(Crowdsourced Civic Issue Reporting & Resolution System)**

## Backend

The backend of CivicPulse is a modern, high-performance RESTful API built with Python.

### Tech Stack
- **Framework:** [FastAPI](https://fastapi.tiangolo.com/) - A modern, fast web framework for building APIs.
- **ORM / Database Modeling:** [SQLModel](https://sqlmodel.tiangolo.com/) - Combines SQLAlchemy and Pydantic for database interactions and data validation.
- **Database:** PostgreSQL (via `asyncpg` and `psycopg2`)
- **Package Management:** [uv](https://github.com/astral-sh/uv) - An extremely fast Python package and project manager.
- **Authentication:** JWT tokens using `python-jose` and password hashing with `passlib`.
- **AI Integration:** Google Generative AI (Gemini) API for AI-powered features.
- **Testing:** `pytest` and `httpx`.

### Setup & Installation

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Sync dependencies and create a virtual environment using `uv`:
   ```bash
   uv sync
   ```

3. Activate the virtual environment:
   - On Windows:
     ```powershell
     .venv\Scripts\activate
     ```
   - On Linux/macOS:
     ```bash
     source .venv/bin/activate
     ```

4. Configure the environment variables:
   Create a `.env` file in the `backend` directory and configure the necessary variables (e.g., Database URL, Secret Keys).

5. Run the development server:
   ```bash
   uv run --env-file=.env fastapi dev
   ```

   The API will be available at `http://127.0.0.1:8000`. You can access the interactive Swagger API documentation at `http://127.0.0.1:8000/docs`.

### Running Tests

To run the test suite, ensure your virtual environment is active and run:
```bash
uv run pytest
```
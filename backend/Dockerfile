FROM caat-backend-base:latest

# Argument to check if the build is for cloud or local environment
# By default, docker image is build for cloud
ARG BUILD_ENV=cloud
ENV BUILD_ENV=${BUILD_ENV}

RUN echo "Building the application for ${BUILD_ENV} ..."

# Set the user to 'caatuser'
USER caatuser

# Set the working directory
WORKDIR /home/caatuser

ENV PYTHONUNBUFFERED 1
ENV PYTHONDONTWRITEBYTECODE 1
ENV HOST 0.0.0.0
ENV PORT 8000

# Copy only required files
COPY --chown=caatuser:caatuser ./src ./src
COPY --chown=caatuser:caatuser ./prisma ./prisma
COPY --chown=caatuser:caatuser ./main.py ./main.py

# Generate prisma client for Postgres Server if BUILD_ENV is for local/codespaces
# Generate prisma client for SQL Server if BUILD_ENV is for cloud
RUN if [ "$BUILD_ENV" = "local" ]; then \
        echo "Generating prisma client for local"; \
        python -m  prisma generate --schema=./prisma/schema.local.prisma; \
    else \
        echo "Generating prisma client for cloud"; \
        python -m  prisma generate --schema=./prisma/schema.prisma; \
    fi

EXPOSE 8000
CMD gunicorn main:app

FROM caat-backend-base:latest

# Argument to check if the build is for azure, aws or local environment
# By default, docker image is build for Azure cloud
# if set to 'local' or 'aws' -> postgres DB will be used.
# if set to 'azure' -> SQL Server DB will be used.
ARG APP_ENV=azure
ENV APP_ENV=${APP_ENV}

RUN echo "Building the application for ${APP_ENV} ..."

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

# Generate prisma client for Postgres Server if APP_ENV is local/aws
# Generate prisma client for SQL Server if APP_ENV is azure
RUN if [ "$APP_ENV" = "local" ] || [ "$APP_ENV" = "aws" ]; then \
        echo "Generating Postgres prisma client for $APP_ENV environment."; \
        python -m  prisma generate --schema=./prisma/schema.postgres.prisma; \
    else \
        echo "Generating SQL server prisma client for $APP_ENV environment."; \
        python -m  prisma generate --schema=./prisma/schema.prisma; \
    fi

EXPOSE 8000
CMD gunicorn main:app

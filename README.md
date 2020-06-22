## Set Up

In order to run the production code, the following environment files and settings must first be created:

_.env.prod_

    DEBUG=0
    SECRET_KEY=your-secret-key
    DJANGO_ALLOWED_HOSTS=your.domain localhost 127.0.0.1 [::1]
    SQL_ENGINE=django.db.backends.postgresql
    SQL_DATABASE=your-db
    SQL_USER=your-user
    SQL_PASSWORD=your-password
    SQL_HOST=db
    SQL_PORT=5432
    DATABASE=postgres

_.env.prod.db_

    POSTGRES_USER=your-user
    POSTGRES_PASSWORD=your-password
    POSTGRES_DB=your-db

## Commands

Build new images, spin up containers and run a daemon in the background:

    $ docker-compose -f docker-compose.prod.yml up -d --build

Make and run migrations and collect the static files:

    $ docker-compose -f docker-compose.prod.yml exec web python manage.py makemigrations --noinput
    $ docker-compose -f docker-compose.prod.yml exec web python manage.py migrate --noinput
    $ docker-compose -f docker-compose.prod.yml exec web python manage.py collectstatic --noinput --clear

Check and follow the log for errors:

    $ docker-compose -f docker-compose.prod.yml logs -f

Bring down the containers:

    $ docker-compose -f docker-compose.prod.yml down

## Background

Architecture based on [Dockerizing a Python Django Web Application](https://testdriven.io/blog/dockerizing-django-with-postgres-gunicorn-and-nginx/). However, the initial step of installing Django and creating a new project was done using a docker container with python:

    /app $ docker run -it -v `pwd`:/usr/src/app python:3.8.3-alpine ash .
    / # pip install django==3.0.7
    / # cd /usr/src/app
    /usr/src/app # django-admin.py startproject toomanydaves .

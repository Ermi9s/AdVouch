#!/bin/sh

echo "Making migrations..."
python manage.py makemigrations --noinput

echo "Applying migrations..."
python manage.py migrate --noinput

echo "Starting server..."
gunicorn advouch.wsgi:application --bind 0.0.0.0:8000 --workers 4

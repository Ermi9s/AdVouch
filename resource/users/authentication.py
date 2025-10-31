import datetime
import jwt
from django.conf import settings
from .models import User
import base64
from django.core.files.base import ContentFile
from rest_framework import authentication, exceptions
from django.contrib.auth.models import AnonymousUser

class JWTAuthentication(authentication.BaseAuthentication):
    """
    Authenticate JWT tokens signed with RS256 using a public key.
    """

    def authenticate(self, request):
        auth_header = authentication.get_authorization_header(request)

        if not auth_header:
            return None

        try:
            prefix, token = auth_header.decode("utf-8").split(" ")

            if prefix.lower() != "bearer":
                return None
        except ValueError:
            raise exceptions.AuthenticationFailed("Invalid Authorization header")

        try:
            with open(settings.JWT_PUBLIC_KEY_FILE, "r") as f:
                public_key = f.read()

            payload = jwt.decode(
                token,
                public_key,
                algorithms=["RS256"],
                options={"verify_aud": False},
            )
        except jwt.ExpiredSignatureError:
            raise exceptions.AuthenticationFailed("Token has expired")
        except jwt.InvalidTokenError as e:
            raise exceptions.AuthenticationFailed(f"Invalid token: {str(e)}")

        # User data is nested under "user" key in the token
        user_data = payload.get("user", {})

        phone_number = user_data.get("phone_number")
        if not phone_number:
            raise exceptions.AuthenticationFailed("Phone number not found in token")

        full_name = user_data.get("full_name", "Unknown")
        email = user_data.get("email", "Unknown")
        gender = user_data.get("gender", "Unknown")

        # Parse birthdate if present
        birthdate = None
        if "birthdate" in user_data and user_data["birthdate"]:
            try:
                birthdate = datetime.datetime.strptime(user_data["birthdate"], "%Y/%m/%d").date()
            except (ValueError, TypeError):
                try:
                    # Try alternative format
                    birthdate = datetime.datetime.strptime(user_data["birthdate"], "%Y-%m-%d").date()
                except (ValueError, TypeError):
                    pass

        # Get or create user
        user, created = User.objects.get_or_create(
            phone_number=phone_number,
            defaults={
                "full_name": full_name,
                "email": email,
                "gender": gender,
                "birthdate": birthdate,
            }
        )

        # Update user data if not created (sync with latest OAuth data)
        if not created:
            user.full_name = full_name
            user.email = email
            user.gender = gender
            if birthdate:
                user.birthdate = birthdate
            user.save()

        # Note: Profile picture is NOT included in JWT token to avoid huge token sizes
        # It should be handled separately during the OAuth callback via the sync endpoint

        return (user, payload)

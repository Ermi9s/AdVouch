import jwt
from django.conf import settings
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
        except jwt.InvalidTokenError:
            raise exceptions.AuthenticationFailed("Invalid token")

  
        user = AnonymousUser() #change to actual user later 
        return (user, payload)

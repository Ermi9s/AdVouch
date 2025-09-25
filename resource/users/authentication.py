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
        except jwt.InvalidTokenError:
            raise exceptions.AuthenticationFailed("Invalid token")

        phone_number = payload.get("phone_number")  
        if not phone_number:
            raise exceptions.AuthenticationFailed("Phone number not found in token")




        full_name = payload.get("full_name", "Unknown")  
        email = payload.get("email", "Unknown")
        gender = payload.get("gender", "Unknown")
        
        birthdate = datetime.strptime(payload["birthdate"], "%Y/%m/%d").date()

        
        user, created = User.objects.get_or_create(
            phone_number = phone_number,
            email = email,
            full_name=full_name,
            birthdate=birthdate,
            gender=gender,
            defaults = {
                "full_name" : full_name,
                "email" : email,
                "gender" : gender,
                "birthdate" : birthdate,
                
            }
        )
        
        if created:
            profile_picture_data = payload.get("picture")  

            if profile_picture_data:
                try:
                    format, imgstr = profile_picture_data.split(";base64,")  
                    ext = format.split("/")[-1] 
                    file = ContentFile(base64.b64decode(imgstr), name=f"{user.full_name}.{ext}")
                    user.profile_picture.save(file.name, file, save=True)

                except Exception as e:
                    print("Profile picture save failed:", e)
            
        return (user, payload)

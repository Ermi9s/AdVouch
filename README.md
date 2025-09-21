# Project structure
This project has multiple services 

- auth
- resource
- web

There are also other services such as redis, postgres and pgadmin in the docker-compose. 
To ru this project clone the repo, setup your .env files where the .env.examples are present according to the the specified keys in the .env.example.

then simply run `docker compose up --build`
NOTE: You will have to have docker installed in your machine.


## The `auth` service

This service is responsible for authentication using fayda. It exposes 3 endpoints:

- `GET api/v1/authorize`
- `POST api/v1/authenticate`
- `POST api/v1/refresh`

### Authentication flow

1. The client calls `GET api/v1/authorize` a successful response will contain `auth_url`
2. The client uses `auth_url` it will redirect to eSignet login page, the client then logs in using Fayda Id.
3. The eSignet page will redirect back to the client with response body.

   ```json
      {
        "session_id" : "",
        "auth_code" : "",
        "state" : "" // a crf token
      }
   ```
4. The client calls `POST api/v1/authenticate` and gets access and refresh token.



#### The `GET api/v1/authorize` 

Ok response:

```json
  {
    "message": "Redirecting to Fayda Esignet",
    "data" : {
      "session_id":"",
      "auth_url":""
    }
  }

```

#### The `POST api/v1/authenticate` 
Request body
```json
  {
    "session_id" : "",
  	"csrf_token" : "",
	  "auth_code" : ""
  }

```

Ok respons

```json
  {
    "message" : "User Authenticated sucessfully"
    "data" : {
      "access_token" : "",
      "refresh_token" : ""
    }
  }

```

#### The `POST api/v1/refresh` 
Request body
```json
  {
    "refresh_token" : "",
  }

```

Ok respons

```json
  {
    "message" : "refresh sucessfull"
    "data" : {
      "access_token" : "",
      "refresh_token" : ""
    }
  }

```

## The `resource` Service








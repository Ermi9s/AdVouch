package main

import (
	"log"
	"os"

	config "github.com/Ermi9s/AdVouch-AuthServer.git/internal/Config"
	"github.com/Ermi9s/AdVouch-AuthServer.git/internal/infrastructures/redis"
	"github.com/Ermi9s/AdVouch-AuthServer.git/internal/infrastructures/router"
)


func main() {
	log.SetFlags(log.LstdFlags | log.Lshortfile)
	var (
		clientId = os.Getenv("CLIENT_ID")
		authUri = os.Getenv("AUTHORIZATION_ENDPOINT")
		tokenUri = os.Getenv("TOKEN_ENDPOINT")
		userInfoUri = os.Getenv("USERINFO_ENDPOINT")
		clientAssertionType = os.Getenv("CLIENT_ASSERTION_TYPE")
		redirectUri = os.Getenv("REDIRECT_URI")
	)

	authConfig := config.NewAuthConfig(clientId, authUri, tokenUri, userInfoUri, clientAssertionType, redirectUri)
	redisClint := redis.NewRedisClient()

	router.Run("8080", authConfig, redisClint)
}
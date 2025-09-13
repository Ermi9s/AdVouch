package router

import (
	"log"
	"net/http"

	config "github.com/Ermi9s/AdVouch-AuthServer.git/internal/Config"
	"github.com/Ermi9s/AdVouch-AuthServer.git/internal/handlers"
	"github.com/Ermi9s/AdVouch-AuthServer.git/internal/infrastructures/redis"
	"github.com/gorilla/mux"
)



func Run(port string, authConfig *config.AuthConfig, redis *redis.RedisClient) {


	controller := handlers.NewFaydaOAuthHandler(
		redis, 
		authConfig.ClientID,
		authConfig.AuthorizeURL,
		authConfig.TokenURL,
		authConfig.UserInfoURL,
		authConfig.ClientAssertionType,
		authConfig.RedirectURI,
	)

	router := mux.NewRouter()
	router.HandleFunc("/authorize", controller.Authorize).Methods("GET", "OPTIONS")
	router.HandleFunc("/authenticate", controller.Authenticate).Methods("POST", "OPTIONS")
	router.HandleFunc("/refresh", controller.Refresh).Methods("POST", "OPTIONS")

    log.Printf("Server running on port %s", port)
    if err := http.ListenAndServe(":"+port, router); err != nil {
        log.Fatalf("failed to start server: %v", err)
    }
}
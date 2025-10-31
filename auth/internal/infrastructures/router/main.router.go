package router

import (
	"log"
	"net/http"

	config "github.com/Ermi9s/AdVouch-AuthServer.git/internal/Config"
	"github.com/Ermi9s/AdVouch-AuthServer.git/internal/handlers"
	"github.com/Ermi9s/AdVouch-AuthServer.git/internal/infrastructures/redis"
	"github.com/gorilla/mux"
)

// CORS middleware
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")

		// Allow specific origins or all if no origin header
		allowedOrigins := []string{
			"http://localhost:3000",
			"http://127.0.0.1:3000",
		}

		// Check if origin is in allowed list
		originAllowed := false
		for _, allowed := range allowedOrigins {
			if origin == allowed {
				originAllowed = true
				break
			}
		}

		// Set the origin header
		if originAllowed {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Access-Control-Allow-Credentials", "true")
		} else if origin == "" {
			// No origin header (direct access), allow all
			w.Header().Set("Access-Control-Allow-Origin", "*")
		} else {
			// Unknown origin, still allow but without credentials
			w.Header().Set("Access-Control-Allow-Origin", origin)
		}

		// Set other CORS headers
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, Cookie")
		w.Header().Set("Access-Control-Max-Age", "86400")

		// Handle preflight requests
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		// Call the next handler
		next.ServeHTTP(w, r)
	})
}

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
	router.HandleFunc("/api/v1/authorize", controller.Authorize).Methods("GET", "OPTIONS")
	router.HandleFunc("/api/v1/authenticate", controller.Authenticate).Methods("POST", "OPTIONS")
	router.HandleFunc("/api/v1/refresh", controller.Refresh).Methods("POST", "OPTIONS")

	// Apply CORS middleware
	handler := corsMiddleware(router)

	log.Printf("Server running on port %s", port)
	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatalf("failed to start server: %v", err)
	}
}

package handlers

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"time"

	"github.com/Ermi9s/AdVouch-AuthServer.git/internal/infrastructures/redis"
	"github.com/Ermi9s/AdVouch-AuthServer.git/internal/infrastructures/token"
	"github.com/golang-jwt/jwt"
	"github.com/gorilla/mux"
)

type FaydaOAuthHandler struct {
	Redis               *redis.RedisClient
	ClientID            string
	AuthorizeURL        string
	TokenURL            string
	UserInfoURL         string
	ClientAssertionType string
	RedirectURI         string
	TokenClient         *token.JWTtoken
}

func NewFaydaOAuthHandler(redis *redis.RedisClient, client_id, authorize_url, token_url, user_info_url, client_assertion_type, redirect_uri string) *FaydaOAuthHandler {
	return &FaydaOAuthHandler{
		Redis:               redis,
		ClientID:            client_id,
		AuthorizeURL:        authorize_url,
		TokenURL:            token_url,
		UserInfoURL:         user_info_url,
		ClientAssertionType: client_assertion_type,
		RedirectURI:         redirect_uri,
	}
}

func (h *FaydaOAuthHandler) Authorize(w http.ResponseWriter, r *http.Request) {
	log.Println("[INFO] Authorize called")
	request_origin := "Unspesified"
	request_referer := "Unspecified"
	redirectURI := h.RedirectURI

	request_vars := mux.Vars(r)

	request_origin = request_vars["request_origin"]
	request_referer = request_vars["request_referer"]

	log.Printf("[INFO] Authorize: request_origin=%s, request_referer=%s, redirectURI=%s", request_origin, request_referer, redirectURI)

	if redirectURI == "" {
		log.Printf("[INFO] Authorize: missing redirectURI for origin %s", request_origin)
		w.WriteHeader(400)
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "*")

		body := map[string]string{
			"message": fmt.Sprintf("Invalid origin: %s", request_origin),
		}
		byte_body, _ := json.Marshal(body)
		w.Write(byte_body)
		return
	}

	stateCSRFToken := RandomCSRFToken()
	codeVerifier := FaydaUniqueCodeVerifier()
	challenge := FaydaUniqueCodeChallenge(codeVerifier)

	sessionID := GenerateRandomString(32)
	sessionData := map[string]interface{}{
		"csrf_token":    stateCSRFToken,
		"code_verifier": codeVerifier,
		"redirect_uri":  redirectURI,
	}
	log.Printf("[INFO] Authorize: Generated sessionID=%s", sessionID)
	err := h.Redis.SetHash(sessionID, sessionData, 15*60)
	if err != nil {
		log.Printf("[ERROR] Authorize: Failed to store session: %v", err)
		w.WriteHeader(500)
		w.Header().Set("content-type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "*")

		body := map[string]string{
			"message": fmt.Sprintf("Failed to store session: %v", err),
		}
		byte_body, _ := json.Marshal(body)
		w.Write(byte_body)
		return
	}

	authParams := url.Values{
		"client_id":             {h.ClientID},
		"response_type":         {"code"},
		"redirect_uri":          {redirectURI},
		"code_challenge":        {challenge},
		"code_challenge_method": {"S256"},
		"scope":                 {"openid profile email"},
		"state":                 {stateCSRFToken},
	}
	authURL := h.AuthorizeURL + "?" + authParams.Encode()
	log.Printf("[INFO] Authorize: Generated authURL=%s", authURL)

	body := map[string]string{
		"message":     "Redirecting to Fayda Esignet",
		"auth_url":    authURL,
		"session_id":  sessionID,
		"utm_referer": request_referer,
		"utm_source":  request_origin,
	}

	byte_body, err := json.Marshal(body)
	if err != nil {
		w.WriteHeader(500)
		w.Header().Set("content-type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "*")

		body := map[string]string{
			"message": fmt.Sprintf("Failed to marshal body: %v", err),
		}
		byte_body, _ := json.Marshal(body)
		w.Write(byte_body)
		return
	}

	w.WriteHeader(200)
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	log.Printf("[INFO] Authorize: Responded with sessionID=%s", sessionID)
	w.Write(byte_body)

}

func (h *FaydaOAuthHandler) Authenticate(w http.ResponseWriter, r *http.Request) {
	log.Println("[INFO] Authenticate called")
	request_body_byte, err := io.ReadAll(r.Body)

	if err != nil {
		log.Printf("[ERROR] Authenticate: Error reading body: %v", err)
		w.WriteHeader(500)
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "*")

		body := map[string]string{
			"message": "Error Reading body",
		}
		byte_body, _ := json.Marshal(body)
		w.Write(byte_body)
		return
	}

	var body map[string]string
	err = json.Unmarshal(request_body_byte, &body)

	if err != nil {
		log.Printf("[ERROR] Authenticate: Error unmarshaling body: %v", err)
		w.WriteHeader(500)
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "*")

		body := map[string]string{
			"message": "Error Unmarshaling body",
		}
		byte_body, _ := json.Marshal(body)
		w.Write(byte_body)
		return
	}

	sessionID := body["session_id"]
	csrfToken := body["csrf_token"]
	authCode := body["auth_code"]
	log.Printf("[INFO] Authenticate: sessionID=%s, csrfToken=%s", sessionID, csrfToken)

	sessionDataInitial, err := h.Redis.Client.HGetAll(h.Redis.Ctx, sessionID).Result()
	sessionData := make(map[string]interface{})
	for key, val := range sessionDataInitial {
		sessionData[key] = val
	}

	if err != nil || len(sessionData) == 0 {
		log.Printf("[INFO] Authenticate: Invalid or expired session for sessionID=%s", sessionID)
		w.WriteHeader(400)
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "*")

		body := map[string]string{
			"message": "Invalid or expired session",
		}
		byte_body, _ := json.Marshal(body)
		w.Write(byte_body)
		return

	}
	if sessionData["csrf_token"] != csrfToken {
		log.Printf("[INFO] Authenticate: Invalid CSRF token for sessionID=%s", sessionID)
		w.WriteHeader(400)
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "*")

		body := map[string]string{
			"message": "Invalid CSRF token",
		}
		byte_body, _ := json.Marshal(body)
		w.Write(byte_body)
		return
	}

	// Generate client assertion
	clientAssertion, err := FaydaClientAssertionSecretGenerator()
	if err != nil {
		log.Printf("[ERROR] Authenticate: Failed to generate client assertion: %v", err)
		w.WriteHeader(500)
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "*")

		body := map[string]string{
			"message": fmt.Sprintf("Failed to generate client assertion: %v", err),
		}
		byte_body, _ := json.Marshal(body)
		w.Write(byte_body)
		return
	}

	redirect_uri, ok := sessionData["redirect_uri"].(string)
	if !ok {
		log.Printf("[ERROR] Authenticate: redirect_uri is not a string for sessionID=%s", sessionID)
		w.WriteHeader(500)
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "*")

		body := map[string]string{
			"message": "redirect_uri is not a string",
		}
		byte_body, _ := json.Marshal(body)
		w.Write(byte_body)
		return
	}

	code_verifier, ok := sessionData["code_verifier"].(string)
	if !ok {
		log.Printf("[ERROR] Authenticate: code_verifier is not a string for sessionID=%s", sessionID)
		w.WriteHeader(500)
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "*")

		body := map[string]string{
			"message": "redirect_uri is not a string",
		}
		byte_body, _ := json.Marshal(body)
		w.Write(byte_body)
		return
	}

	data := url.Values{
		"grant_type":            {"authorization_code"},
		"code":                  {authCode},
		"redirect_uri":          {redirect_uri},
		"code_verifier":         {code_verifier},
		"client_id":             {h.ClientID},
		"client_assertion":      {clientAssertion},
		"client_assertion_type": {h.ClientAssertionType},
	}

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.PostForm(h.TokenURL, data)
	if err != nil {
		log.Printf("[ERROR] Authenticate: Token request failed: %v", err)
		w.WriteHeader(500)
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "*")

		body := map[string]string{
			"message": fmt.Sprintf("Token request failed: %v", err),
		}
		byte_body, _ := json.Marshal(body)
		w.Write(byte_body)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log.Printf("[ERROR] Authenticate: Token endpoint returned status: %d", resp.StatusCode)
		w.WriteHeader(500)
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "*")

		body := map[string]string{
			"message": fmt.Sprintf("Token endpoint returned status: %d", resp.StatusCode),
		}
		byte_body, _ := json.Marshal(body)
		w.Write(byte_body)
		return
	}

	var tokenResp struct {
		AccessToken string `json:"access_token"`
		IDToken     string `json:"id_token"`
		TokenType   string `json:"token_type"`
		ExpiresIn   int    `json:"expires_in"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&tokenResp); err != nil {
		log.Printf("[ERROR] Authenticate: Failed to decode token response: %v", err)
		w.WriteHeader(500)
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "*")

		body := map[string]string{
			"message": fmt.Sprintf("Failed to decode token response: %v", err),
		}
		byte_body, _ := json.Marshal(body)
		w.Write(byte_body)
		return
	}

	req, err := http.NewRequest("GET", h.UserInfoURL, nil)
	if err != nil {
		log.Printf("[ERROR] Authenticate: Failed to create user info request: %v", err)
		w.WriteHeader(500)
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "*")

		body := map[string]string{
			"message": fmt.Sprintf("Failed to create user info request: %v", err),
		}
		byte_body, _ := json.Marshal(body)
		w.Write(byte_body)
		return
	}
	req.Header.Set("Authorization", "Bearer "+tokenResp.AccessToken)

	client = &http.Client{}

	userInfoResp, err := client.Do(req)
	if err != nil {
		log.Printf("[ERROR] Authenticate: Failed to fetch user info: %v", err)
		w.WriteHeader(500)
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "*")

		body := map[string]string{
			"message": fmt.Sprintf("Failed to fetch user info: %v", err),
		}
		byte_body, _ := json.Marshal(body)
		w.Write(byte_body)
		return
	}
	defer userInfoResp.Body.Close()

	if userInfoResp.StatusCode != http.StatusOK {
		log.Printf("[ERROR] Authenticate: User info endpoint returned status: %d", userInfoResp.StatusCode)
		w.WriteHeader(500)
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "*")

		body := map[string]string{
			"message": fmt.Sprintf("User info endpoint returned status: %d", userInfoResp.StatusCode),
		}
		byte_body, _ := json.Marshal(body)
		w.Write(byte_body)
		return
	}

	responseTokenBytes, err := io.ReadAll(userInfoResp.Body)
	if err != nil {
		log.Printf("[ERROR] Authenticate: Failed to read response body: %v", err)
		w.WriteHeader(500)
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "*")

		body := map[string]string{
			"message": fmt.Sprintf("Failed to read response body: %v", err),
		}
		byte_body, _ := json.Marshal(body)
		w.Write(byte_body)
		return
	}
	responseToken := string(responseTokenBytes)

	parsedToken, _, err := new(jwt.Parser).ParseUnverified(responseToken, jwt.MapClaims{})
	if err != nil {
		log.Printf("[ERROR] Authenticate: Failed to decode JWT token: %v", err)
		w.WriteHeader(500)
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "*")

		body := map[string]string{
			"message": fmt.Sprintf("Failed to decode JWT token: %v", err),
		}
		byte_body, _ := json.Marshal(body)
		w.Write(byte_body)
		return
	}

	userInfo := make(map[string]interface{})
	if claims, ok := parsedToken.Claims.(jwt.MapClaims); ok {
		for key, value := range claims {
			userInfo[key] = value
		}
		log.Printf("[INFO] Authenticate: Parsed user claims for sessionID=%s", sessionID)
	} else {
		log.Printf("[ERROR] Authenticate: Failed to parse user claims for sessionID=%s", sessionID)
		w.WriteHeader(500)
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "*")

		body := map[string]string{
			"message": "Failed to parse user claims",
		}
		byte_body, _ := json.Marshal(body)
		w.Write(byte_body)
		return
	}

	accessToken, refreshToekn, err := h.TokenClient.CreateToken(userInfo, 1, sessionID)
	if err != nil {
		log.Printf("[ERROR] Authenticate: Failed to create token: %v", err)
		w.WriteHeader(500)
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "*")

		body := map[string]string{
			"message": err.Error(),
		}
		byte_body, _ := json.Marshal(body)
		w.Write(byte_body)
		return
	}

	err = h.Redis.SetHash(sessionID, userInfo, 86400)
	if err != nil {
		log.Printf("[ERROR] Authenticate: Failed to update session with user info: %v", err)
		w.WriteHeader(500)
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "*")

		body := map[string]string{
			"message": err.Error(),
		}
		byte_body, _ := json.Marshal(body)
		w.Write(byte_body)
		return
	}

	log.Printf("[INFO] Authenticate: User authenticated successfully, sessionID=%s", sessionID)
	w.WriteHeader(200)
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	returnBody := map[string]string{
		"message":       "User Authenticated sucessfully",
		"access_token":  accessToken,
		"refresh_token": refreshToekn,
	}
	byte_body, _ := json.Marshal(returnBody)
	w.Write(byte_body)

}

func (h *FaydaOAuthHandler) Refresh(w http.ResponseWriter, r *http.Request) {
	log.Println("[INFO] Refresh called")
	request_body_byte, err := io.ReadAll(r.Body)

	if err != nil {
		log.Printf("[ERROR] Refresh: Error reading body: %v", err)
		w.WriteHeader(500)
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "*")

		body := map[string]string{
			"message": fmt.Sprintf("Error Reading body: %s", err),
		}
		byte_body, _ := json.Marshal(body)
		w.Write(byte_body)
		return
	}

	var body map[string]string
	err = json.Unmarshal(request_body_byte, &body)

	if err != nil {
		log.Printf("[ERROR] Refresh: Error unmarshaling body: %v", err)
		w.WriteHeader(500)
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "*")

		body := map[string]string{
			"message": "Error Unmarshaling body",
		}
		byte_body, _ := json.Marshal(body)
		w.Write(byte_body)
		return
	}

	refreshToken := body["refresh_token"]
	publicKey := body["key"]
	log.Printf("[INFO] Refresh: refreshToken received")

	parsedToken, err := jwt.Parse(refreshToken, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodRSA); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return publicKey, nil
	})

	if err != nil {
		log.Printf("[ERROR] Refresh: Failed to parse refresh token: %v", err)
		w.WriteHeader(500)
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "*")

		body := map[string]string{
			"message": err.Error(),
		}
		byte_body, _ := json.Marshal(body)
		w.Write(byte_body)
		return
	}

	var sub string = ""

	if claims, ok := parsedToken.Claims.(jwt.MapClaims); ok && parsedToken.Valid {
		exp, exists := claims["exp"]
		if !exists {
			log.Printf("[ERROR] Refresh: exp claim is missing")
			err = errors.New("exp claim is missing")
			if err != nil {
				w.WriteHeader(500)
				w.Header().Set("Content-Type", "application/json")
				w.Header().Set("Access-Control-Allow-Origin", "*")

				body := map[string]string{
					"message": err.Error(),
				}
				byte_body, _ := json.Marshal(body)
				w.Write(byte_body)
				return
			}

			subject, exists := claims["sub"]
			sub, ok = subject.(string)
			if !exists || !ok {
				log.Printf("[ERROR] Refresh: sub claim is missing or not a string")
				err = errors.New("exp claim is missing")
				if err != nil {
					w.WriteHeader(500)
					w.Header().Set("Content-Type", "application/json")
					w.Header().Set("Access-Control-Allow-Origin", "*")

					body := map[string]string{
						"message": "error extracting claim",
					}
					byte_body, _ := json.Marshal(body)
					w.Write(byte_body)
					return
				}

			}

			expFloat, ok := exp.(float64)
			if !ok {
				log.Printf("[ERROR] Refresh: exp claim is not a valid number")
				err = errors.New("exp claim is not a valid number")
				if err != nil {
					w.WriteHeader(500)
					w.Header().Set("Content-Type", "application/json")
					w.Header().Set("Access-Control-Allow-Origin", "*")

					body := map[string]string{
						"message": err.Error(),
					}
					byte_body, _ := json.Marshal(body)
					w.Write(byte_body)
					return
				}

			}

			expTime := time.Unix(int64(expFloat), 0)

			// Compare with current time
			now := time.Now()
			if expTime.Before(now) || expTime.Equal(now) {
				log.Printf("[ERROR] Refresh: Token expired for sub=%s", sub)
				err = errors.New("expired Token")
				if err != nil {
					w.WriteHeader(500)
					w.Header().Set("Content-Type", "application/json")
					w.Header().Set("Access-Control-Allow-Origin", "*")

					body := map[string]string{
						"message": err.Error(),
					}
					byte_body, _ := json.Marshal(body)
					w.Write(byte_body)
					return
				}

			}

		} else {
			log.Printf("[ERROR] Refresh: Invalid or expired token")
			err = errors.New("expired Token")
			if err != nil {
				w.WriteHeader(500)
				w.Header().Set("Content-Type", "application/json")
				w.Header().Set("Access-Control-Allow-Origin", "*")

				body := map[string]string{
					"message": err.Error(),
				}
				byte_body, _ := json.Marshal(body)
				w.Write(byte_body)
				return
			}

		}
	}

	sessionDataInitial, err := h.Redis.Client.HGetAll(h.Redis.Ctx, sub).Result()
	sessionData := make(map[string]interface{})
	for key, val := range sessionDataInitial {
		sessionData[key] = val
	}

	if err != nil || len(sessionData) == 0 {
		log.Printf("[INFO] Refresh: Invalid or expired session for sub=%s", sub)
		w.WriteHeader(400)
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "*")

		body := map[string]string{
			"message": "Invalid or expired session",
		}
		byte_body, _ := json.Marshal(body)
		w.Write(byte_body)
		return
	}

	userInfo, ok := sessionData[sub].(map[string]interface{})

	if !ok {
		log.Printf("[ERROR] Refresh: error getting user info from refresh session for sub=%s", sub)
		w.WriteHeader(500)
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "*")

		body := map[string]string{
			"message": "error getting user info from refresh session",
		}
		byte_body, _ := json.Marshal(body)
		w.Write(byte_body)
		return
	}

	accessToken, refreshToekn, err := h.TokenClient.CreateToken(userInfo, 1, sub)
	if err != nil {
		log.Printf("[ERROR] Refresh: Failed to create token: %v", err)
		w.WriteHeader(500)
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "*")

		body := map[string]string{
			"message": err.Error(),
		}
		byte_body, _ := json.Marshal(body)
		w.Write(byte_body)
		return
	}

	log.Printf("[INFO] Refresh: Token refreshed successfully for sub=%s", sub)
	w.WriteHeader(200)
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	body = map[string]string{
		"message":       "refresh successful",
		"access_token":  accessToken,
		"refresh_token": refreshToekn,
	} 
	byte_body, _ := json.Marshal(body)
	w.Write(byte_body)

}

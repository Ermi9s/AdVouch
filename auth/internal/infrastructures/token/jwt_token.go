package token

import (
	"crypto/rand"
	"crypto/rsa"
	"log"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type JWTtoken struct {
	Private *rsa.PrivateKey
}

func NewJWT() (*JWTtoken, error) {
	// Try to read existing private key file
	privData, err := os.ReadFile("/auth/private.pem")
	if err != nil {
		// If file doesn't exist, generate a new RSA key pair
		log.Println("Private key file not found, generating new RSA key pair...")
		privateKey, err := rsa.GenerateKey(rand.Reader, 2048)
		if err != nil {
			log.Println("Error generating RSA key:", err)
			return nil, err
		}

		log.Println("Successfully generated new RSA private key")
		return &JWTtoken{
			Private: privateKey,
		}, nil
	}

	// Parse existing private key
	privateKey, err := jwt.ParseRSAPrivateKeyFromPEM(privData)
	if err != nil {
		log.Println("Error parsing private key:", err)
		return nil, err
	}

	log.Println("Successfully loaded private key from file")
	return &JWTtoken{
		Private: privateKey,
	}, nil
}

func (jwtT *JWTtoken) CreateToken(payload map[string]interface{}, expire_after_hours int, sessionId string) (string, string, error) {
	accessClaims := jwt.MapClaims{
		"sub":  sessionId,
		"iss":  "adVouch-AuthServer",
		"user": payload,
		"exp":  time.Now().Add(time.Duration(expire_after_hours) * time.Hour).Unix(),
	}

	accessToken := jwt.NewWithClaims(jwt.SigningMethodRS256, accessClaims)

	accessTokenString, err := accessToken.SignedString(jwtT.Private)
	if err != nil {
		log.Println("Error generating access token string: ", err)
		return "", "", err
	}

	refreshClaims := jwt.MapClaims{
		"sub": sessionId,
		"iss": "adVouch-AuthServer",
		"exp": time.Now().Add(time.Duration(30*24) * time.Hour).Unix(), // 30 days
	}

	refreshToken := jwt.NewWithClaims(jwt.SigningMethodRS256, refreshClaims)

	refreshTokenString, err := refreshToken.SignedString(jwtT.Private)
	if err != nil {
		log.Println("Error generating access token string: ", err)
		return "", "", err
	}

	return accessTokenString, refreshTokenString, nil
}

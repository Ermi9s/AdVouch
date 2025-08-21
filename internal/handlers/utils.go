package handlers

import (
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha256"
	"encoding/base64"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/golang-jwt/jwt"
	"github.com/lestrrat-go/jwx/jwk"
)

func RandomCSRFToken() string {
	return GenerateRandomString(24)
}

func FaydaUniqueCodeVerifier() string {
	b := make([]byte, 32)
	rand.Read(b)
	return base64.RawURLEncoding.EncodeToString(b)
}

func FaydaUniqueCodeChallenge(verifier string) string {
	h := sha256.Sum256([]byte(verifier))
	return base64.RawURLEncoding.EncodeToString(h[:])
}

func GenerateRandomString(length int) string {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, length)
	rand.Read(b)
	for i := range b {
		b[i] = charset[b[i]%byte(len(charset))]
	}
	return string(b)
}

func FaydaClientAssertionSecretGenerator() (string, error) {
	privateKey := os.Getenv("FAYDA_OAUTH_PRIVATE_KEY")
	clientID := os.Getenv("FAYDA_OAUTH_CLIENT_ID")
	tokenURL := os.Getenv("FAYDA_TOKEN_URL")

	if privateKey == "" || clientID == "" || tokenURL == "" {
		log.Fatal("Missing required environment variables")
		return "", fmt.Errorf("missing required environment variables")
	}

	privateKeyBytes, err := base64.StdEncoding.DecodeString(privateKey)
	if err != nil {
		log.Fatal("Failed to decode base64 private key")
		return "", fmt.Errorf("failed to decode base64 private key: %w", err)
	}

	rsaPrivateKey, err := parseJWKPrivateKey(privateKeyBytes)
	if err != nil {
		log.Fatal("Failed to parse private key from JWK")
		return "", fmt.Errorf("failed to parse private key from JWK: %w", err)
	}

	claims := jwt.MapClaims{
		"iss": clientID,
		"aud": tokenURL,
		"sub": clientID,
		"exp": time.Now().Add(time.Hour * 24).Unix(),
		"iat": time.Now().Unix(),
	}

	clientAssert := jwt.NewWithClaims(jwt.SigningMethodRS256, claims)
	clientAssertString, err := clientAssert.SignedString(rsaPrivateKey)
	if err != nil {
		log.Fatal("Failed to sign JWT")
		return "", fmt.Errorf("failed to sign JWT: %w", err)
	}

	log.Println("Client assertion generated successfully")
	return clientAssertString, nil
}

func parseJWKPrivateKey(jwkData []byte) (*rsa.PrivateKey, error) {
	key, err := jwk.ParseKey(jwkData)
	if err != nil {
		return nil, fmt.Errorf("failed to parse JWK: %w", err)
	}

	var rawKey interface{}
	if err := key.Raw(&rawKey); err != nil {
		return nil, fmt.Errorf("failed to extract raw key: %w", err)
	}

	rsaKey, ok := rawKey.(*rsa.PrivateKey)
	if !ok {
		return nil, fmt.Errorf("extracted key is not an RSA private key (type: %T)", rawKey)
	}

	log.Println("Parsed private key from JWK format successfully")
	return rsaKey, nil
}
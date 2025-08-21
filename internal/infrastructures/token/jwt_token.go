package token

import (
    "crypto/rsa"
    "encoding/base64"
    "fmt"
    "os"
    "time"

    "github.com/golang-jwt/jwt/v4"
    "github.com/lestrrat-go/jwx/jwk"

)

type FaydaJWT struct {
    privateKey *rsa.PrivateKey
    clientID   string
    tokenURL   string
}


func NewFaydaJWT() (*FaydaJWT, error) {
    privateKey := os.Getenv("FAYDA_OAUTH_PRIVATE_KEY")
    clientID := os.Getenv("FAYDA_OAUTH_CLIENT_ID")
    tokenURL := os.Getenv("FAYDA_TOKEN_URL")

    if privateKey == "" || clientID == "" || tokenURL == "" {
        return nil, fmt.Errorf("missing required environment variables")
    }

    privateKeyBytes, err := base64.StdEncoding.DecodeString(privateKey)
    if err != nil {
        return nil, fmt.Errorf("failed to decode base64 private key: %w", err)
    }

    rsaPrivateKey, err := parseJWKPrivateKey(privateKeyBytes)
    if err != nil {
        return nil, fmt.Errorf("failed to parse private key from JWK: %w", err)
    }

    return &FaydaJWT{
        privateKey: rsaPrivateKey,
        clientID:   clientID,
        tokenURL:   tokenURL,
    }, nil
}


func (f *FaydaJWT) GenerateClientAssertion() (string, error) {
    claims := jwt.MapClaims{
        "iss": f.clientID,
        "aud": f.tokenURL,
        "sub": f.clientID,
        "exp": time.Now().Add(time.Minute * 5).Unix(), 
        "iat": time.Now().Unix(),
    }

    clientAssert := jwt.NewWithClaims(jwt.SigningMethodRS256, claims)
    return clientAssert.SignedString(f.privateKey)
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

    return rsaKey, nil
}

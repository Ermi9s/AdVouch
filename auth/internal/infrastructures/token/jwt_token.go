package token

import (
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
	privData, err := os.ReadFile("/auth/private.pem") // update later, mount needed
	if err != nil {
		log.Println("Error reading private key file:", err)
		return nil, err
	}

	privateKey, err := jwt.ParseRSAPrivateKeyFromPEM(privData)
	if err != nil {
		log.Println("Error parsing private key:", err)
		return nil, err
	}

    return &JWTtoken{
        Private: privateKey,
    }, nil
}



func (jwtT *JWTtoken)CreateToken(payload map[string]interface{}, expire_after_hours int, sessionId string) (string, string, error) {
    accessClaims := jwt.MapClaims{
        "sub" : sessionId,
        "iss" : "adVouch-AuthServer",
        "user" : payload,
        "exp" : time.Now().Add(time.Duration(expire_after_hours) * time.Hour).Unix(),
    }

    accessToken := jwt.NewWithClaims(jwt.SigningMethodRS256, accessClaims)

    accessTokenString, err := accessToken.SignedString(jwtT.Private);
    if err != nil {
        log.Println("Error generating access token string: ", err)
        return "","",err
    }   


    refreshClaims := jwt.MapClaims{
        "sub" : sessionId,
        "iss" : "adVouch-AuthServer",
        "exp" : time.Now().Add(time.Duration(24) * time.Hour).Unix(),
    }

    refreshToken := jwt.NewWithClaims(jwt.SigningMethodRS256, refreshClaims)

    refreshTokenString, err := refreshToken.SignedString(jwtT.Private);
    if err != nil {
        log.Println("Error generating access token string: ", err)
        return "","",err
    } 

    return accessTokenString, refreshTokenString, nil
}
package token

import (
	"crypto/rand"
	"crypto/rsa"
	"log"
	"time"

	"github.com/golang-jwt/jwt/v5"
)



type JWTtoken struct {
    Private *rsa.PrivateKey
    Public *rsa.PublicKey
}


func NewJWT() (*JWTtoken, error) {
    privateKey, err := rsa.GenerateKey(rand.Reader, 2048)
    if err != nil {
        log.Println("Error generating RSA key:", err)
        return &JWTtoken{}, err
    }
    publicKey := &privateKey.PublicKey

    return &JWTtoken{
        Private: privateKey,
        Public: publicKey,
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
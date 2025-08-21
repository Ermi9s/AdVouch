package domain


type FaydaUserInfo struct {
	Email     string                 `json:"email"`
	Phone     string                 `json:"phone"`
	Name      string                 `json:"name"`
	Gender    string                 `json:"gender"`
	Birthdate string                 `json:"birthdate"`
	Address   map[string]interface{} `json:"address"`
	Picture   string                 `json:"picture"`
}



type TokenProvider interface {
    GenerateClientAssertion() (string, error)
}

type SessionStore interface {
    Save(sessionID string, data map[string]string, ttlSeconds int) error
    Get(sessionID string) (map[string]string, error)
}

type OAuthTokenProvider interface {
    GenerateClientAssertion() (string, error)
    // ExchangeAuthCode(code, codeVerifier, redirectURI string) (TokenResponse, error)
    FetchUserInfo(accessToken string) (FaydaUserInfo, error)
}

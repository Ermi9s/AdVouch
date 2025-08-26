package config


type AuthConfig struct {
	ClientID            string
	AuthorizeURL        string
	TokenURL            string
	UserInfoURL         string
	ClientAssertionType string
	RedirectURI 		string
}


func NewAuthConfig(client_id string, auth_url string, token_url string, user_info_url string, client_assertion_type string, redirect_url string) *AuthConfig {
	return &AuthConfig{
		ClientID: client_id,
		AuthorizeURL: auth_url,
		TokenURL: token_url,
		UserInfoURL: user_info_url,
		ClientAssertionType: client_assertion_type,
		RedirectURI: redirect_url,
	}
}



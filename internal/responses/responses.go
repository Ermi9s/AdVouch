package responses


func SuccessResponse(message string, data interface{}, statusCode int) map[string]interface{} {
	return map[string]interface{}{
		"message":     message,
		"data":        data,
		"status_code": statusCode,
	}
}


type FaydaAuthError struct {
	Message    string
	StatusCode int
}

func (e *FaydaAuthError) Error() string {
	return e.Message
}
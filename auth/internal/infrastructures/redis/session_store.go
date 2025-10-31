package redis

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/redis/go-redis/v9"
)

type RedisClient struct {
	Client *redis.Client
	Ctx    context.Context
}

func NewRedisClient() *RedisClient {
	redisHost := os.Getenv("REDIS_HOST")
	redisPort := os.Getenv("REDIS_PORT")

	var err error
	var client *redis.Client
	ctx := context.Background()

	for i := 0; i < 5; i++ {
		redisAddr := fmt.Sprintf("%s:%s", redisHost, redisPort)
		log.Printf("Connecting to Redis at: %s attempt %d", redisAddr, i+1)

		client = redis.NewClient(&redis.Options{
			Addr: redisAddr,
		})

		_, err = client.Ping(ctx).Result()
		if err == nil {
			break
		}
	}

	if err != nil {
		panic(err)
	}

	return &RedisClient{Client: client, Ctx: ctx}
}

func (rc *RedisClient) SetHash(key string, values map[string]interface{}, expiration int) error {
	pipe := rc.Client.Pipeline()
	for k, v := range values {
		// Convert value to string if it's not already a simple type
		var strValue string
		switch val := v.(type) {
		case string:
			strValue = val
		case int, int64, float64, bool:
			strValue = fmt.Sprintf("%v", val)
		default:
			// For complex types, marshal to JSON
			jsonBytes, err := json.Marshal(val)
			if err != nil {
				return fmt.Errorf("failed to marshal value for key %s: %w", k, err)
			}
			strValue = string(jsonBytes)
		}
		pipe.HSet(rc.Ctx, key, k, strValue)
	}
	pipe.Expire(rc.Ctx, key, time.Duration(expiration)*time.Second)
	_, err := pipe.Exec(rc.Ctx)
	return err
}

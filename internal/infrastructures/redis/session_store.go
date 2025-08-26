package redis


import (
	"context"
	"fmt"
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

	redisAddr := fmt.Sprintf("%s:%s", redisHost, redisPort)
	fmt.Println("Connecting to Redis at:", redisAddr)

	client := redis.NewClient(&redis.Options{
		Addr: redisAddr,
	})
	ctx := context.Background()

	_, err := client.Ping(ctx).Result()
	if err != nil {
		panic(err)
	}

	return &RedisClient{Client: client, Ctx: ctx}
}

func (rc *RedisClient) SetHash(key string, values map[string]interface{}, expiration int) error {
	pipe := rc.Client.Pipeline()
	for k, v := range values {
		pipe.HSet(rc.Ctx, key, k, v)
	}
	pipe.Expire(rc.Ctx, key, time.Duration(expiration)*time.Second)
	_, err := pipe.Exec(rc.Ctx)
	return err
}
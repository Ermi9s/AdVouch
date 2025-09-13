FROM golang:1.24.5-alpine

RUN apk update && apk add --no-cache build-base

WORKDIR /app

COPY go.mod go.sum ./

RUN go mod download

COPY . .


RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o /app/advouch ./cmd/main.go


CMD ["./advouch"]
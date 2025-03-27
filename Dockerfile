FROM golang:1.22 AS builder

RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

RUN go install go.k6.io/xk6/cmd/xk6@v0.14.3
RUN xk6 build v0.54.0 \
      --with github.com/grafana/xk6-browser@v1.10.0 \
      --with github.com/avitalique/xk6-file@v1.4.2 \
      --with github.com/acuenca-facephi/xk6-read@v1.0.0 \
      --with github.com/grafana/xk6-faker@v0.4.1

FROM alpine:latest
RUN apk add --no-cache ca-certificates chromium
COPY --from=builder /go/k6 /usr/bin/k6

ENV TERM=xterm-256color
ENV PROJECT_DIR=/home/k6

ENV CHROME_BIN=/usr/bin/chromium-browser
ENV CHROME_PATH=/usr/lib/chromium/
ENV K6_BROWSER_HEADLESS=true
ENV K6_BROWSER_ARGS=no-sandbox

WORKDIR ${PROJECT_DIR}

VOLUME [ "/home/k6" ]
ENTRYPOINT ["k6"]

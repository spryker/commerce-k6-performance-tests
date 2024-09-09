FROM golang:1.20 AS builder

RUN go install go.k6.io/xk6/cmd/xk6@latest
RUN xk6 build v0.53.0 --with github.com/grafana/xk6-browser@latest --with github.com/avitalique/xk6-file@latest --with github.com/acuenca-facephi/xk6-read@latest --with github.com/szkiba/xk6-faker@latest

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

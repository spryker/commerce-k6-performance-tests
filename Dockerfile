FROM grafana/k6:0.46.0-with-browser

ENV TERM=xterm-256color
ENV PROJECT_DIR=/home/k6
ENV K6_BROWSER_ARGS='no-sandbox'

VOLUME [ "/home/k6" ]
FROM grafana/k6:0.56.0-with-browser

ENV TERM=xterm-256color
ENV PROJECT_DIR=/home/k6

VOLUME [ "/home/k6" ]
FROM grafana/k6:0.42.0

ENV TERM=xterm-256color
ENV PROJECT_DIR=/home/k6

VOLUME [ "/home/k6" ]
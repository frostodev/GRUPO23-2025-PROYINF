#!/usr/bin/env sh
# show_frontend_css.sh
# Usage: ./script/show_frontend_css.sh [--host] [-f COMPOSE_FILE] [-s SERVICE]
#
# By default this runs inside the docker compose service and prints the CSS files
# from /app/src/*.css (first 240 lines). If --host is provided it will read the
# files from the host path ./frontend/src/*.css instead.
#
# Examples:
#  ./script/show_frontend_css.sh                # use docker-compose.yml, service 'frontend'
#  ./script/show_frontend_css.sh -f docker-compose2.yml -s frontend
#  ./script/show_frontend_css.sh --host         # read files on the host

set -eu

SCRIPT_DIR=$(dirname "$0")
COMPOSE_FILE="docker-compose.yml"
SERVICE="frontend"
HOST=false

print_help() {
  cat <<EOF
Usage: $0 [options]

Options:
  -f, --file COMPOSE_FILE   Use a specific docker compose file (default: docker-compose.yml)
  -s, --service SERVICE     Use a specific service name (default: frontend)
  --host                    Read CSS files from host path ./frontend/src instead of inside container
  -h, --help                Show this help

Examples:
  $0
  $0 -f docker-compose2.yml -s frontend
  $0 --host
EOF
}

while [ $# -gt 0 ]; do
  case "$1" in
    -f|--file)
      COMPOSE_FILE="$2"; shift 2;;
    -s|--service)
      SERVICE="$2"; shift 2;;
    --host)
      HOST=true; shift;;
    -h|--help)
      print_help; exit 0;;
    *)
      echo "Unknown arg: $1" >&2; print_help; exit 1;;
  esac
done

if [ "$HOST" = "true" ]; then
  echo "Reading CSS files from host: ./frontend/src/*.css"
  for f in ./frontend/src/*.css; do
    [ -f "$f" ] || continue
    echo "===== $f ====="
    sed -n '1,240p' "$f" || true
    echo
  done
  exit 0
fi

DOCKER_CMD="docker compose -f $COMPOSE_FILE"

echo "Reading CSS files from container service '$SERVICE' (compose file: $COMPOSE_FILE)"
${DOCKER_CMD} exec -T "$SERVICE" sh -lc '
  for f in /app/src/*.css; do
    [ -f "$f" ] || continue
    echo "===== $f ====="
    sed -n "1,240p" "$f" || true
    echo
  done
'

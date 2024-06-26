#!/bin/bash

# Change to your email and domain (for Let's Encrypt)
email=myemail@example.org
domain=my.domain.org

cat >/root/compose.yaml <<EOL
version: "3.8"

services:

  traefik:
    image: "traefik:v2.10"
    container_name: "traefik"
    command:
      #- "--log.level=DEBUG"
      - "--api.insecure=true"
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.web.http.redirections.entrypoint.to=websecure"
      - "--entrypoints.web.http.redirections.entrypoint.scheme=https"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.jatosresolver.acme.tlschallenge=true"
      #- "--certificatesresolvers.jatosresolver.acme.caserver=https://acme-staging-v02.api.letsencrypt.org/directory"
      - "--certificatesresolvers.jatosresolver.acme.email=${email}"
      - "--certificatesresolvers.jatosresolver.acme.storage=/letsencrypt/acme.json"
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - "./letsencrypt:/letsencrypt"
      - "/var/run/docker.sock:/var/run/docker.sock:ro"

  jatos:
    image: "jatos/jatos:latest"
    container_name: "jatos"
    ports:
      - "9000:9000"
    volumes:
      - "jatos-logs:/opt/jatos/logs"
      - "jatos-data:/opt/jatos_data"
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.jatos.rule=Host(\`${domain}\`)"
      - "traefik.http.services.jatos.loadbalancer.server.port=9000"
      - "traefik.http.routers.jatos.entrypoints=websecure"
      - "traefik.http.routers.jatos.tls.certresolver=jatosresolver"
    command:
      - '-Djatos.resultUploads.limitPerStudyRun=500MB'
      - '-Djatos.resultUploads.maxFileSize=500MB'
      #- '-Dplay.http.session.secure=true'
      - '-Djatos.brandingUrl=https://robbinslab.github.io/jatos-welcome-page/index.html'

volumes:
  jatos-data:
  jatos-logs:
EOL

docker compose -f /root/compose.yaml up -d
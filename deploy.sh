#!/usr/bin/env bash

set -euo pipefail

PROJECT_NAME=$(basename "$PWD" | tr '[:upper:]' '[:lower:]' | tr -d ' .' | tr '_' '-')

DATA_IMAGE="${PROJECT_NAME}-data-service:latest"
AI_IMAGE="${PROJECT_NAME}-ai-service:latest"
FRONTEND_IMAGE="${PROJECT_NAME}-frontend:latest"

echo "---------------------------------"
echo "Projekt: $PROJECT_NAME"
echo "Data Image: $DATA_IMAGE"
echo "AI Image: $AI_IMAGE"
echo "Frontend Image: $FRONTEND_IMAGE"
echo "---------------------------------"

echo "Baue Docker Images..."
docker compose build

echo "Passe Kubernetes Image-Namen an..."
sed -i.bak -E "s|image: .*data-service:latest|image: ${DATA_IMAGE}|g" k8s/data-service-deployment.yml
sed -i.bak -E "s|image: .*ai-service:latest|image: ${AI_IMAGE}|g" k8s/ai-service-deployment.yml
sed -i.bak -E "s|image: .*frontend:latest|image: ${FRONTEND_IMAGE}|g" k8s/frontend-deployment.yml
rm -f k8s/*.bak

echo "Wende Kubernetes Konfiguration an..."
kubectl apply -f k8s/app-config.yml
if [ -f k8s/ai-api-sealed-secret.yml ]; then
  kubectl apply -f k8s/ai-api-sealed-secret.yml
elif [ -f k8s/ai-api-secret.yml ]; then
  kubectl apply -f k8s/ai-api-secret.yml
fi
kubectl apply -f k8s/data-service-service.yml
kubectl apply -f k8s/ai-service-service.yml
kubectl apply -f k8s/frontend-service.yml
kubectl apply -f k8s/data-service-deployment.yml
kubectl apply -f k8s/ai-service-deployment.yml
kubectl apply -f k8s/frontend-deployment.yml
kubectl apply -f k8s/ai-service-ingress.yml
kubectl apply -f k8s/frontend-ingress.yml

echo "Starte Deployments neu..."
kubectl rollout restart deployment data-service
kubectl rollout restart deployment ai-service
kubectl rollout restart deployment frontend

echo "Aktuelle Pods:"
kubectl get pods

echo "Deployment abgeschlossen."

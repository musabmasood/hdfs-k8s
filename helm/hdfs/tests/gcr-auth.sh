#! /usr/bin/env bash

K8S_NAMESPACE="default"

if ! kubectl cluster-info | grep "$(minikube ip)"; then
    echo "[ERROR] KUBECTL DOES NOT MINIKUBE CLUSTER"
fi

if ! which gcloud; then
    echo "[ERROR] Cannot find gcloud binary"
    exit 1
fi

GCP_ACCOUNT=$(gcloud auth list --filter=status:ACTIVE --format="value(account)")
if [ -z "${GCP_ACCOUNT}" ]; then
    echo "[ERROR] Cannot find an active GCP account, please login with gcloud"
    exit 1
fi

GCP_TOKEN=$(gcloud auth print-access-token)
if [ -z "${GCP_TOKEN}" ]; then
    echo "[ERROR] Cannot find an active GCP account, please login with gcloud"
    exit 1
fi

kubectl --namespace="${K8S_NAMESPACE}" create secret docker-registry gcr \
          --docker-server=https://gcr.io \
          --docker-username=oauth2accesstoken \
          --docker-password="${GCP_TOKEN}" \
          --docker-email="${GCP_ACCOUNT}"

kubectl --namespace="${K8S_NAMESPACE}" patch serviceaccount default \
          -p '{"imagePullSecrets": [{"name": "gcr"}]}'

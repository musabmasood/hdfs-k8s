#!/bin/bash
set -e -x
docker load -i $1
docker tag gcr.io/google_samples/k8szk:v3 docker.registry:5000/gcr.io/google_samples/k8szk:v3
docker push docker.registry:5000/gcr.io/google_samples/k8szk:v3
docker tag gcr.io/byond-infinity-platform/integrity-hdfs-namenode:2.9.2 docker.registry:5000/gcr.io/byond-infinity-platform/integrity-hdfs-namenode:2.9.2
docker push docker.registry:5000/gcr.io/byond-infinity-platform/integrity-hdfs-namenode:2.9.2
docker tag busybox:1.27.1 docker.registry:5000/busybox:1.27.1
docker push docker.registry:5000/busybox:1.27.1
docker tag gcr.io/byond-infinity-platform/integrity-hdfs-namenode:2.9.2 docker.registry:5000/gcr.io/byond-infinity-platform/integrity-hdfs-namenode:2.9.2
docker push docker.registry:5000/gcr.io/byond-infinity-platform/integrity-hdfs-namenode:2.9.2
docker tag gcr.io/byond-infinity-platform/integrity-hdfs:2.9.2 docker.registry:5000/gcr.io/byond-infinity-platform/integrity-hdfs:2.9.2
docker push docker.registry:5000/gcr.io/byond-infinity-platform/integrity-hdfs:2.9.2
docker tag gcr.io/byond-infinity-platform/integrity-hdfs-datanode:2.9.2 docker.registry:5000/gcr.io/byond-infinity-platform/integrity-hdfs-datanode:2.9.2
docker push docker.registry:5000/gcr.io/byond-infinity-platform/integrity-hdfs-datanode:2.9.2
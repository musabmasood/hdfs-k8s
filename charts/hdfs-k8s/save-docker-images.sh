#!/bin/bash
set -e -x
docker pull gcr.io/google_samples/k8szk:v3
docker pull gcr.io/byond-infinity-platform/integrity-hdfs-namenode:2.9.2
docker pull busybox:1.27.1
docker pull gcr.io/byond-infinity-platform/integrity-hdfs-namenode:2.9.2
docker pull gcr.io/byond-infinity-platform/integrity-hdfs:2.9.2
docker pull gcr.io/byond-infinity-platform/integrity-hdfs-datanode:2.9.2
docker save gcr.io/google_samples/k8szk:v3 gcr.io/byond-infinity-platform/integrity-hdfs-namenode:2.9.2 busybox:1.27.1 gcr.io/byond-infinity-platform/integrity-hdfs-namenode:2.9.2 gcr.io/byond-infinity-platform/integrity-hdfs:2.9.2 gcr.io/byond-infinity-platform/integrity-hdfs-datanode:2.9.2  | gzip -c > images.tar.gz

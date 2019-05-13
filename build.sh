#!/bin/sh
set -e -x
if [ -z "$1" ];
then
echo "No version specified defaulting to 2.9.2"
HADOOP_VERSION=2.9.2
else
echo "Building using hadoop version $1"
HADOOP_VERSION=$1
fi


docker build -t gcr.io/byond-infinity-platform/integrity-hdfs:${HADOOP_VERSION} ./base/ --build-arg HADOOP_VERSION=$HADOOP_VERSION
docker build -t gcr.io/byond-infinity-platform/integrity-hdfs-namenode:${HADOOP_VERSION} ./namenode/ --build-arg HADOOP_VERSION=$HADOOP_VERSION
docker build -t gcr.io/byond-infinity-platform/integrity-hdfs-datanode:${HADOOP_VERSION} ./datanode/ --build-arg HADOOP_VERSION=$HADOOP_VERSION
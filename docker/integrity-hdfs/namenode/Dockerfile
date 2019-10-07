ARG HADOOP_VERSION=2.9.2
FROM gcr.io/byond-infinity-platform/integrity-hdfs:${HADOOP_VERSION}

ENV HDFS_CONF_dfs_namenode_name_dir=file:///hadoop/dfs/name
RUN mkdir -p /hadoop/dfs/name \
 && curl -L -o /usr/bin/kubectl https://storage.googleapis.com/kubernetes-release/release/v1.10.3/bin/linux/amd64/kubectl \
 && chmod +x /usr/bin/kubectl

VOLUME /hadoop/dfs/name

COPY run.sh /run.sh
RUN chmod a+x /run.sh

CMD ["/run.sh"]

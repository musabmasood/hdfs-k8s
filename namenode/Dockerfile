ARG HADOOP_VERSION=2.9.2
FROM gcr.io/byond-infinity-platform/integrity-hdfs:${HADOOP_VERSION}

ENV HDFS_CONF_dfs_namenode_name_dir=file:///hadoop/dfs/name
RUN mkdir -p /hadoop/dfs/name
VOLUME /hadoop/dfs/name

COPY run.sh /run.sh
RUN chmod a+x /run.sh

CMD ["/run.sh"]

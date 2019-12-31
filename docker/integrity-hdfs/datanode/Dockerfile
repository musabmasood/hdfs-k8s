ARG HADOOP_VERSION=2.9.2
FROM gcr.io/byond-infinity-platform/integrity-hdfs:${HADOOP_VERSION}

ENV HDFS_CONF_dfs_datanode_data_dir=file:///hadoop/dfs/data
RUN mkdir -p /hadoop/dfs/data
VOLUME /hadoop/dfs/data

COPY run.sh /run.sh
RUN chmod a+x /run.sh

CMD ["/run.sh"]

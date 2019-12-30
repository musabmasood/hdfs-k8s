ARG HADOOP_VERSION=2.9.2
FROM integrity-hdfs:${HADOOP_VERSION}

ENV HDFS_CONF_dfs_namenode_name_dir=file:///hadoop/dfs/name
RUN mkdir -p /hadoop/dfs/name \
 && curl -L -o /usr/bin/kubectl https://storage.googleapis.com/kubernetes-release/release/v1.10.3/bin/linux/amd64/kubectl \
 && chmod +x /usr/bin/kubectl

VOLUME /hadoop/dfs/name

COPY ./ui/explorer.js /opt/hadoop-$HADOOP_VERSION/share/hadoop/hdfs/webapps/hdfs/explorer.js
COPY ./ui/userList.js /opt/hadoop-$HADOOP_VERSION/share/hadoop/hdfs/webapps/hdfs/userList.js
COPY ./ui/explorer.html /opt/hadoop-$HADOOP_VERSION/share/hadoop/hdfs/webapps/hdfs/explorer.html
COPY ./ui/explorer.css /opt/hadoop-$HADOOP_VERSION/share/hadoop/hdfs/webapps/hdfs/explorer.css

COPY run.sh /run.sh
RUN chmod a+x /run.sh

CMD ["/run.sh"]

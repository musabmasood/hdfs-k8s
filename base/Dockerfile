FROM openjdk:8-jre

RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y net-tools curl procps dos2unix

ARG HADOOP_VERSION=2.9.2
ENV HADOOP_VERSION ${HADOOP_VERSION}
ENV HADOOP_URL https://www.apache.org/dist/hadoop/common/hadoop-$HADOOP_VERSION/hadoop-$HADOOP_VERSION.tar.gz
RUN curl -fSL "$HADOOP_URL" -o /tmp/hadoop.tar.gz \
    && tar -xvf /tmp/hadoop.tar.gz -C /opt/ \
    && rm /tmp/hadoop.tar.gz* \
    && ln -s /opt/hadoop-$HADOOP_VERSION/etc/hadoop /etc/hadoop \
    && cp /etc/hadoop/mapred-site.xml.template /etc/hadoop/mapred-site.xml \
    && mkdir /opt/hadoop-$HADOOP_VERSION/logs \
    && mkdir /hadoop-data \
    && rm -Rf /opt/hadoop-$HADOOP_VERSION/share/doc/hadoop

ENV HADOOP_PREFIX=/opt/hadoop-$HADOOP_VERSION
ENV HADOOP_CONF_DIR=/etc/hadoop
ENV MULTIHOMED_NETWORK=1

ENV USER=root
ENV PATH $HADOOP_PREFIX/bin/:$PATH

ADD entrypoint.sh /entrypoint.sh
RUN chmod a+x /entrypoint.sh

ARG CONFIG_DIR=config
COPY $CONFIG_DIR/* /tmp/

RUN dos2unix /tmp/* \
 && mv /tmp/hdfs-site.xml $HADOOP_HOME/etc/hadoop/hdfs-site.xml \
 && mv /tmp/core-site.xml $HADOOP_HOME/etc/hadoop/core-site.xml \
 && mv /tmp/mapred-site.xml $HADOOP_HOME/etc/hadoop/mapred-site.xml \
 && mv /tmp/yarn-site.xml $HADOOP_HOME/etc/hadoop/yarn-site.xml

ENTRYPOINT ["/entrypoint.sh"]
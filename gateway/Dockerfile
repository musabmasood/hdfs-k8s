FROM minio/minio:latest

RUN apk update && apk upgrade 
RUN apk add net-tools curl procps dos2unix openjdk8 bash 

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
ENV JAVA_HOME=/usr/lib/jvm/java-1.8-openjdk
ENV MULTIHOMED_NETWORK=1

ENV USER=root
ENV PATH $HADOOP_PREFIX/bin/:$PATH

ARG CONFIG_DIR=config
COPY $CONFIG_DIR/* /tmp/

RUN dos2unix /tmp/* \
 && mv /tmp/hdfs-site.xml $HADOOP_PREFIX/etc/hadoop/hdfs-site.xml \
 && mv /tmp/core-site.xml $HADOOP_PREFIX/etc/hadoop/core-site.xml \
 && mv /tmp/mapred-site.xml $HADOOP_PREFIX/etc/hadoop/mapred-site.xml \
 && mv /tmp/yarn-site.xml $HADOOP_PREFIX/etc/hadoop/yarn-site.xml 

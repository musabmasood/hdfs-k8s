#!/usr/bin/env bash
  # Exit on error. Append "|| true" if you expect an error.
  set -o errexit
  # Exit on error inside any functions or subshells.
  set -o errtrace
  # Do not allow use of undefined vars. Use ${VAR:-} to use an undefined VAR
  set -o nounset
  # Catch an error in command pipes. e.g. mysqldump fails (but gzip succeeds)
  # in `mysqldump |gzip`
  set -o pipefail
  # Turn on traces, useful while debugging.
  set -o xtrace
  _HDFS_BIN=$HADOOP_PREFIX/bin/hdfs
  _METADATA_DIR=/hadoop/dfs/name/current
  if [[ "$MY_POD" = "$NAMENODE_POD_0" ]]; then
    if [[ ! -d $_METADATA_DIR ]]; then
        $_HDFS_BIN --config $HADOOP_CONF_DIR namenode -format  \
            -nonInteractive hdfs-k8s ||
            (rm -rf $_METADATA_DIR; exit 1)
    fi
    _ZKFC_FORMATTED=/hadoop/dfs/name/current/.hdfs-k8s-zkfc-formatted
    if [[ ! -f $_ZKFC_FORMATTED ]]; then
      _OUT=$($_HDFS_BIN --config $HADOOP_CONF_DIR zkfc -formatZK -nonInteractive 2>&1)
      # zkfc masks fatal exceptions and returns exit code 0
      (echo $_OUT | grep -q "FATAL") && exit 1
      touch $_ZKFC_FORMATTED
    fi
  elif [[ "$MY_POD" = "$NAMENODE_POD_1" ]]; then
    if [[ ! -d $_METADATA_DIR ]]; then
      $_HDFS_BIN --config $HADOOP_CONF_DIR namenode -bootstrapStandby  \
          -nonInteractive ||  \
          (rm -rf $_METADATA_DIR; exit 1)
    fi
  fi
  $HADOOP_PREFIX/sbin/hadoop-daemon.sh --config $HADOOP_CONF_DIR start zkfc
  $_HDFS_BIN --config $HADOOP_CONF_DIR namenode
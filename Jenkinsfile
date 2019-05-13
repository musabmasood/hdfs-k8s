podTemplate(label: 'did-slave', 
    containers: [containerTemplate(name: 'docker', image: 'gcr.io/cloud-solutions-images/jenkins-k8s-slave', command: 'cat', ttyEnabled: true)],
    volumes: [hostPathVolume(hostPath: '/usr/bin/docker', mountPath: '/usr/bin/docker'),
              hostPathVolume(hostPath: '/var/run/docker.sock', mountPath: '/var/run/docker.sock')]
) {
    node ('did-slave')
    { 
        withEnv(["REPO_CREDENTIAL_ID=jenkins-git-key",
                "REPO_BRANCH=master",
                "REPO_URL=git@github.com:b-yond-infinite-network/integrity-infra.git",
                "CONTAINER_REGISTRY_ENDPOINT=https://gcr.io",
                "VERSION=2.9.2",
                "PROJECT=byond-infinity-platform",
                "PREFIX=integrity-hdfs"]) {

            def TAG = "gcr.io/${env.PROJECT}/${env.PREFIX}:${env.VERSION}"
            
            container('docker') {
                
                stage ('Run build script') {
                    git branch: "${env.REPO_BRANCH}", credentialsId: "${env.REPO_CREDENTIAL_ID}", url: "${env.REPO_URL}"
                    sh("chmod +x ./docker/integrity-hdfs/build.sh && cd ./docker/integrity-hdfs/ && ./build.sh ${HADOOP_VERSION}")
                }
                stage ('Push images'){
                    sh("gcloud docker -- push gcr.io/byond-infinity-platform/integrity-hdfs:${HADOOP_VERSION}")
                    sh("gcloud docker -- push gcr.io/byond-infinity-platform/integrity-hdfs-namenode:${HADOOP_VERSION}")        
                    sh("gcloud docker -- push gcr.io/byond-infinity-platform/integrity-hdfs-datanode:${HADOOP_VERSION}")   
                }
            }
        }
    }
}



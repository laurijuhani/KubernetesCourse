const k8s = require('@kubernetes/client-node');
const fs = require('fs');

const kc = new k8s.KubeConfig();
kc.loadFromDefault();

const coreApi = kc.makeApiClient(k8s.CoreV1Api);
const appsApi = kc.makeApiClient(k8s.AppsV1Api);

const namespace = 'default'; 

const main = async () => {
  const watch = new k8s.Watch(kc);

  watch.watch(
    `/apis/example.com/v1/namespaces/${namespace}/dummysites`,
    {},
    async (type, obj) => {
      if (type === 'ADDED') {
        const url = obj.spec.website_url;
        const name = obj.metadata.name;

        const html = await fetch(url).then(res => res.text());

        const configMap = new k8s.V1ConfigMap();
        const metadata = new k8s.V1ObjectMeta();
        configMap.apiVersion = 'v1';
        configMap.kind = 'ConfigMap';
        metadata.name = `dummysite-html-${name}`;
        configMap.metadata = metadata;
        configMap.data = { 'index.html': html };

        await coreApi.createNamespacedConfigMap({ namespace: namespace, body: configMap});

        await appsApi.createNamespacedDeployment({namespace: namespace, body: {
          apiVersion: 'apps/v1',
          kind: 'Deployment',
          metadata: { name: `dummysite-${name}` },
          spec: {
            replicas: 1,
            selector: { matchLabels: { app: `dummysite-${name}` } },
            template: {
              metadata: { labels: { app: `dummysite-${name}` } },
              spec: {
                containers: [{
                  name: 'nginx',
                  image: 'nginx:alpine',
                  volumeMounts: [{
                    name: 'html',
                    mountPath: '/usr/share/nginx/html'
                  }]
                }],
                volumes: [{
                  name: 'html',
                  configMap: { name: `dummysite-html-${name}` }
                }]
              }
            }
          }
        }});

        await coreApi.createNamespacedService({namespace: namespace, body: {
          metadata: { name: `dummysite-${name}` },
          spec: {
            selector: { app: `dummysite-${name}` },
            ports: [{ port: 80, targetPort: 80 }]
          }
        }});

        console.log(`DummySite ${name} created!`);
      }
    },
    err => { console.error(err); }
  );
};

main();
---
slug: "/2020/01/getting-started-with-helm-v3/"
date: "2020-01-06"
title: "Getting Started with Helm v3"
blurb: |
  I've been digging more into Kubernetes lately trying to figure out the best way to monitor certain resources and
  metrics within my cluster.
---

I've been digging more into Kubernetes lately trying to figure out the best way to monitor certain resources and metrics within my cluster.

An important component for monitoring in Kubernetes is metrics-server - which I usually quickly install with helm.

So I downloaded the newest release of Helm and did the following:

```bash
$ helm install stable/metrics-server metrics-server \
  --version 2.0.2 \
  --namespace metrics
Error: failed to download "metrics-server" (hint: running `helm repo update` may help)
```

Hmm, that's weird. Ok, let me follow what the output says:

```bash
$ helm repo update
Error: no repositories found. You must add one before updating
```

## Helm Repo Initialization

The reason we're seeing these messages is because in Helm v3 the `stable` repo is not automatically installed.

There reason for this can be found in the [comments on GitHub](https://github.com/helm/helm/issues/6359#issuecomment-528914720)
but essentially the helm team are trying to move away from the idea that `stable` is the de-facto "central" repo for
all helm charts.

What's also not so clear from any of the docs is how to enable the stable repo so that you can go on living your life.

## Usability

Although their decision makes sense, from a usability point of view this can cause issues - especially when you are trying to skill up newer engineers into the Kubernetes way of life.

## Adding the Stable Repo to Helm v3

To add the stable repo you need to install it using the url to the charts which are hosted in GCP:

```bash
helm repo add stable https://kubernetes-charts.storage.googleapis.com/
"stable" has been added to your repositories
```

From here you can now update the repo and install the required stable charts.

## Conclusion

I hope that this might at least help some other schmuck like me who spent a good hour trying to figure out how to add this in :).
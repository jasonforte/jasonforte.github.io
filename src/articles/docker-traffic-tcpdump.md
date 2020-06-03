---
slug: "/2017/11/inspect-docker-compose-network-traffic-with-tcpdump"
date: "2017-11-04"
title: "Inspect Docker traffic with tcpdump"
blurb: |
  I was recently involved in a project deploying a Django application to AWS EC2 Container Service. I had spent a few
  days building the app into a container alongside a RabbitMQ and Postgres containers. I made use of docker compose to
  run & tested locally.
---

I was recently involved in a project deploying a Django application to AWS EC2 Container Service. I had spent a few days
building the app into a container alongside a RabbitMQ and Postgres containers. I made use of docker compose to run &
tested locally.

There came point where I needed to quickly check the amount of TCP traffic being sent to a specific third-party API.
<h2>Basic Compose Network</h2>
When you startup your containers with docker compose, a network is automatically created for your containers.

<strong>Check all the containers are still running</strong>
<pre><code class="bash">$ docker-compose ps
         Name      State                    Ports
-------------------------------------------------------------------
django_app_1       Up      0.0.0.0:5000-&gt;5000/tcp
django_db_1        Up      5432/tcp
django_rabbit_1    Up      25672/tcp, 4369/tcp, 5671/tcp, 5672/tcp
</code></pre>
<strong>View the network created for the containers</strong>
<pre><code class="bash">$ docker network ls
NETWORK ID     NAME                  DRIVER          SCOPE
2106f72737b4   django_default        bridge          local
1c8fc1a172a5   host                  host            local
c0504b7be27b   none                  null            local
bb5f6238e0e9   bridge                bridge          local
</code></pre>
The network allows your containers to communicate between each other without affecting the host's network.
<blockquote>You can't just use tcpdump from the host because the docker network is isolated from the host network by default.</blockquote>
<h2>Attaching to a Compose network</h2>
Instead I can attach to the compose network using the <code>--net</code> parameter in my <code>docker run</code> command. From this new container I can access the network interface for the containers running with docker-compose.
<pre><code class="bash"># Run a Debian container attached to the docker-compose network
$ docker run -it --rm --net=container:django_app_1 debian
root@f5d9ed725329:/# apt update &amp;&amp; apt install -y tcpdump
</code></pre>
<h2>TCPDump for Outbound Traffic</h2>
Now I can monitor traffic on the network using regular tcpdump commands.
<pre><code>root@f5d9ed:/# # Running tcpdump on the eth0 interface
root@f5d9ed:/# tcpdump -v \
           -i eth0 \
           -n 'dst host 1.2.3.4 and (dst port 80 or dst port 443)'
tcpdump: listening on eth0, link-type EN10MB (Ethernet)...
</code></pre>
With this setup I was able to easily inspect the amount of network activity for the container and debug the issue.
<h2>What about HTTP Traffic</h2>
Although this is okay for TCP and/or UDP traffic there may be a use case where you need to inspect HTTP requests. If this is the case the I would recommend looking into using a proxy tool such as <a href="https://hoverfly.io/">Hovefly</a>.
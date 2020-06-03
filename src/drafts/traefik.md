---
slug: "/2017/01/using-custom-ssl-certs-with-elixir"
date: "2017-01-30"
title: "Using Custom SSL Certs with Elixir"
blurb: |
  While there is a great use-case for token based authentication, there is an emerging trend of using self-signed
  ssl certs to authenticate against an API
---

I was recently involved in a project deploying a Django application to AWS EC2 Container Service. I had spent a few days building the app into a container alongside a RabbitMQ and Postgres containers. I made use of docker compose to run &amp; tested locally.

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

<img src="https://www.jforte.me/wp-content/uploads/2017/06/traefik.logo-2-300x300.png" alt="" class="alignnone size-medium wp-image-56" style="margin-left: 150px" width="300" height="300">

<a href="https://traefik.io/">Traefik</a> is a young load balancer &amp; reverse proxy application built in Go. While there is already a number of products that fill this space (nginx, apache, HAProxy); Traefik distinguishes itself with the aim of catering to microservices architectures.

One feature I am interested in is Traefik's ability to reload it's configuration based on a number of backends.

The admin interface is also something that I think would be useful when orchestrating a large number of microservices.
<h2>Traefik backends</h2>
The power of Traefik comes when it is infront of one of the supported backend service. Some of the available Traefik backends are:
<ul>
 	<li>Docker</li>
 	<li>Docker Swarm</li>
 	<li>Consul</li>
 	<li>Kubernetes</li>
 	<li>Mesos</li>
 	<li>Mesos / Marathon</li>
 	<li>Rest API</li>
 	<li>Files</li>
</ul>
Traefik can use the backends to determine where traffic must be routed and aid in monitoring your cluster.
<h2>A Basic Server</h2>
To try out Traefik I created a basic Python Server in Flask.
<pre><code class="python"># start.py

from flask import (
  Flask,
  jsonify
)

app = Flask(__name__)


@app.route("/")
def main():
  return jsonify(**{"status": "success"})

if __name__ == "__main__":
  app.run(host="localhost", port=4000)
</code></pre>
To run the server
<pre><code class="bash">$ python start.py
 * Running on http://localhost:4000/ (Press CTRL+C to quit)
</code></pre>
<h2>Download Traefik Release</h2>
Go to <a href="https://github.com/containous/traefik/releases">https://github.com/containous/traefik/releases</a> to download the latest release.
<pre><code class="bash">$ wget https://github.com/containous/traefik/releases/download/v1.0.2/traefik_linux-amd64 -O traefik
</code></pre>
<h2>Configuration</h2>
Coming from an nginx background, I was expecting some sort of content to be displayed when I started up Traefik. Unfortunately this was not the case - Traefik has no default configuration. A <a href="https://raw.githubusercontent.com/containous/traefik/master/traefik.sample.toml">sample configuration file</a> is provided but it took me a few minutes to piece together the minimum settings for a basic reverse proxy.

The settings can be combined into a single config file which has to be in <a href="https://github.com/toml-lang/toml">TOML format</a>. I decided to separate the config of Traefik from the config of my server.
<pre><code class="toml"># traefik.toml

# Set up logging.
traefikLogsFile = "traefik.log"
accessLogsFile = "access.log"

# Set the Web Admin Port.
[web]
address = ":8080"

# Configure Traefik to watch a file for config changes.
[file]
filename = "rules.toml"
watch = true
</code></pre>
My <code>rules.toml</code> looks like this:
<pre><code class="toml"># EntryPoints
# ===========
# Determine which ports can be used to access Traefik managed routes.
[entryPoints]
  [entryPoints.http]
  address = ":80"

# Frontends
# ===========
# Mainly take care of routing base on request info such as headers, paths, hostname etc. The frontends
# also specify which backends must handle certain traffic.
[frontends]
  [frontends.frontend1]
  entrypoints = ["http"]
  backend = "backend1"
  [frontends.frontend1.routes.base_route]
    rule = "Host:localhost"

# Backends
# ===========
# Manage load balancing and checking of the response info such as the status code and the status of the connection.
[backends]
  [backends.backend1]
  entrypoints = ["http"]
    [backends.backend1.servers.server1]
    url = "http://localhost:4000"
</code></pre>
<img src="" alt="Traefik Logo">
<h2>Running Traefik</h2>
All you need now is to point Traefik to your config file (make sure your Flask server is still running).
<pre><code class="bash">$ sudo chmod +x traefik
$ sudo ./traefik -c traefik.toml
</code></pre>
Goto http://localhost/ to see the output from the flask server.
<h2>Admin Interface</h2>
The admin interface for traefik should also be available at http://localhost:8080/
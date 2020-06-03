---
slug: "/2017/02/use-ansible-to-deploy-a-docker-container"
date: "2017-02-08"
title: "Use Ansible to Deploy a Docker Container"
blurb: |
  Deploying containers to a remote server can be rather tedious. Sometimes all you need is to deploy your container on
  a remote server.
---

<h2>Deploying Environment</h2>
Deploying containers to a remote server can be rather tedious. Sometimes all you need is to deploy your container on a remote server.
<blockquote>Sometime budget and time constraints don't allow you to setup a full Kubernetes cluster. But for a prototype or landing page simplicity is best.</blockquote>
Whenever I'm faced with a task that is tedious and repetitive, I see it as an opportunity to automate.

<img src="/content/images/2017/02/docker-ansible.png" alt="Docker + Ansible">

I decided to try use <a href="https://www.ansible.com/">Ansible</a> to deploy my <a href="https://getdocker.com">Docker</a> containers.
<h2>Requirements</h2>
To follow this guide you need:
<ul>
 	<li>Remote host with ssh access</li>
 	<li>Docker installed on the remote host</li>
 	<li>Python Docker SDK <a href="https://github.com/docker/docker-py">docker-py</a> installed on the remote host</li>
 	<li>Container registry with an image ready to deploy</li>
</ul>
Setting up the registry and pushing the image will be covered in a future post.
<h2>Ansible Environment</h2>
The majority of my projects involve some form of Python so I just install with pip
<pre><code class="sh">$ pip install --upgrade ansible
</code></pre>
<h4>Ops Folder</h4>
For a small project I like to keep all my devops related stuff in an <code>.ops</code> directory on the root of my project.
<pre><code class="sh">.ops
├── deploy_staging.yml
└── hosts
</code></pre>
<h2>Ansible Inventory File</h2>
I like to store a list of servers in a <code>hosts</code> file.
<pre><code class="ini">[staging]
staging.jforte.me  ansible_host=45.32.235.197

[prod]
jforte.me
</code></pre>
<em>Ansible docs provide a list of <a href="http://docs.ansible.com/ansible/intro_inventory.html#list-of-behavioral-inventory-parameters">inventory parameters</a></em>
<h3>Testing the connection</h3>
To test Ansible can connect to the server use the ping module
<pre><code class="sh">$ ansible -i hosts staging -m ping
staging.jforte.me | SUCCESS =&gt; {
    "changed": false,
    "ping": "pong"
}
</code></pre>
<em>If you are using certificates you will be prompted to enter a password.</em>
<h2>Simple Deployment Playbook</h2>
Deployment procedure is defined in a playbook called <code>deploy_staging.yml</code>:
<pre><code class="yml">---
- hosts: staging
  tasks:
    - name: login to container registry
      docker_login:
        registry: registry.gitlab.com
        username: JasonForte
        password: passwordortoken
        reauthorize: yes
    - name: start a new container for web
      docker_container:
        name: web
        image: registry.gitlab.com/jasonforte/jforte.me:web.1702.001-dev
        pull: true
        restart: yes
        state: started
        ports:
          - "8003:80"

</code></pre>
Here I've defined the tasks to first login to the remote registry and then pull and start the new container. This is for my staging servers only.

<em>Ansible has a number of <a href="http://docs.ansible.com/ansible/list_of_all_modules.html">builtin modules</a> for the playbooks.</em>
<h2>Running the playbook</h2>
Running the playbook requires referencing the <code>hosts</code> file.
<pre><code class="bash">
$ ansible-playbook -i hosts deploy_staging.yml
</code></pre>
If this is successful you should see a new container running on the remote server.
<h2>What's next?</h2>
The next step would be to write a task to reconfigure / restart your web server (nginx / HAProxy etc).

Once I'm happy with the playbook I will usually add it to a Makefile for easy access.
<pre><code class="Makefile">
deploy:
    ansible-playbook -i .ops/hosts .ops/deploy_staging.yml
</code></pre>
I will tackle some of these next steps in future posts.
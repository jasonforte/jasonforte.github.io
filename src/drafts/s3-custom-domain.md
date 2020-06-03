This article is the second in a series of articles outlining how to setup a highly available, scalable, serverless single page application (SPA) using AWS S3.

In the <a href="https://www.jforte.me/2018/03/deploy-a-vue-js-app-with-aws-s3/">previous article</a> I went over the creation of our site hosted in S3.

In this article I will cover:
<ul>
 	<li>Creating a public hosted zone in Amazon Route53 to store DNS records</li>
 	<li>Linking this hosted zone to my domain registrar - in my case GoDaddy</li>
 	<li>Testing DNS with dig and nslookup</li>
 	<li>Creating a alias record set for my website hosted in S3</li>
</ul>
<h2>Route53 for DNS</h2>
Using Amazon Route53 to manage your DNS gives a number of advantages over other DNS providers:
<ul>
 	<li>High availability and scalability</li>
 	<li>Integrates seamlessly with AWS services such as S3 website hosting, elastic load balancing (ELB)</li>
 	<li>Provides features such as latency and geo based routing</li>
 	<li>Even with applications not hosted in AWS it offers features such as health checks, monitoring and DNS fail-over</li>
</ul>
<h2>Cost of Route53</h2>
Route53 is a fairly cost effective service. You get charged per hosted zone and the number of DNS queries served. This means that in some cases you can improve costs by increasing the TTL of your record sets. However in cases such as elastic load balancing you may not have the option to set your own TTLs.
<h2>Creating the Public Hosted Zone</h2>
From the AWS management console go to Route53. From there you can select "Create Hosted Zone". Ensure that the <code>Type</code> is set to "Public Hosted Zone".

<img src="https://www.jforte.me/wp-content/uploads/2018/04/Screenshot-from-2018-04-14-11-42-14-300x249.png" alt="Dialog for creating a hosted zone in route53" class="aligncenter size-medium wp-image-143" width="300" height="249">

Once the hosted zone has created you will be presented with the hosted zone view with a default NS record set and a default SOA record set.

<img src="https://www.jforte.me/wp-content/uploads/2018/04/Screenshot-from-2018-04-14-11-47-16-768x206.png" alt="Hosted zone view from AWS management console." class="aligncenter size-medium_large wp-image-144" width="700" height="188">
<h2>Pointing GoDaddy Domain to AWS DNS</h2>
Now that you've created your public hosted zone you need to tell your domain registrar to use the Amazon provided name servers for DNS. From GoDaddy, navigate to your domain DNS settings. In the "Nameservers" section select "Using custom nameservers" and the provide the 4 NS domains that are listed in your AWS public hosted zone. Once you save it can take up to 24 hours to completely transition the nameservers. This is based on the SOA record set by GoDaddy.

<img src="https://www.jforte.me/wp-content/uploads/2018/04/Screenshot-from-2018-04-14-11-56-04-768x270.png" alt="Nameservers matching AWS hosted zone added in the GoDaddy DNS settings." class="aligncenter size-medium_large wp-image-147" width="700" height="246">
<h2>Testing DNS records with nslookup and dig</h2>
Now that the DNS nameservers have changed, how can we check that the propogation has completed? This is where tools such as <code>nslookup</code> come in.
<h3>NSLookup</h3>
NSLookup is a tool that is usually installed on Windows or Unix based systems. It's accessible via the command line.
<pre><code class="bash">$ # Query the nameserver records for lula.cloud
$ nslookup -query=NS lula.cloud -debug
$ # Query the start of authority (SOA) record for lula.cloud
$ nslookup -query=SOA lula.cloud -debug
$ # Query the naked domain DNS for lula.cloud
$ nslookup lula.cloud -debug
</code></pre>
From the outputs you can tell whether your DNS is pointing to GoDaddy or Amazon Route53.
<h3>TTL and Negative TTL</h3>
From the results of <code>nslookup</code> you can see the time to live <code>TTL</code> of the records. If the DNS is still pointing to GoDaddy (or your registrar) you will need to wait for the TTL (in seconds) before the DNS servers update the records.

Negative TTL can be seen as the <code>minimum</code> value when querying the SOA record. If you request a DNS record that is not set (i.e. before creating the record set), DNS servers will cache this negative result up-to this <code>minimum</code> number of seconds. This can be a nuisance when you set the DNS record set and then don't see the propagation until long after.
<h2>Creating the Alias Record to the S3 Website</h2>
Once the DNS has propagated you can create a record to point to the S3 website. From the Hosted Zone view create a new Record Set.

Leave the name field blank (we want to set the naked domain). Chose <code>Type</code> as A record. Select <code>Yes</code> for <code>Alias</code> and then from the <code>Alias Target</code> dropdown select the S3 bucket where your site is hosted. Leave the rest as defaults and save the Record Set.

<img src="https://www.jforte.me/wp-content/uploads/2018/04/Screenshot-from-2018-04-14-12-19-00-262x300.png" alt="Creating a new alias record set to point to the S3 hosted website." class="aligncenter size-medium wp-image-150" width="262" height="300">
<h2>Accessing the Site</h2>
Once the new DNS record has propagated you can navigate to the new domain name in your browser.

<img src="https://www.jforte.me/wp-content/uploads/2018/04/Screenshot-from-2018-04-14-12-26-42-768x204.png" alt="Viewing site in browser using the lula.cloud domain name." class="aligncenter size-medium_large wp-image-153" width="700" height="186">
<h2>Next Steps</h2>
In future articles I will cover:
<ul>
 	<li><a href="https://www.jforte.me/2018/04/generate-an-https-cert-using-lets-encrypt/">Secure the site with an HTTPS cert provided by LetsEncrypt</a></li>
 	<li><a href="https://www.jforte.me/2018/05/improve-loading-time-of-a-vue-js-app-hosted-s3-cloudfront/">Improving loading time by setting up a CDN with AWS CloudFront.</a></li>
 	<li>Implementing a deployment pipeline to automatically deploy changes from GitLab</li>
</ul>
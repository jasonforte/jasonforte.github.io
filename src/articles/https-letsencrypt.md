---
slug: "/2018/04/generate-an-https-cert-using-lets-encrypt"
date: "2018-04-27"
title: "Generate an HTTPS cert using LetsEncrypt"
blurb: |
	This article is the third in a series of articles outlining how to setup a highly available, scalable, serverless
	single page application (SPA) using AWS S3.
---

This article is the third in a series of articles outlining how to setup a highly available, scalable, serverless single page application (SPA) using AWS S3.

In the <a href="https://www.jforte.me/2018/04/using-a-custom-domain-for-an-s3-hosted-website-with-amazon-route53/" rel="noopener" target="_blank">previous article</a>, I went over how to setup a custom domain for our app with Amazon Route 53.

In this article I will cover:
<ul>
 	<li>Installing CertBot to automatically generate signed TLS certificates.</li>
 	<li>Using CertBot with the DNS challenge to create a TLS certificate.</li>
 	<li>Creating TXT records in Route 53 to verify domain ownership to CertBot.</li>
 	<li>Importing our certificates to AWS Certificate Manager</li>
</ul>
<h1>Is it really so easy?</h1>
With the movement to a more secure web comes the adoption of HTTPS. This migration would be much harder if there wasn't companies out there doing their best to make securing your site fast an simple.
<h2>Install CertBot</h2>
Once you have purchased a domain via Godaddy, AWS etc. You will need to download <a href="https://certbot.eff.org/">CertBot</a>. This tool is an easy way to interface to the LetsEncrypt server.

CertBot does not currently support Windows. In this case I can recommend spinning up an EC2 instance and using putty to SSH to the instance.
<h2>LetsEncrypt DNS Challenge</h2>
In the default mode, CertBot needs to be run from an instance that is hosting your website. Because we are hosting on AWS we do not have the option of connecting to the instance - unless we reassign the DNS to point to an instance.

So in our case we'll use the <code>dns-challenge</code> option with CertBot. This option will generate a string that you can add to your DNS to prove that you have control of the domain. Let's generate the cert for both the naked domain and the www domain:
<pre><code class="bash">$ sudo certbot certonly --manual --preferred-challenges dns \
                        -d lula.cloud \
                        -d www.lula.cloud</code></pre>
<h2>Createing the TXT DNS records</h2>
If you are following the series on creating a app on S3 then you will be using Route53 for DNS management.

Go to Route 53 in the AWS Management Console and then select the hosted zone for your app.

Create a new Record Set, name it _acme-challenge and make it a TXT record. Update the value to match the outputted string (you may need to surround the value with double quotes <code>"</code> if there are some backslashes etc).

[caption id="attachment_192" align="aligncenter" width="279"]<img src="https://www.jforte.me/wp-content/uploads/2018/04/Screenshot-from-2018-04-27-18-43-36-279x300.png" alt="Creating a TXT record in route 53" class="size-medium wp-image-192" width="279" height="300"> Creating a TXT record in Route 53[/caption]

In your console when you hit enter, you'll be prompted with a record for the <code>www</code> domain. Complete the above steps for the <code>www</code> domain.

Before you hit the final enter to generate the certs, I recommend using a DNS checker tool such as <a href="https://dnschecker.org/">DNSChecker</a> to validate that the NS record has propagated. If the record has not properly propagated then the generation step will fail. You'll have to start the process again.
<h2>Adding your Certs to AWS Certificate Manager</h2>
Hitting enter for the last time will generate the cert and complete the signing process.

By default, your required certs and keys will be in <code>/etc/letsencrypt/live/yourdomainname.com/</code>

We'll be adding these certs into the AWS Certificate Manager. Because the goal is to eventually add this onto a CloudFront distribution, we need to make sure to add the certs to the N.Virginia (us-east-1) region.

If you are only interested in using the cert to secure traffic to a load balancer then you can import the cert to the same region as the load balancer.
<blockquote>CloudFront can only attach AWS Certificate Manager certificates hosted in the N.Virginia (<code>us-east-1</code>) region.</blockquote>
Go to Certificate Manager in the AWS Management Console. Make sure you're in the N.Virginia region (indicated in the top right panel). Choose import a certificate.

For the three fields you'll need to copy the text certificates from your <code>letsencrypt</code> directory. It's sufficient to use <code>cat</code> to show the text and copy and paste the output to the Certificate Manager.
<ul>
 	<li>Certificate Body - <code>cert.pem</code></li>
 	<li>Certificate private key - <code>privkey.pem</code></li>
 	<li>Certificate chain - <code>chain.pem</code></li>
</ul>
[caption id="attachment_197" align="aligncenter" width="700"]<img src="https://www.jforte.me/wp-content/uploads/2018/04/Screenshot-from-2018-04-27-19-43-21-768x401.png" alt="Adding Certificates to AWS Certificate Manager" class="size-medium_large wp-image-197" width="700" height="365"> Adding Certificates to AWS Certificate Manager[/caption]

Select review and then import.
<h2>Next Steps</h2>
We've now imported a valid TLS certificate and key into AWS Certificate Manager. In the next article I'll go over:
<ul>
 	<li><a href="https://www.jforte.me/2018/05/improve-loading-time-of-a-vue-js-app-hosted-s3-cloudfront/">Improving loading time by setting up a CloudFront distribution to act as a CDN for our static files.</a></li>
 	<li>Implementing a deployment pipeline to automatically deploy changes using GitLab</li>
</ul>
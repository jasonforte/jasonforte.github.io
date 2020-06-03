<img src="https://www.jforte.me/wp-content/uploads/2018/03/logo.png" alt="" class="alignnone wp-image-85" width="100" height="100"> <img src="https://www.jforte.me/wp-content/uploads/2018/03/aws-s3.png" alt="" class="alignnone wp-image-89" width="83" height="100">

This article is the first in a series of articles outlining how to setup a highly available, scalable, serverless single page application using AWS S3.

In this first article I will cover:
<ul>
 	<li>Steps to setup an S3 bucket, properties and permissions for static site hosting</li>
 	<li>Generating a basic Vue.js app as an example SPA</li>
 	<li>Configuring the app for easy deployment to S3 from your local environment</li>
 	<li>Building and deploying the application to an S3 based URL</li>
</ul>
I will use <code>lula.cloud</code> as the example site for this series.
<h2>Why use S3 for hosting?</h2>
Amazon S3 is an extremely cost effective way of deploying a single page application (SPA).

By deploying to S3 you leverage Amazon's infrastructure to provide a durable, scalable &amp; highly available app for your customers. More than that - the pricing model for S3 apps is on a per object requested basis. This means that for sites with low to medium traffic you can save an immense amount of money by not having to pay when your app is idle.
<blockquote>Not having to manage servers also gives developers peace-of-mind to focus on developing better, more streamlined applications.</blockquote>
<h2>Setup the S3 Bucket &amp; Permissions</h2>
Go to the S3 and create a new bucket. In the bucket properties enable "Static website hosting". Specify <code>index.html</code> as the Index Document and save.

<img src="https://www.jforte.me/wp-content/uploads/2018/03/Screenshot-from-2018-03-02-14-36-58-edited-275x300.png" alt="" class="aligncenter size-medium wp-image-108" width="275" height="300">

<em>Note that the endpoint for the hosted site is provided as an S3 based URL</em>
<h3>Updating the Bucket Permissions</h3>
Go to the permissions tab and select "Bucket Policy". Update the JSON policy to allow access to the bucket contents by anyone:
<pre><code class="json">{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::lula.cloud/*"
        }
    ]
}
</code></pre>
<h2>Create the Vue.js App</h2>
Create a vue.js project using the vue-cli tool
<pre><code class="bash">$ # Install the vue cli tool
$ npm i vue-cli -g
$ # Create a new project
$ mkdir lula.cloud &amp;&amp; cd lula.cloud
$ vue init webpack .
</code></pre>
You will be prompted with some questions about your project.
<h2>Install the AWS Command Line tool</h2>
<pre><code class="bash">$ # Install the cli tool
$ sudo -H pip install awscli
$ # Configure the tool with credentials - get these from IAM in AWS
$ aws configure
</code></pre>
<h2>Edit the <code>package.json</code> scripts</h2>
In the <code>package.json</code> "scripts" section add the following script:
<pre><code class="json">...
"scripts": {
    "deploy": "aws s3 sync --acl public-read --delete dist/ s3://lula.cloud",
},
...
</code></pre>
<em>Make sure you use the correct bucket name in this configuration</em>
<h2>Deploy your application</h2>
With the scripts section setup you can deploy to S3
<pre><code class="bash">$ # Build the static files for your app
$ npm run build
$ # Deploy your files directly to the S3 bucket
$ npm run deploy
</code></pre>
<h2>Accessing your SPA</h2>
Once the files have been deployed you will be able to access the site from the S3 URL generated earlier.
<blockquote>http://lula.cloud.s3-website-eu-west-1.amazonaws.com/</blockquote>
[caption id="attachment_139" align="aligncenter" width="700"]<img src="https://www.jforte.me/wp-content/uploads/2018/04/Screenshot-from-2018-04-14-11-22-14-768x255.png" alt="Lula.cloud hosted in S3 with bare domain" class="size-medium_large wp-image-139" width="700" height="232"> Lula.cloud hosted in S3 with bare domain[/caption]
<h3>Next steps</h3>
In future articles I will improve on this application by:
<ul>
 	<li><a href="https://www.jforte.me/2018/04/using-a-custom-domain-for-an-s3-hosted-website-with-amazon-route53/">Adding a custom domain name using Amazon Route53</a></li>
 	<li><a href="https://www.jforte.me/2018/04/generate-an-https-cert-using-lets-encrypt/">Secure the site with an HTTPS cert provided by LetsEncrypt</a></li>
 	<li><a href="https://www.jforte.me/2018/05/improve-loading-time-of-a-vue-js-app-hosted-s3-cloudfront/">Improving loading time by setting up a CloudFront distribution to act as a CDN for our static files.</a></li>
 	<li>Implementing a deployment pipeline to automatically deploy changes from GitLab</li>
</ul>
---
slug: "/2017/01/using-custom-ssl-certs-with-elixir"
date: "2017-01-30"
title: "Using Custom SSL Certs with Elixir"
blurb: |
  While there is a great use-case for token based authentication, there is an emerging trend of using self-signed
  ssl certs to authenticate against an API
---

## Why Custom SSL Certs?

While there is a great use-case for token based authentication, there is an emerging trend of using self-signed ssl certs to authenticate against an API.

> This has the neat effect of forcing clients to encrypt communications with your API.

## Connecting to an API via Elixir

To use custom certs when connecting to an external endpoint make use of the [Hackney](https://github.com/benoitc/hackney)
library which comes bundled with [HTTPoison](https://github.com/edgurgel/httpoison).

```elixir
def deps do
  [{:httpoison, "~> 0.10.0"}]
end
```

Remember to include the runtime dependency.

```elixir
def application do
  [applications: [:httpoison]]
end
```

## Making the HTTPS Request

Making a request is as simple as supplying the paths to the SSL cert files when calling HTTPoison functions.

```elixir
def https_options() do
  [
    hackney: [
      ssl_options: [
        cacertfile: "/path/to/cacertfile.pem",
        certfile: "/path/to/certfile.pem",
        keyfile: "/path/to/keyfile.pem"
      ]
    ]
  ]
end

def get_request(url) do
    HTTPoison.get(url, [], https_options())
end
```

_I like to separate the hackney settings purely for readability reasons._

## Conclusion

By adding SSL Certs as an authentication mechanism you force your clients to use SSL when communicating with your API. The drawback to this approach is that it still suffers from the same client side trust issues as with basic auth.

> If the client accidentally leaks their cert then then you will need to make use of [Certificate Revocation Lists](https://jamielinux.com/docs/openssl-certificate-authority/certificate-revocation-lists.html) (CRLs) to protect your API from malicious activity.

Additional to this some clients may not be as familiar with the certificate generation and signing process which could
deter smaller clients from implementing your API.
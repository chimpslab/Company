# Company
Invoice system and tools to manage an company

# installation

Create a .env in /envirs folder containing something like this
```ini
# A key with a lot of random values
SESSION_SECRET=akeywithalotofrandomness

# The database URL; leave ip:port unchanged if you use Docker, with mongodb running on host
MONGODB_URI=mongodb://myuser:mypassword@172.17.0.1:27017/mydatabase?authSource=mydatabase&readPreference=primary&ssl=false

# Main user for bootstrapping the application. He is able to invite new users.
SUPERADMIN_EMAIL=hello@mycompany.be
SUPERADMIN_SECRET=amagicpassword

# Mailing with users. ie: used as sender adress when request a reset password
MAILING_EMAIL=hello@mycompany.be

# Mailing system & credentials
MAILING_API_KEY=mymailingapikey

#The maximum allowed size for HTTP/POST request
#BODYPARSER_LIMIT=15mb
```

Use a reverse proxy with apache like so:
``` xml
<VirtualHost company.myhost.be:80>
	ServerName company.myhost.be
	RewriteEngine on
	RewriteCond %{SERVER_NAME} =company.myhost.be
	RewriteRule ^ https://%{SERVER_NAME}%{REQUEST_URI} [END,NE,R=permanent]
</VirtualHost>
<IfModule mod_ssl.c>
	<VirtualHost company.myhost.be:443>
		ServerName company.myhost.be
		ServerAdmin nicosanta@brightnightgames.net
 

        ErrorLog ${APACHE_LOG_DIR}/error.log
        CustomLog ${APACHE_LOG_DIR}/access.log combined

        Include /etc/letsencrypt/options-ssl-apache.conf
        SSLProxyEngine On
        SSLProxyCheckPeerCN off
        SSLProxyCheckPeerExpire off
        SSLProxyCheckPeerName off
        SSLProxyVerify none

        ProxyPreserveHost On
        <Proxy *>
            Require all granted
        </Proxy>

		<Location />
			ProxyPass http://127.0.0.1:10014/
			ProxyPassReverse http://127.0.0.1:10014/
		</Location>

        # Generated with certbot
		SSLCertificateFile /etc/letsencrypt/live/company.myhost.be/fullchain.pem
		SSLCertificateKeyFile /etc/letsencrypt/live/company.myhost.be/privkey.pem
	</VirtualHost>
</IfModule>

```

## build Docker image

```bash
# Build chain to create a /dist folder with js bundle, css and static assets like fonts etc
npm run build
# change name of the tag, here means you have to change it insode of docker-compose.yml too
docker build -t company:0.0.1 .
```

## Start Docker image
```bash
# Create two servers app and staging
docker-compose up -d
```

## Test the server
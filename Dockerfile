FROM node:latest AS builder

WORKDIR /workspace

# Copy package manifest.
COPY package.json ./package.json

# Cache depedencies.
RUN npm install

# Copy sources.
COPY . ./

# Generate static site.
RUN npm run build

FROM busybox:stable

# Write httpd configuration.
RUN <<EOF cat >> /var/www/httpd.conf
H:/var/www/html
I:index.html
E404:404.html
EOF

# Copy resulted build.
COPY --from=builder /workspace/.output/public /var/www/html

ENTRYPOINT [ "/bin/httpd" ]
CMD [ "-f", "-p80", "-c/var/www/httpd.conf" ]

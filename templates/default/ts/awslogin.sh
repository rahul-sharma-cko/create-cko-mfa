okta-aws-cli --org-domain checkout.okta.com --oidc-client-id 0oar3nsvk7VtIvsL3357 --aws-acct-fed-app-id 0oa423kknpZCS07GJ357 -b -z -r arn:aws:iam::791259062566:role/cko_portals_engineer -i arn:aws:iam::791259062566:saml-provider/okta &&
aws codeartifact login --tool npm --domain cko-packages --domain-owner 791259062566 --repository cko-packages --region eu-west-1 --namespace cko

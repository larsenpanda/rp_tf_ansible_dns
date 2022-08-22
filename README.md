# Redpanda TF/Ansible DNS workflow integration

If you need to have a workflow where you start with a dns/host setup file, deploy Redpanda and its monitoring, and populate a hosts.ini to be installed later, this might help.

### Dependencies
- node.js
- Terraform
- Ansible

### Lets Go

First get the TF/Ansible scripts from Redpanda github:
`git clone https://github.com/redpanda-data/deployment-automation.git`


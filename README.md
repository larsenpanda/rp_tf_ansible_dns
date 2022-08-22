# Redpanda TF/Ansible DNS workflow integration

If you need to have a workflow where you start with a dns/host setup file, deploy Redpanda and its monitoring, and populate a hosts.ini to be installed later, this might help.

### Dependencies
- node.js
- Terraform
- Ansible

### Get the Redpanda repo

First get the TF/Ansible scripts from Redpanda github:
`git clone https://github.com/redpanda-data/deployment-automation.git`

### Modify with this repo

1. Put ```app.js``` into the root of the `deployment-automation` repo folder
2. Put ```redpanda-dns.json``` into the root of the `deployment-automation` repo folder

Optional: Update aws/cluster.tf to add "Name" tag so you can identify the redpanda nodes for this run (note: Name : "redpanda-tf-test", edit as desired)

```locals {
  uuid = random_uuid.cluster.result
  timestamp = time_static.timestamp.rfc3339
  deployment_id = "redpanda-${local.uuid}-${local.timestamp}"

  # tags shared by all instances
  instance_tags = {
    owner        : local.deployment_id
    iam_username : trimprefix(data.aws_arn.caller_arn.resource, "user/")
    Name	: "redpanda-tf-test"
  }
}```

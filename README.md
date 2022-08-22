# Redpanda TF/Ansible DNS workflow integration

If you need to have a workflow where you start with a dns/host setup file, deploy Redpanda and its monitoring, and populate a hosts.ini to be installed later, this might help.

### Dependencies
- Node.js
- Terraform
- Ansible

### Get the Redpanda repo

First get the TF/Ansible scripts from Redpanda github:
`git clone https://github.com/redpanda-data/deployment-automation.git`

### Modify with this repo

1. Put `app.js` into the root of the `deployment-automation` repo folder
2. Put `redpanda-dns.json` into the root of the `deployment-automation` repo folder
3. Modify `redpanda-dns.json` and **change the nodes to give the names and domain you want to use**

Optional: Update aws/cluster.tf to add "Name" tag so you can identify the redpanda nodes for this run (note: Name : "redpanda-tf-test", edit as desired)

```
locals {
  uuid = random_uuid.cluster.result
  timestamp = time_static.timestamp.rfc3339
  deployment_id = "redpanda-${local.uuid}-${local.timestamp}"

  # tags shared by all instances
  instance_tags = {
    owner        : local.deployment_id
    iam_username : trimprefix(data.aws_arn.caller_arn.resource, "user/")
    Name	: "redpanda-tf-test"
  }
}
```

### Run it

To run the terraform along with the node.js script, enter the `deployment-automation/aws` (if AWS) folder and run the following:

`terraform apply -auto-approve -json && terraform output -json > ./tf_out.json && cd .. && node app.js`

### Now what?

Now look at the file that got created, `redpanda-dns-out.json`, you can use this to share with your dns team or do automation to upsert those entries as appropriate.

Look at the `hosts.ini`, it's ready to go with the dns hostnames. If everything looks good and your dns names get added just run the ansible-playbook command:

`ansible-playbook --private-key <your_private_key> -i hosts.ini -v ansible/playbooks/provision-node.yml`

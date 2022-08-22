var nodes=[];
var fs = require('fs');
var ansible_username='ec2-user';

// Read config file
const configTmp = fs.readFileSync('./redpanda-dns.json',{encoding:'utf8', flag:'r'});
 
// Encode it into json
const configJSON=JSON.parse(configTmp)

// Display the file data
// console.log(configJSON);

// Read TF output and encode it into JSON
const tfOutTmp = fs.readFileSync('./aws/tf_out.json',{encoding:'utf8', flag:'r'});
const tfJSON=JSON.parse(tfOutTmp)

// Read redpanda nodes from terraform output
var rp_node_ips=tfJSON.redpanda.value;
var rp_node_keys=Object.keys(tfJSON.redpanda.value)
var rp_nodes=[];

rp_node_keys.forEach(function(key){
    var rp_node={};
    rp_node.int_ip=rp_node_ips[key];
    rp_node.ext_ip=key;
    rp_nodes.push(rp_node);
});

// Read monitor node from terraform output
var monitor_node_ips=tfJSON.prometheus.value;
var monitor_node_keys=Object.keys(tfJSON.prometheus.value)
var monitor_nodes=[];

monitor_node_keys.forEach(function(key){
    var monitor_node={};
    monitor_node.int_ip=monitor_node_ips[key];
    monitor_node.ext_ip=key;
    monitor_nodes.push(monitor_node);
})

var monitor={};

//Read config json and enrich with tf output
configJSON.forEach(function(configObj, idx) {
    if (configObj.nodetype==='redpanda-node') {
        configObj.ext_ip=rp_nodes[idx].ext_ip;
        configObj.int_ip=rp_nodes[idx].int_ip;
        configJSON[idx]=configObj;
    }
    if (configObj.nodetype==='monitor-node') {
        configObj.ext_ip=monitor_nodes[0].ext_ip;
        configObj.int_ip=monitor_nodes[0].int_ip;
        configJSON[idx]=configObj;
    }
});

// Write out to a pretty-printed json file called redpanda-dns-out.json
fs.writeFileSync('./redpanda-dns-out.json',JSON.stringify(configJSON, null, 4),{encoding:'utf8'});

// Prepare the Redpanda and Monitoring sections
var redpandaSection='[redpanda]\n';
configJSON.forEach(function(node, idx) {
    if (node.nodetype==='redpanda-node') {
        redpandaSection=redpandaSection+node.nodename+'.'+node.domain+'  ansible_user='+ansible_username+' ansible_become=True private_ip='+node.int_ip+' id=0\n'
    }
})

var monitorSection='';
configJSON.forEach(function(node, idx) {
    if (node.nodetype==='monitor-node') {
        monitorSection=monitorSection+'\n[monitor]\n';
        monitorSection=monitorSection+node.nodename+'.'+node.domain+'  ansible_user='+ansible_username+' ansible_become=True private_ip='+node.int_ip+' id=0\n'
    }
})

// Set hosts_ini and write it out to hosts.ini
var hosts_ini=redpandaSection+monitorSection;
fs.writeFileSync('./hosts.ini',hosts_ini, null, 'utf8');
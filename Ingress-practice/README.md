# Kubernetes Service Discovery & Traffic Management


------------------

<img width="1920" height="1080" alt="Your paragraph text (1)" src="https://github.com/user-attachments/assets/b7b66dff-c31e-481b-9347-c5681bcceeef" />


This repository demonstrates a step-by-step implementation of a professional traffic flow within a Kubernetes cluster using **Deployments**, **Services**, and **Ingress Controllers**.

> **Environment Note:** The cluster is bootstrapped using `kubeadm` on a private cloud provider consisting of **one Control Plane** and **three Worker Nodes**.

---

## Architecture Overview

Traffic enters the cluster through a single entry point (Ingress) and is routed to the appropriate microservice based on the URL path.

### Step 1: Deploying the Application Layer

We utilize **Deployments** to manage the lifecycle of our pods. The Deployment ensures that the desired state of our application is maintained across the worker nodes.

1. **Apply the Manifest:**
```bash
kubectl apply -f frontend-dep.yaml -n <namespace>
kubectl apply -f backend-dep.yaml -n <namespace>

```


2. **Scaling the Application:**
One of the core strengths of the Deployment controller is horizontal scaling. You can adjust the number of running pods with a single command:
```bash
kubectl scale deployment <deployment-name> --replicas=N -n <namespace>

```



### Step 2: Configuring Service Discovery

To expose the Pods internally and group them logically, we use **Services**. In this architecture, we use the `ClusterIP` type.

* **Why ClusterIP?** Since we are using an Ingress as our "Front Door," we do not need to expose individual services via NodePorts. `ClusterIP` keeps the services internal to the cluster, significantly increasing security.

1. **Deploy the Services:**
```bash
kubectl apply -f frontendService.yaml -n <namespace>
kubectl apply -f backendService.yaml -n <namespace>

```


2. **Verifying Endpoints:**
The Service automatically discovers Pods by matching the `selector` in the Service YAML with the `labels` on the Pods. Verify the connection by checking the endpoints:
```bash
kubectl describe svc <service-name> -n <namespace>

```



### Step 3: Traffic Routing with Ingress & NGINX Controller

The Ingress layer consists of two main components:

* **Ingress Resource:** A set of rules defining hostnames and paths.
* **Ingress Controller:** The "engine" (NGINX) that processes these rules and manages the traffic.

1. **Deploy the Ingress Controller (Bare Metal):**
The controller creates its own namespace (`ingress-nginx`) and manages the mapping between external requests and internal services.
```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.9.4/deploy/static/provider/baremetal/deploy.yaml
```

3. **Apply the Routing Rules:**
```bash
kubectl apply -f virtual-host-ingress.yaml -n <namespace>

```



---

## Accessing the Application

The traffic is now routed based on the following logic:

* `example.com/frontend` → `frontend-svc` → `frontend-pods`
* `example.com/backend` → `backend-svc` → `backend-pods`

### Testing the Implementation

Since we are using an Ingress Host header, use the following `curl` command to verify connectivity through the Ingress Controller's NodePort:

```bash
curl -H "Host: example.com" http://<NODE_IP>:<INGRESS_PORT>/frontend
curl -H "Host: example.com" http://<NODE_IP>:<INGRESS_PORT>/backend

```

---

### Reference: 
Introduction to Kuberentes (LFS158)

https://medium.com/@SabujJanaCodes/kubernetes-club-ep-01-decrypting-a-k8s-cluster-hands-on-84a9b7b7bd4d

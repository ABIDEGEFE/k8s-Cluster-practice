
# Kubernetes Cluster Objects and Traffic Flow

While learning how cluster objects work together to create multiple independent services, interconnect them, and provide the resources needed to run their logic and store their data, I wrote the following core points about cluster objects and the end-to-end workflow of user traffic. I attached screenshot files for the objects to show what they look like inside the cluster.

---

## Ingress

Ingress is a single point of entry to the cluster. It contains a set of rules that define hostnames and paths for each service. It acts like a middleman that receives and forwards traffic to the defined services.

Ingress itself is only a set of rules; the main component is the **ingress controller**, which implements those rules. In our case, it is NGINX.


user ----> ingress-controller ----> services

<img width="1070" height="419" alt="2026-02-13_11-21" src="https://github.com/user-attachments/assets/78eba259-e621-4848-a1ed-41fcd0ed50bf" />



Since I use Minikube to bootstrap the cluster, enabling the NGINX ingress controller is a single command task using an addon. It runs as a Pod under its own namespace (`ingress-nginx`).

minikube addons enable ingress

---

## Services

Pods by nature are ephemeral. They cannot keep their identity when they restart. They may lose their IP address and receive a new one. Because of this, clients that want to access Pods permanently may face problems.

```

Pod: hey client, my name is John<br>
Client: nice to meet you, John<br>
// Pod restarts and changes its name to Bob<br>
Client: hey John, give me data<br>
// no one listens because there is no Pod called John

```

This is where Services come in. They logically group related Pods and continuously track their identity and status, making traffic forwarding possible. Clients no longer need to know the Pod name. They only need to know the Service that exposes the Pods and send requests directly to the Service.

I created three Services for each tier with their own Service types:



### 1. Frontend-service
Exposes Pods that run the frontend application. It is of type `ClusterIP`, so only internal communication is possible through its name.


User ----> Ingress-controller ----> frontend-service

<img width="1269" height="628" alt="2026-02-13_11-31" src="https://github.com/user-attachments/assets/e518f3cf-cc2a-43c9-bd9a-7a72593a33b4" />



### 2. Backend-service
Exposes Pods that run the backend application (Django). It is also of type `ClusterIP`, so the ingress controller can access it through its name.

<img width="1343" height="575" alt="2026-02-13_11-54" src="https://github.com/user-attachments/assets/592b1cb1-4d93-461c-a7b1-27cfcfe92711" />


### 3. DB-service
Exposes Pods that run the database application (Postgres) and is of type **Headless Service**. Since the controller of database Pods is a StatefulSet, Pods must persist their state (data).

In this configuration, Pods follow a master–slave pattern (that is, there is only one master Pod that can read and write data, and the other Pods are slaves that synchronize data from the master Pod and serve read-only requests).

Clients that want to perform write operations must connect directly to the master Pod. Therefore, they must know the Pod’s identity. In addition, Pods must be able to discover each other so that data synchronization is possible. This is where a headless Service is used. It removes the single virtual IP address of the Service and instead returns the Pod endpoints to the client so the client knows which Pod is the master and which are slaves.

<img width="1253" height="589" alt="2026-02-13_11-57" src="https://github.com/user-attachments/assets/6f5063c0-25ec-4141-9e10-5afbd0d2a740" />


---

## Controllers

Controllers are cluster objects used to manage the lifecycle of Pods. I use two types of controllers:

### 1. Deployment
- **Frontend-deployment** – logically groups and manages frontend Pods and their lifecycle.

<img width="1531" height="909" alt="2026-02-13_12-03" src="https://github.com/user-attachments/assets/7dc37183-bb92-4159-97cb-5c35209776e3" />


- **Backend-deployment** – logically groups and manages backend Pods and their lifecycle.

<img width="1495" height="969" alt="2026-02-13_12-09" src="https://github.com/user-attachments/assets/6b59116c-8c7e-4b37-ab20-6c8aaa923ef9" />


<img width="1516" height="550" alt="2026-02-13_12-11" src="https://github.com/user-attachments/assets/670e7745-0394-4289-aaad-ff811a80e5ae" />



### 2. StatefulSet
Unlike Deployments, StatefulSets give a unique identity to each Pod under their control. They are used when Pods run stateful applications such as databases.

StatefulSets are known for their ordered Pod lifecycle management, which prevents data inconsistency. They help Pods keep their unique identity so that they join the cluster as consistent members rather than temporary guests. This is especially useful when Pods claim storage from their own unique Persistent Volumes.

<img width="1741" height="919" alt="2026-02-13_12-15" src="https://github.com/user-attachments/assets/9e72ae06-67b1-42d5-9711-b5736eb7192f" />


---

## Persistent Volume

A Persistent Volume is a dedicated storage resource that exists independently of the Pod lifecycle. Kubernetes does not provide built-in long-term data persistence inside Pods to prevent severe data loss in case of cluster-level failures.

Pods mount the path of the actual data that resides in the Persistent Volume.


<img width="1663" height="617" alt="2026-02-13_12-19" src="https://github.com/user-attachments/assets/ff75b92b-87b7-4803-a200-6f803877ba7e" />


---

## Persistent Volume Claim

A Persistent Volume Claim is a request created by Pods in order to access a Persistent Volume. It finds a Persistent Volume that satisfies the Pod’s storage requirements. It is namespace-scoped and must exist in the same namespace as the Pods requesting storage.

It is possible to create Persistent Volumes outside the local device, such as cloud storage. In our case, we use local storage, which means data may be lost in case of disk failure. To ensure resiliency, it is recommended to use cloud storage.


<img width="1855" height="714" alt="2026-02-13_12-22" src="https://github.com/user-attachments/assets/1b524fd8-b483-4dd5-b4b8-9bd73036e3f9" />


---

## ConfigMap

To enhance security and maintainability, it is not best practice to hardcode sensitive or non-sensitive information. I use environment variables to avoid hardcoding values such as database name and configuration parameters.

ConfigMaps help store non-sensitive values and pass them to containers at runtime.


<img width="1654" height="835" alt="2026-02-13_12-26" src="https://github.com/user-attachments/assets/deac4ab6-800d-4f2d-929b-cddb45143012" />

<img width="1078" height="825" alt="2026-02-13_12-25" src="https://github.com/user-attachments/assets/2f7972a8-52ea-4fc0-81ae-ce96e9e148ed" />



---

## Secret

A Secret is a cluster object used to store sensitive information. Instead of hardcoding the database password, it is stored in a Secret and referenced during runtime.


<img width="1745" height="471" alt="2026-02-13_12-28" src="https://github.com/user-attachments/assets/036fd976-98f2-4304-8b01-ed40a1b1ae3e" />


----


use the following docker commands to pull and use already built images.<br>

```bash
docker pull abinetdegefa/voteapp-backend:v2

docker pull abinetdegefa/voteapp-frontend:v2
```



# Combined Kubernetes Research

## Introduction
The rapid evolution of distributed computing and cloud infrastructure in the early 2010s presented new challenges in the deployment and management of applications at scale. Containers emerged as a lightweight alternative to traditional virtualization, offering benefits in portability, isolation, and efficiency. However, the increasing adoption of containers created operational challenges that required more sophisticated orchestration.

Kubernetes, an open-source platform originally created at Google, was developed to address these challenges. It builds on years of experience operating large-scale systems such as Borg and Omega and was later donated to the Cloud Native Computing Foundation (CNCF). Kubernetes automates the deployment, scaling, and management of containerized applications across distributed environments.

At its core, Kubernetes uses a declarative model: developers describe the desired state of an application, and the system continuously works to ensure that the actual state matches it. This allows for automated restarts, self-healing, rolling updates, and horizontal scaling. Its flexibility, strong ecosystem, and cloud-agnostic design have made Kubernetes one of the most widely adopted platforms for running cloud-native workloads.

This research provides the background knowledge required for the workshop, including why Kubernetes exists, the challenges it solves, how it compares to alternative solutions, and when it is appropriate to use. It also explains how Kubernetes can be used in modern application environments.

---

## Why Kubernetes Exists: Background, History, and the Problems It Solves
As software systems became more distributed and complex, organizations shifted from monolithic applications to microservices running across clusters of machines. Containers made it easier to package and run these services consistently, but managing hundreds or thousands of containers manually quickly became unmanageable. This growing complexity created the need for an automated orchestration system capable of running containers reliably at scale.

Kubernetes originated at Google in 2013, building on lessons learned from internal systems like Borg and Omega, which introduced ideas such as declarative state, automated scheduling, and self-healing. Engineers Joe Beda, Brendan Burns, and Craig McLuckie initiated Kubernetes as an open-source project, and it was officially announced in 2014 and donated to the Cloud Native Computing Foundation (CNCF) in 2015. With contributions from Google and the wider community, Kubernetes evolved into a cloud-agnostic orchestration platform suitable for on-premises, hybrid, or public cloud environments.

Modern enterprise systems often consist of hundreds of interdependent services, deployed across multiple teams and environments. Managing these containers manually is error-prone and unsustainable. Kubernetes solves these challenges by:

### Managing containers at scale
Its scheduler automatically assigns containers to nodes based on resources and constraints, reducing operational overhead.

### Ensuring reliability and self-healing
Failed containers are restarted automatically, and workloads are rescheduled if nodes fail.

### Standardizing deployments
Using a declarative model, Kubernetes aligns all environments to the same application definitions, reducing errors.

### Safe and predictable updates
Rolling updates, zero-downtime deployments, and instant rollbacks allow frequent releases without disrupting users.

### Automatic scaling
Horizontal, vertical, and cluster autoscaling adjust resources based on demand, improving efficiency and reducing costs.

### Service discovery and networking
Stable virtual IPs, DNS, and load balancing keep microservices connected even as containers move or restart.

### Portability
Kubernetes allows applications to run consistently across on-premises and cloud environments.

In short, Kubernetes exists to help organizations deploy, manage, and scale containerized applications reliably, efficiently, and consistently, turning a previously complex and error-prone process into an automated, predictable system.

---

## Why Kubernetes is Still Relevant Today
Kubernetes, introduced in 2014, continues to be a cornerstone of modern cloud-native infrastructure. Its relevance stems from its ability to address the core operational challenges of complex, distributed applications while evolving alongside new technological demands. As organizations increasingly adopt microservices and distributed architectures, Kubernetes provides a standardized platform for deploying, managing, and scaling applications reliably.

One major factor in its continued relevance is its **dominance in the container orchestration ecosystem**. Kubernetes is widely adopted across cloud providers and enterprise environments, supported by a large ecosystem of tools, plugins, and integrations that simplify deployment, monitoring, and management. This widespread adoption ensures long-term community support, security updates, and compatibility with emerging technologies.

Another key reason is its **open-source nature**. Developed and maintained by a global community, with backing from organizations like Google, Red Hat, and Microsoft, Kubernetes benefits from rapid innovation, frequent security improvements, and extensive community knowledge. Enterprises can adopt Kubernetes without licensing costs and customize it to meet their specific needs.

Kubernetes also supports **hybrid and multi-cloud environments**, providing a vendor-neutral API that allows workloads to run consistently across on-premises data centers and multiple cloud providers. This portability, combined with features like automated scaling, self-healing, and service discovery, makes it ideal for managing modern cloud-native applications.

Finally, Kubernetes continues to **evolve and innovate**. New features, such as advanced scheduling, serverless frameworks like Knative, and machine learning workflows like Kubeflow, expand its capabilities beyond traditional web services to AI/ML, big data processing, and IoT applications. This constant evolution ensures Kubernetes remains flexible, reliable, and future-proof for modern workloads.

In summary, Kubernetes remains relevant because of its widespread adoption, alignment with microservices and cloud-native practices, support for hybrid and multi-cloud strategies, active community development, and a growing ecosystem that keeps it ready for new technological challenges.

---

## Comparison with Alternative Container Orchestration Tools
While Kubernetes has emerged as a leading container orchestration platform, several alternative tools exist, each with distinct strengths and weaknesses. The most widely known alternatives include Docker Swarm, HashiCorp Nomad, Apache Mesos, and OpenShift.

### Overview of Alternatives

| Tool | Description | Strengths | Weaknesses |
|------|-------------|----------|------------|
| Docker Swarm | Native orchestration for Docker containers | Simple, easy to set up, integrates tightly with Docker | Limited scalability, smaller ecosystem, less community support |
| HashiCorp Nomad | General-purpose cluster scheduler | Lightweight, flexible, supports non-container workloads | Fewer built-in features (networking, service discovery) |
| Apache Mesos / Marathon | Distributed systems kernel + orchestration | High scalability, flexible for big data workloads | Complex setup, smaller adoption in recent years |
| OpenShift (OKD) | Kubernetes-based enterprise platform | Security-focused, integrated CI/CD, GUI management | Heavier, more opinionated, potential vendor lock-in |
| Kubernetes | Open-source container orchestration platform | Large ecosystem, auto-scaling, rolling updates, service discovery, portability, self-healing | More complex to set up, steeper learning curve |

### Key Differentiators of Kubernetes
- **Ecosystem and Community Support:** Largest developer and vendor community, extensive tooling (Helm, Operators), integrations with major cloud providers.  
- **Scalability:** Can manage thousands of nodes and complex workloads.  
- **Feature-Rich Platform:** Load balancing, service discovery, declarative configuration, rolling updates, auto-scaling, self-healing.  
- **Portability:** Consistent deployments across on-premises, public cloud, and hybrid environments.  

![Kubernetes diagram](Kubernetes%20diagram.png)

### Conclusion
Although alternatives provide simpler or specialized solutions, Kubernetes is the most comprehensive platform for managing containerized applications at scale. Its combination of ecosystem support, feature richness, scalability, and portability ensures its continued dominance in enterprise and cloud-native environments.

---

## When and When Not to Use Kubernetes

Kubernetes is powerful but not always necessary. Its adoption depends on application complexity, scaling needs, team expertise, and infrastructure resources.

| When to Use Kubernetes | When Not to Use Kubernetes |
|------------------------|---------------------------|
| Microservices architecture with multiple, loosely coupled services | Monolithic applications with simple deployment requirements |
| Applications requiring high availability and dynamic scaling | Low-traffic or single-instance applications |
| CI/CD pipelines with frequent deployments | Teams with limited DevOps expertise or operational resources |
| Multi-cloud or hybrid-cloud deployments requiring portability | Projects with constrained infrastructure or strict simplicity requirements |
| Workloads that benefit from self-healing, automated scaling, and rolling updates | Serverless or PaaS environments where orchestration is handled by the platform |

### Analysis
Kubernetes shines in complex, dynamic environments where automation, scaling, and fault tolerance are crucial. For small-scale or simple applications, or teams lacking experience, its operational overhead may outweigh the benefits. Organizations should evaluate workloads and resources before adopting Kubernetes.

---

## Where to Start and How Kubernetes Works

Kubernetes introduces a new way of running applications, different from traditional server-based deployments. Instead of running programs directly on virtual machines or physical servers, Kubernetes manages applications through abstractions that automate placement, scaling, recovery, and updates.

### Kubernetes as a System of Desired State
At its core, Kubernetes uses the **desired state** concept. Developers define how many replicas of an application must run, which container image to use, required resources, and access methods. Kubernetes continuously monitors the system and ensures the actual state matches the desired state, automatically handling updates, failures, and scaling.

### Kubernetes Architecture
Kubernetes consists of two main layers: **control plane** and **worker nodes**.

**Control Plane:** The “brain” of the cluster, responsible for global decision-making.  
- **API Server:** Entry point for all operations and user commands.  
- **etcd:** Distributed key-value store for cluster state.  
- **Scheduler:** Assigns new Pods to suitable nodes based on resources.  
- **Controller Manager:** Ensures actual state matches desired state.  

**Worker Nodes:** The machines where applications run.  
- **kubelet:** Ensures containers run correctly and communicates with the control plane.  
- **Container Runtime:** Runs containers (e.g., containerd).  
- **kube-proxy:** Manages networking and service communication.  

### Core Kubernetes Concepts
- **Pods:** Smallest deployable units, typically a single container, ephemeral.  
- **Deployments:** Manage Pods over time, enable rolling updates, maintain replicas.  
- **ReplicaSets:** Ensure a specific number of Pod replicas are running.  
- **Services:** Provide stable IPs and load balancing between Pods.  
- **Ingress / Gateway API:** Expose applications externally.  
- **ConfigMaps and Secrets:** Manage configuration and sensitive information.  
- **PersistentVolumes / PersistentVolumeClaims:** Provide persistent storage.  

### The Reconciliation Loop
1. Users define a desired state in a YAML manifest.  
2. The API Server stores this state in etcd.  
3. Controllers detect differences between desired and actual state.  
4. Scheduler assigns new Pods to nodes.  
5. kubelet starts and monitors containers.  
6. Loop continues until actual state matches desired state.  

### Getting Started with Kubernetes
1. **Learn the core concepts:** Pods, Deployments, Services, ConfigMaps, Secrets, Ingress.  
2. **Set up a cluster:**  
   - Local: Minikube, Kind, k3s, Rancher Desktop.  
   - Cloud: Managed services like GKE, EKS, or AKS.  
3. **Deploy a simple application:** Write a containerized app, define Deployment YAML, expose it with a Service, and apply using `kubectl`.  
4. **Explore features:** Scaling, rolling updates, self-healing, monitoring.  
5. **Best practices:** Keep manifests declarative, use namespaces, leverage Helm or Operators.  

### Resources
- [Kubernetes Official Documentation](https://kubernetes.io/docs/)  
- Interactive tutorials: Katacoda Kubernetes scenarios  
- Book: *Kubernetes Up & Running* by Hightower et al.  

## References

Appvia, 2024. 5 Reasons You Should NOT Use Kubernetes. Available at: https://www.appvia.io/blog/5-reasons-you-should-not-use-kubernetes [Accessed 24 September 2025].

“Kubernetes,” 2025. Kubernetes Documentation. Available at: https://kubernetes.io/docs/ [Accessed 24 September 2025].

“Kubernetes,” Wikipedia (accessed November 2025). Available at: https://en.wikipedia.org/wiki/Kubernetes

“Kubernetes,” The Cloud Native Computing Foundation (CNCF) / Kubernetes.io (accessed November 2025). Available at: https://kubernetes.io/

“Kubernetes overview,” Red Hat Documentation, OpenShift Container Platform 4.17 (accessed November 2025). Available at: https://docs.redhat.com/en/documentation/openshift_container_platform/4.17/html/getting_started/kubernetes-overview

Burns, B., Grant, B., Oppenheimer, D., Brewer, E. and Wilkes, J., 2016. Borg, Omega, and Kubernetes. Communications of the ACM, 59(5), pp.50–57. Available at: https://doi.org/10.1145/2890784 [Accessed 24 September 2025].

CNCF, 2020. Kubernetes project journey report. Available at: https://www.cncf.io/reports/kubernetes-project-journey/ [Accessed 24 September 2025].

Erbis, 2023. When Don't You Need Kubernetes? Available at: https://erbis.com/blog/need-for-kubernetes/ [Accessed 24 September 2025].

Hightower, K., Burns, B. and Beda, J., 2017. Kubernetes: Up and Running. O'Reilly Media.

IBM, 2023. Kubernetes Examples, Applications & Use Cases. Available at: https://www.ibm.com/think/topics/kubernetes-use-cases [Accessed 24 September 2025].

Katacoda, 2025. Kubernetes Interactive Tutorials. Available at: https://www.katacoda.com/courses/kubernetes [Accessed 24 September 2025].

Khg, H., 2024. The Case For Not Using Kubernetes. Medium. Available at: https://medium.com/@dskydragon/the-case-for-not-using-kubernetes-bfa157fd123d [Accessed 24 September 2025].

McLuckie, C., 2015. From Google to the world: The Kubernetes origin story. Google Cloud Blog. Available at: https://cloud.google.com/blog/products/containers-kubernetes/from-google-to-the-world-the-kubernetes-origin-story [Accessed 24 September 2025].

PhoenixNAP, 2023. When to Use Kubernetes (and Why). Available at: https://phoenixnap.com/kb/when-to-use-kubernetes [Accessed 24 September 2025].

Spacelift, 2025. 12 Kubernetes Use Cases [Examples for 2025]. Available at: https://spacelift.io/blog/kubernetes-use-cases [Accessed 24 September 2025].

Verma, A., Pedrosa, L., Korupolu, M.R., Oppenheimer, D., Tune, E. and Wilkes, J., 2015. Large-scale cluster management at Google with Borg. EuroSys 2015. ACM. Available at: https://doi.org/10.1145/2741948.2741964 [Accessed 24 September 2025].

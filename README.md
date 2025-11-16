# Kubernetes Workshop - Getting Started

Welcome! In this hands-on workshop, you'll learn Kubernetes fundamentals by working with a real application.

## 📋 Prerequisites

Before starting, ensure you have:
- ✅ **Docker Desktop** installed and **running**
- ✅ **Git** installed (to clone this repository)

### Check Docker is Running

Open a terminal and run:
```bash
docker ps
```

If this works without errors, you're ready!

---

## 🚀 Setup 

### Step 1: Clone the Repository

### Step 2: Start the Workshop Environment

**Run these commands:**

```bash
cd Workshop_Implementation
docker-compose -f docker-compose.workshop.yaml build
docker-compose -f docker-compose.workshop.yaml up -d
```

This will:
- ✅ Build your application images (backend + frontend)
- ✅ Start a Kubernetes cluster (k3s)
- ✅ Deploy all applications automatically
- ✅ Set up the Kubernetes Dashboard

**Wait time**: 2-3 minutes

### Step 3: Watch the Setup Progress

Monitor the deployment:
```bash
docker logs -f workshop-deployer
```

When you see **"✅ Setup Complete!"**, you're ready!

Press `Ctrl+C` to stop viewing logs.

### Step 4: Verify Everything is Running

Check that all pods are running:
```bash
docker exec workshop-k3s kubectl get pods -n workshop
```

You should see:
```
NAME                        READY   STATUS    RESTARTS   AGE
backend-xxxxx-xxxxx         1/1     Running   0          1m
backend-xxxxx-xxxxx         1/1     Running   0          1m
frontend-xxxxx-xxxxx        1/1     Running   0          1m
frontend-xxxxx-xxxxx        1/1     Running   0          1m
frontend-xxxxx-xxxxx        1/1     Running   0          1m
```

All pods should show `Running` status.

### Step 5: Access Your Applications

Open these in your browser:

| Application | URL | Purpose |
|-------------|-----|---------|
| **Frontend** | http://localhost:30081 | Your web application |
| **Backend** | http://localhost:30080/health | API health check |
| **Dashboard** | https://localhost:30082 | Kubernetes visualization |

#### For the Dashboard:
1. Your browser will warn about the certificate - click **"Advanced"** → **"Proceed"**
2. On the login page, click the **"Skip"** button
3. You should now see the Kubernetes Dashboard!

---

## 📊 Understanding What's Running

You now have a complete Kubernetes environment with:

### Your Application:
- **Backend**: 2 pods running a Node.js API with SQLite database
- **Frontend**: 3 pods running a React application
- **Load Generator**: Ready to create artificial load (starts at 0 replicas)

### Kubernetes Components:
- **Services**: Provide stable network endpoints
- **HPA (HorizontalPodAutoscaler)**: Ready to auto-scale based on load
- **Dashboard**: Web UI to visualize everything

### Quick Reference Commands

Throughout the workshop, you'll use these commands:

```bash
# View all pods
docker exec workshop-k3s kubectl get pods -n workshop

# View all resources
docker exec workshop-k3s kubectl get all -n workshop

# View autoscaling status
docker exec workshop-k3s kubectl get hpa -n workshop

# View resource usage
docker exec workshop-k3s kubectl top pods -n workshop
```

## 🎯 Exercise 1: Scaling in Kubernetes

**Goal**: Learn manual scaling, prove zero-downtime, and see autoscaling in action

---

### Part 1: Manual Scaling 

Learn how to scale applications manually and watch it happen in real-time.

#### Step 1: Open the Dashboard

Open two browser tabs:
1. **Dashboard**: https://localhost:30082
   - On the top left, select all namespaces.
   - Navigate to: **Workloads** → **Deployments**
2. **Your App**: http://localhost:30081

Keep both visible!

#### Step 2: Check Current State

In your terminal, check current pods:
```bash
docker exec workshop-k3s kubectl get pods -n workshop
```

You should see:
- **2 backend pods** (backend-xxxxx)
- **3 frontend pods** (frontend-xxxxx)

In the Dashboard, you can see the same information visually.

#### Step 3: Scale Frontend UP

Scale the frontend to 6 replicas:
```bash
docker exec workshop-k3s kubectl scale deployment/frontend --replicas=6 -n workshop
```

**👀 Watch it happen:**
- **In Dashboard**: Click on the `frontend` deployment
  - Watch the **Pods** section - 3 new pods appear!
  - Status changes: `Pending` → `ContainerCreating` → `Running`
- **In Terminal** (optional):
  ```bash
  docker exec workshop-k3s kubectl get pods -n workshop -w
  ```
  Press `Ctrl+C` to stop watching.

**⏱️ Wait** until all 6 pods show `Running` status.

#### Step 4: Scale Frontend DOWN

Now scale back down to just 1 replica:
```bash
docker exec workshop-k3s kubectl scale deployment/frontend --replicas=1 -n workshop
```

**👀 Watch it happen:**
- In Dashboard: See 5 pods gracefully terminate
- Notice: Kubernetes removes pods one by one, not all at once

#### Step 5: Verify the App Still Works

Refresh http://localhost:30081 in your browser.

**Result**: The app works perfectly, even with just 1 pod!

---

### Part 2: Zero-Downtime Proof 

Prove that scaling doesn't break your application.

#### Step 1: Set Up Monitoring

Open a **new terminal window** and run:

**Windows PowerShell:**
```powershell
while($true) { 
    try {
        $response = Invoke-WebRequest -Uri http://localhost:30081 -UseBasicParsing
        Write-Host "✓ $($response.StatusCode)" -ForegroundColor Green
    } catch {
        Write-Host "✗ ERROR" -ForegroundColor Red
    }
    Start-Sleep -Milliseconds 500 
}
```

**Mac/Linux:**
```bash
while true; do 
    curl -s -o /dev/null -w "✓ %{http_code}\n" http://localhost:30081 || echo "✗ ERROR"
    sleep 0.5
done
```

You should see a continuous stream of `✓ 200` responses.

#### Step 2: Scale Aggressively While Monitoring

Keep the monitoring running! In your **original terminal**, execute these commands quickly one after another:

```bash
# Scale UP
docker exec workshop-k3s kubectl scale deployment/backend --replicas=10 -n workshop

# Wait 5 seconds (just count in your head)

# Scale DOWN
docker exec workshop-k3s kubectl scale deployment/backend --replicas=2 -n workshop

# Wait 5 seconds

# Scale UP again
docker exec workshop-k3s kubectl scale deployment/backend --replicas=7 -n workshop

# Wait 5 seconds

# Scale DOWN again
docker exec workshop-k3s kubectl scale deployment/backend --replicas=3 -n workshop
```

#### Step 3: Observe the Results

Look at your monitoring terminal:

**What you should see:**
- ✅ The app **never goes down**
- ✅ All requests return `✓ 200 OK`
- ✅ No `✗ ERROR` messages

**In Dashboard:**
- Watch pods appear and disappear smoothly
- Traffic continues flowing to healthy pods

**Stop monitoring**: Press `Ctrl+C` in the monitoring terminal.

#### 🎓 What You Learned

**Why doesn't the app break?**
1. Kubernetes maintains the **Service** (the network endpoint)
2. The Service only routes traffic to **healthy pods**
3. New pods become healthy before old pods are removed
4. This is called a **rolling update**

This is why Kubernetes is so powerful for production applications!

---

### Part 3: Autoscaling 

Watch Kubernetes automatically scale based on load.

### Step 1: Deploy the HPA (HorizontalPodAutoscaler)

Now that we've explored manual scaling, let's enable autoscaling:

**All platforms:**
```bash
docker exec workshop-k3s kubectl apply -f k8s/hpa.yaml
```

You should see:
```
horizontalpodautoscaler.autoscaling/backend-hpa created
horizontalpodautoscaler.autoscaling/frontend-hpa created
```

**What this does:**
- Creates autoscaling rules for backend and frontend
- Backend: Scale between 2-10 pods based on CPU usage
- Frontend: Scale between 2-8 pods based on CPU usage


#### Step 2: Check HPA Status

HPA (HorizontalPodAutoscaler) is already configured. Check it:
```bash
docker exec workshop-k3s kubectl get hpa -n workshop
```

You should see:
```
NAME           REFERENCE             TARGETS   MINPODS   MAXPODS   REPLICAS
frontend-hpa   Deployment/frontend   2%/60%    2         8         2
backend-hpa    Deployment/backend    1%/50%    3         10        3
```

**Understanding the columns:**
- **TARGETS**: Current CPU usage / Target CPU usage
- **MINPODS**: Minimum number of pods (won't go below this)
- **MAXPODS**: Maximum number of pods (won't go above this)
- **REPLICAS**: Current number of pods running

#### Step 3: Check Current Resource Usage

See how much CPU/memory your pods are using:
```bash
docker exec workshop-k3s kubectl top pods -n workshop
```

You should see low CPU usage (a few millicores like `1m` or `2m`).

#### Step 4: Start the Load Generator

The load generator will send many requests to the backend to create CPU load:

```bash
docker exec workshop-k3s kubectl scale deployment/load-generator --replicas=12 -n workshop
```

**What this does**: Creates 12 pods that continuously hit the backend API.

**👀 In Dashboard:**
- Navigate to **Workloads** → **Pods**
- You'll see 12 new `load-generator` pods appear

#### Step 5: Watch Autoscaling Happen

Open **two terminal windows** and run these commands:

**Terminal 1 - Watch HPA:**
```bash
docker exec workshop-k3s kubectl get hpa -n workshop -w
```

**Terminal 2 - Watch Pods:**
```bash
docker exec workshop-k3s kubectl get pods -n workshop -w
```

**What you'll see over the next 30-60 seconds:**

1. **CPU increases**: The TARGETS column shows higher % (like `45%/50%`, then `80%/50%`)
2. **HPA triggers scaling**: When CPU > 50%, HPA decides to add pods
3. **New pods created**: You'll see new `backend-xxxxx` pods in `ContainerCreating` state
4. **Load distributes**: As new pods become Ready, CPU per pod decreases
5. **System stabilizes**: Eventually settles with enough pods to keep CPU around 50%

**Expected result**: Backend scales from 2 → 4-6 pods (depending on load)

**💡 In Dashboard:**
- Watch the backend deployment
- See the replica count increase automatically
- No manual commands needed!

#### Step 6: Stop the Load

Now stop generating load:
```bash
docker exec workshop-k3s kubectl scale deployment/load-generator --replicas=0 -n workshop
```

**Watch what happens (30-60 seconds):**

1. **CPU drops**: TARGETS shows low usage like `5%/50%`
2. **HPA waits**: There's a stabilization window (30 seconds)
3. **Scale down begins**: HPA gradually removes pods
4. **Returns to minimum**: Eventually scales back to 2 pods (minReplicas)

**Why the wait?** To avoid "flapping" (scaling up and down repeatedly).

Press `Ctrl+C` in both monitoring terminals when done.

#### Step 7: Verify Final State

```bash
docker exec workshop-k3s kubectl get hpa -n workshop
docker exec workshop-k3s kubectl get pods -n workshop
```

Everything should be back to the starting state:
- Backend: 2 pods
- Frontend: 3 pods
- Load generator: 0 pods

---

## 🎓 Summary - What You Learned

### ✅ Manual Scaling
- Used `kubectl scale` to change replica count
- Kubernetes creates/destroys pods as needed
- Changes happen gradually, maintaining availability

### ✅ Zero-Downtime
- Applications remain available during scaling
- Kubernetes only routes traffic to healthy pods
- Services provide stable endpoints despite pod changes

### ✅ Autoscaling (HPA)
- Kubernetes can scale automatically based on metrics
- HPA monitors CPU/memory and adjusts replicas
- Scaling has built-in safeguards (min/max, stabilization)

### 🌟 Why This Matters

**In Production:**
- **Handle traffic spikes** automatically (Black Friday, viral content)
- **Optimize costs** by scaling down during low usage
- **Maintain availability** without manual intervention
- **Sleep better** knowing your app self-heals and scales

## 🎯 Exercise 2: Rolling Updates & Rollbacks

**Goal**: Deploy new versions without downtime and rollback instantly if something breaks

---

### What You'll Learn

- How to update applications in Kubernetes
- How rolling updates maintain zero-downtime
- How to rollback when deployments fail
- How Kubernetes protects your application automatically

---

## Part 1: Successful Update (v1 → v2) 

Deploy a new version and watch Kubernetes update gradually.

### Step 1: Check Current Version

First, let's see what version is currently running:

**Windows PowerShell:**
```powershell
Invoke-RestMethod http://localhost:30080/api/status | ConvertTo-Json
```

**Mac/Linux:**
```bash
curl http://localhost:30080/api/status
```

You should see:
```json
{
  "ok": true,
  "version": "1.0.0",
  "uptime": 123,
  "node": "v22.x.x"
}
```

The version is **1.0.0** (v1).

### Step 2: Open Monitoring Windows

Open **three windows** to watch the update happen:

**Window 1 - Dashboard:**
- Open https://localhost:30082
- Navigate to: **Workloads** → **Deployments** → Click **backend**
- Keep this visible to watch pods change

**Window 2 - Terminal (Watch Pods):**
```bash
docker exec workshop-k3s kubectl get pods -n workshop -w
```

**Window 3 - Terminal (Commands):**
- Keep this ready for running commands

### Step 3: Update to Version 2

In **Window 3**, run the update command:

```bash
docker exec workshop-k3s kubectl set image deployment/backend backend=demo-api:v2 -n workshop
```

**What this does**: Changes the image from `demo-api:v1` to `demo-api:v2`

### Step 4: Watch the Rolling Update

**👀 In Window 2 (Terminal):**
You'll see this sequence:
1. A new pod appears with a new name (e.g., `backend-xxxxx-yyyyy`)
2. Status: `ContainerCreating` → `Running`
3. Once the new pod is `Ready`, an old pod starts `Terminating`
4. Another new pod is created
5. Another old pod terminates
6. Process continues until all pods are v2

**👀 In Window 1 (Dashboard):**
- Click on the **backend** deployment
- Watch the **Pods** section
- See pods with different names (old vs new)
- Notice: Some v1 pods stay running while v2 pods start!

**⏱️ This takes about 30-60 seconds**

### Step 5: Verify the Update Worked

Once all pods show `Running`, check the version:

**Windows PowerShell:**
```powershell
Invoke-RestMethod http://localhost:30080/api/status | ConvertTo-Json
```

**Mac/Linux:**
```bash
curl http://localhost:30080/api/status
```

You should now see:
```json
{
  "ok": true,
  "version": "2.0.0",  ← Changed!
  "uptime": 15,
  "node": "v22.x.x"
}
```

**Success!** You've deployed v2 without downtime! 🎉

### Step 6: Check Rollout Status

```bash
docker exec workshop-k3s kubectl rollout status deployment/backend -n workshop
```

Output:
```
deployment "backend" successfully rolled out
```

You can also see the rollout history:
```bash
docker exec workshop-k3s kubectl rollout history deployment/backend -n workshop
```

---

## Part 2: Failed Update & Rollback (v2 → v3) 

Now let's see what happens when an update fails.

### Step 1: Try to Update to v3 (Doesn't Exist)

Let's simulate deploying a broken version:

```bash
docker exec workshop-k3s kubectl set image deployment/backend backend=demo-api:v3 -n workshop
```

**What this does**: Tries to update to v3, which doesn't exist!

### Step 2: Watch Kubernetes Handle the Failure

**Keep Window 2 running** (watching pods)

You'll see:
1. New pods appear (trying to start v3)
2. Status: `ContainerCreating` → `ImagePullBackOff` or `ErrImagePull`
3. **Old v2 pods keep running!** ← This is the key!

**👀 In Dashboard:**
- New pods show status: `ImagePullBackOff` (red warning)
- Old v2 pods: Still `Running` (green)
- Traffic only goes to the healthy v2 pods!

### Step 3: Verify Application Still Works

While the v3 pods are failing, test the application:

**Windows PowerShell:**
```powershell
Invoke-RestMethod http://localhost:30080/api/status | ConvertTo-Json
```

**Mac/Linux:**
```bash
curl http://localhost:30080/api/status
```

You should still see:
```json
{
  "ok": true,
  "version": "2.0.0",  ← Still v2, still working!
  ...
}
```

**The app never went down!** Even though new pods are failing, the old v2 pods continue serving traffic.

### Step 4: Check Rollout Status

```bash
docker exec workshop-k3s kubectl rollout status deployment/backend -n workshop --timeout=30s
```

This will timeout because the rollout can't complete:
```
Waiting for deployment "backend" rollout to finish: 1 out of 2 new replicas have been updated...
error: timed out waiting for the condition
```
### Step 5: Inspect a Failed Pod

Pick one of the failing pods and check what's wrong:

**All platforms:**
```bash
# First, get the list of pods
docker exec workshop-k3s kubectl get pods -n workshop
```

Look for a pod with status `ImagePullBackOff` or `ErrImagePull`. Copy its name, then describe it:
```bash
# Replace  with the actual pod name you copied
docker exec workshop-k3s kubectl describe pod  -n workshop
```

**Example:**
```bash
docker exec workshop-k3s kubectl describe pod backend-7d4b9c8f6d-x9k2l -n workshop
```

Look for the **Events** section at the bottom. You'll see:
```
Failed to pull image "demo-api:v3": rpc error: code = NotFound desc = failed to pull and unpack image
```

### Step 6: Rollback to Previous Version

Now let's fix it instantly with a rollback:

```bash
docker exec workshop-k3s kubectl rollout undo deployment/backend -n workshop
```

**Watch what happens:**
- Failed v3 pods are terminated
- v2 pods are restored
- Application continues working

### Step 7: Verify Rollback

Check the rollout status:
```bash
docker exec workshop-k3s kubectl rollout status deployment/backend -n workshop
```

Output:
```
deployment "backend" successfully rolled out
```

Check the version:
```bash
curl http://localhost:30080/api/status
```

Back to:
```json
{
  "version": "2.0.0"  ← Rolled back to v2
}
```

### Step 8: Check History

See all the changes we made:
```bash
docker exec workshop-k3s kubectl rollout history deployment/backend -n workshop
```

You should see:
```
REVISION  CHANGE-CAUSE
1         <none>
2         <none>
3         <none>
```

Each revision represents a deployment change (v1 → v2 → v3 → v2).

---

## 🎓 What You Learned

### ✅ Rolling Updates
- Kubernetes updates pods **gradually**, not all at once
- New pods start **before** old pods stop
- Traffic only goes to **healthy pods**
- **Zero downtime** during updates

### ✅ Automatic Protection
- When new pods fail, **old pods keep running**
- Your application **never goes down**
- Failed deployments **don't break production**
- Kubernetes **waits** for pods to be ready before switching traffic

### ✅ Instant Rollbacks
- One command: `kubectl rollout undo`
- Returns to previous working version
- Takes seconds, not minutes
- Can rollback to any previous revision

---

## 🔍 Understanding the Process

### Rolling Update Strategy

When you update a deployment, Kubernetes:

1. **Creates 1 new pod** with the new version
2. **Waits** for it to pass health checks (readiness probe)
3. **Marks it ready** to receive traffic
4. **Terminates 1 old pod**
5. **Repeats** until all pods are updated

### Why Old Pods Stay During Failures

When new pods fail health checks:
- Kubernetes **never marks them ready**
- Service **never routes traffic to them**
- Old pods **continue serving requests**
- Your SLA is maintained!

## 🎯 Exercise 3: Self-Healing

**Goal**: Watch Kubernetes automatically recover from failures without human intervention

---

### What You'll Learn

- How Kubernetes maintains desired state automatically
- How liveness probes detect and restart failed containers
- How deployments ensure the correct number of replicas
- Why you don't need to manually fix crashed pods

---

## Understanding Self-Healing

Kubernetes constantly monitors your applications and automatically fixes problems:

1. **Deployment Controller**: Ensures the desired number of pods are always running
2. **Liveness Probes**: Checks if containers are healthy, restarts them if not
3. **Service**: Only routes traffic to healthy pods

Let's see this in action!

---

## Part 1: Pod Deletion 

Watch Kubernetes automatically recreate deleted pods.

### Step 1: Check Current State

See how many backend pods are running:

**All platforms (same command):**
```bash
docker exec workshop-k3s kubectl get pods -n workshop -l app=backend
```

You should see **2 backend pods** (because `replicas: 2` in backend.yaml):
```
NAME                      READY   STATUS    RESTARTS   AGE
backend-xxxxx-aaaaa       1/1     Running   0          5m
backend-xxxxx-bbbbb       1/1     Running   0          5m
```

### Step 2: Open Monitoring Window

In a **separate terminal**, watch pods in real-time:

**All platforms (same command):**
```bash
docker exec workshop-k3s kubectl get pods -n workshop -w
```

Keep this running!

### Step 3: Delete a Pod

In your **original terminal**, pick one backend pod and delete it:

**All platforms (same command):**
```bash
# Replace <pod-name> with actual name from Step 1
docker exec workshop-k3s kubectl delete pod <pod-name> -n workshop
```

**Example:**
```bash
docker exec workshop-k3s kubectl delete pod backend-xxxxx-aaaaa -n workshop
```

### Step 4: Watch What Happens

**👀 In your monitoring window:**

You'll see:
1. The deleted pod: `Terminating`
2. **Immediately**, a new pod appears (different name)
3. New pod: `Pending` → `ContainerCreating` → `Running`
4. Old pod disappears
5. **Total count stays at 2 pods**

This happens in **seconds**!

### Step 5: Verify

Stop watching (press `Ctrl+C`) and check the final state:

**All platforms (same command):**
```bash
docker exec workshop-k3s kubectl get pods -n workshop -l app=backend
```

You should see:
- 2 backend pods (same as before)
- One pod has a very recent AGE (the newly created one)

**🎓 What Just Happened:**

Kubernetes **Deployment** maintains `replicas: 2`. When you deleted a pod:
1. Deployment noticed: "I have 1 pod, but I need 2"
2. Deployment created a new pod immediately
3. New pod started and became ready
4. Desired state restored

**No human intervention needed!**

---

## Part 2: Container Crash 

Watch Kubernetes automatically restart crashed containers.

### Step 1: Trigger a Crash

Your backend has a special endpoint that crashes the container (for demo purposes):

**Windows PowerShell:**
```powershell
Invoke-RestMethod -Method POST -Uri http://localhost:30080/api/crash
```

**Mac/Linux:**
```bash
curl -X POST http://localhost:30080/api/crash
```

You should get a response:
```json
{
  "message": "This pod will crash in 1 second for demo purposes",
  "pod": "backend-xxxxx-yyyyy",
  "note": "Kubernetes will restart this container automatically"
}
```

Note the pod name!

### Step 2: Watch the Restart

Immediately check pod status:

**All platforms (same command):**
```bash
docker exec workshop-k3s kubectl get pods -n workshop -l app=backend
```

**What you'll see:**

The pod you crashed will show:
```
NAME                      READY   STATUS    RESTARTS   AGE
backend-xxxxx-yyyyy       0/1     Error     0          2m
backend-xxxxx-zzzzz       1/1     Running   0          2m
```

Wait a few seconds and check again:

**All platforms (same command):**
```bash
docker exec workshop-k3s kubectl get pods -n workshop -l app=backend
```

Now it shows:
```
NAME                      READY   STATUS    RESTARTS   AGE
backend-xxxxx-yyyyy       1/1     Running   1          2m  ← RESTARTS increased!
backend-xxxxx-zzzzz       1/1     Running   0          2m
```

**Notice:**
- Same pod name (not deleted)
- `RESTARTS` increased from `0` to `1`
- Status back to `Running`

### Step 3: Check Pod Events

See what Kubernetes did:

**All platforms (same command):**
```bash
docker exec workshop-k3s kubectl describe pod <crashed-pod-name> -n workshop
```

Scroll to the **Events** section at the bottom. You'll see:
```
Events:
  Type     Reason     Age   From               Message
  ----     ------     ----  ----               -------
  Normal   Pulled     30s   kubelet            Successfully pulled image "demo-api:v1"
  Warning  BackOff    15s   kubelet            Back-off restarting failed container
  Normal   Pulled     10s   kubelet            Container image already present on machine
  Normal   Created    10s   kubelet            Created container backend
  Normal   Started    10s   kubelet            Started container backend
```

### Step 4: Check Container Logs

See the crash in the logs:

**All platforms (same command):**
```bash
docker exec workshop-k3s kubectl logs <crashed-pod-name> -n workshop --tail=20
```

You should see:
```
[backend-xxxxx-yyyyy] Intentional crash triggered for workshop demo
```

**🎓 What Just Happened:**

The **Liveness Probe** detected the crash:
1. Container process exited (crashed)
2. Liveness probe failed (no response on `/health`)
3. Kubernetes restarted the **container** (not the whole pod)
4. New container started fresh
5. Health check passed → Container ready

**The pod wasn't deleted, just the container inside was restarted!**

---

## Part 3: Chaos Test

Let's cause chaos and prove the application stays available.

### Step 1: Set Up Monitoring

Open a **new terminal** and monitor the application:

**Windows PowerShell:**
```powershell
while($true) { 
    try {
        $response = Invoke-WebRequest -Uri http://localhost:30080/api/status -UseBasicParsing
        Write-Host "✓ OK - Version: $(($response.Content | ConvertFrom-Json).version)" -ForegroundColor Green
    } catch {
        Write-Host "✗ FAILED" -ForegroundColor Red
    }
    Start-Sleep -Milliseconds 500 
}
```

**Mac/Linux:**
```bash
while true; do 
    response=$(curl -s http://localhost:30080/api/status)
    if [ $? -eq 0 ]; then
        version=$(echo $response | grep -o '"version":"[^"]*"' | cut -d'"' -f4)
        echo "✓ OK - Version: $version"
    else
        echo "✗ FAILED"
    fi
    sleep 0.5
done
```

You should see continuous `✓ OK` messages. **Keep this running!**

### Step 2: Cause Chaos

In your **original terminal**, let's cause multiple failures at once.

**First, crash a pod:**

**Windows PowerShell:**
```powershell
Invoke-RestMethod -Method POST -Uri http://localhost:30080/api/crash
```

**Mac/Linux:**
```bash
curl -X POST http://localhost:30080/api/crash
```

**Then immediately delete a different pod:**

**Windows PowerShell:**
```powershell
$podName = docker exec workshop-k3s kubectl get pod -l app=backend -n workshop -o jsonpath='{.items[0].metadata.name}'
docker exec workshop-k3s kubectl delete pod $podName -n workshop
```

**Mac/Linux:**
```bash
docker exec workshop-k3s kubectl delete pod $(docker exec workshop-k3s kubectl get pod -l app=backend -n workshop -o jsonpath='{.items[0].metadata.name}') -n workshop
```

**Then crash again:**

**Windows PowerShell:**
```powershell
Invoke-RestMethod -Method POST -Uri http://localhost:30080/api/crash
```

**Mac/Linux:**
```bash
curl -X POST http://localhost:30080/api/crash
```

### Step 3: Observe Results

**👀 In your monitoring terminal:**

You should see:
- Mostly `✓ OK` responses
- Maybe 1-2 `✗ FAILED` (during brief transition)
- Quickly back to all `✓ OK`

**Why didn't the app go down?**
- You have **2 backend pods**
- When one crashes/deleted → Other pod handles traffic
- Service only routes to **healthy pods**
- By the time one recovers, another is ready

**Stop monitoring**: Press `Ctrl+C`

### Step 4: Check Final State

See what happened:

**All platforms (same command):**
```bash
docker exec workshop-k3s kubectl get pods -n workshop -l app=backend
```

You should see:
- 2 pods running (always!)
- Increased `RESTARTS` counts
- Recent `AGE` for recreated pods

**Everything is back to normal, automatically!**

---

## 🎓 What You Learned

### ✅ Automatic Pod Recreation
- Deployment maintains desired replica count
- Delete a pod → New pod created instantly
- No manual intervention needed

### ✅ Container Restarts
- Liveness probes detect unhealthy containers
- Failed containers restart automatically
- Pod survives, just container restarts

### ✅ Zero-Downtime Recovery
- Multiple replicas provide redundancy
- Service routes around failed pods
- Application stays available during chaos

---

## 🔍 Understanding the Mechanisms

### 1. Deployment Controller

**What it does:**
- Constantly monitors: "Do I have the right number of pods?"
- If count is wrong → Creates or deletes pods to match `replicas:`

**In your backend.yaml:**
```yaml
spec:
  replicas: 2  # Always maintain 2 pods
```

### 2. Liveness Probe

**What it does:**
- Periodically checks if container is alive
- If check fails → Restarts the container

**In your backend.yaml:**
```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 8080
  initialDelaySeconds: 10
  periodSeconds: 10       # Check every 10 seconds
```

**How it works:**
1. Every 10 seconds, Kubernetes calls `GET /health`
2. If response is OK → Container is healthy
3. If no response / error → Container is dead
4. After a few failures → Restart container

## 🎯 Exercise 4: ConfigMaps & Secrets
 
**Goal**: Learn how to configure applications without rebuilding images and handle sensitive data securely

---

### What You'll Learn

- How to separate configuration from code
- The difference between ConfigMaps and Secrets
- How to update application config without rebuilding images
- Why the same image can run in dev, staging, and production

---

## Understanding Configuration Management

In production, you want:
- **One image** that works everywhere (dev, staging, production)
- **Different configuration** per environment
- **No secrets in code** or Docker images
- **Easy config updates** without redeployment

Kubernetes provides:
- **ConfigMaps**: For non-sensitive configuration (URLs, feature flags, settings)
- **Secrets**: For sensitive data (API keys, passwords, tokens)

Let's see them in action!

---

## Part 1: View Current Configuration 

Your backend has a special endpoint that shows its current configuration.

### Step 1: Check Current Config

**Windows PowerShell:**
```powershell
Invoke-RestMethod http://localhost:30080/api/config | ConvertTo-Json
```

**Mac/Linux:**
```bash
curl http://localhost:30080/api/config
```

You should see:
```json
{
  "environment": "development",
  "feature_new_ui": false,
  "external_api_url": "https://api.example.com",
  "max_items": 100,
  "database_path": "/data/demo.sqlite",
  "has_api_key": true,
  "api_key_length": 29
}
```

**🎓 What you're seeing:**
- `environment`: Loaded from **ConfigMap**
- `feature_new_ui`: Feature flag from **ConfigMap**
- `external_api_url`: External service URL from **ConfigMap**
- `max_items`: App setting from **ConfigMap**
- `has_api_key`: Shows we have a secret (without exposing it!)
- `api_key_length`: Shows the secret's length (safe to show)

### Step 2: View the ConfigMap

See what's in the ConfigMap:

**All platforms:**
```bash
docker exec workshop-k3s kubectl get configmap backend-config -n workshop -o yaml
```

You'll see:
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: backend-config
  namespace: workshop
data:
  APP_ENV: "development"
  FEATURE_NEW_UI: "false"
  EXTERNAL_API_URL: "https://api.example.com"
  MAX_ITEMS: "100"
```

**Notice:** It's **plain text** - anyone can read it!

### Step 3: View the Secret

See what's in the Secret:

**All platforms:**
```bash
docker exec workshop-k3s kubectl get secret backend-secret -n workshop -o yaml
```

You'll see:
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: backend-secret
  namespace: workshop
type: Opaque
data:
  API_KEY: c3VwZXItc2VjcmV0LWFwaS1rZXktMTIzNDU=
```

**Notice:** It's **base64 encoded** - not human-readable, but NOT encrypted!

### Step 4: Decode the Secret (Optional)

Let's see what the secret actually is:

**Windows PowerShell:**
```powershell
[Text.Encoding]::UTF8.GetString([Convert]::FromBase64String("c3VwZXItc2VjcmV0LWFwaS1rZXktMTIzNDU="))
```

**Mac/Linux:**
```bash
echo "c3VwZXItc2VjcmV0LWFwaS1rZXktMTIzNDU=" | base64 --decode
```

Output:
```
super-secret-api-key-12345
```

**🎓 Important:** Base64 is **NOT encryption** - it's just encoding to handle binary data. Secrets in Kubernetes are:
- Base64 encoded in YAML (so they can contain any characters)
- Stored in etcd (can be encrypted at rest with proper K8s config)
- Only accessible with proper RBAC permissions
- Not meant to be read directly by humans

---

## Part 2: Update Configuration 

Let's change the configuration **without rebuilding the image**.

### Step 1: Update the ConfigMap

We'll update the ConfigMap by applying a new version.

**Edit the existing file**

Open `k8s/configmap.yaml` in your text editor and change:
```yaml
data:
  APP_ENV: "development"
  FEATURE_NEW_UI: "true"      # Change from "false" to "true"
  EXTERNAL_API_URL: "https://api.example.com"
  MAX_ITEMS: "200"            # Change from "100" to "200"
```

Save the file.

```bash
docker exec workshop-k3s kubectl rollout restart deployment/backend -n workshop
```
### Step 2: Apply the Updated ConfigMap

**All platforms:**
```bash
docker exec workshop-k3s kubectl apply -f k8s/configmap.yaml
```

You should see:
```
configmap/backend-config configured
```

### Step 3: Restart Pods to Pick Up New Config

ConfigMap changes don't automatically update running pods. Delete the pods so they restart with the new config:

**All platforms:**
```bash
docker exec workshop-k3s kubectl delete pods -l app=backend -n workshop
```

You should see:
```
pod "backend-xxxxx-yyyyy" deleted
pod "backend-xxxxx-zzzzz" deleted
```

Watch the pods get recreated:

**All platforms:**
```bash
docker exec workshop-k3s kubectl get pods -n workshop -w
```

Wait until you see both backend pods with:
- STATUS: `Running`
- READY: `1/1`

Then press `Ctrl+C` to stop watching.

**🎓 What's Happening:**
- Kubernetes Deployment sees pods are missing
- Immediately creates new pods
- New pods load fresh ConfigMap values
- Total downtime: ~10-20 seconds (other pod handles traffic)

### Step 4: Verify the Changes

Check the config again:

**Windows PowerShell:**
```powershell
Invoke-RestMethod http://localhost:30080/api/config | ConvertTo-Json
```

**Mac/Linux:**
```bash
curl http://localhost:30080/api/config
```

Now you should see:
```json
{
  "environment": "development",
  "feature_new_ui": true,    ← Changed!
  "external_api_url": "https://api.example.com",
  "max_items": 200,          ← Changed!
  "database_path": "/data/demo.sqlite",
  "has_api_key": true,
  "api_key_length": 26
}
```

**🎓 What Just Happened:**
1. Changed ConfigMap (just YAML, no code)
2. Restarted pods to pick up new config
3. Application now uses new settings
4. **No image rebuild needed!**
5. **Same image**, different config

---


## Part 3: Update a Secret 

Let's change the API key to show how Secrets work.

### Step 1: Create a New Secret Value

First, we need to base64-encode our new secret value.

**Windows PowerShell:**
```powershell
[Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes("new-production-key-67890"))
```

**Mac/Linux:**
```bash
echo -n "new-production-key-67890" | base64
```

You'll get:
```
bmV3LXByb2R1Y3Rpb24ta2V5LTY3ODkw
```

**Copy this value!**

### Step 2: Edit the Secret File

Open `k8s/secret.yaml` in your text editor and update the API_KEY value:

**Find this line:**
```yaml
data:
  # API_KEY value: "super-secret-api-key-12345"
  API_KEY: c3VwZXItc2VjcmV0LWFwaS1rZXktMTIzNDU=
```

**Replace with your new base64 value:**
```yaml
data:
  # API_KEY value: "new-production-key-67890"
  API_KEY: bmV3LXByb2R1Y3Rpb24ta2V5LTY3ODkw
```

**Save the file.**

### Step 3: Apply the Updated Secret

**All platforms:**
```bash
docker exec workshop-k3s kubectl apply -f k8s/secret.yaml
```

You should see:
```
secret/backend-secret configured
```

### Step 4: Restart Pods to Pick Up New Secret

**All platforms:**
```bash
docker exec workshop-k3s kubectl delete pods -l app=backend -n workshop
```

Watch the pods restart:

**All platforms:**
```bash
docker exec workshop-k3s kubectl get pods -n workshop -w
```

Wait for both pods to show `Running` and `1/1 READY`, then press `Ctrl+C`.

### Step 5: Verify the Change

Check the config:

**Windows PowerShell:**
```powershell
Invoke-RestMethod http://localhost:30080/api/config | ConvertTo-Json
```

**Mac/Linux:**
```bash
curl http://localhost:30080/api/config
```

Now you should see:
```json
{
  "environment": "development",
  "feature_new_ui": true,
  "external_api_url": "https://api.example.com",
  "max_items": 200,
  "database_path": "/data/demo.sqlite",
  "has_api_key": true,
  "api_key_length": 24    ← Changed! (different length)
}
```

**Notice:** The `api_key_length` changed from `26` to `24` characters!

**🎓 What Just Happened:**
1. Created new base64-encoded secret
2. Edited the Secret file directly
3. Applied the updated Secret to Kubernetes
4. Deleted pods so they reload with new secret
5. Application now uses new API key
6. **API key never appeared in code or images!**

## Part 4: Multiple Environments 

Understanding how this works in production.

### The Power of ConfigMaps & Secrets

**Same Image, Different Configs:**

```
┌─────────────────────────────────────────┐
│         Docker Image: demo-api:v1       │
│         (Same code, no config)          │
└─────────────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
   ┌────────┐  ┌────────┐  ┌────────┐
   │  Dev   │  │Staging │  │  Prod  │
   │Namespace│ │Namespace│ │Namespace│
   └────────┘  └────────┘  └────────┘
        │           │           │
   ConfigMap    ConfigMap   ConfigMap
   - ENV: dev   - ENV: staging - ENV: prod
   - DEBUG:true - DEBUG: true  - DEBUG: false
   - API: test  - API: staging - API: prod
        │           │           │
    Secret       Secret       Secret
   - KEY: dev123 - KEY: stg456 - KEY: prod789
```

**Key Benefits:**
- ✅ **One image** for all environments
- ✅ **Different configs** per namespace
- ✅ **Secrets separated** from code
- ✅ **Easy updates** - just edit ConfigMap
- ✅ **Version controlled** - ConfigMaps are YAML files


## 🎓 What You Learned

### ✅ ConfigMaps
- Store non-sensitive configuration
- Plain text (anyone can read)
- Easy to edit and version control
- Update without rebuilding images

### ✅ Secrets
- Store sensitive data (API keys, passwords, tokens)
- Base64 encoded (not encrypted by default!)
- Only expose to pods that need them
- Can be encrypted at rest with proper K8s setup

### ✅ Separation of Concerns
- **Code**: In Docker image
- **Config**: In ConfigMap
- **Secrets**: In Secret
- **Image**: Same everywhere, config differs

---

## 🔍 Understanding the Mechanisms

### How ConfigMaps Work

**In backend.yaml:**
```yaml
env:
- name: APP_ENV
  valueFrom:
    configMapKeyRef:
      name: backend-config
      key: APP_ENV
```

**What this does:**
1. Kubernetes reads `backend-config` ConfigMap
2. Extracts the value of key `APP_ENV`
3. Sets it as environment variable in container
4. Application reads `process.env.APP_ENV`

### How Secrets Work

**In backend.yaml:**
```yaml
env:
- name: API_KEY
  valueFrom:
    secretKeyRef:
      name: backend-secret
      key: API_KEY
```

**What this does:**
1. Kubernetes reads `backend-secret` Secret
2. **Decodes** base64 automatically
3. Sets plain text as environment variable
4. Application reads `process.env.API_KEY` (already decoded!)

---

**Resources:**
- Official Kubernetes Docs: https://kubernetes.io/docs/

**Thank you for participating!** 
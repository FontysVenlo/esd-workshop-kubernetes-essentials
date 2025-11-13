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

## 🚀 Setup (5 minutes)

### Step 1: Clone the Repository

### Step 2: Start the Workshop Environment

**One command does everything:**

```bash
cd Workshop_Implementation
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

**Time**: ~15 minutes  
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

### Part 2: Zero-Downtime Proof (2-3 minutes)

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

### Part 3: Autoscaling (4-5 minutes)

Watch Kubernetes automatically scale based on load.

#### Step 1: Check HPA Status

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

#### Step 2: Check Current Resource Usage

See how much CPU/memory your pods are using:
```bash
docker exec workshop-k3s kubectl top pods -n workshop
```

You should see low CPU usage (a few millicores like `1m` or `2m`).

#### Step 3: Start the Load Generator

The load generator will send many requests to the backend to create CPU load:

```bash
docker exec workshop-k3s kubectl scale deployment/load-generator --replicas=3 -n workshop
```

**What this does**: Creates 3 pods that continuously hit the backend API.

**👀 In Dashboard:**
- Navigate to **Workloads** → **Pods**
- You'll see 3 new `load-generator` pods appear

#### Step 4: Watch Autoscaling Happen

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

#### Step 5: Stop the Load

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

#### Step 6: Verify Final State

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

**Time**: ~10 minutes  
**Goal**: Deploy new versions without downtime and rollback instantly if something breaks

---

### What You'll Learn

- How to update applications in Kubernetes
- How rolling updates maintain zero-downtime
- How to rollback when deployments fail
- How Kubernetes protects your application automatically

---

## Part 1: Successful Update (v1 → v2) (5 minutes)

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

## Part 2: Failed Update & Rollback (v2 → v3) (5 minutes)

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

```bash
# Get the name of a failed pod
docker exec workshop-k3s kubectl get pods -n workshop | grep ImagePull

# Describe it to see the error
docker exec workshop-k3s kubectl describe pod <failed-pod-name> -n workshop
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





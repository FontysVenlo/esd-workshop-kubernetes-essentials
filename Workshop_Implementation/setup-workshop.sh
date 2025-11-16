#!/bin/bash
# setup-workshop.sh
# Setup script for Kubernetes Workshop (Linux)

set -e

echo "======================================"
echo "Kubernetes Workshop Setup"
echo "======================================"
echo ""

# Step 1: Clean up any existing workshop resources
echo "🧹 Cleaning up existing workshop resources..."
docker compose -f docker-compose.workshop.yaml down -v 2>/dev/null || true

# Step 2: Remove old images
echo "🗑️  Removing old workshop images..."
docker rmi demo-api:v1 2>/dev/null || true
docker rmi demo-api:v2 2>/dev/null || true
docker rmi demo-web:local 2>/dev/null || true

# Step 3: Build fresh images
echo "🔨 Building workshop images from scratch..."
echo "   This may take a few minutes..."
docker compose -f docker-compose.workshop.yaml build --no-cache api-v1 api-v2 web

# Step 4: Verify images were built
echo ""
echo "✅ Verifying images were built..."
docker images | grep demo

# Step 5: Start the workshop
echo ""
echo "🚀 Starting workshop environment..."
docker compose -f docker-compose.workshop.yaml up -d

# Step 6: Wait for k3s to be ready
echo ""
echo "⏳ Waiting for Kubernetes to be ready..."
echo "   This may take 30-60 seconds..."
sleep 10

for i in {1..30}; do
    if docker exec workshop-k3s kubectl get nodes &>/dev/null; then
        echo "✅ Kubernetes is ready!"
        break
    fi
    echo -n "."
    sleep 2
done

# Step 7: Check image loader
echo ""
echo "📦 Checking image loader status..."
docker logs workshop-image-loader 2>/dev/null | tail -20

# Step 8: Verify images in k3s
echo ""
echo "🔍 Verifying images in k3s..."
docker exec workshop-k3s ctr images list | grep demo || {
    echo ""
    echo "⚠️  WARNING: Images not found in k3s!"
    echo "   Attempting manual image load..."
    echo ""
    docker save demo-api:v1 | docker exec -i workshop-k3s ctr images import -
    docker save demo-api:v2 | docker exec -i workshop-k3s ctr images import -
    docker save demo-web:local | docker exec -i workshop-k3s ctr images import -
    echo "✅ Manual image load complete"
}

# Step 9: Check deployer
echo ""
echo "📋 Checking deployer status..."
sleep 5
docker logs workshop-deployer 2>/dev/null | tail -30

echo ""
echo "======================================"
echo "✅ Workshop Setup Complete!"
echo "======================================"
echo ""
echo "🌐 Access your applications:"
echo "   Frontend:   http://localhost:30081"
echo "   Backend:    http://localhost:30080/api/health"
echo "   Dashboard:  https://localhost:30082"
echo ""
echo "🔍 Verify everything is running:"
echo "   docker exec workshop-k3s kubectl get pods -n workshop"
echo ""
echo "📚 Start with Exercise 1: Scaling"
echo ""
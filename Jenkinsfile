
pipeline {
  agent any
  options { timestamps() }

  environment {
    DOCKER_BUILDKIT = '1'
    COMPOSE_DOCKER_CLI_BUILD = '1'
    CONTAINER_NAME = 'artomily-app'
    WORKER_NAME = 'artomily-worker'
    COMPOSE_FILE   = "${WORKSPACE}/docker-compose.yml"
  }

  stages {
    stage('Prepare') {
      steps {
        sh '''
          set -e
          mkdir -p deploy-logs
          docker compose version
          ls -la "${COMPOSE_FILE}"

          # Create external network if not exists (required for traefik_proxy)
          if ! docker network ls | grep -q "traefik_proxy"; then
            echo "Creating external network: traefik_proxy"
            docker network create traefik_proxy
          else
            echo "External network traefik_proxy already exists"
          fi
        '''
      }
    }

    stage('Build & Deploy') {
      steps {
        sh '''
          set -e

          # Build and start containers (sama seperti docker compose up -d --build)
          echo "Building and starting containers..."
          docker compose -f "${COMPOSE_FILE}" up -d --build

          # Show running containers
          echo "Container status:"
          docker compose -f "${COMPOSE_FILE}" ps
        '''
      }
    }

    stage('Health Check') {
      steps {
        sh '''
          set -e

  # Ambil container ID dari service name
          echo "Getting container ID for service..."
          CID=$(docker compose -f "${COMPOSE_FILE}" ps -q app)

          # Fallback: use container name if service name doesn't work
          if [ -z "$CID" ]; then
            echo "Container ID from service not found, trying container name..."
            CID=$(docker ps -q --filter "name=${CONTAINER_NAME}")
          fi

          if [ -z "$CID" ]; then
            echo "Container ID not found. Current ps:"
            docker compose -f "${COMPOSE_FILE}" ps
            echo "All containers:"
            docker ps -a
            exit 1
          fi

          echo "Found container ID: $CID"

          # Tunggu container RUNNING + punya .State.Health
          i=0
          while [ $i -lt 60 ]; do
            STATE=$(docker inspect --format='{{.State.Status}}' "$CID" || echo "unknown")
            HEALTH=$(docker inspect --format='{{if .State.Health}}{{.State.Health.Status}}{{else}}nohealth{{end}}' "$CID" || echo "unknown")
            echo "Attempt $((i+1)): state=${STATE}, health=${HEALTH}"

            # Keluar sukses kalau sehat
            if [ "$HEALTH" = "healthy" ]; then
              exit 0
            fi

            # Kalau belum ada health (nohealth), tunggu sebentar (healthcheck compose butuh waktu attach)
            sleep 5
            i=$((i+1))
          done

          echo "Container not healthy after retries. Recent logs:"
          docker logs "$CID" --tail=200 || true
          exit 1
        '''
      }
    }
  }

  post {
    always {
      sh '''
        set -e
        mkdir -p deploy-logs

        # Collect logs for debugging
        docker compose -f "${COMPOSE_FILE}" ps > deploy-logs/compose-ps.txt 2>/dev/null || true
        docker logs "${CONTAINER_NAME}" --since=30m > "deploy-logs/${CONTAINER_NAME}.log" 2>/dev/null || true
        docker logs "${WORKER_NAME}" --since=30m > "deploy-logs/${WORKER_NAME}.log" 2>/dev/null || true
        docker ps -a > deploy-logs/all-containers.txt 2>/dev/null || true
        docker network ls > deploy-logs/networks.txt 2>/dev/null || true
      '''
      archiveArtifacts artifacts: 'deploy-logs/**', onlyIfSuccessful: false
    }
    failure {
      sh '''
        echo "Build failed, cleaning up..."
        docker compose -f "${COMPOSE_FILE}" down --remove-orphans || true
      '''
    }
    aborted {
      sh '''
        echo "Build aborted, cleaning up..."
        docker compose -f "${COMPOSE_FILE}" down --remove-orphans || true
      '''
    }
  }
}

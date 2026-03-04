
pipeline {
  agent any
  options { timestamps() }

  environment {
    DOCKER_BUILDKIT = '1'
    COMPOSE_DOCKER_CLI_BUILD = '1'
    CONTAINER_NAME = 'artomily-app'
    WORKER_NAME = 'artomily-worker'
    COMPOSE_FILE   = "${WORKSPACE}/docker-compose.yml"

    // Credentials dari Jenkins Secret Text
    DATABASE_URL = credentials('DATABASE_URL')
    NEXTAUTH_URL = credentials('NEXTAUTH_URL')
    NEXTAUTH_SECRET = credentials('NEXTAUTH_SECRET')
    REDIS_URL = credentials('REDIS_URL')
    ALIBABA_API_KEY = credentials('ALIBABA_API_KEY')
    STRIPE_SECRET_KEY = credentials('STRIPE_SECRET_KEY')
    STRIPE_WEBHOOK_SECRET = credentials('STRIPE_WEBHOOK_SECRET')
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = credentials('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY')
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

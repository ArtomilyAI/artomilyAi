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
        '''
      }
    }

    stage('Build & Deploy') {
      steps {
        script {
          // Build env file from credentials
          // Each credential is wrapped individually so missing ones don't block deployment
          def envLines = []

          def credentialIds = [
            'DATABASE_URL',
            'NEXTAUTH_URL',
            'NEXTAUTH_SECRET',
            'REDIS_URL',
            'ALIBABA_API_KEY',
            'STRIPE_SECRET_KEY',
            'STRIPE_WEBHOOK_SECRET',
            'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'
          ]

          for (credId in credentialIds) {
            try {
              withCredentials([string(credentialsId: credId, variable: 'CRED_VALUE')]) {
                envLines.add("${credId}=${env.CRED_VALUE}")
              }
            } catch (Exception e) {
              echo "WARNING: Credential '${credId}' not found in Jenkins, skipping."
              envLines.add("${credId}=")
            }
          }

          // Write .env file
          writeFile file: "${env.WORKSPACE}/.env", text: envLines.join('\n') + '\n'
          echo ".env file created with ${envLines.size()} variables"

          // Now run docker compose (it will read .env automatically)
          sh '''
            set -e

            # Cleanup existing containers
            echo "Cleaning up existing containers..."
            docker compose -f "${COMPOSE_FILE}" down --remove-orphans || true

            for CN in "${CONTAINER_NAME}" "${WORKER_NAME}"; do
              if docker ps -a --format "{{.Names}}" | grep -q "^${CN}$"; then
                echo "Force stopping and removing container: ${CN}"
                docker stop "${CN}" || true
                docker rm "${CN}" || true
              fi
            done

            # Build the new image
            echo "Building Docker image..."
            docker compose -f "${COMPOSE_FILE}" build --pull --no-cache

            # Start the containers
            echo "Starting containers..."
            docker compose -f "${COMPOSE_FILE}" up -d

            # Show running containers
            echo "Container status:"
            docker compose -f "${COMPOSE_FILE}" ps
          '''
        }
      }
    }

    stage('Health Check') {
      steps {
        sh '''
          set -e

          echo "Checking containers..."
          CID_APP=$(docker ps -q --filter "name=${CONTAINER_NAME}")
          CID_WORKER=$(docker ps -q --filter "name=${WORKER_NAME}")

          if [ -z "$CID_APP" ]; then
            echo "App container not found!"
            docker ps -a
            exit 1
          fi

          if [ -z "$CID_WORKER" ]; then
            echo "Worker container not found!"
            docker ps -a
            exit 1
          fi

          echo "Found App container:    $CID_APP"
          echo "Found Worker container: $CID_WORKER"

          i=0
          while [ $i -lt 6 ]; do
            STATE_APP=$(docker inspect --format='{{.State.Status}}' "$CID_APP" || echo "unknown")
            STATE_WORKER=$(docker inspect --format='{{.State.Status}}' "$CID_WORKER" || echo "unknown")
            echo "Attempt $((i+1)): app=${STATE_APP}, worker=${STATE_WORKER}"

            if [ "$STATE_APP" != "running" ]; then
              echo "ERROR: App container is not running!"
              docker logs "$CID_APP" --tail=200 || true
              exit 1
            fi

            if [ "$STATE_WORKER" != "running" ]; then
              echo "ERROR: Worker container is not running!"
              docker logs "$CID_WORKER" --tail=200 || true
              exit 1
            fi

            sleep 5
            i=$((i+1))
          done

          echo "All containers are running successfully"
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

      // Remove .env to prevent credential leakage
      sh 'rm -f "${WORKSPACE}/.env"'

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

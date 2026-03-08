pipeline {
  agent any
  options { timestamps() }

  environment {
    DOCKER_BUILDKIT = '1'
    COMPOSE_DOCKER_CLI_BUILD = '1'
    CONTAINER_NAME = 'artomily-app'
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
            'NEXT_PUBLIC_SUPABASE_URL',
            'SUPABASE_STORAGE_ENDPOINT',
            'SUPABASE_STORAGE_REGION',
            'SUPABASE_STORAGE_ACCESS_KEY_ID',
            'SUPABASE_STORAGE_SECRET_ACCESS_KEY',
            'SUPABASE_STORAGE_IMAGE_BUCKET',
            'SUPABASE_STORAGE_VIDEO_BUCKET'
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

            for CN in "${CONTAINER_NAME}"; do
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
            docker compose -f "${COMPOSE_FILE}" up -d --scale worker=2

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

          if [ -z "$CID_APP" ]; then
            echo "App container not found!"
            docker ps -a
            exit 1
          fi

          # Check worker replicas
          WORKER_COUNT=$(docker compose -f "${COMPOSE_FILE}" ps -q worker | wc -l)
          echo "Found App container: $CID_APP"
          echo "Found ${WORKER_COUNT} worker container(s)"

          if [ "$WORKER_COUNT" -lt 1 ]; then
            echo "ERROR: No worker containers found!"
            docker compose -f "${COMPOSE_FILE}" ps
            exit 1
          fi

          i=0
          while [ $i -lt 6 ]; do
            STATE_APP=$(docker inspect --format='{{.State.Status}}' "$CID_APP" || echo "unknown")
            echo "Attempt $((i+1)): app=${STATE_APP}"

            if [ "$STATE_APP" != "running" ]; then
              echo "ERROR: App container is not running!"
              docker logs "$CID_APP" --tail=200 || true
              exit 1
            fi

            # Check all worker replicas
            ALL_WORKERS_OK=true
            for WID in $(docker compose -f "${COMPOSE_FILE}" ps -q worker); do
              W_STATE=$(docker inspect --format='{{.State.Status}}' "$WID" || echo "unknown")
              echo "  worker $WID: ${W_STATE}"
              if [ "$W_STATE" != "running" ]; then
                echo "ERROR: Worker $WID is not running!"
                docker logs "$WID" --tail=200 || true
                ALL_WORKERS_OK=false
              fi
            done

            if [ "$ALL_WORKERS_OK" = false ]; then
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

        # Collect worker logs (multiple replicas)
        WIDX=1
        for WID in $(docker compose -f "${COMPOSE_FILE}" ps -q worker 2>/dev/null); do
          docker logs "$WID" --since=30m > "deploy-logs/worker-${WIDX}.log" 2>/dev/null || true
          WIDX=$((WIDX+1))
        done

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

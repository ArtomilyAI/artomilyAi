pipeline {
    agent any
    options {
        timestamps()
        disableConcurrentBuilds()
        timeout(time: 30, unit: 'MINUTES')
    }

    environment {
        DOCKER_BUILDKIT        = '1'
        COMPOSE_DOCKER_CLI_BUILD = '1'
        CONTAINER_NAME         = 'artomily-app'
        WORKER_NAME            = 'artomily-worker'
        COMPOSE_FILE           = "${WORKSPACE}/docker-compose.yml"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Prepare Environment') {
            steps {
                withCredentials([
                    string(credentialsId: 'DATABASE_URL',                       variable: 'DATABASE_URL'),
                    string(credentialsId: 'NEXTAUTH_URL',                      variable: 'NEXTAUTH_URL'),
                    string(credentialsId: 'NEXTAUTH_SECRET',                   variable: 'NEXTAUTH_SECRET'),
                    string(credentialsId: 'REDIS_URL',                         variable: 'REDIS_URL'),
                    string(credentialsId: 'ALIBABA_API_KEY',                   variable: 'ALIBABA_API_KEY'),
                    string(credentialsId: 'STRIPE_SECRET_KEY',                 variable: 'STRIPE_SECRET_KEY'),
                    string(credentialsId: 'STRIPE_WEBHOOK_SECRET',             variable: 'STRIPE_WEBHOOK_SECRET'),
                    string(credentialsId: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', variable: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY')
                ]) {
                    // Write .env file for docker-compose
                    sh '''
                        set -e
                        cat > "${WORKSPACE}/.env" <<EOF
DATABASE_URL=${DATABASE_URL}
NEXTAUTH_URL=${NEXTAUTH_URL}
NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
REDIS_URL=${REDIS_URL}
ALIBABA_API_KEY=${ALIBABA_API_KEY}
STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET}
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
EOF
                        echo ".env file created successfully"
                    '''
                }
            }
        }

        stage('Prepare Network') {
            steps {
                sh '''
                    set -e
                    docker compose version

                    # Create external network if not exists
                    if ! docker network ls --format '{{.Name}}' | grep -qx "traefik_proxy"; then
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

                    echo "==> Building and starting containers..."
                    docker compose -f "${COMPOSE_FILE}" up -d --build --remove-orphans

                    echo "==> Waiting for containers to become healthy..."
                    sleep 10

                    echo "==> Container status:"
                    docker compose -f "${COMPOSE_FILE}" ps
                '''
            }
        }

        stage('Health Check') {
            steps {
                sh '''
                    set -e

                    echo "==> Checking container status..."
                    # Verify containers are running (not restarting/exited)
                    RUNNING_APP=$(docker inspect --format='{{.State.Status}}' "${CONTAINER_NAME}" 2>/dev/null || echo "not_found")
                    RUNNING_WORKER=$(docker inspect --format='{{.State.Status}}' "${WORKER_NAME}" 2>/dev/null || echo "not_found")

                    echo "App container status: ${RUNNING_APP}"
                    echo "Worker container status: ${RUNNING_WORKER}"

                    if [ "${RUNNING_APP}" != "running" ]; then
                        echo "ERROR: App container is not running!"
                        docker logs "${CONTAINER_NAME}" --tail 50 2>/dev/null || true
                        exit 1
                    fi

                    if [ "${RUNNING_WORKER}" != "running" ]; then
                        echo "ERROR: Worker container is not running!"
                        docker logs "${WORKER_NAME}" --tail 50 2>/dev/null || true
                        exit 1
                    fi

                    echo "==> All containers are running successfully"
                '''
            }
        }
    }

    post {
        always {
            sh '''
                mkdir -p deploy-logs
                docker compose -f "${COMPOSE_FILE}" ps > deploy-logs/compose-ps.txt 2>/dev/null || true
                docker logs "${CONTAINER_NAME}" --since=30m > "deploy-logs/${CONTAINER_NAME}.log" 2>&1 || true
                docker logs "${WORKER_NAME}" --since=30m > "deploy-logs/${WORKER_NAME}.log" 2>&1 || true
                docker ps -a > deploy-logs/all-containers.txt 2>/dev/null || true
                docker network ls > deploy-logs/networks.txt 2>/dev/null || true
            '''
            archiveArtifacts artifacts: 'deploy-logs/**', allowEmptyArchive: true
        }
        success {
            echo '✅ Deployment completed successfully!'
        }
        failure {
            sh '''
                echo "❌ Build failed! Container logs:"
                docker logs "${CONTAINER_NAME}" --tail 100 2>/dev/null || true
                docker logs "${WORKER_NAME}" --tail 100 2>/dev/null || true
            '''
        }
        cleanup {
            // Remove the .env file to avoid credential leakage
            sh 'rm -f "${WORKSPACE}/.env"'
        }
    }
}

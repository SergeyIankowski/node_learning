import { assignment, PR_FORFEITS, PR_RULES, programModule } from '../links';
import type { Week } from '../types';
import { KH_REPO_NOTE } from './week-09';

const PROJECT = 'w11-docker';

export const week11: Week = {
  id: 'w11',
  number: 11,
  programWeek: 6,
  title: 'Containerization with Docker & Compose',
  short: 'Docker',
  goals: [
    'Understand images, containers, layers, volumes and networks',
    'Write a small, secure, multi-stage Dockerfile for a Nest app',
    'Run app + PostgreSQL (+ adminer) with Docker Compose, health checks and restart policies',
  ],
  modules: [programModule('rest/containerization', 'REST service: Containerization')],
  tasks: [
    {
      id: 'w11-docker-read',
      kind: 'read',
      title: 'Docker basics and Dockerfile best practices',
      summary: 'Images vs containers, layers and caching, multi-stage builds, Compose.',
      estimateH: 3,
      resources: [
        { title: 'Lecture: Docker basics', url: 'https://youtu.be/kAM-_vZIYkI', lang: 'RU' },
        { title: 'Docker live coding', url: 'https://youtu.be/XPB0ZYNnFf0', lang: 'RU' },
        { title: 'Docker docs: get started', url: 'https://docs.docker.com/get-started/' },
        { title: 'Docker guide: Node.js', url: 'https://docs.docker.com/guides/nodejs/' },
        { title: 'Dockerfile best practices', url: 'https://docs.docker.com/build/building/best-practices/' },
        { title: 'Multi-stage builds', url: 'https://docs.docker.com/build/building/multi-stage/' },
        { title: 'Compose file reference', url: 'https://docs.docker.com/reference/compose-file/' },
      ],
      questions: [
        'Why copy `package*.json` and run `npm ci` **before** copying the source code?',
        'What is the difference between `CMD` and `ENTRYPOINT`? And `EXPOSE` vs publishing a port?',
        'Why run as a non-root user inside the container?',
        'How do containers on the same Compose network find each other (service name = hostname)?',
        'Named volume vs bind mount: which one for PostgreSQL data, and why?',
      ],
    },
    {
      id: 'w11-docker-hello',
      kind: 'code',
      warmup: true,
      title: 'Warm-up: Docker CLI drills',
      summary: 'run, ps, logs, exec, volumes, networks.',
      estimateH: 1,
      description: `1. \`docker run -d --name web -p 8080:80 nginx:alpine\`, then open http://localhost:8080
2. \`docker logs -f web\`, \`docker exec -it web sh\`, then edit \`/usr/share/nginx/html/index.html\`
3. Stop and remove it, run again. Your edit is gone. Why?
4. \`docker volume create pgdata\`. Run \`postgres:16-alpine\` with \`-v pgdata:/var/lib/postgresql/data\`, create a table, remove the container, start a new one. The table is still there.
5. \`docker network create lab\`. Two containers on \`lab\` can \`ping\` each other by name.`,
      acceptance: [
        'You can explain container vs image vs volume',
        'You know where to look when a container exits immediately (`docker logs`, `docker inspect`)',
      ],
    },
    {
      id: PROJECT,
      kind: 'project',
      title: 'Project: Containerization & Docker (foundation)',
      summary: 'Dockerize the Knowledge Hub API and run it with PostgreSQL in Compose.',
      estimateH: 1,
      ...assignment('06a-docker'),
      maxScore: 166,
      overview: `${KH_REPO_NOTE}

Prepare the runtime: an **app container** and a **PostgreSQL container**. The app keeps its in-memory storage for now. Next week Prisma connects it to this database.

Prerequisites: install Docker and create a Docker Hub account.`,
      requirements: [
        'TypeScript; Node.js 24.x (24.10.0+)',
        'Starts with `docker-compose up --build`',
        '`.env` is not committed',
        ...PR_RULES,
      ],
      spec: `### .dockerignore
\`node_modules\`, \`.git\`, \`logs/\`, \`*.log\`, \`.env\`, \`dist/\`, \`.vscode/\`, \`.idea/\`

### Dockerfile
- **Multi-stage**. Stage 1 (build): all dependencies + compile TS. Stage 2 (production): compiled output + \`npm ci --omit=dev\`
- Final base image \`node:24-alpine\`, \`NODE_ENV=production\`, \`EXPOSE\` the app port, a **non-root user**, and a \`CMD\` that starts the app

### docker-compose.yml
| service | requirements |
|---|---|
| \`app\` | build from the Dockerfile; \`depends_on: db\` (healthy); \`4000:4000\`; \`env_file: .env\`; healthcheck (\`curl -f http://localhost:4000/\` or a \`wget\`/\`node\` equivalent); \`restart: on-failure\` |
| \`db\` | \`postgres:16-alpine\`; \`POSTGRES_USER/PASSWORD/DB\`; port 5432; **named volume**; healthcheck \`pg_isready\`; \`restart: unless-stopped\` |
| \`adminer\` (optional) | official image, \`8080:8080\`, only in a dev profile (\`profiles: [debug]\`) |

Plus a custom **bridge network** and a named volume.

### .env.example
\`POSTGRES_USER\`, \`POSTGRES_PASSWORD\`, \`POSTGRES_DB\`, \`POSTGRES_HOST=db\`, \`POSTGRES_PORT=5432\`

### Security & registry
Scan the image (\`docker scout cves <image>\` or \`trivy image <image>\`) and put the results in the PR description. Push the image to Docker Hub and link it in the README.`,
      scoring: [
        {
          scope: 'Basic',
          items: [
            '**+10** .dockerignore · **+20** Dockerfile builds · **+20** compose with app + db',
            '**+10** custom network · **+10** named volume · **+10** works via `docker-compose up --build`',
            '**+10** db healthy and reachable from the app · **+10** db vars in `.env`/`.env.example`',
          ],
        },
        {
          scope: 'Advanced',
          items: [
            '**+16** multi-stage build',
            '**+10** health checks for app and db',
            '**+6** non-root user',
            '**+6** restart policies',
          ],
        },
        {
          scope: 'Hacker',
          items: [
            '**+10** security scan documented',
            '**+6** final image < 500 MB',
            '**+6** pushed to Docker Hub + link in README',
            '**+6** adminer in a dev profile',
          ],
        },
        { scope: 'Forfeits', items: PR_FORFEITS },
      ],
      deliverables: [
        'Dockerfile, .dockerignore, docker-compose.yml, updated .env.example',
        'Docker Hub link in README',
        'PR with scan results and self-score',
      ],
    },
    {
      id: 'w11-dockerignore',
      kind: 'code',
      title: '.dockerignore',
      summary: 'Keep the build context small and secrets out.',
      estimateH: 0.25,
      projectId: PROJECT,
      points: 10,
      description:
        'Create `.dockerignore` with at least the entries from the spec. Compare the "transferring context" size in `docker build` output before and after.',
      acceptance: ['`.env` and `node_modules` are not sent to the daemon'],
    },
    {
      id: 'w11-dockerfile',
      kind: 'code',
      title: 'Multi-stage Dockerfile (alpine, non-root)',
      summary: 'Build stage + slim runtime stage.',
      estimateH: 2,
      projectId: PROJECT,
      points: 42,
      description: `~~~dockerfile
FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:24-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
USER node
EXPOSE 4000
CMD ["node", "dist/main.js"]
~~~
Adapt it to your project, and understand every line.`,
      run: 'docker build -t knowledge-hub .\ndocker images knowledge-hub\ndocker run --rm knowledge-hub whoami',
      expected: 'knowledge-hub  latest  …  ~200MB\nnode',
      acceptance: ['Builds without errors', 'Runs as `node` (not root)', 'Image < 500 MB'],
    },
    {
      id: 'w11-compose',
      kind: 'code',
      title: 'docker-compose: app + db, network, volume',
      summary: 'The whole stack with one command.',
      estimateH: 2,
      projectId: PROJECT,
      points: 60,
      description:
        "Write `docker-compose.yml` with `app` and `db`, a custom bridge network `kh-net` and a named volume `pgdata`. Give the app the `POSTGRES_*` variables. Even though it doesn't use the DB yet, check it can reach `db:5432` (for example `docker compose exec app nc -z db 5432`).",
      run: 'docker compose up --build\ncurl -i localhost:4000/user',
      acceptance: [
        'API responds from the container',
        'The DB data survives `docker compose down` + `up` (without `-v`)',
      ],
    },
    {
      id: 'w11-healthchecks',
      kind: 'code',
      title: 'Health checks & restart policies',
      summary: 'depends_on: condition: service_healthy.',
      estimateH: 1,
      projectId: PROJECT,
      points: 16,
      description:
        '`db`: `test: ["CMD-SHELL", "pg_isready -U $${POSTGRES_USER} -d $${POSTGRES_DB}"]`. `app`: there is no curl in alpine by default, so use `wget -qO- http://localhost:4000/doc || exit 1` or a tiny node one-liner. `app.depends_on.db.condition: service_healthy`. Restart policies: app `on-failure`, db `unless-stopped`.',
      run: 'docker compose ps',
      expected: 'app   …   Up (healthy)\ndb    …   Up (healthy)',
      acceptance: ['Both services show `(healthy)`', 'The app starts only after the db is healthy'],
    },
    {
      id: 'w11-env',
      kind: 'code',
      title: 'Database env variables',
      summary: '.env / .env.example with POSTGRES_* values.',
      estimateH: 0.25,
      projectId: PROJECT,
      points: 10,
      description:
        'Add `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `POSTGRES_HOST=db` and `POSTGRES_PORT=5432` to `.env.example`, with safe defaults. Compose reads `.env` automatically for variable substitution.',
      acceptance: ['`.env` is git-ignored, `.env.example` is committed'],
    },
    {
      id: 'w11-adminer',
      kind: 'code',
      title: 'adminer in a debug profile',
      summary: 'A DB UI only when you ask for it.',
      estimateH: 0.25,
      projectId: PROJECT,
      points: 6,
      description: 'Add an `adminer` service with `profiles: ["debug"]` on the same network, mapped to `8080:8080`.',
      run: 'docker compose --profile debug up -d\nopen http://localhost:8080',
      acceptance: ['A plain `docker compose up` does not start adminer', 'You can log in to Postgres (server: `db`)'],
    },
    {
      id: 'w11-scan-push',
      kind: 'code',
      title: 'Security scan + push to Docker Hub',
      summary: 'docker scout / trivy, then docker push.',
      estimateH: 1,
      projectId: PROJECT,
      points: 22,
      description:
        'Scan with `docker scout cves knowledge-hub` or `trivy image knowledge-hub` and fix critical issues if any (update the base image or dependencies). Then tag and push: `docker tag knowledge-hub <you>/knowledge-hub:1.0 && docker push <you>/knowledge-hub:1.0`. Add the Docker Hub link to the README.',
      acceptance: [
        'Scan output summarized in the PR description',
        'The image is public on Docker Hub',
        'Link in README',
      ],
    },
    {
      id: 'w11-docker-ship',
      kind: 'code',
      title: 'Ship & self-score: Docker',
      summary: 'Fresh clone → docker compose up → works.',
      estimateH: 0.5,
      projectId: PROJECT,
      description:
        'Clone the repo into a temp folder, `cp .env.example .env`, `docker compose up --build`, and check the API and the provided tests. Then open the PR with your self-score.',
      acceptance: ['Works from a fresh clone', 'Self-score written down (target ≥ 150/166)'],
    },
  ],
};

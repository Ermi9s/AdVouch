FROM node:18-alpine


WORKDIR /app

COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./
RUN npm install --frozen-lockfile || yarn install --frozen-lockfile || pnpm install --frozen-lockfile


COPY . .


CMD ["npm", "run", "dev"]

# Postomat map for Moscow

Front-end application oriented to show the map with postomats in Moscow

## Technologies used

- [React](https://reactjs.org/)
- [Typescript](https://www.typescriptlang.org/)
- [Docker](https://www.docker.com/)

## Setup

1. Clone the repository and install the dependencies

```bash
yarn install
```

2. Start the frontend application locally

```bash
yarn start
```

---

## Docker setup

1. To up docker container

```bash
yarn run docker-compose-up
```

2. To down docker container

```bash
yarn run docker-compose-down
```

## Available commands

- `yarn start`: Start the app locally in your development environment, by default it will be in http://localhost:3000.
- `yarn run docker-compose-up`: Start docker container, by default it will be in http://localhost:3001
- `yarn run docker-compose-down`: Close docker container

---

This app was bootstraped based on the template provided by [`create-react-app`](https://github.com/facebook/create-react-app)

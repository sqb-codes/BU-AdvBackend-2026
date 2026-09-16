Build the image
docker build -t userservice:1.0 .

Run the container
docker run -d -p 4545:4545 --name userservice_container userservice:1.0

Open docker shell
docker exec -it userservice_container sh

Mount anonymous volume
For windows
docker run -d -p 4545:4545 -v (pwd):/app --name userservice_container userservice:1.0

For mac/linux
docker run -d -p 4545:4545 -v "$(pwd)":/app --name userservice_container userservice:1.0


Make Read only docker app directory
docker run -d -p 4545:4545 -v "$(pwd)":/app:ro --name userservice_container userservice:1.0


Run docker compose:
docker compose up -d

Run compose + build again
docker compose up -d --build


Run dev environment
docker compose -f docker-compose.yaml -f docker-compose.dev.yaml up -d

Run prod environment
docker compose -f docker-compose.yaml -f docker-compose.prod.yaml up -d
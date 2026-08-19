Build the image

docker build -t userservice:1.0 .


Run the container

docker run -d -p 4545:4545 --name userservice_container userservice:1.0

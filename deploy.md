## Deployment Steps

**Note: The overall build flow can be used to deploy a Fargate container or setup up an EC2 instance serving the React SPA. The steps are assuming a Linux distribution with an nginx server is being used for the container or EC2 instance. The AWS CLI Commands/Steps can be used to deploy changes to the AWS sandbox until the CI/CD pipeline is in place.**

### Build steps

1. Install node.js (which comes with the npm package manager) on the build server or docker container (see Dockerfile for reference)
   **Note: the `default.conf` file for this project is located at `nginx/default.conf`**
2. Install an nginx web server with a `default.conf` that works with a React SPA using react router on the build server or container (see Dockerfile for reference).
3. Navigate to the root directory of the project
   **Note: install project dependencies**
4. `npm install`
   **Note: run tests and move to next step if they pass (exit code: 0)**
5. `npm run test`
   **Note: create production build**
6. `npm run build`
7. move build folder into the nginx web server directory `/usr/share/nginx/html`
8. start nginx server
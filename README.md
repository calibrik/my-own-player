# Description
My own player for movies and tv shows, cuz I'm done with sketchy ass websites. So I made my own sketchy looking website, but it was an artistic choice, we are different.

# Live Link
https://calibriks-player.netlify.app


# Build locally using docker
The search feature uses The Movie Database (TMDB) API.

1. You need to install Docker.

2. Create a free account at https://www.themoviedb.org/signup and verify your email.

3. Go to https://www.themoviedb.org/settings/api and click **Request an API Key**.

4. Choose **Developer**, accept the terms and fill in the short form (type: **Website**, app URL can be anything).
5. Copy the generated **API Key**.

6. Create ```env_vars.env``` file in root directory and add this ```VITE_TMDB_API_KEY=your_api_key```

7. In the project folder run ```docker compose up --build``` in terminal or click on [dockerComposeLocal.bat](dockerComposeLocal.bat) to build images and run containers. Server will start on [localhost:80](http://localhost:80).
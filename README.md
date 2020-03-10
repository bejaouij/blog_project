# Node Blog Project - API
Backend API designed to provide data for blog applications.

## Deployment
Here are what you need to run this API on your server.

### Dependences
First, you will need the following tools:
* **NPM 6.13.4+** (previous versions may suit but were not tested in this project).
* **Node 12.14.0+** (previous versions may suit but were not tested in this project).
* A **RestDB** access from an API key containing the following collections:
    * users (_id: **text**, email: **email**, name: **text**, password: **text**, description: **text**)
    * articles (_id: **text**, title: **text**, content: **richtext**, user: **users** )

### Get started
Download the latest project source files archive from this [url](https://github.com/bejaouij/blog_project/archive/master.zip):

Or by cloning the related repository by typing from a terminal:
```
git clone https://github.com/bejaouij/blog_project.git
```
Next, set the following environment variables:
* **RESTDB_API_KEY** - Your RestDB API key with an access to previously mentioned collections.
* **SERVER_PORT** - The port used by the application.
* **SERVER_JWT_SECRET** - A secret for JWT signature.

Now, please install the required dependencies by typing `npm install` from the terminal. Make sure you are in the project root directory.

To start the application, run the `npm start` command from your terminal.

## Versions
### 1.0.0
* Application release.

## Author
* [Jérémy Béjaoui](https://github.com/bejaouij) - *Designer | Developer*

## License
This project is entirely free of uses and modifications.
/**
 * Article.js
 *
 * @description : Articles data access.
 */
const bcrypt = require("bcrypt");
const restAxios = require("../helpers/AxiosConcreteFactory").getRestAxios();

const Article = {
    requiredFields: [
        "title",
        "content"
    ],
    fillableFields: [
        "title",
        "content"
    ],
    async create(data) {
        return new Promise((resolve, reject) => {
            let newArticleData = {};

            Article.hydrate(newArticleData, data);

            let invalidData = Article.checkData(newArticleData);

            if (Object.keys(invalidData).length > 0) {
                reject({ "status": 400, "message": "Invalid data.", "invalid_data": invalidData });
            }

            restAxios.post("articles", newArticleData)
                .then(response => {
                    resolve({ "status": 201, "data": newArticleData });
                })
                .catch(err => {
                    reject({ "status": 500});
                })
        });
    },
    async read() {
        return new Promise((resolve, reject) => {
            restAxios.get("articles")
                .then(response => {
                    const articles = response.data;
                    articles.map(article => {
                        article.author = {
                            "name": article.user ? article.user[0].name : "Unknown",
                            "_id": article.user ? article.user[0]._id : -1
                        };
                        article.user = undefined;
                    });

                    resolve({ "status": 200, data: articles});
                })
                .catch(err => {
                    console.log(err);

                    reject({ "status": 500 });
                })
        });
    },
    async readById(id) {
        return new Promise((resolve, reject) => {
            restAxios.get(`articles/${id}`)
                .then(response => {
                    if (!response.data) {
                        resolve({ "status" : 200, "data": []});
                    }

                    const article = response.data;
                    article.author = {
                        "name": article.user ? article.user[0].name : "Unknown",
                        "_id": article.user ? article.user[0]._id : -1
                    };
                    article.user = undefined;

                    resolve({ "status" : 200, "data": article});
                })
                .catch(err => {
                    console.log(err);

                    reject({ "status": 500 });
                })
        });
    },
    async readOneBy(field, value) {
        return new Promise((resolve, reject) => {
            const params = {
                "q": {}
            };

            params.q[field] = value;

            restAxios.get("users", { params: params})
                .then(response => {
                    resolve({ "status": 200, "data": response.data });
                })
                .catch(err => {
                    reject({ "status": 500 });
                });
        });
    },
    async delete(id) {
        return new Promise((resolve, reject) =>  {
            restAxios.delete(`articles/${id}`)
                .then(response => {
                    resolve({ "status": 200 });
                })
                .catch(err => {
                    console.log(err);

                    reject( { "status": 500 });
                });
        });
    },
    hydrate(articleToHydrate, data) {
        Article.fillableFields.forEach(value => {
            articleToHydrate[value] = data[value];
        });

        articleToHydrate.user = data.user;
    },
    checkData(data) {
        let invalidData = {};

        Article.requiredFields.forEach((value) => {
            if (data[value] == null || !data[value].trim()) {

                invalidData[value] = {
                    "reasons": ["Empty data."]
                };
            }
        });

        return invalidData;
    },
    update(id, data) {
        return new Promise((resolve, reject) => {
            restAxios.patch(`articles/${id}`, data)
                .then(response => {
                    const article = response.data;

                    resolve({ "status": 200, "data": { article } })
                })
                .catch(err => {
                    console.log(err);

                    reject({ "status": 500 });
                });
        });
    }
};

module.exports = Article;
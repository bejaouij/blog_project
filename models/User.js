/**
 * User.js
 *
 * @description : Users data access.
 */
const bcrypt = require("bcrypt");
const restAxios = require("../helpers/AxiosConcreteFactory").getRestAxios();

const User = {
    requiredFields: [
        "email",
        "password",
        "name"
    ],
    fillableFields: [
        "email",
        "password",
        "name",
        "description"
    ],
    async create(data) {
        return new Promise((resolve, reject) => {
            let newUserData = {};

            User.hydrate(newUserData, data);

            let invalidData = User.checkData(newUserData);

            if (Object.keys(invalidData).length > 0) {
                reject({ "status": 400, "message": "Invalid data.", "invalid_data": invalidData });
            }

            const saltRound = 10;

            User.readOneBy("email", data.email)
                .then(response => {
                    if (response.data.length === 1) {
                        reject({ "status": 403, "message": "Email already taken." });
                    }

                    bcrypt.hash(data.password, saltRound)
                        .then(hashedPassword => {
                            newUserData.password = hashedPassword;
                            newUserData.active = true;

                            restAxios.post("users", newUserData)
                                .then(() => {
                                    resolve({ "status": 201 });
                                })
                                .catch(err => {
                                    console.log(err);
                                    reject({ "status": 500 })
                                });
                        })
                        .catch(err => {
                            console.log(err);
                            reject({ "status": 500 })
                        });
                })
                .catch(err => {
                    console.log(err);
                    reject({ "status": 500 });
                });
        });
    },
    async readById(id) {
        return new Promise((resolve, reject) => {
            restAxios.get(`users/${id}`)
                .then(response => {
                    if (!response.data) {
                        resolve({ "status" : 200, "data": []});
                    }

                    const user = response.data;

                    resolve({ "status" : 200, "data": user});
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
    hydrate(userToHydrate, data) {
        User.fillableFields.forEach(value => {
            userToHydrate[value] = data[value];
        });
    },
    checkData(data) {
        let invalidData = {};

        User.requiredFields.forEach((value) => {
            if (data[value] == null || !data[value].trim()) {

                invalidData[value] = {
                    "reasons": ["Empty data."]
                };
            }
        });

        const emailRegexp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        if (!emailRegexp.test(data.email)) {
            if (!invalidData.email) {
                invalidData.email = { "reasons": [] };
            }

            invalidData.email.reasons.push("Invalid email format.")
        }

        return invalidData;
    }
};

module.exports = User;
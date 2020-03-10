const express = require("express");
const bodyParser = require("body-parser");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("./models/User");
const Article = require("./models/Article");
const app = express();

const SERVER_PORT = process.env.SERVER_PORT;

const JwtStrategy = require("passport-jwt").Strategy,
    ExtractJwt = require("passport-jwt").ExtractJwt;

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.SERVER_JWT_SECRET
};

passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
    User.readById(jwt_payload.user_id)
        .then(res => {
            if (res.data.length === 0) {
                return done(null, false);
            }

            return done(null, res.data);
        })
        .catch(err => {
            console.log(err);

            return done(err, false);
        });
}));

app.use(bodyParser.json());

// Authentication actions

app.post("/register", (req, res) => {
    User.create(req.body)
        .then(response => {
            res.json(response);
        })
        .catch(err => {
            console.log(err);
            res.json(err);
        })
});

app.post("/login", (req, res) => {
    User.readOneBy("email", req.body.email)
        .then(response => {
            if (response.data.length !== 1) {
                return res.json({ "status": 404, "message": "Email address does not match any record." })
            }

            const retrievedUser = response.data[0];

            bcrypt.compare(req.body.password, retrievedUser.password)
                .then(isEqual => {
                    if (!isEqual) {
                        res.json({ "status": 404, "message": "Password does not match email address." })
                    }

                    const token = jwt.sign({ user_id: retrievedUser._id }, process.env.SERVER_JWT_SECRET);

                    const responseData = {
                        "token": token
                    };

                    return res.json({ "status": 201, "data": responseData })
                })
                .catch(err => {
                    console.log(err);
                    res.json({ "status": 500 })
                })
        })
        .catch(err => {
            console.log(err);
            res.json(err)
        });
});

// Article actions

app.post("/articles", passport.authenticate("jwt", { session: false }), (req, res) => {
    const data = req.body;
    data.user = req.user;

    Article.create(data)
        .then(response => {
            res.json(response);
        })
        .catch(err => {
            console.log(err);
            res.json(err);
        });
});

app.get("/articles", (req, res) => {
    Article.read()
        .then(response => {
            res.json(response);
        })
        .catch(err => {
            console.log(err);

            res.json(err)
        })
});

app.get("/articles/:id", (req, res) => {
    Article.readById(req.params.id)
        .then(response => {
            res.json(response);
        })
        .catch(err => {
            console.log(err);

            res.json(err)
        });
});

app.patch("/articles/:id", passport.authenticate("jwt", { session: false }), (req, res) => {
    let newArticleData = {};

    Article.hydrate(newArticleData, req.body);

    let invalidData = Article.checkData(newArticleData);

    if (Object.keys(invalidData).length > 0) {
        res.json({ "status": 400, "message": "Invalid data.", "invalid_data": invalidData });
    }

    Article.readById(req.params.id)
        .then(response => {
            if (response.data.length === 0) {
                return res.json({ "status": 404, "message": "Article not found." });
            }

            if (response.data.author._id !== req.user._id) {
                return res.json({"status": 403, "message": "Article belongs to another user."});
            }

            Article.update(req.params.id, newArticleData)
                .then(response => {
                    res.json(response);
                })
                .catch(err => {
                    console.log(err);
                })
        })
        .catch(err => {
            console.log(err);

            res.json(err);
        });
});

app.delete("/articles/:id", passport.authenticate("jwt", { session: false }), (req, res) => {
    Article.readById(req.params.id)
        .then(response => {
            if (response.data.length === 0) {
                return res.json({ "status": 404, "message": "Article not found." });
            }

            if (response.data.author._id !== req.user._id) {
                return res.json({"status": 403, "message": "Article belongs to another user."});
            }

            res.json({ "status": 200 });

            Article.delete(req.params.id)
                .catch(err => {
                    console.log(err);
                })
        })
        .catch(err => {
            console.log(err);

            res.json(err);
        });
});

app.listen(SERVER_PORT, () => console.log(`Server started on port ${SERVER_PORT}!`));

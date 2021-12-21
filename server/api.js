/* eslint-disable no-restricted-syntax */
const express = require('express');
const developers = require('./developersData');

const router = express.Router();
const axios = require('axios');


router.get('/developers', (req, res) => {
    const developerList = [];
    const keys = Object.keys(developers);
    for (const key of keys) {
        if (key !== 'developersData') {
            developerList.push({
                githubId: developers[key].githubId,
                avatar_url: developers[key].avatar_url,
            });
        }
    }
    res.status(200).send(developerList);
});

router.get('/developers/:developerId', (req, res) => {
    const developerData = developers[req.params.developerId];
    if (developerData) {
        res.status(200).send(developers[req.params.developerId]);
    } else {
        res.status(404).send('Developer is not present in our system');
    }
});

router.post('/developers', (req, res) => {
    const data = req.body;
    const developerData = {
        githubId: data.githubId,
        linkedinId: data.linkedinId,
        codechefId: data.codechefId,
        hackerrankId: data.hackerrankId,
        twitterId: data.twitterId,
        mediumId: data.mediumId,
    };
    const userPromise = axios.get(`https://api.github.com/users/${data.githubId}`).then((response) => {
        developerData.avatar_url = response.data.avatar_url;
        developerData.name = response.data.name;
        developerData.company = response.data.company;
        developerData.blog = response.data.blog;
        developerData.location = response.data.location;
        developerData.email = response.data.email;
        developerData.bio = response.data.bio;
        developerData.github_id = response.data.login;
    });

    const reposPromise = axios(`https://api.github.com/users/${data.githubId}/repos`).then((response) => {
        const requiredInfoFromRepos = [];
        for (const repo of response.data) {
            requiredInfoFromRepos.push({
                name: repo.name,
                html_url: repo.owner.html_url,
                description: repo.description,
                updated_at: repo.updated_at,
            });
        }
        developerData.repos = requiredInfoFromRepos;
    });

    Promise.all([userPromise, reposPromise])
        .then((responses) => {
            developers[developerData.githubId] = developerData;
            res.status(201).send({ id: data.githubId});
        })
        .catch((err) => {
            res.status(400).send("Github username is invalid");
        });
});

router.delete('/developers/:developerId', (req, res) => {
    const developerInfo = developers[req.params.developerId];
    if (developerInfo) {
        delete developers[req.params.developerId];
        res.status(204).send('Developer Deleted');
    } else {
        res.status(404).send("Developer doesn't exist in our system");
    }
});

module.exports = router;

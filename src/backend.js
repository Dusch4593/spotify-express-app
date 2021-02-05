// enable usage of relevant environment variables
require('dotenv').config()

// bring in necesssary dependencies
const express = require('express')
const request = require('request')
const querystring = require('querystring')

// set up CORS
const cors = require('cors')  
app.use(cors)



const app = express()

const port = 3000 

let redirectURI = process.env.REDIRECT_URI || 'http://localhost:3000/callback'

app.get('/', (req, res) => {
    res.send('<a href="/login">Log In w/ Spotify</a>')
})

app.get('/login', (req, res) => {
    try {
        let scopes = 'user-read-private user-read-email'
        res.redirect('https://accounts.spotify.com/authorize?' + 
                     querystring.stringify({
                         response_type: 'code',
                         client_id: process.env.CLIENT_ID,
                         scope: scopes,
                         redirect_uri: redirectURI,
                     }))

    } catch (err) {
        return res.status(500).json({
            success: false,
            messsage: err.message
        })
    }
})

app.get('/callback', (req, res) => {
    
    try {
        let code = req.query.code || null 
        let authOptions = {
            url: 'https://accounts.spotify.com/api/token',
            form: {
                code: code,
                redirect_uri: redirectURI,
                grant_type: 'authorization_code'
            },
            headers: {
                'Authorization': 'Basic ' +  (Buffer.from(
                    process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET
                    ).toString('base64'))
            },
            json: true
        }
        request.post(authOptions, (error, response, body) => {
            debugger
            let access_token = body.access_token 
            let newRedirect = 'http://localhost:3000'
            res.send({
                'access_token': access_token
            })
        })
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        })
    }

    // TODO: Test fetching from the Spotify API by 
    // utilizing the access_token
    // /api.spotify.com/v1/episodes
    
})

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})
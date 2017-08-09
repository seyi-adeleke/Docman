# Docman
[![Build Status](https://travis-ci.org/seyi-adeleke/Docman.svg?branch=staging)](https://travis-ci.org/seyi-adeleke/Docman)
[![Coverage Status](https://coveralls.io/repos/github/seyi-adeleke/Docman/badge.svg?branch=staging)](https://coveralls.io/github/seyi-adeleke/Docman?branch=staging)

# Introduction
Docman is document management api which is used to track and managements documents based on roles and priviledges
It Features an Administator that has access to all documents and users.

# Basic Features
<ul>
<li>Users can view documents based on priviledges</li>
<li>Users can search for documents </li>
<li>Users can create document and specify the access level</li>
<li>Users can edit documents</li>
<li>Users can edit documents </li>
<li>Admins can get a list of all users and all documents </li>
</ul>

# Endpoints
Please click **[here](https://docman-cp2-staging.herokuapp.com)** to view the api's documentation

# Dependencies
*  **[jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)** - For authorization and authentication
*  **[bcrypt](https://www.npmjs.com/package/bcrypt)** - For hashing passwords
*  **[Express](https://expressjs.com/)** - A web application framework
*  **[sequelize](https://www.npmjs.com/package/sequelize)** - As on `ORM`

# Dev Dependencies
*  **[Chai](https://www.npmjs.com/package/chai)** - As an assertion Library
*  **[Gulp-Jasmine](https://www.npmjs.com/package/gulp-jasmine)** - A BDD style Test framework
*  **[Gulp](https://www.npmjs.com/package/gulp)** - As a task runner
*  **[Gulp-babel](https://www.npmjs.com/package/gulp-babel)** - For transpiling ES6
*  **[gulp-istanbul](https://www.npmjs.com/package/gulp-istanbul)** - For generating test coverage
* **[gulp-nodemon](https://www.npmjs.com/package/gulp-nodemon)** - To watch the files in the directory for any files change
* **[supertest](https://www.npmjs.com/package/supertest)** - To make Api calls


# Installation

    - clone the project to your local machine, copy and paste the commands below on your terminal
    $ git clone https://github.com/seyi-adeleke/docman.git

    -install dependencies 
    $ npm install

    -start the project
    $ npm run start:dev


# Tests
*  The tests have been written using Gulp-Jasmine and Chai.

     -To run tests use the command

         $ npm test

# Contributing
Contibutions to Docman are welcome. Fork this Repo and submit a pull request with the pr message explaining your changes.Ensure it is fully tested and you extend the `airbnb` style guide

# FAQ


## How do I access the API?
A link to the `api` is provided **[here](https://docman-cp2-staging.herokuapp.com/api/v1)** 
All Api endpoints are restful

## What format is the reponse?

The API currently returns data in `JSON` format.

## Authentication?
All api endpoints require authentication and authorization. On succesfull login or signup a token is returned. Set the token as the value to the `Authorization` key in your `headers`.

# Limitations
The api uses a shared database connection thereby leading to occasionally slow response times

# License

(The MIT License)

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

# Author
Adeleke Adetokunbo
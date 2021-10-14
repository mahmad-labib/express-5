const conf = {
    // Start port
    port: 3030,

    // Database configuration
    database: {
        DATABASE: 'test',
        USERNAME: 'adam',
        PASSWORD: '01030',
        HOST: 'localhost'
    }
}

const roles = {
    admin: 'admin',
    moderator: 'moderator',
    author: 'author',
    junior: 'junior'
}

module.exports = {conf, roles}
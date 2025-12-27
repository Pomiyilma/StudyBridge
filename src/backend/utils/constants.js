const constants = {
    PORT: process.env.PORT || 3000,
    DB_URI: process.env.DB_URI || 'mongodb://localhost:27017/studybridge',
    JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret_here'
};

module.exports = constants;
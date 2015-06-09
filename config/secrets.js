var secrets = {
  db: process.env.MONGODB || 'mongodb://localhost:27017/test',
  sessionSecret: '-xX7sMSDkLkxc9ike**wdsd',
  soundcloud: {
    clientID: '28845fccde738eae8af0a212443197ef',
    clientSecret:'525b94f7d33f783d1155e7d47390efd6',
    callbackURL: '/auth/soundcloud/callback',
    passReqToCallback: true
  }
};

module.exports = secrets; 
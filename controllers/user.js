const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.signup = (req, res, next) => {
    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const user = new User({
                email: req.body.email,
                password: hash
            });
            user.save({ validateModifiedOnly: true })
                .then(() => res.status(201).json({ message: 'Utilisateur crée' }))
                .catch(error => {
                    console.log(error);
                     res.status(500).json({ error })
                    });
        })
        .catch(error => res.status(500).json({ error }));
};

const maskEmail = (emailString) => {
    let outPut= "";
    const length = emailString.length;
    for( let i=0; i<length; i++){
        if (i<=length/2) {
            outPut+="*"
        } else {
            outPut+= emailString[i]
        }
    }
    return outPut;
}
exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                return res.status(401).json({ message: 'Utilisateur non trouvé' });
            }
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({ error: 'Mot de passe incorrect' });
                    }
                    res.status(200).json({
                        userId: user._id,
                        email: maskEmail(user.email),
                        token: jwt.sign(
                            { userId: user._id },
                            process.env.JWT_SECRET,
                            { expiresIn: '24h' }
                        )
                    });
                })
                .catch(error => res.status(500).json({ error }));

        })
        .catch(error => res.status(500).json({ error }));
};
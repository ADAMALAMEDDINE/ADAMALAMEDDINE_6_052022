const Sauce = require('../models/sauce');
const fs = require('fs');

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisliked: []
  });
  sauce.save()
    .then(() => res.status(201).json({ message: 'Sauce enregistrée' }))
    .catch(error => {
      console.log(error);
      res.status(400).json({ error })
    });
};

exports.modifySauce = (req, res, next) => {
  let sauceObject = {};
  req.file ? (
    Sauce.findOne({
      _id: req.params.id
    }).then((sauce) => {
      const filename = sauce.imageUrl.split("/images/")[1]
      fs.unlinkSync(`images/${filename}`)
    }),
    sauceObject = {
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename
        }`,
    }
  ) : (
    sauceObject = {
      ...req.body
    }
  )
  Sauce.updateOne(
    {
      _id: req.params.id
    }, {
    ...sauceObject,
    _id: req.params.id
  })
    .then(() => res.status(200).json({
      message: "Sauce modifiée"
    }))
    .catch(error => {
      console.log(error);
      res.status(400).json({ error })
    });
};

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      const filename = sauce.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({
            message: 'Sauce supprimée'
          }))
          .catch(error => res.status(400).json({ error }));
      });
    })
    .catch(error => res.status(500).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => res.status(200).json(sauce))
    .catch(error => res.status(404).json({ error }));
};

exports.getAllSauce = (req, res, next) => {
  Sauce.find()
    .then(sauces => res.status(200).json(sauces))
    .catch(error => res.status(400).json({ error }));

};

exports.likeDislike = async (req, res, next) => {

  let like = req.body.like
  let userId = req.body.userId
  let sauceId = req.params.id // l'Id de la sauce qu'on souhaite liker ou disliker est passé via le params de la route//
  /* 4 cas de figures ajout d'un like, suppréssion d'un like et ajout d'un dislike et suppréssion d'un dislike
  req.body.like a 3 valeurs possible 1, -1 et 0 
  */
  const sauce = await Sauce.findOne({ _id: sauceId }) // on récupere la sauce en question avec tous ses attributs
  //l'utilisateur like la sauce pour la premiere fois (ajout d'un like)
  if (like === 1) {
    if (sauce.usersLiked.includes(userId)) {
      res.status(403).json({
        message: "Vous n'êtes pas autorisé à liker plusieurs fois la même sauce"
      })
      return
    }
    Sauce.updateOne({
      _id: sauceId
    }, {

      $push: { //fonction de mongoose qui consiste a ajouter un élement dans un tableau à l'interieur de la base de donnée
        usersLiked: userId
      },
      $inc: {
        likes: +1
      }, // On incrémente de 1
    })
      .then(() => res.status(200).json({
        message: 'j\'aime ajouté !'
      }))
      .catch((error) => res.status(400).json({
        error
      }))
  }

  // rajout de la part de l'utilisateur un dislike
  if (like === -1) {
    if (sauce.usersDisliked.includes(userId)) {
      res.status(403).json({
        message: "Vous n'êtes pas autorisé à disliker plusieurs fois la même sauce"
      })
      return
    }
    Sauce.updateOne(
      {
        _id: sauceId
      }, {
      $push: {
        usersDisliked: userId
      },
      $inc: {
        dislikes: +1
      },
    }
    )
      .then(() => {
        res.status(200).json({
          message: 'Dislike ajouté !'
        })
      })
      .catch((error) => res.status(400).json({
        error
      }))
  }
  if (like === 0) { //deux situations possibles : l'utilisateur veut retirer un like ou un 
    // si l'Id de l'utilisateur est deja present dans le tableau usersLiked c'est qu' on veut retirer un Like
    if (sauce.usersLiked.includes(userId)) {
      Sauce.updateOne({
        _id: sauceId
      }, {
        $pull: {
          usersLiked: userId
        },
        $inc: {
          likes: -1
        },
      })
        .then(() => res.status(200).json({
          message: 'Like retiré !'
        }))
        .catch((error) => res.status(400).json({
          error
        }))
    }
    if (sauce.usersDisliked.includes(userId)) {
          // si l'Id de l'utilisateur est deja present dans le tableau usersDisliked c'est qu' on veut retirer un dislike

      Sauce.updateOne({
        _id: sauceId
      }, {
        $pull: {
          usersDisliked: userId
        },
        $inc: {
          dislikes: -1
        },
      })
        .then(() => res.status(200).json({
          message: 'Dislike retiré !'
        }))
        .catch((error) => res.status(400).json({
          error
        }))
    }
  }
}
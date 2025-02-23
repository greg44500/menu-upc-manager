const jwt = require('jsonwebtoken');
const SessionModel = require('../models/session.model');
const UserModel = require('../models/user.model')

exports.authenticateUser = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {

      return res.status(401).json({
        success: false,
        message: "Authentification requise"
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const session = await SessionModel.findById(decoded.sessionId);

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Session invalide"
      });
    }
    // Récupérer l'utilisateur à partir de la base de données
    const user = await UserModel.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Utilisateur non trouvé"
      });
    }
    // if (req.user.isTemporaryPassword) {
    //     // On peut soit renvoyer une erreur
    //     return res.status(403).json({
    //       success: false,
    //       message: "Votre mot de passe est temporaire. Veuillez le modifier avant de continuer.",
    //       requirePasswordChange: true // Flag pour utiliser coté Client
    //     });
        
    //     // Ou rediriger vers la page de changement de mot de passe
    //     // return res.redirect('/change-password');
    //   }
    
  
    req.user = {
      id: decoded.userId,
      role: user.role
    };

    // Vérifie si la session existe en base de données 
    req.session = session;
    next();
  } catch (err) {
    console.error(err)
    res.status(401).json({
      success: false,
      message: "Token invalide"
    });

  }
};

exports.authorizeRoles = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      const user = await UserModel.findById(req.user.id);


      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Utilisateur non trouvé"
        });
      }

      if (!allowedRoles.includes(user.role)) {

        return res.status(403).json({
          success: false,
          message: "Vous n'avez pas les autorisations nécessaires"
        });
      }

      req.userRole = user.role;
      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur de vérification des autorisations"
      });
    }
  };
};

exports.checkResourceAccess = (model) => {
  return async (req, res, next) => {
    try {
      const user = await UserModel.findById(req.user.id);
      const resourceId = req.params.id;
      const resource = await model.findById(resourceId);

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: "Ressource non trouvée"
        });
      }

      switch (user.role) {
        case 'superAdmin':
        case 'manager':
          return next(); // Accès total pour superAdmin et manager

        case 'user':
          if (resource.trainer && resource.trainer.toString() === user.id) {
            return next(); // Accès pour le propriétaire de la ressource
          }
          break;
      }

      return res.status(403).json({
        success: false,
        message: "Accès non autorisé"
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Erreur de vérification des droits"
      });
    }
  };
};
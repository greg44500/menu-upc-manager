const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true
  },
  lastname: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["superAdmin", "manager", "user"],
    required: true
  },
  specialization: {
    type: String,
    enum: ["cuisine", "service"],
    required: true
  },
  isTemporaryPassword: {
    type: Boolean,
    default: true
  }, // Indique si c'est un mot de passe provisoire

  assignedClasses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Classroom"
  }], // Classes permanentes
  replacementClasses: [{
    class: {
      type: mongoose.Schema.Types.ObjectId, ref: "Classroom"
    },
    weeks: [Number] // Semaines où l'utilisateur remplace un autre formateur
  }],

  assignedProgressions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Progression"
  }], // Progressions assignées
  replacementProgressions: [{
    progression: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Progression"
    },
    weeks: [Number] // Semaines où il remplace
  }],

  createdItemsMenus: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Items"
  }], // Historique des menus créés

}, {
  timestamps: true
});

/**
 * Hash du mot de passe avant sauvegarde
 */
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

/**
 * Vérification du mot de passe
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// /**
//  * Génération d'un mot de passe temporaire
//  */
// userSchema.statics.generateTemporaryPassword = function () {
//   return Math.random().toString(36).slice(-8); // Génère un mot de passe aléatoire
// };

module.exports = mongoose.model("User", userSchema);
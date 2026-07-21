const mongoose = require('mongoose');

// Le "slug" est la même chaîne que le champ `location` déjà utilisé sur
// Device / Measurement / Observation depuis la Phase 1 (ex: "cafe-plateau").
// On ne renomme rien : on ajoute juste une entité qui décrit ce lieu
// (nom lisible + coordonnées) sans casser les endpoints existants.
const locationSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    lat: { type: Number, required: true, min: -90, max: 90 },
    lng: { type: Number, required: true, min: -180, max: 180 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Location', locationSchema);

const express = require("express");
const router = express.Router();

const Consultation = require("../models/consultation");
const Patient = require("../models/patient");


// =========================
// Gestion des erreurs
// =========================

function handleError(res, err) {

  if (err.name === "ValidationError") {
    const erreurs = Object.values(err.errors).map(
      e => e.message
    );

    return res.status(400).json({
      message: "Données invalides",
      erreurs
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      message: "Identifiant invalide"
    });
  }

  console.error(err);

  return res.status(500).json({
    message: "Erreur serveur"
  });
}


// =========================
// POST
// Créer une consultation
// =========================

router.post("/", async (req, res) => {

  try {

    // Vérifier que le patient existe
    const patientExiste = await Patient.exists({
      _id: req.body.patient
    });

    if (!patientExiste) {
      return res.status(404).json({
        message: "Patient introuvable"
      });
    }

    const consultation = await Consultation.create(req.body);

    res.status(201).json(consultation);

  } catch (err) {

    handleError(res, err);

  }

});


// =========================
// GET
// Toutes les consultations
// =========================

router.get("/", async (req, res) => {

  try {

    const filtre = {};

    // Filtre par patient
    if (req.query.patient) {
      filtre.patient = req.query.patient;
    }

    // Filtre par statut
    if (req.query.statut) {
      filtre.statut = req.query.statut;
    }

    const consultations = await Consultation.find(filtre)
      .populate("patient", "nom prenom")
      .sort({ date: -1 });

    res.json(consultations);

  } catch (err) {

    handleError(res, err);

  }

});


// =========================
// GET
// Une consultation par ID
// =========================

router.get("/:id", async (req, res) => {

  try {

    const consultation = await Consultation.findById(
      req.params.id
    ).populate("patient", "nom prenom");

    if (!consultation) {
      return res.status(404).json({
        message: "Consultation introuvable"
      });
    }

    res.json(consultation);

  } catch (err) {

    handleError(res, err);

  }

});


// =========================
// PUT
// Modifier une consultation
// =========================

router.put("/:id", async (req, res) => {

  try {

    // Si le patient est modifié,
    // vérifier qu'il existe
    if (req.body.patient) {

      const patientExiste = await Patient.exists({
        _id: req.body.patient
      });

      if (!patientExiste) {

        return res.status(404).json({
          message: "Patient introuvable"
        });

      }
    }

    const consultation =
      await Consultation.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true
        }
      ).populate("patient", "nom prenom");

    if (!consultation) {

      return res.status(404).json({
        message: "Consultation introuvable"
      });

    }

    res.json(consultation);

  } catch (err) {

    handleError(res, err);

  }

});


// =========================
// DELETE
// Supprimer une consultation
// =========================

router.delete("/:id", async (req, res) => {

  try {

    const consultation =
      await Consultation.findByIdAndDelete(
        req.params.id
      );

    if (!consultation) {

      return res.status(404).json({
        message: "Consultation introuvable"
      });

    }

    res.json({
      message: "Consultation supprimée"
    });

  } catch (err) {

    handleError(res, err);

  }

});


module.exports = router;
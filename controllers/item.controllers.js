const asyncHandler = require("express-async-handler");
const Item = require("../models/item.model");
const {
    validateObjectId
} = require("../helpers/user.helper");

// ** @desc    Créer un nouvel item (unique)
// ** @route   POST /api/items
// ** @access  Formateur, Manager, Admin
const createItem = asyncHandler(async (req, res) => {
    const {
        name,
        category,
    } = req.body;
    // Vérification de la présence des champs obligatoires
    if (!name || !category) {
        res.status(400);
        throw new Error("Tous les champs sont requis.");
    }

    // Vérifier si l'item existe déjà
    const itemExists = await Item.findOne({
        name: name.trim()
    });
    if (itemExists) {
        res.status(400);
        throw new Error("Cet item existe déjà.");
    }

    // Création de l'item
    const item = await Item.create({
        name: name.trim(),
        category,
        author: req.user.id
    });

    res.status(201).json(item);
});

// ** @desc    Récupérer tous les items
// ** @route   GET /api/items
// ** @access  Tous les rôles
const getAllItems = asyncHandler(async (req, res) => {
    const items = await Item.find().sort({
        createdAt: -1
    });
    res.status(200).json({
        succes: true,
        count: items.length,
        data: items.length ? items : "Rien à afficher"
    });
});

// ** @desc    Récupérer tous les items Par Formateurs
// ** @route   GET /api/items/mine
// ** @access  Tous les rôles
const getItemsByUsers = asyncHandler(async (req, res) => {
    const {
       id
    } = req.user
    const items = await Item.find().sort({
        createdAt: -1
    }).populate('author');
    res.status(200).json({
        succes: true,
        count: items.length,
        data: items.length ? items : "Rien à afficher"
    });
});

// ** @desc    Récupérer un item spécifique
// ** @route   GET /api/items/:id
// ** @access  Tous les rôles
const getItemById = asyncHandler(async (req, res) => {
    const {
        id
    } = req.params;

    // Vérification ObjectId
    if (!validateObjectId(id)) {
        res.status(400);
        throw new Error("ID invalide.");
    }

    const item = await Item.findById(id);
    if (!item) {
        res.status(404);
        throw new Error("Item non trouvé.");
    }

    res.status(200).json(item);
});

// ** @desc    Modifier un item (seul le créateur ou un admin peut le faire)
// ** @route   PUT /api/items/:id
// ** @access  Formateur (créateur), Manager, Admin
const updateItem = asyncHandler(async (req, res) => {
    const {
        id
    } = req.params;
    const {
        name,
        category
    } = req.body;

    if (!validateObjectId(id)) {
        res.status(400);
        throw new Error("ID invalide.");
    }

    let item = await Item.findById(id);
    if (!item) {
        res.status(404);
        throw new Error("Item non trouvé.");
    }

    // Vérification des droits : Seul le créateur ou un admin peut modifier
    if (req.user.role !== "admin" && req.user._id.toString() !== item.createdBy.toString()) {
        res.status(403);
        throw new Error("Accès refusé.");
    }

    // Vérifier si le nouveau nom est unique
    if (name && name.trim() !== item.name) {
        const itemExists = await Item.findOne({
            name: name.trim()
        });
        if (itemExists) {
            res.status(400);
            throw new Error("Un item avec ce nom existe déjà.");
        }
    }

    item.name = name ? name.trim() : item.name;
    item.category = category || item.category;
    item = await item.save();

    res.status(200).json(item);
});

// ** @desc    Supprimer un item (seul un admin peut le faire)
// ** @route   DELETE /api/items/:id
// ** @access  Admin
const deleteItem = asyncHandler(async (req, res) => {
    const {
        id
    } = req.params;

    if (!validateObjectId(id)) {
        res.status(400);
        throw new Error("ID invalide.");
    }

    const item = await Item.findById(id);
    if (!item) {
        res.status(404);
        throw new Error("Item non trouvé.");
    }

    await item.deleteOne();
    res.status(200).json({
        message: "Item supprimé avec succès."
    });
});

module.exports = {
    createItem,
    getAllItems,
    getItemById,
    getItemsByUsers,
    updateItem,
    deleteItem
};
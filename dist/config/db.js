"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = connectDB;
const mongoose_1 = __importDefault(require("mongoose"));
async function connectDB() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        throw new Error("MONGODB_URI manquant dans les variables d'environnement (.env)");
    }
    await mongoose_1.default.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('MongoDB connecté');
}

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const db_1 = __importDefault(require("./config/db"));
const devices_routes_1 = __importDefault(require("./routes/devices.routes"));
const measurements_routes_1 = __importDefault(require("./routes/measurements.routes"));
const observations_routes_1 = __importDefault(require("./routes/observations.routes"));
const ambiance_routes_1 = __importDefault(require("./routes/ambiance.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const locations_routes_1 = __importDefault(require("./routes/locations.routes"));
const users_routes_1 = __importDefault(require("./routes/users.routes"));
const errorHandler_1 = __importDefault(require("./middlewares/errorHandler"));
const notFound_1 = __importDefault(require("./middlewares/notFound"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get('/', (req, res) => res.json({ name: 'Ambiance API', status: 'ok' }));
app.use('/devices', devices_routes_1.default);
app.use('/measurements', measurements_routes_1.default);
app.use('/observations', observations_routes_1.default);
app.use('/ambiance', ambiance_routes_1.default);
app.use('/auth', auth_routes_1.default);
app.use('/locations', locations_routes_1.default);
app.use('/users', users_routes_1.default);
app.use(notFound_1.default);
app.use(errorHandler_1.default);
const PORT = process.env.PORT || 3000;
(0, db_1.default)()
    .then(() => {
    app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));
})
    .catch((err) => {
    console.error('Échec de connexion à MongoDB :', err.message);
    process.exit(1);
});

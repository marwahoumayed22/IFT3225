"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LOUD_THRESHOLD = exports.QUIET_THRESHOLD = void 0;
exports.classifyAudioLevel = classifyAudioLevel;
exports.average = average;
// Seuils de classification du niveau sonore, en dB (échelle Phyphox).
// Valeurs de départ — à recalibrer avec les vraies données de la Tâche 6
// une fois que tu auras collecté au café (voir section "Agrégation" du rapport).
exports.QUIET_THRESHOLD = -50;
exports.LOUD_THRESHOLD = -35;
function classifyAudioLevel(average) {
    if (average === null || average === undefined)
        return 'inconnu';
    if (average < exports.QUIET_THRESHOLD)
        return 'calme';
    if (average < exports.LOUD_THRESHOLD)
        return 'modere';
    return 'anime';
}
function average(values) {
    if (!values || values.length === 0)
        return null;
    const sum = values.reduce((a, b) => a + b, 0);
    return sum / values.length;
}

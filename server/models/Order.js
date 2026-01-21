const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: { type: String, required: false }, // Can be null if guest, but mostly logged in
    userEmail: { type: String, required: true },
    files: [{
        name: String,
        type: String, // 'application/pdf', 'image/png', 'stationery'
        size: Number,
        pageCount: Number,
        price: Number,
        dataVal: String, // Determine if we keep base64 or move to cloud storage later. For now keeping simple.
        id: String
    }],
    settings: {
        color: Boolean,
        doubleSided: Boolean,
        copies: Number
    },
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ['paid', 'printed', 'collected'], default: 'paid' },
    otp: { type: String, required: true, unique: true },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

module.exports = mongoose.model('Order', orderSchema);

// backend/models/composer/scriptComposer.js

const mongoose = require("mongoose");

const scriptComposerSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
	    unique : true,
        },
        options: {
            type: Object, // 예: { console: null, lang: "ko", view: "connect", script: "javascript" }
            required: true,
        },
        transcript: {
            type: Object, 
            required: true,
        },
    },
    {
        timestamps: true, // createdAt, updatedAt 자동 생성
    }
);

module.exports = mongoose.model("ScriptComposer", scriptComposerSchema);

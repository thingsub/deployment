// models/composer/blockComposer.js
const mongoose = require("mongoose");

const blockComposerSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
	    unique : true,
        },
        workspace: {
            type: Object, // 블록의 XML/JSON 구조 데이터를 저장
            required: true, 
        },
        options: {
            type: Object, // 예: { console: null, lang: "ko", view: "connect" }
            required: true,
        },
        transcript: {
            type: Object, // 예: { javascript: "...", python: "..." } 코드 문자열
            required: true,
        },
    },
    {
        timestamps: true, // createdAt, updatedAt 자동 생성
    }
);


module.exports = mongoose.model("BlockComposer", blockComposerSchema);

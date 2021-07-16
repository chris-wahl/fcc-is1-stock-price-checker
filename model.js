const mongoose = require('mongoose');

mongoose.connect(process.env['DB'], {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

const likeRecordSchema = new mongoose.Schema({
    ip: {
        type: String,
        required: true
    },
    stock: {
        type: String,
        required: true
    }
});

module.exports = new mongoose.model('LikeRecord', likeRecordSchema);

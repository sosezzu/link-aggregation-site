const mongoose = require('mongoose');
const URLSlugs = require('mongoose-url-slugs');

//schemas
const UserSchema = new mongoose.Schema({
        username: { type: String, required: true },
        email: { type: String, required: true },
        password: { type: String, unique: true, required: true },
        articles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Article' }]
    });
const ArticleSchema = new mongoose.Schema({
        title: String,
        url: String,
        description: String,
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    });

//plugins (for slug)
ArticleSchema.plugin(URLSlugs('title'));

//registers model
mongoose.model('User', UserSchema);
mongoose.model('Article', ArticleSchema);

mongoose.connect('mongodb://localhost/hw06');

// const mongoose = require("mongoose");
// const Schema = mongoose.Schema;
// const socialGroupSchema = new Schema({
//     name: {
//         type: String,
//         required: true
//     },
//     theme: {
//         type: Schema.Types.ObjectId,
//         ref: "theme"
//     },
//     auth_challenge: {
//         type: Schema.Types.ObjectId,
//         ref: "auth_challenge"
//     },
//     members: {
//         approved: {
//             type: [Schema.Types.ObjectId],
//             ref: "user"
//         },
//         pending: {
//             type: [Schema.Types.ObjectId],
//             ref: "user"
//         }
//     },
//     thematic_area: {
//         type: Schema.Types.ObjectId,
//         ref: "theme"
//     },
//     region: {
//         type: Schema.Types.ObjectId,
//         ref: "region"
//     },
//     description: {
//         type: String
//     },
//     discussions: {
//         approved: {
//             type: [Schema.Types.ObjectId],
//             ref: "social_post"
//         },
//         pending: {
//             type: [Schema.Types.ObjectId],
//             ref: "social_post"
//         }
//     },
//     announcements: {
//         approved: {
//             type: [Schema.Types.ObjectId],
//             ref: "social_post"
//         },
//         pending: {
//             type: [Schema.Types.ObjectId],
//             ref: "social_post"
//         }
//     },
//     files: {
//         type: [Schema.Types.ObjectId],
//         ref: "user_file"
//     },
//     projects: {
//         approved: {
//             type: [Schema.Types.ObjectId],
//             ref: "project"
//         },
//         pending: {
//             type: [Schema.Types.ObjectId],
//             ref: "project"
//         }
//     },
//     approved: {
//         type: Boolean,
//         default: false
//     },
//     approved_on: Date,
//     approved_by: {
//         type: Schema.Types.ObjectId,
//         ref: "user"
//     },
//     global: Boolean
// }, { timestamps: true });

// module.exports = mongoose.model("social_group", socialGroupSchema);   


////


const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const socialGroupSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    theme: {
        type: Schema.Types.ObjectId,
        ref: "theme"
    },
    auth_challenge: {
        type: Schema.Types.ObjectId,
        ref: "auth_challenge"
    },
    members: {
        approved: {
            type: [Schema.Types.ObjectId],
            ref: "user"
        },
        pending: [
            {
                user: {
                    type: Schema.Types.ObjectId,
                    ref: "user"
                },
                message: {
                    type: String
                }
            }
        ]
    },
    thematic_area: {
        type: Schema.Types.ObjectId,
        ref: "theme"
    },
    region: {
        type: Schema.Types.ObjectId,
        ref: "region"
    },
    description: {
        type: String
    },
    discussions: {
        approved: {
            type: [Schema.Types.ObjectId],
            ref: "social_post"
        },
        pending: {
            type: [Schema.Types.ObjectId],
            ref: "social_post"
        }
    },
    announcements: {
        approved: {
            type: [Schema.Types.ObjectId],
            ref: "social_post"
        },
        pending: {
            type: [Schema.Types.ObjectId],
            ref: "social_post"
        }
    },
    files: {
        type: [Schema.Types.ObjectId],
        ref: "user_file"
    },
    projects: {
        approved: {
            type: [Schema.Types.ObjectId],
            ref: "project"
        },
        pending: {
            type: [Schema.Types.ObjectId],
            ref: "project"
        }
    },
    approved: {
        type: Boolean,
        default: false
    },
    approved_on: Date,
    approved_by: {
        type: Schema.Types.ObjectId,
        ref: "user"
    },
    global: Boolean,
    groupAdmin: {
        type: Schema.Types.ObjectId,
        ref: "user"
    },
    groupAdminOnlyPosting: {
        type: Boolean,
        default: false
    },
    isUnConnectGroup: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model("social_group", socialGroupSchema);

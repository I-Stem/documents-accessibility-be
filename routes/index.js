const express = require("express");
const router = express.Router();

const adminRoutes = require("./admin.routes");
const projectRoutes = require("./project.routes");
const userRoutes = require("./user.routes");
const socialGroupRoutes = require("./social-group.routes");
const socialPostRoutes = require("./social-post.routes");
const socialPostCommentRoutes = require("./social-post-comment.routes");
const userGroupRoutes = require("./user-group.routes");

const authChallengeRoutes = require("./auth-challenge.routes");
const authChallengeResponseRoutes = require("./auth-challenge-response.routes");
const userQuestionRoutes = require("./user-question.routes");

const socialFriendRoutes = require("./social-friend.routes");
const userFriendRoutes = require("./user-friend.routes");

const countryRoutes = require("./country.routes");
const themeRoutes = require("./theme.routes");
const regionRoutes = require("./region.routes");
const authRoutes = require("./auth.routes");
const messageRoutes = require("./message.routes");

const notificationRoutes = require("./user-notification.routes")

const courseRoutes = require('../routes/learning-course.route');
const moduleRoutes = require('../routes/learning-module.routes')
const sectionRoutes = require('../routes/learning-section.route')

const chatbotRoutes = require('../routes/chatbot.routes')
const eventRoutes = require("./event.routes");
const autotagRoutes=require("./autotag.routes")
const contentRoutes=require("./opportunities.route")



router.use('/content',contentRoutes);

router.use("/event", eventRoutes);
router.use("/autotag",autotagRoutes);

router.use("/learning-course", courseRoutes);
router.use("/learning-module", moduleRoutes);
router.use("/learning-section", sectionRoutes);

router.use("/user-notification", notificationRoutes)

router.use("/admin", adminRoutes);
router.use("/projects", projectRoutes);
router.use("/users", userRoutes);

router.use("/social-groups", socialGroupRoutes);
router.use("/social-posts", socialPostRoutes);
router.use("/social-post-comments", socialPostCommentRoutes);
router.use("/social-friends", socialFriendRoutes);

router.use("/user-groups", userGroupRoutes);
router.use("/user-friends", userFriendRoutes);

router.use("/auth-challenges", authChallengeRoutes);
router.use("/auth-challenge-responses", authChallengeResponseRoutes);
router.use("/user-questions", userQuestionRoutes);

router.use("/countries", countryRoutes);
router.use("/themes", themeRoutes);
router.use("/regions", regionRoutes);
router.use("/messages", messageRoutes);

router.use("/chatbot", chatbotRoutes);

router.use("/auth", authRoutes);

module.exports = router;
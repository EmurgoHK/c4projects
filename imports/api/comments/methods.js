import { Meteor } from "meteor/meteor";
import SimpleSchema from "simpl-schema";
import { ValidatedMethod } from "meteor/mdg:validated-method";
import { Comments } from "./comments";
import { isModerator } from "/imports/api/user/methods";

export const newComment = new ValidatedMethod({
  name: "newComment",
  validate: new SimpleSchema({
    parentId: {
      type: String,
      optional: false,
    },
    text: {
      type: String,
      max: 1000,
      optional: false,
    },
    articleId: {
      type: String,
      optional: false,
    },
    articleType: {
      type: String,
      optional: true,
    },
  }).validator({
    clean: true,
  }),
  run({ parentId, text, articleId, articleType }) {
    if (!Meteor.userId()) {
      throw new Meteor.Error("Error.", "messages.login");
    }

    return Comments.insert({
      parentId: parentId,
      text: text,
      createdAt: new Date().getTime(),
      createdBy: Meteor.userId(),
      articleId: articleId,
      articleType: articleType,
    });
  },
});

export const removeComment = new ValidatedMethod({
  name: "removeComment",
  validate: new SimpleSchema({
    commentId: {
      type: String,
      optional: false,
    },
  }).validator(),
  run({ commentId }) {
    let comment = Comments.findOne({
      _id: commentId,
    });

    if (!comment) {
      throw new Meteor.Error("Error.", "messages.comments.no_comment");
    }

    if (!Meteor.userId()) {
      throw new Meteor.Error("Error.", "messages.login");
    }

    if (comment.createdBy !== Meteor.userId()) {
      throw new Meteor.Error("Error.", "messages.comments.cant_remove");
    }

    // if the comment that's being deleted has children, append the children to the parent comment
    let comments = Comments.find({
      parentId: comment._id,
    }).fetch();

    comments.forEach(i => {
      Comments.update(
        {
          _id: i._id,
        },
        {
          $set: {
            parentId: comment.parentId,
          },
        }
      );
    });

    return Comments.remove({
      _id: commentId,
    });
  },
});

export const editComment = new ValidatedMethod({
  name: "editComment",
  validate: new SimpleSchema({
    commentId: {
      type: String,
      optional: false,
    },
    text: {
      type: String,
      max: 1000,
      optional: false,
    },
  }).validator({
    clean: true,
  }),
  run({ commentId, text }) {
    let comment = Comments.findOne({
      _id: commentId,
    });

    if (!comment) {
      throw new Meteor.Error("Error.", "messages.comments.no_comment");
    }

    if (!Meteor.userId()) {
      throw new Meteor.Error("Error.", "messages.login");
    }

    if (comment.createdBy !== Meteor.userId()) {
      throw new Meteor.Error("Error.", "messages.comments.cant_edit");
    }

    return Comments.update(
      {
        _id: commentId,
      },
      {
        $set: {
          text: text,
          editedAt: new Date().getTime(),
        },
      }
    );
  },
});

export const flagComment = new ValidatedMethod({
  name: "flagComment",
  validate: new SimpleSchema({
    commentId: {
      type: String,
      optional: false,
    },
    reason: {
      type: String,
      max: 1000,
      optional: false,
    },
  }).validator({
    clean: true,
  }),
  run({ commentId, reason }) {
    let comment = Comments.findOne({
      _id: commentId,
    });

    if (!comment) {
      throw new Meteor.Error("Error.", "messages.comments.no_comment");
    }

    if (!Meteor.userId()) {
      throw new Meteor.Error("Error.", "messages.login");
    }

    if ((comment.flags || []).some(i => i.flaggedBy === Meteor.userId())) {
      throw new Meteor.Error("Error.", "messages.already_flagged");
    }

    return Comments.update(
      {
        _id: commentId,
      },
      {
        $push: {
          flags: {
            reason: reason,
            flaggedBy: Meteor.userId(),
            flaggedAt: new Date().getTime(),
          },
        },
      }
    );
  },
});

export const resolveCommentFlags = new ValidatedMethod({
  name: "resolveCommentFlags",
  validate: new SimpleSchema({
    commentId: {
      type: String,
      optional: false,
    },
    decision: {
      type: String,
      optional: false,
    },
  }).validator({
    clean: true,
  }),
  run({ commentId, decision }) {
    if (!Meteor.userId()) {
      throw new Meteor.Error("Error.", "messages.login");
    }

    if (!isModerator(Meteor.userId())) {
      throw new Meteor.Error("Error.", "messages.moderator");
    }

    let comment = Comments.findOne({
      _id: commentId,
    });

    if (!comment) {
      throw new Meteor.Error("Error.", "messages.comments.no_comment");
    }

    if (decision === "ignore") {
      return Comments.update(
        {
          _id: commentId,
        },
        {
          $set: {
            flags: [],
          },
        }
      );
    } else {
      Comments.update(
        {
          parentId: comment._id,
        },
        {
          $set: {
            parentId: comment.parentId,
          },
        }
      );

      return Comments.remove({
        _id: commentId,
      });
    }
  },
});

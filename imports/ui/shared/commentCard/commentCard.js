import "./commentCard.html";
import "./commentCard.scss";

import { Template } from "meteor/templating";

import { loggedInSWAL } from "../../utils/loggedInSWAL";
import { Comments } from "../../../api/comments/comments";
import { removeComment, flagComment } from "../../../api/comments/methods";
import { notify } from "../../utils/notifier";

Template.commentCard.onCreated(function() {
  this.editing = new ReactiveVar(false);
  this.replying = new ReactiveVar(false);

  this.message = new ReactiveVar("");

  this.showReplies = new ReactiveVar(false);
});

Template.commentCard.helpers({
  user: () => Meteor.users.findOne({ _id: Template.currentData().createdBy }),
  canEditComment: function() {
    return this.createdBy === Meteor.userId();
  },
  editMode: function() {
    return Template.instance().editing.get();
  },
  replyMode: function() {
    return Template.instance().replying.get();
  },
  commentInvalidMessage: () => Template.instance().message.get(),
  newIdent: () => Template.instance().data.ident + 10,
  formIdent: () => (Template.instance().data.ident - 5 > 0 ? Template.instance().data.ident - 5 : 0),
  ident: () => Template.instance().data.ident,
  childComments: function() {
    console.log(this._id);
    return Comments.find(
      {
        parentId: this._id,
      },
      {
        sort: {
          createdAt: -1,
        },
      }
    );
  },
  childCommentCount: function() {
    return Comments.find(
      {
        parentId: this._id,
      },
      {
        sort: {
          createdAt: -1,
        },
      }
    ).count();
  },
  showReplies: () => Template.instance().showReplies.get(),
  subCommentArgs: comment => {
    const data = Template.instance().data;

    return {
      ident: 15, // data.ident + 10
      comment: comment,
      _id: comment._id,
      articleId: data.articleId,
      articleType: data.articleType,
      onReplySuccess: data.onReplySuccess,
      onEditSuccess: data.onEditSuccess,
    };
  },
  replySuccess: () => {
    const templateInstance = Template.instance();

    return () => {
      notify(TAPi18n.__("comments.success"), "success");
      templateInstance.showReplies.set(true);
      templateInstance.replying.set(false);

      if (templateInstance.data.onReplySuccess) templateInstance.data.onReplySuccess();
    };
  },
  replyCancel: () => {
    const templateInstance = Template.instance();
    return () => templateInstance.replying.set(false);
  },
  editSuccess: () => {
    const templateInstance = Template.instance();

    return () => {
      notify(TAPi18n.__("comments.success_edit"), "success");
      templateInstance.editing.set(false);

      if (templateInstance.data.onEditSuccess) templateInstance.data.onEditSuccess();
    };
  },
  editCancel: () => {
    const templateInstance = Template.instance();

    return () => templateInstance.editing.set(false);
  },
});

Template.commentCard.events({
  "click .reply": function(event, templateInstance) {
    event.preventDefault();
    event.stopImmediatePropagation();

    if (templateInstance.data.comment._id === event.target.getAttribute("data-id")) {
      templateInstance.showReplies.set(true);
      templateInstance.replying.set(true);
    }
  },
  "click .edit-mode": function(event, templateInstance) {
    event.preventDefault();
    event.stopImmediatePropagation();

    if (templateInstance.data.comment._id === event.target.getAttribute("data-id")) {
      templateInstance.editing.set(true);
    }
  },
  "click .delete-comment": function(event, templateInstance) {
    event.preventDefault();
    event.stopImmediatePropagation();

    loggedInSWAL({
      action: "shared.loginModal.action.delete",
      text: TAPi18n.__("comments.remove_question"),
      type: "warning",
      showCancelButton: true,
    }).then(confirmed => {
      if (confirmed.value) {
        removeComment.call(
          {
            commentId: this._id,
          },
          (err, data) => {
            if (err) {
              notify(TAPi18n.__(err.reason || err.message), "error");
            }
          }
        );
      }
    });
  },
  "click .showReplies": (event, templateInstance) => {
    event.preventDefault();

    // Check if the button was clicked for this comment and not in a child
    if (templateInstance.data.comment._id === event.target.getAttribute("data-id"))
      templateInstance.showReplies.set(true);
  },
  "click .hideReplies": (event, templateInstance) => {
    event.preventDefault();

    // Check if the button was clicked for this comment and not in a child
    if (templateInstance.data.comment._id === event.target.getAttribute("data-id"))
      templateInstance.showReplies.set(false);
  },
});

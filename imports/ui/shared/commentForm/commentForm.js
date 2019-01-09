import "./commentForm.html";

import { loggedInSWAL } from "../../utils/loggedInSWAL";
import { newComment, editComment } from "../../../api/comments/methods";

Template.commentForm.onCreated(function() {
  this.text = new ReactiveVar("");
  this.error = new ReactiveVar("");

  this.autorun(() => {
    this.text.set(Template.currentData().text);
  });
});

Template.commentForm.helpers({
  text() {
    return Template.instance().text.get();
  },
  error() {
    return Template.instance().error.get();
  },
  saveButtonText() {
    const data = Template.currentData();
    if (data.saveButtonText) return data.saveButtonText;

    if (data.id) return TAPi18n.__("comments.edit");

    if (data.parentId !== data.newsId) return TAPi18n.__("comments.reply");

    return TAPi18n.__("comments.comment");
  },
  placeholder() {
    return Template.currentData().placeholder || TAPi18n.__("comments.placeholder");
  },

  wrapperClasses() {
    return Template.currentData().wrapperClasses || "";
  },
});

Template.commentForm.events({
  "keyup/blur comment-text": (event, templateInstance) => {
    templateInstance.text.set(templateInstance.$("textarea.comment-text").val());

    return false;
  },

  "click .save-comment": (event, templateInstance) => {
    if (!Meteor.userId()) {
      return loggedInSWAL({
        action: "shared.loginModal.action.comment",
      });
    }
    const data = Template.currentData();
    const text = templateInstance.$("textarea.comment-text").val();
    if (data.id) {
      editComment.call(
        {
          commentId: data.id,
          text,
        },
        (err, res) => {
          if (!err) {
            templateInstance.text.set("");
            templateInstance.error.set("");

            if (data.onSuccess) data.onSuccess(res);
          } else {
            templateInstance.error.set(TAPi18n.__(err.reason || err.message));
          }
        }
      );
    } else {
      newComment.call(
        {
          articleId: data.articleId,
          articleType: data.articleType,
          parentId: data.parentId,
          text,
        },
        (err, res) => {
          if (!err) {
            templateInstance.text.set("");
            templateInstance.error.set("");

            if (data.onSuccess) data.onSuccess(res);
          } else {
            templateInstance.error.set(TAPi18n.__(err.reason || err.message));
          }
        }
      );
    }
  },
  "click .cancel-comment": (event, templateInstance) => {
    const data = Template.currentData();
    data.onCancel();
  },
});

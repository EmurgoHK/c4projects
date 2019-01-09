import "./commentArea.html";
import "./commentArea.scss";

import "../commentForm/commentForm";
import "../commentCard/commentCard";

import { Comments } from "../../../api/comments/comments";

Template.commentArea.onCreated(function() {
  this.autorun(() => {
    this.subscribe("comments.item", Template.currentData().parentId);
  });
});

Template.commentArea.helpers({
  formArgs() {
    const instance = Template.instance();

    return {
      wrapperClasses: "card-body",
      articleId: instance.data.parentId,
      articleType: instance.data.articleType,
      parentId: instance.data.parentId,
      onSuccess: instance.data.commentSuccess,
      hideCancel: true,
    };
  },
  wrapperClasses() {
    return Template.currentData().wrapperClasses || "";
  },
  comments: () => {
    const data = Template.currentData();

    return Comments.find(
      {
        parentId: data.parentId,
      },
      {
        sort: {
          createdAt: -1,
        },
      }
    );
  },
});
